using Microsoft.EntityFrameworkCore;
using SportBooking.Domain.Common;
using SportBooking.Domain.Entities;
using SportBooking.Application.Interfaces;
using System.Reflection;

namespace SportBooking.Infrastructure.Data;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<SlotTemplate> SlotTemplates => Set<SlotTemplate>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
    public DbSet<PricingRule> PricingRules => Set<PricingRule>();
    public DbSet<HolidayPrice> HolidayPrices => Set<HolidayPrice>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global query filter for soft delete
        modelBuilder.Entity<User>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Venue>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Court>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<SlotTemplate>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Booking>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Payment>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Review>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<TimeSlot>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<PricingRule>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<HolidayPrice>().HasQueryFilter(x => !x.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                    
                case EntityState.Deleted:
                    entry.Entity.IsDeleted = true;
                    entry.State = EntityState.Modified;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
