using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Booking;
using SportBooking.Application.Features.Bookings.Commands;
using SportBooking.Application.Features.Bookings.Queries;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IMediator _mediator;

    public BookingsController(IBookingService bookingService, IMediator mediator)
    {
        _bookingService = bookingService;
        _mediator = mediator;
    }

    [HttpPost("bookings")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<BookingResponseDto>>> Create([FromBody] CreateBookingDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new CreateBookingCommand(userId, dto.CourtId, dto.BookingDate, dto.TimeSlotIds);
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<BookingResponseDto>.Ok(result, "Đơn đặt sân đã được tạo thành công."));
    }

    [HttpGet("bookings/my")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<IEnumerable<BookingResponseDto>>>> GetMyBookings()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _bookingService.GetMyBookingsAsync(userId);
        return Ok(ApiResponse<IEnumerable<BookingResponseDto>>.Ok(result, "Danh sách đơn đặt sân của tôi."));
    }

    [HttpGet("bookings/{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<BookingResponseDto>>> GetById(Guid id)
    {
        var result = await _bookingService.GetBookingByIdAsync(id);
        return Ok(ApiResponse<BookingResponseDto>.Ok(result, "Thông tin đơn đặt sân."));
    }

    [HttpPut("bookings/{id}/cancel")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Cancel(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        await _bookingService.CancelBookingAsync(userId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Đã hủy đơn đặt sân thành công."));
    }

    [HttpGet("courts/{courtId}/availability")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TimeSlotDto>>>> GetAvailability(Guid courtId, [FromQuery] DateTime date)
    {
        var query = new GetAvailableSlotsQuery(courtId, date);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<IEnumerable<TimeSlotDto>>.Ok(result, "Danh sách khung giờ trống."));
    }
}
