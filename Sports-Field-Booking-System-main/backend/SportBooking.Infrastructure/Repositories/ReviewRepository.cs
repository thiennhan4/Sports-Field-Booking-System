using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(Guid id)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Venue)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Review?> GetByBookingIdAsync(Guid bookingId)
    {
        return await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);
    }

    public async Task<IEnumerable<Review>> GetByVenueIdAsync(Guid venueId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.VenueId == venueId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetRecentAsync(int count)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Venue)
            .OrderByDescending(r => r.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task AddAsync(Review review)
    {
        await _context.Reviews.AddAsync(review);
        await _context.SaveChangesAsync();
    }

    public async Task<(double AverageRating, int Count)> GetVenueStatsAsync(Guid venueId)
    {
        var stats = await _context.Reviews
            .Where(r => r.VenueId == venueId)
            .GroupBy(r => r.VenueId)
            .Select(g => new { Average = g.Average(r => r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();

        return stats == null ? (0, 0) : (stats.Average, stats.Count);
    }

    public async Task<Dictionary<Guid, (double AverageRating, int Count)>> GetAllVenueStatsAsync()
    {
        var stats = await _context.Reviews
            .GroupBy(r => r.VenueId)
            .Select(g => new { VenueId = g.Key, Average = g.Average(r => r.Rating), Count = g.Count() })
            .ToListAsync();

        return stats.ToDictionary(s => s.VenueId, s => (s.Average, s.Count));
    }
}
