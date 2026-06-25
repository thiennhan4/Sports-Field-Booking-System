using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Services;

public class SlotGenerator : ISlotGenerator
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

        foreach (var court in courts)
        {
            await GenerateSlotsForCourtInternalAsync(court);
        }

        await _context.SaveChangesAsync();
    }

    public async Task GenerateSlotsForCourtAsync(Guid courtId)
    {
        var court = await _context.Courts
            .Include(c => c.Venue)
            .FirstOrDefaultAsync(c => c.Id == courtId);

        if (court == null)
            return;

        await GenerateSlotsForCourtInternalAsync(court);
        await _context.SaveChangesAsync();
    }

    private async Task GenerateSlotsForCourtInternalAsync(Court court)
    {
        var courtTemplates = await _context.SlotTemplates
            .Where(t => t.CourtId == court.Id && t.IsActive)
            .ToListAsync();

        if (courtTemplates.Count == 0)
            return;

        var startDate = DateTime.UtcNow.Date;
        var endDate = startDate.AddDays(30);

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;

            var pricingRule = await _context.PricingRules
                .FirstOrDefaultAsync(pr => pr.CourtId == court.Id && pr.IsActive);

            var holidayPrice = await _context.HolidayPrices
                .FirstOrDefaultAsync(hp => hp.VenueId == court.VenueId && hp.Date.Date == date.Date);

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
                    continue;

                decimal ratePerHour = court.PricePerHour;

                if (holidayPrice != null)
                    ratePerHour = holidayPrice.SpecialPricePerHour;
                else if (pricingRule != null)
                    ratePerHour = isWeekend ? pricingRule.WeekendPrice : pricingRule.WeekdayPrice;

                var duration = template.EndTime - template.StartTime;
                var slotPrice = ratePerHour * (decimal)duration.TotalHours;

                _context.TimeSlots.Add(new TimeSlot
                {
                    CourtId = court.Id,
                    Date = date,
                    StartTime = template.StartTime,
                    EndTime = template.EndTime,
                    Price = slotPrice,
                    Status = SlotStatus.Available
                });
            }
        }
    }
}
