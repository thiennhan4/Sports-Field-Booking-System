namespace SportBooking.Application.DTOs.Review;

public class ReviewResponseDto
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid VenueId { get; set; }
    public string VenueName { get; set; } = string.Empty;
    public Guid? BookingId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    public Guid VenueId { get; set; }
    public Guid? BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
