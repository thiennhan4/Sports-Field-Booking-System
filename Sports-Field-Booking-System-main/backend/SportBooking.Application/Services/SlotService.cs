using SportBooking.Application.DTOs.Slot;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class SlotService : ISlotService
{
    private readonly ISlotRepository _slotRepository;
    private readonly ICourtRepository _courtRepository;
    private readonly ISlotGenerator _slotGenerator;

    public SlotService(
        ISlotRepository slotRepository,
        ICourtRepository courtRepository,
        ISlotGenerator slotGenerator)
    {
        _slotRepository = slotRepository;
        _courtRepository = courtRepository;
        _slotGenerator = slotGenerator;
    }

    public async Task<SlotResponseDto> CreateAsync(Guid ownerId, Guid courtId, CreateSlotDto dto)
    {
        var court = await _courtRepository.GetByIdAsync(courtId);
        if (court == null)
            throw new AppException("Court not found.", 404);

        if (court.Venue == null || court.Venue.OwnerId != ownerId)
            throw new AppException("You do not have permission to add slot templates to this court.", 403);

        if (dto.StartTime >= dto.EndTime)
            throw new AppException("Start time must be before end time.", 400);

        var existingSlots = await _slotRepository.GetByCourtIdAsync(courtId);
        if (existingSlots.Any(s => s.StartTime < dto.EndTime && dto.StartTime < s.EndTime))
            throw new AppException("This slot overlaps with an existing slot template.", 400);

        var slot = new SlotTemplate
        {
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsActive = true,
            CourtId = courtId
        };

        await _slotRepository.AddAsync(slot);
        await _slotGenerator.GenerateSlotsForCourtAsync(courtId);

        return new SlotResponseDto
        {
            Id = slot.Id,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsActive = slot.IsActive,
            CourtId = slot.CourtId
        };
    }

    public async Task<IEnumerable<SlotResponseDto>> GetByCourtIdAsync(Guid courtId)
    {
        var court = await _courtRepository.GetByIdAsync(courtId);
        if (court == null)
            throw new AppException("Court not found.", 404);

        var slots = await _slotRepository.GetByCourtIdAsync(courtId);
        return slots.Select(slot => new SlotResponseDto
        {
            Id = slot.Id,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsActive = slot.IsActive,
            CourtId = slot.CourtId
        });
    }

    public async Task DeleteAsync(Guid ownerId, Guid id)
    {
        var slot = await _slotRepository.GetByIdAsync(id);
        if (slot == null)
            throw new AppException("Slot template not found.", 404);

        if (slot.Court == null || slot.Court.Venue == null || slot.Court.Venue.OwnerId != ownerId)
            throw new AppException("You do not have permission to delete this slot template.", 403);

        await _slotRepository.DeleteAsync(slot);
    }
}
