using SportBooking.Application.DTOs.Venue;

namespace SportBooking.Application.Interfaces;

public interface IVenueService
{
    Task<VenueResponseDto> CreateAsync(Guid ownerId, CreateVenueDto dto);
    Task<IEnumerable<VenueResponseDto>> GetAllAsync();
    Task<VenueResponseDto> GetByIdAsync(Guid id);
    Task<VenueResponseDto> UpdateAsync(Guid ownerId, Guid id, UpdateVenueDto dto);
    Task DeleteAsync(Guid ownerId, Guid id);
}
