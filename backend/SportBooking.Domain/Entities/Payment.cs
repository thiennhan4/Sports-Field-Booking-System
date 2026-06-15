using SportBooking.Domain.Common;
using SportBooking.Domain.Enums;

namespace SportBooking.Domain.Entities;

public class Payment : BaseEntity
{
    public decimal Amount { get; set; }
    public PaymentProvider Provider { get; set; }
    public string? TransactionId { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Status { get; set; } = "Pending";

    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
}
