using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SportBooking.Application.DTOs.Payment;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using SportBooking.Domain.Enums;
using System.Security.Claims;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly string _frontendUrl;

    public PaymentsController(IPaymentService paymentService, IConfiguration configuration)
    {
        _paymentService = paymentService;
        _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
    }

    [HttpPost("payments")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> Process([FromBody] CreatePaymentDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _paymentService.ProcessPaymentAsync(userId, dto);
        return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment processed successfully."));
    }

    [HttpGet("bookings/{bookingId}/payment")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> GetByBooking(Guid bookingId)
    {
        var result = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
        return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment retrieved successfully."));
    }

    [HttpPost("payments/create-url")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<string>>> CreatePaymentUrl([FromQuery] Guid bookingId, [FromQuery] PaymentProvider provider)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        
        var result = await _paymentService.CreatePaymentUrlAsync(userId, bookingId, provider, ipAddress);
        return Ok(ApiResponse<string>.Ok(result, "Payment URL generated successfully."));
    }

    [HttpGet("payments/callback/vnpay")]
    public async Task<IActionResult> VnpayCallback()
    {
        var queryParams = HttpContext.Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
        var idempotencyKey = queryParams.GetValueOrDefault("vnp_TransactionNo", Guid.NewGuid().ToString());
        var bookingId = queryParams.GetValueOrDefault("vnp_TxnRef", "");
        
        var isSuccess = await _paymentService.HandleCallbackAsync(idempotencyKey, queryParams, PaymentProvider.VNPay);
        
        return Redirect($"{_frontendUrl}/payment/callback?status={(isSuccess ? "success" : "failed")}&provider=vnpay&bookingId={bookingId}");
    }

    [HttpPost("payments/callback/momo")]
    [HttpGet("payments/callback/momo")]
    public async Task<IActionResult> MomoCallback()
    {
        var queryParams = HttpContext.Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
        if (!queryParams.Any() && HttpContext.Request.HasFormContentType)
        {
            queryParams = HttpContext.Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());
        }

        var idempotencyKey = queryParams.GetValueOrDefault("transId", Guid.NewGuid().ToString());
        var bookingId = queryParams.GetValueOrDefault("orderId", "");
        
        var isSuccess = await _paymentService.HandleCallbackAsync(idempotencyKey, queryParams, PaymentProvider.Momo);
        
        return Redirect($"{_frontendUrl}/payment/callback?status={(isSuccess ? "success" : "failed")}&provider=momo&bookingId={bookingId}");
    }

    [HttpPost("bookings/{bookingId}/refund")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<string>>> RefundBooking(Guid bookingId)
    {
        await _paymentService.ProcessRefundAsync(bookingId);
        return Ok(ApiResponse<string>.Ok("Refund processed.", "Refund processed successfully if eligible."));
    }
}
