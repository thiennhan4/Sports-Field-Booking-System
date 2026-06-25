using MediatR;
using SportBooking.Application.DTOs.Booking;
using System;
using System.Collections.Generic;

namespace SportBooking.Application.Features.Bookings.Commands;

public record CreateBookingCommand(
    Guid UserId,
    Guid CourtId,
    DateTime Date,
    List<Guid> TimeSlotIds
) : IRequest<BookingResponseDto>;
