namespace SportBooking.Application.DTOs.Slot;

public class CreateSlotDto
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
