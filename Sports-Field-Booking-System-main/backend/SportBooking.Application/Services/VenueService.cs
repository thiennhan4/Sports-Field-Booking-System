using SportBooking.Application.DTOs.Venue;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class VenueService : IVenueService
{
    private readonly IVenueRepository _venueRepository;
    private readonly IUserRepository _userRepository;
    private readonly IReviewRepository _reviewRepository;

    public VenueService(
        IVenueRepository venueRepository,
        IUserRepository userRepository,
        IReviewRepository reviewRepository)
    {
        _venueRepository = venueRepository;
        _userRepository = userRepository;
        _reviewRepository = reviewRepository;
    }

    public async Task<VenueResponseDto> CreateAsync(Guid ownerId, CreateVenueDto dto)
    {
        var owner = await _userRepository.GetByIdAsync(ownerId);
        if (owner == null)
            throw new AppException("Owner user not found.", 404);

        var venue = new Venue
        {
            Name = dto.Name,
            Description = dto.Description,
            Address = dto.Address,
            Phone = dto.Phone,
            ImageUrl = dto.ImageUrl,
            OwnerId = ownerId,
            Status = owner.Role == Domain.Enums.UserRole.Admin
                ? Domain.Enums.VenueStatus.Active
                : Domain.Enums.VenueStatus.Maintenance
        };

        await _venueRepository.AddAsync(venue);

        return await MapToDtoAsync(venue, owner?.Username ?? "Unknown");
    }

    public async Task<IEnumerable<VenueResponseDto>> GetAllAsync()
    {
        var venues = await _venueRepository.GetAllAsync();
        var stats = await _reviewRepository.GetAllVenueStatsAsync();
        var response = new List<VenueResponseDto>();

        foreach (var venue in venues)
        {
            var owner = await _userRepository.GetByIdAsync(venue.OwnerId);
            var (avg, count) = stats.GetValueOrDefault(venue.Id, (0, 0));
            response.Add(MapToDto(venue, owner?.Username ?? "Unknown", avg, count));
        }
        return response;
    }

    public async Task<IEnumerable<VenueResponseDto>> SearchAsync(VenueSearchQueryDto query)
    {
        var venues = await _venueRepository.SearchAsync(query);
        var stats = await _reviewRepository.GetAllVenueStatsAsync();
        var response = new List<VenueResponseDto>();

        foreach (var venue in venues)
        {
            var owner = await _userRepository.GetByIdAsync(venue.OwnerId);
            var (avg, count) = stats.GetValueOrDefault(venue.Id, (0, 0));
            response.Add(MapToDto(venue, owner?.Username ?? "Unknown", avg, count));
        }
        return response;
    }

    public async Task<VenueResponseDto> GetByIdAsync(Guid id)
    {
        var venue = await _venueRepository.GetByIdAsync(id);
        if (venue == null)
            throw new AppException("Venue not found.", 404);

        var owner = await _userRepository.GetByIdAsync(venue.OwnerId);
        var (avg, count) = await _reviewRepository.GetVenueStatsAsync(id);

        return MapToDto(venue, owner?.Username ?? "Unknown", avg, count);
    }

    public async Task<VenueResponseDto> UpdateAsync(Guid ownerId, Guid id, UpdateVenueDto dto)
    {
        var venue = await _venueRepository.GetByIdAsync(id);
        if (venue == null)
            throw new AppException("Venue not found.", 404);

        if (venue.OwnerId != ownerId)
        {
            var user = await _userRepository.GetByIdAsync(ownerId);
            if (user == null || user.Role != Domain.Enums.UserRole.Admin)
                throw new AppException("You do not have permission to update this venue.", 403);
        }

        venue.Name = dto.Name;
        venue.Description = dto.Description;
        venue.Address = dto.Address;
        venue.Phone = dto.Phone;
        venue.ImageUrl = dto.ImageUrl;
        venue.Status = dto.Status;

        await _venueRepository.UpdateAsync(venue);

        var owner = await _userRepository.GetByIdAsync(venue.OwnerId);
        var (avg, count) = await _reviewRepository.GetVenueStatsAsync(id);

        return MapToDto(venue, owner?.Username ?? "Unknown", avg, count);
    }

    public async Task DeleteAsync(Guid ownerId, Guid id)
    {
        var venue = await _venueRepository.GetByIdAsync(id);
        if (venue == null)
            throw new AppException("Venue not found.", 404);

        if (venue.OwnerId != ownerId)
            throw new AppException("You do not have permission to delete this venue.", 403);

        await _venueRepository.DeleteAsync(venue);
    }

    private static VenueResponseDto MapToDto(Venue venue, string ownerName, double avgRating = 0, int reviewCount = 0) => new()
    {
        Id = venue.Id,
        Name = venue.Name,
        Description = venue.Description,
        Address = venue.Address,
        Phone = venue.Phone,
        Status = venue.Status.ToString(),
        ImageUrl = venue.ImageUrl,
        OwnerId = venue.OwnerId,
        OwnerName = ownerName,
        CreatedAt = venue.CreatedAt,
        AverageRating = Math.Round(avgRating, 1),
        ReviewCount = reviewCount,
        Latitude = venue.Latitude,
        Longitude = venue.Longitude,
        MinPricePerHour = venue.Courts.Any()
            ? venue.Courts.Min(c => c.PricePerHour)
            : null,
        SportTypes = venue.Courts
            .Select(c => c.SportType.ToString())
            .Distinct()
            .ToList()
    };

    private async Task<VenueResponseDto> MapToDtoAsync(Venue venue, string ownerName)
    {
        var (avg, count) = await _reviewRepository.GetVenueStatsAsync(venue.Id);
        return MapToDto(venue, ownerName, avg, count);
    }
}
