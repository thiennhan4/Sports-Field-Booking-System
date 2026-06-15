using Microsoft.EntityFrameworkCore;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SportBooking.Infrastructure.Services;

public class SlotGenerator
{
    private readonly AppDbContext _context;

    public SlotGenerator(AppDbContext context)
    {
        _context = context;
    }

    public async Task GenerateSlotsForNext30DaysAsync()
    {
        var courts = await _context.Courts
            .Include(c => c.Venue)
            .ToListAsync();

        var slotTemplates = await _context.SlotTemplates
            .Where(t => t.IsActive)
            .ToListAsync();

        var startDate = DateTime.UtcNow.Date;
        var endDate = startDate.AddDays(30);

        // Group templates by CourtId for faster lookup
        var templatesByCourt = slotTemplates.ToLookup(t => t.CourtId);

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;

            foreach (var court in courts)
            {
                var courtTemplates = templatesByCourt[court.Id];
                if (!courtTemplates.Any()) continue;

                // Load pricing configurations for this court/venue/date
                var pricingRule = await _context.PricingRules
                    .FirstOrDefaultAsync(pr => pr.CourtId == court.Id && pr.IsActive);

                var holidayPrice = await _context.HolidayPrices
                    .FirstOrDefaultAsync(hp => hp.VenueId == court.VenueId && hp.Date.Date == date.Date);

                // Fetch existing slot keys for this court and date to avoid duplicates
                var existingSlots = await _context.TimeSlots
                    .Where(ts => ts.CourtId == court.Id && ts.Date.Date == date.Date)
                    .Select(ts => new { ts.StartTime, ts.EndTime })
                    .ToListAsync();

                var existingSet = new HashSet<(TimeSpan, TimeSpan)>(
                    existingSlots.Select(s => (s.StartTime, s.EndTime))
                );

                foreach (var template in courtTemplates)
                {
                    if (existingSet.Contains((template.StartTime, template.EndTime)))
                    {
                        continue; // Already generated
                    }

                    // Price calculation logic:
                    // 1. Holiday Override (highest priority)
                    // 2. Pricing Rule (Weekday/Weekend)
                    // 3. Default Court Base Price
                    decimal ratePerHour = court.PricePerHour;

                    if (holidayPrice != null)
                    {
                        ratePerHour = holidayPrice.SpecialPricePerHour;
                    }
                    else if (pricingRule != null)
                    {
                        ratePerHour = isWeekend ? pricingRule.WeekendPrice : pricingRule.WeekdayPrice;
                    }

                    var duration = template.EndTime - template.StartTime;
                    decimal slotPrice = ratePerHour * (decimal)duration.TotalHours;

                    var timeSlot = new TimeSlot
                    {
                        CourtId = court.Id,
                        Date = date,
                        StartTime = template.StartTime,
                        EndTime = template.EndTime,
                        Price = slotPrice,
                        Status = SlotStatus.Available
                    };

                    _context.TimeSlots.Add(timeSlot);
                }
            }
        }

        await _context.SaveChangesAsync();
    }
}
