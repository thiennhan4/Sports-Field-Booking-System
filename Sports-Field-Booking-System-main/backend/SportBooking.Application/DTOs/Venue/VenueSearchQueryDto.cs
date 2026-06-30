namespace SportBooking.Application.DTOs.Venue;

public class VenueSearchQueryDto
{
    public string? Name { get; set; }
    public string? District { get; set; }
    public string? SportType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
}
