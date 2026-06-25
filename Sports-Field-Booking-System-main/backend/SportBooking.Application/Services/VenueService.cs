using SportBooking.Application.DTOs.Venue;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class VenueService : IVenueService
{
    private readonly IVenueRepository _venueRepository;
    private readonly IUserRepository _userRepository;

    public VenueService(IVenueRepository venueRepository, IUserRepository userRepository)
    {
        _venueRepository = venueRepository;
        _userRepository = userRepository;
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
            OwnerId = ownerId,
            Status = owner.Role == Domain.Enums.UserRole.Admin
                ? Domain.Enums.VenueStatus.Active
                : Domain.Enums.VenueStatus.Maintenance
        };

        await _venueRepository.AddAsync(venue);

        return new VenueResponseDto
        {
            Id = venue.Id,
            Name = venue.Name,
            Description = venue.Description,
            Address = venue.Address,
            Phone = venue.Phone,
            Status = venue.Status.ToString(),
            OwnerId = venue.OwnerId,
            OwnerName = owner.Username,
            CreatedAt = venue.CreatedAt
        };
    }

    public async Task<IEnumerable<VenueResponseDto>> GetAllAsync()
    {
        var venues = await _venueRepository.GetAllAsync();
        var response = new List<VenueResponseDto>();
        foreach (var venue in venues)
        {
            var owner = await _userRepository.GetByIdAsync(venue.OwnerId);
            response.Add(new VenueResponseDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Description = venue.Description,
                Address = venue.Address,
                Phone = venue.Phone,
                Status = venue.Status.ToString(),
                OwnerId = venue.OwnerId,
                OwnerName = owner?.Username ?? "Unknown",
                CreatedAt = venue.CreatedAt
            });
        }
        return response;
    }

    public async Task<VenueResponseDto> GetByIdAsync(Guid id)
    {
        var venue = await _venueRepository.GetByIdAsync(id);
        if (venue == null)
            throw new AppException("Venue not found.", 404);

        var owner = await _userRepository.GetByIdAsync(venue.OwnerId);

        return new VenueResponseDto
        {
            Id = venue.Id,
            Name = venue.Name,
            Description = venue.Description,
            Address = venue.Address,
            Phone = venue.Phone,
            Status = venue.Status.ToString(),
            OwnerId = venue.OwnerId,
            OwnerName = owner?.Username ?? "Unknown",
            CreatedAt = venue.CreatedAt
        };
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
        venue.Status = dto.Status;

        await _venueRepository.UpdateAsync(venue);

        var owner = await _userRepository.GetByIdAsync(venue.OwnerId);

        return new VenueResponseDto
        {
            Id = venue.Id,
            Name = venue.Name,
            Description = venue.Description,
            Address = venue.Address,
            Phone = venue.Phone,
            Status = venue.Status.ToString(),
            OwnerId = venue.OwnerId,
            OwnerName = owner?.Username ?? "Unknown",
            CreatedAt = venue.CreatedAt
        };
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
}
