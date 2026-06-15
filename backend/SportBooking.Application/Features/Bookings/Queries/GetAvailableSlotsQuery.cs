using MediatR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SportBooking.Application.Features.Bookings.Queries;

public record GetAvailableSlotsQuery(Guid CourtId, DateTime Date) : IRequest<IEnumerable<TimeSlotDto>>;

public class TimeSlotDto
{
    public Guid Id { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }
    public string Status { get; set; } = string.Empty; // Available, Held, Booked, Blocked
    public bool IsAvailable { get; set; }
}

public class GetAvailableSlotsQueryHandler : IRequestHandler<GetAvailableSlotsQuery, IEnumerable<TimeSlotDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICacheService _cacheService;
    private readonly IConnectionMultiplexer _redis;

    public GetAvailableSlotsQueryHandler(
        IAppDbContext context,
        ICacheService cacheService,
        IConnectionMultiplexer redis)
    {
        _context = context;
        _cacheService = cacheService;
        _redis = redis;
    }

    public async Task<IEnumerable<TimeSlotDto>> Handle(GetAvailableSlotsQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"slots:court:{request.CourtId}:date:{request.Date:yyyyMMdd}";
        
        // 1. Try to get slots from Cache
        var cachedSlots = await _cacheService.GetAsync<List<TimeSlotDto>>(cacheKey);
        List<TimeSlotDto> slots;

        if (cachedSlots != null)
        {
            slots = cachedSlots;
        }
        else
        {
            // 2. Cache miss, retrieve from SQL Server
            var dbSlots = await _context.TimeSlots
                .Where(ts => ts.CourtId == request.CourtId && ts.Date.Date == request.Date.Date)
                .OrderBy(ts => ts.StartTime)
                .ToListAsync(cancellationToken);

            slots = dbSlots.Select(ts => new TimeSlotDto
            {
                Id = ts.Id,
                StartTime = ts.StartTime,
                EndTime = ts.EndTime,
                Price = ts.Price,
                Status = ts.Status.ToString(),
                IsAvailable = ts.Status == SlotStatus.Available
            }).ToList();

            // Store in Redis cache with 5-minute expiry
            await _cacheService.SetAsync(cacheKey, slots, TimeSpan.FromMinutes(5));
        }

        // 3. Perform real-time overlay of Redis hold keys
        var db = _redis.GetDatabase();
        foreach (var slot in slots)
        {
            if (slot.IsAvailable)
            {
                var holdKey = $"booking:hold:slot:{slot.Id}";
                var holdExists = await db.KeyExistsAsync(holdKey);
                if (holdExists)
                {
                    slot.Status = "Held";
                    slot.IsAvailable = false;
                }
            }
        }

        return slots;
    }
}
