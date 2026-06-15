using SportBooking.Application.DTOs.Booking;
using SportBooking.Application.DTOs.Slot;

namespace SportBooking.Application.Interfaces;

public interface IBookingService
{
    Task<BookingResponseDto> CreateBookingAsync(Guid userId, CreateBookingDto dto);
    Task<IEnumerable<BookingResponseDto>> GetMyBookingsAsync(Guid userId);
    Task<BookingResponseDto> GetBookingByIdAsync(Guid id);
    Task CancelBookingAsync(Guid userId, Guid bookingId);
    Task<IEnumerable<SlotResponseDto>> GetAvailableSlotsAsync(Guid courtId, DateTime date);
}
