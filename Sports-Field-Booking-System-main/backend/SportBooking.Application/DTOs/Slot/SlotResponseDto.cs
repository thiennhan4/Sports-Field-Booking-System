namespace SportBooking.Application.DTOs.Slot;

public class SlotResponseDto
{
    public Guid Id { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; }
    public Guid CourtId { get; set; }
}
