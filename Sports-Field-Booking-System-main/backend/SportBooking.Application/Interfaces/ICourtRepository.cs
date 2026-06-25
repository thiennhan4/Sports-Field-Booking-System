using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface ICourtRepository
{
    Task<Court?> GetByIdAsync(Guid id);
    Task<IEnumerable<Court>> GetByVenueIdAsync(Guid venueId);
    Task AddAsync(Court court);
    Task UpdateAsync(Court court);
    Task DeleteAsync(Court court);
}
