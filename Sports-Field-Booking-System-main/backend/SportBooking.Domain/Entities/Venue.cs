using SportBooking.Domain.Common;
using SportBooking.Domain.Enums;

namespace SportBooking.Domain.Entities;

public class Venue : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public VenueStatus Status { get; set; } = VenueStatus.Active;

    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // Navigation properties
    public ICollection<Court> Courts { get; set; } = new List<Court>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
