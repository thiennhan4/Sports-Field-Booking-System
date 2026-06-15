using SportBooking.Domain.Enums;

namespace SportBooking.Application.DTOs.Venue;

public class UpdateVenueDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public VenueStatus Status { get; set; }
}
