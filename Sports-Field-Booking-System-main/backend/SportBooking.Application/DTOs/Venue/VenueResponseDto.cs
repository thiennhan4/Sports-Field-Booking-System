namespace SportBooking.Application.DTOs.Venue;

public class VenueResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public decimal? MinPricePerHour { get; set; }
    public List<string> SportTypes { get; set; } = new();
}
