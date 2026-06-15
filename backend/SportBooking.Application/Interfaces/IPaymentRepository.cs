using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task<Payment?> GetByBookingIdAsync(Guid bookingId);
    Task AddAsync(Payment payment);
    Task UpdateAsync(Payment payment);
}
