using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Payment;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using System.Security.Claims;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("payments")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> Process([FromBody] CreatePaymentDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _paymentService.ProcessPaymentAsync(userId, dto);
        return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment processed successfully."));
    }

    [HttpGet("bookings/{bookingId}/payment")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> GetByBooking(Guid bookingId)
    {
        var result = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
        return Ok(ApiResponse<PaymentResponseDto>.Ok(result, "Payment retrieved successfully."));
    }
}
