using SportBooking.Domain.Enums;

namespace SportBooking.Application.DTOs.Payment;

public class CreatePaymentDto
{
    public Guid BookingId { get; set; }
    public PaymentProvider Provider { get; set; }
}
