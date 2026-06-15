namespace SportBooking.Application.DTOs.Court;

public class CourtResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SportType { get; set; } = string.Empty;
    public decimal PricePerHour { get; set; }
    public Guid VenueId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
