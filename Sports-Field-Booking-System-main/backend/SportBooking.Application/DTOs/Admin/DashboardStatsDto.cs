namespace SportBooking.Application.DTOs.Admin;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalVenues { get; set; }
    public int PendingVenues { get; set; }
    public int TotalBookings { get; set; }
    public int ConfirmedBookings { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingOwners { get; set; }
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public bool IsBlocked { get; set; }
    public DateTime CreatedAt { get; set; }
}
