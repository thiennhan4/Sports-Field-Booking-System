using SportBooking.Application.DTOs.Court;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class CourtService : ICourtService
{
    private readonly ICourtRepository _courtRepository;
    private readonly IVenueRepository _venueRepository;

    public CourtService(ICourtRepository courtRepository, IVenueRepository venueRepository)
    {
        _courtRepository = courtRepository;
        _venueRepository = venueRepository;
    }

    public async Task<CourtResponseDto> CreateAsync(Guid ownerId, Guid venueId, CreateCourtDto dto)
    {
        var venue = await _venueRepository.GetByIdAsync(venueId);
        if (venue == null)
            throw new AppException("Venue not found.", 404);

        if (venue.OwnerId != ownerId)
            throw new AppException("You do not have permission to add courts to this venue.", 403);

        var court = new Court
        {
            Name = dto.Name,
            SportType = dto.SportType,
            PricePerHour = dto.PricePerHour,
            VenueId = venueId
        };

        await _courtRepository.AddAsync(court);

        return new CourtResponseDto
        {
            Id = court.Id,
            Name = court.Name,
            SportType = court.SportType.ToString(),
            PricePerHour = court.PricePerHour,
            VenueId = court.VenueId,
            VenueName = venue.Name,
            CreatedAt = court.CreatedAt
        };
    }

    public async Task<IEnumerable<CourtResponseDto>> GetByVenueIdAsync(Guid venueId)
    {
        var venue = await _venueRepository.GetByIdAsync(venueId);
        if (venue == null)
            throw new AppException("Venue not found.", 404);

        var courts = await _courtRepository.GetByVenueIdAsync(venueId);
        return courts.Select(court => new CourtResponseDto
        {
            Id = court.Id,
            Name = court.Name,
            SportType = court.SportType.ToString(),
            PricePerHour = court.PricePerHour,
            VenueId = court.VenueId,
            VenueName = venue.Name,
            CreatedAt = court.CreatedAt
        });
    }

    public async Task<CourtResponseDto> GetByIdAsync(Guid id)
    {
        var court = await _courtRepository.GetByIdAsync(id);
        if (court == null)
            throw new AppException("Court not found.", 404);

        return new CourtResponseDto
        {
            Id = court.Id,
            Name = court.Name,
            SportType = court.SportType.ToString(),
            PricePerHour = court.PricePerHour,
            VenueId = court.VenueId,
            VenueName = court.Venue?.Name ?? "Unknown",
            CreatedAt = court.CreatedAt
        };
    }

    public async Task<CourtResponseDto> UpdateAsync(Guid ownerId, Guid id, UpdateCourtDto dto)
    {
        var court = await _courtRepository.GetByIdAsync(id);
        if (court == null)
            throw new AppException("Court not found.", 404);

        if (court.Venue == null || court.Venue.OwnerId != ownerId)
            throw new AppException("You do not have permission to update this court.", 403);

        court.Name = dto.Name;
        court.SportType = dto.SportType;
        court.PricePerHour = dto.PricePerHour;

        await _courtRepository.UpdateAsync(court);

        return new CourtResponseDto
        {
            Id = court.Id,
            Name = court.Name,
            SportType = court.SportType.ToString(),
            PricePerHour = court.PricePerHour,
            VenueId = court.VenueId,
            VenueName = court.Venue.Name,
            CreatedAt = court.CreatedAt
        };
    }

    public async Task DeleteAsync(Guid ownerId, Guid id)
    {
        var court = await _courtRepository.GetByIdAsync(id);
        if (court == null)
            throw new AppException("Court not found.", 404);

        if (court.Venue == null || court.Venue.OwnerId != ownerId)
            throw new AppException("You do not have permission to delete this court.", 403);

        await _courtRepository.DeleteAsync(court);
    }
}
