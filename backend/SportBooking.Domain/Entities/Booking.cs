using SportBooking.Domain.Common;
using SportBooking.Domain.Enums;

namespace SportBooking.Domain.Entities;

public class Booking : BaseEntity
{
    public DateTime BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    // Concurrency token (Row version)
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CourtId { get; set; }
    public Court Court { get; set; } = null!;

    public Payment? Payment { get; set; }
    public Review? Review { get; set; }
}
