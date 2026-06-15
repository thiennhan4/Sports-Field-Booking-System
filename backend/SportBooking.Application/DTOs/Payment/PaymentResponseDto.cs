namespace SportBooking.Application.DTOs.Payment;

public class PaymentResponseDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid BookingId { get; set; }
    public DateTime CreatedAt { get; set; }
}
