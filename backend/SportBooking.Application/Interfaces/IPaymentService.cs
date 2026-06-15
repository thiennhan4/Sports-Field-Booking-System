using SportBooking.Application.DTOs.Payment;
using SportBooking.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportBooking.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseDto> ProcessPaymentAsync(Guid userId, CreatePaymentDto dto);
    Task<PaymentResponseDto> GetPaymentByBookingIdAsync(Guid bookingId);
    Task<string> CreatePaymentUrlAsync(Guid userId, Guid bookingId, PaymentProvider provider, string ipAddress);
    Task<bool> HandleCallbackAsync(string idempotencyKey, Dictionary<string, string> queryParameters, PaymentProvider provider);
    Task ProcessRefundAsync(Guid bookingId);
}
