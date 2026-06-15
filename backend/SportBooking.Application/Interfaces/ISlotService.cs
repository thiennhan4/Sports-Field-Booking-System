using SportBooking.Application.DTOs.Slot;

namespace SportBooking.Application.Interfaces;

public interface ISlotService
{
    Task<SlotResponseDto> CreateAsync(Guid ownerId, Guid courtId, CreateSlotDto dto);
    Task<IEnumerable<SlotResponseDto>> GetByCourtIdAsync(Guid courtId);
    Task DeleteAsync(Guid ownerId, Guid id);
}
