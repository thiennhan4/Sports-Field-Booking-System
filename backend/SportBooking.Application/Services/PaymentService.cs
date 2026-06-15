using StackExchange.Redis;
using SportBooking.Application.DTOs.Payment;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Linq;

namespace SportBooking.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IAppDbContext _context;
    private readonly IConnectionMultiplexer _redis;

    public PaymentService(
        IPaymentRepository paymentRepository, 
        IBookingRepository bookingRepository,
        IAppDbContext context,
        IConnectionMultiplexer redis)
    {
        _paymentRepository = paymentRepository;
        _bookingRepository = bookingRepository;
        _context = context;
        _redis = redis;
    }

    public async Task<PaymentResponseDto> ProcessPaymentAsync(Guid userId, CreatePaymentDto dto)
    {
        var booking = await _bookingRepository.GetByIdAsync(dto.BookingId);
        if (booking == null)
            throw new AppException("Đơn đặt sân không tồn tại.", 404);

        if (booking.UserId != userId)
            throw new AppException("Bạn không có quyền thanh toán cho đơn đặt sân này.", 403);

        if (booking.Status != BookingStatus.Pending)
            throw new AppException($"Không thể thanh toán đơn đặt sân ở trạng thái: {booking.Status}", 400);

        var existingPayment = await _paymentRepository.GetByBookingIdAsync(dto.BookingId);
        if (existingPayment != null && existingPayment.Status == "Success")
            throw new AppException("Đơn đặt sân này đã được thanh toán.", 400);

        var payment = new Payment
        {
            Amount = booking.TotalPrice,
            Provider = dto.Provider,
            TransactionId = "TXN" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            PaymentDate = DateTime.UtcNow,
            Status = "Success",
            BookingId = dto.BookingId
        };

        await _paymentRepository.AddAsync(payment);

        booking.Status = BookingStatus.Confirmed;
        await _bookingRepository.UpdateAsync(booking);

        // Update slots to Booked and release hold
        var slots = await _context.TimeSlots.Where(ts => ts.BookingId == booking.Id).ToListAsync();
        var redisDb = _redis.GetDatabase();
        foreach (var slot in slots)
        {
            slot.Status = SlotStatus.Booked;
            await redisDb.KeyDeleteAsync($"booking:hold:slot:{slot.Id}");
        }
        await _context.SaveChangesAsync();

        return new PaymentResponseDto
        {
            Id = payment.Id,
            Amount = payment.Amount,
            Provider = payment.Provider.ToString(),
            TransactionId = payment.TransactionId,
            PaymentDate = payment.PaymentDate,
            Status = payment.Status,
            BookingId = payment.BookingId,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task<PaymentResponseDto> GetPaymentByBookingIdAsync(Guid bookingId)
    {
        var payment = await _paymentRepository.GetByBookingIdAsync(bookingId);
        if (payment == null)
            throw new AppException("Không tìm thấy thông tin thanh toán cho đơn đặt sân này.", 404);

        return new PaymentResponseDto
        {
            Id = payment.Id,
            Amount = payment.Amount,
            Provider = payment.Provider.ToString(),
            TransactionId = payment.TransactionId,
            PaymentDate = payment.PaymentDate,
            Status = payment.Status,
            BookingId = payment.BookingId,
            CreatedAt = payment.CreatedAt
        };
    }

    public async Task<string> CreatePaymentUrlAsync(Guid userId, Guid bookingId, PaymentProvider provider, string ipAddress)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null) throw new AppException("Đơn đặt sân không tồn tại.", 404);
        if (booking.UserId != userId) throw new AppException("Bạn không có quyền thanh toán đơn đặt sân này.", 403);
        if (booking.Status != BookingStatus.Pending) throw new AppException("Trạng thái đơn đặt sân không hợp lệ.", 400);

        var amountInVnd = (int)(booking.TotalPrice * 25000); // Base price calculation multiplier for real payment systems

        if (provider == PaymentProvider.VNPay)
        {
            // Build VNPay request parameters
            var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            var vnpParams = new SortedList<string, string>
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", "TMNCODE_MOCK" },
                { "vnp_Amount", (amountInVnd * 100).ToString() },
                { "vnp_CreateDate", DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", ipAddress },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", $"Thanh toan san SportBook booking {booking.Id}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", "https://sportbook.vn/payment-callback/vnpay" },
                { "vnp_TxnRef", booking.Id.ToString() }
            };

            var rawData = string.Join("&", vnpParams.Select(p => $"{p.Key}={Uri.EscapeDataString(p.Value)}"));
            var signValue = HmacSha512("SECRET_KEY_MOCK", rawData);
            
            return $"{vnpUrl}?{rawData}&vnp_SecureHash={signValue}";
        }
        else if (provider == PaymentProvider.Momo)
        {
            var momoUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
            var requestId = Guid.NewGuid().ToString();
            var rawSignature = $"accessKey=ACCESS_MOCK&amount={amountInVnd}&extraData=&ipnUrl=https://sportbook.vn/payment-callback/momo&orderId={booking.Id}&orderInfo=SportBook+Booking&partnerCode=MOMO_MOCK&redirectUrl=https://sportbook.vn/payment-callback/momo&requestId={requestId}&requestType=captureWallet";
            
            var signature = HmacSha256("SECRET_KEY_MOCK", rawSignature);
            return $"{momoUrl}?partnerCode=MOMO_MOCK&orderId={booking.Id}&requestId={requestId}&amount={amountInVnd}&orderInfo=SportBook+Booking&redirectUrl=https://sportbook.vn/payment-callback/momo&ipnUrl=https://sportbook.vn/payment-callback/momo&requestType=captureWallet&signature={signature}&extraData=";
        }

        throw new AppException("Phương thức thanh toán không hỗ trợ.", 400);
    }

    public async Task<bool> HandleCallbackAsync(string idempotencyKey, Dictionary<string, string> queryParameters, PaymentProvider provider)
    {
        var redisDb = _redis.GetDatabase();
        var cacheKey = $"idempotency:payment:{idempotencyKey}";
        
        // 1. Idempotency Check
        var processed = await redisDb.StringGetAsync(cacheKey);
        if (processed.HasValue)
        {
            return processed == "Success";
        }

        // 2. Resolve booking and payment status
        string bookingIdStr = provider == PaymentProvider.VNPay ? queryParameters["vnp_TxnRef"] : queryParameters["orderId"];
        if (!Guid.TryParse(bookingIdStr, out Guid bookingId))
            throw new AppException("Booking ID không hợp lệ trong callback.", 400);

        var booking = await _context.Bookings
            .Include(b => b.Court)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) throw new AppException("Đơn đặt sân không tìm thấy.", 404);

        // Verify checksum (Mock logic check: we check if response contains success code)
        bool isSuccess = false;
        if (provider == PaymentProvider.VNPay)
        {
            isSuccess = queryParameters.TryGetValue("vnp_ResponseCode", out string? resCode) && resCode == "00";
        }
        else if (provider == PaymentProvider.Momo)
        {
            isSuccess = queryParameters.TryGetValue("resultCode", out string? resCode) && resCode == "00";
        }

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var slots = await _context.TimeSlots.Where(ts => ts.BookingId == booking.Id).ToListAsync();

            if (isSuccess)
            {
                booking.Status = BookingStatus.Confirmed;
                
                // Add Payment Record
                var payment = new Payment
                {
                    Amount = booking.TotalPrice,
                    Provider = provider,
                    TransactionId = provider == PaymentProvider.VNPay ? queryParameters.GetValueOrDefault("vnp_TransactionNo", "VNP_" + Guid.NewGuid().ToString("N")[..6]) : queryParameters.GetValueOrDefault("transId", "MM_" + Guid.NewGuid().ToString("N")[..6]),
                    PaymentDate = DateTime.UtcNow,
                    Status = "Success",
                    BookingId = booking.Id
                };
                _context.Payments.Add(payment);

                // Update TimeSlot statuses to Booked
                foreach (var slot in slots)
                {
                    slot.Status = SlotStatus.Booked;
                    await redisDb.KeyDeleteAsync($"booking:hold:slot:{slot.Id}");
                }
            }
            else
            {
                booking.Status = BookingStatus.Cancelled;
                
                // Revert TimeSlots back to Available and clear their booking association
                foreach (var slot in slots)
                {
                    slot.Status = SlotStatus.Available;
                    slot.BookingId = null;
                    await redisDb.KeyDeleteAsync($"booking:hold:slot:{slot.Id}");
                }
            }

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            // Cache idempotency response for 24 hours
            await redisDb.StringSetAsync(cacheKey, isSuccess ? "Success" : "Failed", TimeSpan.FromHours(24));

            return isSuccess;
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    public async Task ProcessRefundAsync(Guid bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) throw new AppException("Đơn đặt sân không tồn tại.", 404);
        if (booking.Payment == null || booking.Payment.Status != "Success") return;

        // Calculate refund percentage
        // Cancellation rules:
        // >= 24h before start time: 100% refund
        // >= 2h before start time: 50% refund
        // < 2h before start time: 0% refund
        var bookingStartDateTime = booking.BookingDate.Date.Add(booking.StartTime);
        var timeDifference = bookingStartDateTime - DateTime.UtcNow;

        decimal refundPercentage = 0;
        if (timeDifference.TotalHours >= 24)
        {
            refundPercentage = 1.0m;
        }
        else if (timeDifference.TotalHours >= 2)
        {
            refundPercentage = 0.5m;
        }

        if (refundPercentage > 0)
        {
            var refundAmount = booking.TotalPrice * refundPercentage;
            
            // Perform actual payment gateway refund request (Mocked here)
            booking.Payment.Status = "Refunded";
            
            // Record refund details in Payment notes or database if needed
            var refundTransaction = new Payment
            {
                Amount = -refundAmount, // Negative amount signifies refund/outflow
                Provider = booking.Payment.Provider,
                TransactionId = "REF_" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
                PaymentDate = DateTime.UtcNow,
                Status = "Refunded",
                BookingId = booking.Id
            };
            _context.Payments.Add(refundTransaction);
            await _context.SaveChangesAsync();
        }
    }

    private string HmacSha512(string key, string message)
    {
        var keyByte = Encoding.UTF8.GetBytes(key);
        using var hmac = new HMACSHA512(keyByte);
        var messageBytes = Encoding.UTF8.GetBytes(message);
        var hashmessage = hmac.ComputeHash(messageBytes);
        return string.Concat(hashmessage.Select(b => b.ToString("x2")));
    }

    private string HmacSha256(string key, string message)
    {
        var keyByte = Encoding.UTF8.GetBytes(key);
        using var hmac = new HMACSHA256(keyByte);
        var messageBytes = Encoding.UTF8.GetBytes(message);
        var hashmessage = hmac.ComputeHash(messageBytes);
        return string.Concat(hashmessage.Select(b => b.ToString("x2")));
    }
}
