using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using SportBooking.Domain.Enums;
using SportBooking.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SportBooking.Infrastructure.Services;

public class UnpaidBookingCancelJob
{
    private readonly AppDbContext _context;
    private readonly IConnectionMultiplexer _redis;

    public UnpaidBookingCancelJob(AppDbContext context, IConnectionMultiplexer redis)
    {
        _context = context;
        _redis = redis;
    }

    public async Task CancelExpiredBookingsAsync()
    {
        var expirationThreshold = DateTime.UtcNow.AddMinutes(-15);

        // Fetch bookings that are Pending and older than 15 minutes
        var expiredBookings = await _context.Bookings
            .Where(b => b.Status == BookingStatus.Pending && b.CreatedAt <= expirationThreshold)
            .ToListAsync();

        if (!expiredBookings.Any()) return;

        var db = _redis.GetDatabase();

        foreach (var booking in expiredBookings)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Update booking status
                booking.Status = BookingStatus.Cancelled;

                // Retrieve and release all associated slots
                var slots = await _context.TimeSlots
                    .Where(ts => ts.BookingId == booking.Id)
                    .ToListAsync();

                foreach (var slot in slots)
                {
                    slot.Status = SlotStatus.Available;
                    slot.BookingId = null;

                    // Release Redis hold key
                    var holdKey = $"booking:hold:slot:{slot.Id}";
                    await db.KeyDeleteAsync(holdKey);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                // Log and continue to next booking
            }
        }
    }
}
