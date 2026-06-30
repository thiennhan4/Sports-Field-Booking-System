namespace SportBooking.Application.DTOs.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileDto
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class UserSettingsDto
{
    public bool DarkMode { get; set; } = true;
    public bool EmailNotifications { get; set; } = true;
    public string Language { get; set; } = "vi";
}

public class UpdateUserSettingsDto
{
    public bool DarkMode { get; set; }
    public bool EmailNotifications { get; set; }
    public string Language { get; set; } = "vi";
}
