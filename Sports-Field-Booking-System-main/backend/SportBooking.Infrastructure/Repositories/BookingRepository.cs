using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _context;

    public BookingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(Guid id)
    {
        return await _context.Bookings
            .Include(b => b.Court)
                .ThenInclude(c => c.Venue)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Bookings
            .Include(b => b.Court)
                .ThenInclude(c => c.Venue)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasConflictAsync(Guid courtId, DateTime bookingDate, TimeSpan startTime, TimeSpan endTime)
    {
        var targetDate = bookingDate.Date;
        return await _context.Bookings
            .AnyAsync(b => b.CourtId == courtId &&
                           b.BookingDate.Date == targetDate &&
                           b.Status != BookingStatus.Cancelled &&
                           b.StartTime < endTime &&
                           startTime < b.EndTime);
    }

    public async Task AddAsync(Booking booking)
    {
        await _context.Bookings.AddAsync(booking);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Booking>> GetBookingsByCourtAndDateAsync(Guid courtId, DateTime date)
    {
        var targetDate = date.Date;
        return await _context.Bookings
            .Where(b => b.CourtId == courtId &&
                       b.BookingDate.Date == targetDate &&
                       b.Status != BookingStatus.Cancelled)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetAllAsync()
    {
        return await _context.Bookings
            .Include(b => b.Court)
                .ThenInclude(c => c.Venue)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByOwnerIdAsync(Guid ownerId)
    {
        return await _context.Bookings
            .Include(b => b.Court)
                .ThenInclude(c => c.Venue)
            .Where(b => b.Court.Venue.OwnerId == ownerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }
}
