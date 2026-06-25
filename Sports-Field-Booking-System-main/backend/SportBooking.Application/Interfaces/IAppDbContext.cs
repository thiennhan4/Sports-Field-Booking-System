using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SportBooking.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace SportBooking.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Venue> Venues { get; }
    DbSet<Court> Courts { get; }
    DbSet<SlotTemplate> SlotTemplates { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Review> Reviews { get; }
    DbSet<TimeSlot> TimeSlots { get; }
    DbSet<PricingRule> PricingRules { get; }
    DbSet<HolidayPrice> HolidayPrices { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
