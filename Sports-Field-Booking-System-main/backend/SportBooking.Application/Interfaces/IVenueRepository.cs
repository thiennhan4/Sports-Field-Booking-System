using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface IVenueRepository
{
    Task<Venue?> GetByIdAsync(Guid id);
    Task<IEnumerable<Venue>> GetAllAsync();
    Task<IEnumerable<Venue>> GetByOwnerIdAsync(Guid ownerId);
    Task AddAsync(Venue venue);
    Task UpdateAsync(Venue venue);
    Task DeleteAsync(Venue venue);
}
