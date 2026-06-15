namespace SportBooking.Application.DTOs.Booking;

public class CreateBookingDto
{
    public Guid CourtId { get; set; }
    public DateTime BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public System.Collections.Generic.List<Guid> TimeSlotIds { get; set; } = new System.Collections.Generic.List<Guid>();
}
