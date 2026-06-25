using SportBooking.Application.DTOs.Court;

namespace SportBooking.Application.Interfaces;

public interface ICourtService
{
    Task<CourtResponseDto> CreateAsync(Guid ownerId, Guid venueId, CreateCourtDto dto);
    Task<IEnumerable<CourtResponseDto>> GetByVenueIdAsync(Guid venueId);
    Task<CourtResponseDto> GetByIdAsync(Guid id);
    Task<CourtResponseDto> UpdateAsync(Guid ownerId, Guid id, UpdateCourtDto dto);
    Task DeleteAsync(Guid ownerId, Guid id);
}
