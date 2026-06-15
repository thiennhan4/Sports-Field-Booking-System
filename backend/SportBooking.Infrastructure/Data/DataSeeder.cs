using Microsoft.EntityFrameworkCore;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;

namespace SportBooking.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedDataAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return; // Data already seeded
        }

        var adminId = Guid.NewGuid();
        var admin = new User
        {
            Id = adminId,
            Username = "admin",
            Email = "admin@sportbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = UserRole.Admin,
            Phone = "123456789",
            CreatedAt = DateTime.UtcNow
        };

        var ownerId = Guid.NewGuid();
        var owner = new User
        {
            Id = ownerId,
            Username = "owner1",
            Email = "owner1@sportbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("owner123"),
            Role = UserRole.Owner,
            Phone = "987654321",
            CreatedAt = DateTime.UtcNow
        };

        // Add a customer user for testing booking
        var customerId = Guid.NewGuid();
        var customer = new User
        {
            Id = customerId,
            Username = "customer1",
            Email = "customer1@sportbooking.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("customer123"),
            Role = UserRole.Customer,
            Phone = "0999888777",
            CreatedAt = DateTime.UtcNow
        };

        var venueId = Guid.NewGuid();
        var venue = new Venue
        {
            Id = venueId,
            Name = "Khu Thể Thao Bách Khoa",
            Description = "Sân bóng xịn xò",
            Address = "268 Lý Thường Kiệt",
            Phone = "0123456789",
            Status = VenueStatus.Active,
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow
        };

        var court1 = new Court
        {
            Id = Guid.NewGuid(),
            Name = "Sân bóng đá 1",
            SportType = SportType.Football,
            PricePerHour = 200000,
            VenueId = venueId,
            CreatedAt = DateTime.UtcNow
        };

        var court2 = new Court
        {
            Id = Guid.NewGuid(),
            Name = "Sân tennis 2",
            SportType = SportType.Tennis,
            PricePerHour = 150000,
            VenueId = venueId,
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(admin, owner, customer);
        await context.Venues.AddAsync(venue);
        await context.Courts.AddRangeAsync(court1, court2);

        // Seed some slot templates for court1 and court2
        var timeSlots = new List<(TimeSpan Start, TimeSpan End)>
        {
            (new TimeSpan(8, 0, 0), new TimeSpan(9, 0, 0)),
            (new TimeSpan(9, 0, 0), new TimeSpan(10, 0, 0)),
            (new TimeSpan(16, 0, 0), new TimeSpan(17, 0, 0)),
            (new TimeSpan(17, 0, 0), new TimeSpan(18, 0, 0)),
            (new TimeSpan(18, 0, 0), new TimeSpan(19, 0, 0)),
            (new TimeSpan(19, 0, 0), new TimeSpan(20, 0, 0))
        };

        foreach (var slot in timeSlots)
        {
            await context.SlotTemplates.AddAsync(new SlotTemplate
            {
                StartTime = slot.Start,
                EndTime = slot.End,
                IsActive = true,
                CourtId = court1.Id
            });

            await context.SlotTemplates.AddAsync(new SlotTemplate
            {
                StartTime = slot.Start,
                EndTime = slot.End,
                IsActive = true,
                CourtId = court2.Id
            });
        }
        
        await context.SaveChangesAsync();
    }
}
