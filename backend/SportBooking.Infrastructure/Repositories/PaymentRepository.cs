using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment?> GetByBookingIdAsync(Guid bookingId)
    {
        return await _context.Payments
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId);
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();
    }
}
