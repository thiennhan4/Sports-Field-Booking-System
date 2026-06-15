using SportBooking.Application.DTOs.Booking;
using SportBooking.Application.DTOs.Slot;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ICourtRepository _courtRepository;
    private readonly ISlotRepository _slotRepository;

    public BookingService(
        IBookingRepository bookingRepository, 
        ICourtRepository courtRepository, 
        ISlotRepository slotRepository)
    {
        _bookingRepository = bookingRepository;
        _courtRepository = courtRepository;
        _slotRepository = slotRepository;
    }

    public async Task<BookingResponseDto> CreateBookingAsync(Guid userId, CreateBookingDto dto)
    {
        var court = await _courtRepository.GetByIdAsync(dto.CourtId);
        if (court == null)
            throw new AppException("Sân không tồn tại.", 404);

        if (dto.StartTime >= dto.EndTime)
            throw new AppException("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.", 400);

        // Verify slot template exists
        var slotTemplates = await _slotRepository.GetByCourtIdAsync(dto.CourtId);
        var validTemplate = slotTemplates.FirstOrDefault(s => 
            s.StartTime == dto.StartTime && 
            s.EndTime == dto.EndTime && 
            s.IsActive);

        if (validTemplate == null)
            throw new AppException("Khung giờ đặt sân không hợp lệ.", 400);

        // Check if there is already a booking for this slot
        var hasConflict = await _bookingRepository.HasConflictAsync(
            dto.CourtId, 
            dto.BookingDate, 
            dto.StartTime, 
            dto.EndTime);

        if (hasConflict)
            throw new AppException("Khung giờ này đã được đặt bởi người khác.", 409);

        // Calculate TotalPrice
        var duration = dto.EndTime - dto.StartTime;
        var hours = (decimal)duration.TotalHours;
        var totalPrice = court.PricePerHour * hours;

        var booking = new Booking
        {
            BookingDate = dto.BookingDate.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            TotalPrice = totalPrice,
            Status = BookingStatus.Pending,
            UserId = userId,
            CourtId = dto.CourtId
        };

        await _bookingRepository.AddAsync(booking);

        return new BookingResponseDto
        {
            Id = booking.Id,
            BookingDate = booking.BookingDate,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            UserId = booking.UserId,
            CourtId = booking.CourtId,
            CourtName = court.Name,
            VenueName = court.Venue?.Name ?? "Unknown",
            CreatedAt = booking.CreatedAt
        };
    }

    public async Task<IEnumerable<BookingResponseDto>> GetMyBookingsAsync(Guid userId)
    {
        var bookings = await _bookingRepository.GetByUserIdAsync(userId);
        return bookings.Select(b => new BookingResponseDto
        {
            Id = b.Id,
            BookingDate = b.BookingDate,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            TotalPrice = b.TotalPrice,
            Status = b.Status.ToString(),
            UserId = b.UserId,
            CourtId = b.CourtId,
            CourtName = b.Court?.Name ?? "Unknown",
            VenueName = b.Court?.Venue?.Name ?? "Unknown",
            CreatedAt = b.CreatedAt
        });
    }

    public async Task<BookingResponseDto> GetBookingByIdAsync(Guid id)
    {
        var b = await _bookingRepository.GetByIdAsync(id);
        if (b == null)
            throw new AppException("Đơn đặt sân không tồn tại.", 404);

        return new BookingResponseDto
        {
            Id = b.Id,
            BookingDate = b.BookingDate,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            TotalPrice = b.TotalPrice,
            Status = b.Status.ToString(),
            UserId = b.UserId,
            CourtId = b.CourtId,
            CourtName = b.Court?.Name ?? "Unknown",
            VenueName = b.Court?.Venue?.Name ?? "Unknown",
            CreatedAt = b.CreatedAt
        };
    }

    public async Task CancelBookingAsync(Guid userId, Guid bookingId)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null)
            throw new AppException("Đơn đặt sân không tồn tại.", 404);

        if (booking.UserId != userId)
            throw new AppException("Bạn không có quyền hủy đơn đặt sân này.", 403);

        if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Confirmed)
            throw new AppException("Không thể hủy đơn đặt sân ở trạng thái này.", 400);

        booking.Status = BookingStatus.Cancelled;
        await _bookingRepository.UpdateAsync(booking);
    }

    public async Task<IEnumerable<SlotResponseDto>> GetAvailableSlotsAsync(Guid courtId, DateTime date)
    {
        var court = await _courtRepository.GetByIdAsync(courtId);
        if (court == null)
            throw new AppException("Sân không tồn tại.", 404);

        var templates = await _slotRepository.GetByCourtIdAsync(courtId);
        var activeTemplates = templates.Where(t => t.IsActive).ToList();

        var bookings = await _bookingRepository.GetBookingsByCourtAndDateAsync(courtId, date);

        var availableSlots = new List<SlotResponseDto>();
        foreach (var template in activeTemplates)
        {
            // Check if any booking overlaps with this template slot
            var isBooked = bookings.Any(b => 
                b.StartTime < template.EndTime && 
                template.StartTime < b.EndTime);

            if (!isBooked)
            {
                availableSlots.Add(new SlotResponseDto
                {
                    Id = template.Id,
                    StartTime = template.StartTime,
                    EndTime = template.EndTime,
                    IsActive = template.IsActive,
                    CourtId = template.CourtId
                });
            }
        }

        return availableSlots;
    }
}
