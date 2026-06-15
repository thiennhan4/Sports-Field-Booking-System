using MediatR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using SportBooking.Application.DTOs.Booking;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SportBooking.Application.Features.Bookings.Commands;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BookingResponseDto>
{
    private readonly IAppDbContext _context;
    private readonly ILockService _lockService;
    private readonly IConnectionMultiplexer _redis;

    public CreateBookingCommandHandler(
        IAppDbContext context,
        ILockService lockService,
        IConnectionMultiplexer redis)
    {
        _context = context;
        _lockService = lockService;
        _redis = redis;
    }

    public async Task<BookingResponseDto> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        if (request.TimeSlotIds == null || !request.TimeSlotIds.Any())
            throw new AppException("Vui lòng chọn ít nhất một khung giờ đặt sân.", 400);

        // Lock token to uniquely identify our ownership of locks
        var lockToken = Guid.NewGuid().ToString();
        var acquiredLocks = new List<string>();

        try
        {
            // 1. Acquire distributed locks for all slots sequentially
            foreach (var slotId in request.TimeSlotIds)
            {
                var lockKey = $"booking:lock:slot:{slotId}";
                // Try to acquire lock, expiring after 10 seconds to prevent deadlocks
                var lockAcquired = await _lockService.AcquireLockAsync(lockKey, lockToken, TimeSpan.FromSeconds(10));
                if (!lockAcquired)
                {
                    throw new AppException("Khung giờ này đang được giao dịch bởi người khác. Vui lòng thử lại sau.", 409);
                }
                acquiredLocks.Add(lockKey);
            }

            // 2. Perform DB check and insertion in a transaction
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                // Retrieve time slots from DB
                var timeSlots = await _context.TimeSlots
                    .Include(ts => ts.Court)
                        .ThenInclude(c => c.Venue)
                    .Where(ts => request.TimeSlotIds.Contains(ts.Id) && ts.CourtId == request.CourtId)
                    .ToListAsync(cancellationToken);

                if (timeSlots.Count != request.TimeSlotIds.Count)
                    throw new AppException("Một hoặc nhiều khung giờ chọn không hợp lệ.", 400);

                // Check SQL Server slot status (must be Available)
                if (timeSlots.Any(ts => ts.Status != SlotStatus.Available))
                    throw new AppException("Một hoặc nhiều khung giờ đã được đặt hoặc bị khóa.", 409);

                // Check Redis 15-minute temporary holds
                var db = _redis.GetDatabase();
                foreach (var slotId in request.TimeSlotIds)
                {
                    var holdKey = $"booking:hold:slot:{slotId}";
                    var currentHolder = await db.StringGetAsync(holdKey);
                    
                    // If held by another user, throw conflict
                    if (currentHolder.HasValue && currentHolder != request.UserId.ToString())
                    {
                        throw new AppException("Một hoặc nhiều khung giờ đã được giữ chỗ tạm thời bởi người khác.", 409);
                    }
                }

                // Calculate total price from slot prices
                decimal totalPrice = timeSlots.Sum(ts => ts.Price);

                // Create the Booking entity
                var booking = new Booking
                {
                    UserId = request.UserId,
                    CourtId = request.CourtId,
                    BookingDate = request.Date.Date,
                    StartTime = timeSlots.Min(ts => ts.StartTime),
                    EndTime = timeSlots.Max(ts => ts.EndTime),
                    TotalPrice = totalPrice,
                    Status = BookingStatus.Pending
                };

                _context.Bookings.Add(booking);

                // Associate time slots with this booking
                foreach (var ts in timeSlots)
                {
                    ts.BookingId = booking.Id;
                }
                
                // Save changes (this includes EF Core optimistic concurrency validation via RowVersion)
                await _context.SaveChangesAsync(cancellationToken);

                // 3. Lock slots temporarily in Redis (15-min hold)
                foreach (var slotId in request.TimeSlotIds)
                {
                    var holdKey = $"booking:hold:slot:{slotId}";
                    // Store the booking ID as the hold value, with 15-min TTL
                    await db.StringSetAsync(holdKey, request.UserId.ToString(), TimeSpan.FromMinutes(15));
                }

                await transaction.CommitAsync(cancellationToken);

                // Retrieve names safely for mapping response
                var firstSlot = timeSlots.First();
                return new BookingResponseDto
                {
                    Id = booking.Id,
                    BookingDate = booking.BookingDate,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    TotalPrice = booking.TotalPrice,
                    Status = booking.Status.ToString(),
                    UserId = booking.UserId,
                    CourtId = booking.CourtId,
                    CourtName = firstSlot.Court.Name,
                    VenueName = firstSlot.Court.Venue.Name,
                    CreatedAt = booking.CreatedAt
                };
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new AppException("Có xung đột khi đặt sân. Vui lòng thử lại.", 409);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
        finally
        {
            // 4. Release all acquired locks
            foreach (var lockKey in acquiredLocks)
            {
                await _lockService.ReleaseLockAsync(lockKey, lockToken);
            }
        }
    }
}
