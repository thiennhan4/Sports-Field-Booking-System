using SportBooking.Domain.Common;

namespace SportBooking.Domain.Entities;

public class SlotTemplate : BaseEntity
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid CourtId { get; set; }
    public Court Court { get; set; } = null!;
}
