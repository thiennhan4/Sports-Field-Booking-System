using SportBooking.Application.DTOs.Booking;
using SportBooking.Application.DTOs.Slot;
using SportBooking.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportBooking.Application.Interfaces;

public interface IBookingService
{
    Task<BookingResponseDto> CreateBookingAsync(Guid userId, CreateBookingDto dto);
    Task<IEnumerable<BookingResponseDto>> GetMyBookingsAsync(Guid userId);
    Task<BookingResponseDto> GetBookingByIdAsync(Guid id);
    Task CancelBookingAsync(Guid userId, Guid bookingId);
    Task<IEnumerable<SlotResponseDto>> GetAvailableSlotsAsync(Guid courtId, DateTime date);
    Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync();
    Task<IEnumerable<BookingResponseDto>> GetOwnerBookingsAsync(Guid ownerId);
    Task UpdateStatusAsync(Guid userId, Guid bookingId, BookingStatus status);
}
