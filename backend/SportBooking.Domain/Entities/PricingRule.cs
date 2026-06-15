using SportBooking.Domain.Common;

namespace SportBooking.Domain.Entities;

public class PricingRule : BaseEntity
{
    public Guid CourtId { get; set; }
    public Court Court { get; set; } = null!;
    
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    
    public decimal WeekdayPrice { get; set; }
    public decimal WeekendPrice { get; set; }
    public bool IsActive { get; set; } = true;
}
