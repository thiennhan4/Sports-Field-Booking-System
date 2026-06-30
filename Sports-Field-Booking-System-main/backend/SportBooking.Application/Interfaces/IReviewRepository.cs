using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(Guid id);
    Task<Review?> GetByBookingIdAsync(Guid bookingId);
    Task<IEnumerable<Review>> GetByVenueIdAsync(Guid venueId);
    Task<IEnumerable<Review>> GetRecentAsync(int count);
    Task AddAsync(Review review);
    Task<(double AverageRating, int Count)> GetVenueStatsAsync(Guid venueId);
    Task<Dictionary<Guid, (double AverageRating, int Count)>> GetAllVenueStatsAsync();
}
