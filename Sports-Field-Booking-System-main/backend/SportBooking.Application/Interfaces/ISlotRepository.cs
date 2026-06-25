using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface ISlotRepository
{
    Task<SlotTemplate?> GetByIdAsync(Guid id);
    Task<IEnumerable<SlotTemplate>> GetByCourtIdAsync(Guid courtId);
    Task AddAsync(SlotTemplate slot);
    Task UpdateAsync(SlotTemplate slot);
    Task DeleteAsync(SlotTemplate slot);
}
