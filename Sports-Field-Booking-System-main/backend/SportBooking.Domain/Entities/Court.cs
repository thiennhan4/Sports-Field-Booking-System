using SportBooking.Domain.Common;
using SportBooking.Domain.Enums;

namespace SportBooking.Domain.Entities;

public class Court : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public SportType SportType { get; set; }
    public decimal PricePerHour { get; set; }

    public Guid VenueId { get; set; }
    public Venue Venue { get; set; } = null!;

    // Navigation properties
    public ICollection<SlotTemplate> SlotTemplates { get; set; } = new List<SlotTemplate>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
