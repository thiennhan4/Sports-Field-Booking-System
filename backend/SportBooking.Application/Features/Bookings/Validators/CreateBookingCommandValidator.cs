using FluentValidation;
using SportBooking.Application.Features.Bookings.Commands;
using System;

namespace SportBooking.Application.Features.Bookings.Validators;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId không được để trống.");

        RuleFor(x => x.CourtId)
            .NotEmpty().WithMessage("Sân (CourtId) không được để trống.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Ngày đặt sân không được để trống.")
            .Must(BeValidDate).WithMessage("Ngày đặt sân không hợp lệ. Phải từ ngày hôm nay trở đi.");

        RuleFor(x => x.TimeSlotIds)
            .NotEmpty().WithMessage("Phải chọn ít nhất một khung giờ đặt sân.")
            .Must(x => x != null && x.Count > 0).WithMessage("Phải chọn ít nhất một khung giờ đặt sân.");
    }

    private bool BeValidDate(DateTime date)
    {
        return date.Date >= DateTime.UtcNow.Date;
    }
}
