using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id);
    Task<IEnumerable<Booking>> GetByUserIdAsync(Guid userId);
    Task<bool> HasConflictAsync(Guid courtId, DateTime bookingDate, TimeSpan startTime, TimeSpan endTime);
    Task AddAsync(Booking booking);
    Task UpdateAsync(Booking booking);
    Task<IEnumerable<Booking>> GetBookingsByCourtAndDateAsync(Guid courtId, DateTime date);
}
