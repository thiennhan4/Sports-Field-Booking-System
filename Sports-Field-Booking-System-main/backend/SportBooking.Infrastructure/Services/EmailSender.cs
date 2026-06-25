using Microsoft.Extensions.Logging;
using SportBooking.Application.Interfaces;

namespace SportBooking.Infrastructure.Services;

public class EmailSender : IEmailSender
{
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(ILogger<EmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        // Mock implementation for sending email
        _logger.LogInformation("Sending email to {To}", to);
        _logger.LogInformation("Subject: {Subject}", subject);
        _logger.LogInformation("Body: {Body}", body);
        
        return Task.CompletedTask;
    }
}
