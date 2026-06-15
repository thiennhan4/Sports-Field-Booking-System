using SportBooking.Domain.Common;

namespace SportBooking.Domain.Entities;

public class Review : BaseEntity
{
    public int Rating { get; set; } // 1 to 5
    public string? Comment { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid VenueId { get; set; }
    public Venue Venue { get; set; } = null!;

    public Guid? BookingId { get; set; }
    public Booking? Booking { get; set; }
}
