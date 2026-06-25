using SportBooking.Domain.Enums;

namespace SportBooking.Application.DTOs.Court;

public class UpdateCourtDto
{
    public string Name { get; set; } = string.Empty;
    public SportType SportType { get; set; }
    public decimal PricePerHour { get; set; }
}
