namespace SportBooking.Application.Interfaces;

public interface ISlotGenerator
{
    Task GenerateSlotsForNext30DaysAsync();
    Task GenerateSlotsForCourtAsync(Guid courtId);
}
