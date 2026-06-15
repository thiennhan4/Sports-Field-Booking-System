using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SportBooking.Domain.Entities;

namespace SportBooking.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.Username).IsUnique();
        
        builder.Property(u => u.Username).HasMaxLength(100);
        builder.Property(u => u.Email).HasMaxLength(200);
    }
}

public class VenueConfiguration : IEntityTypeConfiguration<Venue>
{
    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.HasIndex(v => v.Name);
        builder.Property(v => v.Name).HasMaxLength(200);
        
        builder.HasOne(v => v.Owner)
            .WithMany(u => u.Venues)
            .HasForeignKey(v => v.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class CourtConfiguration : IEntityTypeConfiguration<Court>
{
    public void Configure(EntityTypeBuilder<Court> builder)
    {
        builder.Property(c => c.Name).HasMaxLength(100);
        builder.Property(c => c.PricePerHour).HasColumnType("decimal(18,2)");
    }
}

public class SlotTemplateConfiguration : IEntityTypeConfiguration<SlotTemplate>
{
    public void Configure(EntityTypeBuilder<SlotTemplate> builder)
    {
        // UNIQUE constraint slot per court
        builder.HasIndex(s => new { s.CourtId, s.StartTime, s.EndTime }).IsUnique();
    }
}

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.Property(b => b.TotalPrice).HasColumnType("decimal(18,2)");
        
        builder.Property(b => b.RowVersion).IsRowVersion();

        builder.HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Court)
            .WithMany(c => c.Bookings)
            .HasForeignKey(b => b.CourtId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
    }
}

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Venue)
            .WithMany(v => v.Reviews)
            .HasForeignKey(r => r.VenueId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
