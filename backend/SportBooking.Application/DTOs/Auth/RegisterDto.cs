namespace SportBooking.Application.DTOs.Auth;

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = "Customer"; // "Customer" or "Owner"
}
