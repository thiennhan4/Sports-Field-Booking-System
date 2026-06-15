using SportBooking.Domain.Common;

namespace SportBooking.Domain.Entities;

public class HolidayPrice : BaseEntity
{
    public Guid VenueId { get; set; }
    public Venue Venue { get; set; } = null!;
    
    public DateTime Date { get; set; }
    public decimal SpecialPricePerHour { get; set; }
    public string Description { get; set; } = string.Empty;
}
