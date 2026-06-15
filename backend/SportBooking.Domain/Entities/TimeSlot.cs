using SportBooking.Domain.Common;
using SportBooking.Domain.Enums;

namespace SportBooking.Domain.Entities;

public class TimeSlot : BaseEntity
{
    public Guid CourtId { get; set; }
    public Court Court { get; set; } = null!;
    
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    
    public decimal Price { get; set; }
    
    public SlotStatus Status { get; set; } = SlotStatus.Available;

    public Guid? BookingId { get; set; }
    public Booking? Booking { get; set; }
    
    // Concurrency token for optimistic locking
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
