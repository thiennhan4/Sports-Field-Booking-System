using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SportBooking.Domain.Common;
using SportBooking.Domain.Exceptions;

namespace SportBooking.API.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = (int)HttpStatusCode.InternalServerError;
        var message = "Internal Server Error from the custom middleware.";
        List<string>? errors = null;

        if (exception is AppException appException)
        {
            statusCode = appException.StatusCode;
            message = appException.Message;
            errors = appException.Errors;
        }

        context.Response.StatusCode = statusCode;

        var response = ApiResponse<object>.Fail(message, errors);
        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return context.Response.WriteAsync(jsonResponse);
    }
}
