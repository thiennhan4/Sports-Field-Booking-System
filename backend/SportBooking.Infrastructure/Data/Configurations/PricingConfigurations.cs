using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SportBooking.Domain.Entities;

namespace SportBooking.Infrastructure.Data.Configurations;

public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
{
    public void Configure(EntityTypeBuilder<PricingRule> builder)
    {
        builder.Property(pr => pr.WeekdayPrice).HasColumnType("decimal(18,2)");
        builder.Property(pr => pr.WeekendPrice).HasColumnType("decimal(18,2)");

        builder.HasOne(pr => pr.Court)
            .WithMany()
            .HasForeignKey(pr => pr.CourtId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class HolidayPriceConfiguration : IEntityTypeConfiguration<HolidayPrice>
{
    public void Configure(EntityTypeBuilder<HolidayPrice> builder)
    {
        builder.Property(hp => hp.SpecialPricePerHour).HasColumnType("decimal(18,2)");
        builder.Property(hp => hp.Description).HasMaxLength(500);

        builder.HasOne(hp => hp.Venue)
            .WithMany()
            .HasForeignKey(hp => hp.VenueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class TimeSlotConfiguration : IEntityTypeConfiguration<TimeSlot>
{
    public void Configure(EntityTypeBuilder<TimeSlot> builder)
    {
        builder.Property(ts => ts.Price).HasColumnType("decimal(18,2)");
        builder.Property(ts => ts.RowVersion).IsRowVersion();

        builder.HasIndex(ts => new { ts.CourtId, ts.Date, ts.StartTime, ts.EndTime }).IsUnique();

        builder.HasOne(ts => ts.Court)
            .WithMany()
            .HasForeignKey(ts => ts.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ts => ts.Booking)
            .WithMany()
            .HasForeignKey(ts => ts.BookingId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
