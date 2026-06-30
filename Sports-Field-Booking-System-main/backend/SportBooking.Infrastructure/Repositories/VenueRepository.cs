using Microsoft.EntityFrameworkCore;
using SportBooking.Application.DTOs.Venue;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Repositories;

public class VenueRepository : IVenueRepository
{
    private readonly AppDbContext _context;

    public VenueRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Venue?> GetByIdAsync(Guid id)
    {
        return await _context.Venues
            .Include(v => v.Courts)
                .ThenInclude(c => c.SlotTemplates)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<Venue>> GetAllAsync()
    {
        return await _context.Venues
            .Include(v => v.Courts)
            .ToListAsync();
    }

    public async Task<IEnumerable<Venue>> GetByOwnerIdAsync(Guid ownerId)
    {
        return await _context.Venues
            .Where(v => v.OwnerId == ownerId)
            .Include(v => v.Courts)
            .ToListAsync();
    }

    public async Task<IEnumerable<Venue>> SearchAsync(VenueSearchQueryDto query)
    {
        var venueQuery = _context.Venues
            .Include(v => v.Courts)
                .ThenInclude(c => c.SlotTemplates)
            .AsQueryable();

        // Filter by name
        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            var nameLower = query.Name.ToLower();
            venueQuery = venueQuery.Where(v => v.Name.ToLower().Contains(nameLower));
        }

        // Filter by district / address
        if (!string.IsNullOrWhiteSpace(query.District))
        {
            var districtLower = query.District.ToLower();
            venueQuery = venueQuery.Where(v => v.Address.ToLower().Contains(districtLower));
        }

        // Filter by sport type, price, and time slot — requires court-level filtering
        var venues = await venueQuery.ToListAsync();

        if (!string.IsNullOrWhiteSpace(query.SportType) || query.MinPrice.HasValue || query.MaxPrice.HasValue || query.StartTime.HasValue || query.EndTime.HasValue)
        {
            venues = venues.Where(venue =>
            {
                return venue.Courts.Any(court =>
                {
                    // Sport type filter
                    if (!string.IsNullOrWhiteSpace(query.SportType))
                    {
                        var sportTypeName = court.SportType.ToString().ToUpper();
                        if (!sportTypeName.Contains(query.SportType.ToUpper()))
                            return false;
                    }

                    // Price filter
                    if (query.MinPrice.HasValue && court.PricePerHour < query.MinPrice.Value)
                        return false;
                    if (query.MaxPrice.HasValue && court.PricePerHour > query.MaxPrice.Value)
                        return false;

                    // Time slot filter — check if court has a slot overlapping with the requested time
                    if (query.StartTime.HasValue || query.EndTime.HasValue)
                    {
                        var hasMatchingSlot = court.SlotTemplates.Any(slot =>
                        {
                            if (!slot.IsActive) return false;
                            if (query.StartTime.HasValue && slot.EndTime <= query.StartTime.Value) return false;
                            if (query.EndTime.HasValue && slot.StartTime >= query.EndTime.Value) return false;
                            return true;
                        });
                        if (!hasMatchingSlot) return false;
                    }

                    return true;
                });
            }).ToList();
        }

        return venues;
    }

    public async Task AddAsync(Venue venue)
    {
        await _context.Venues.AddAsync(venue);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Venue venue)
    {
        _context.Venues.Update(venue);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Venue venue)
    {
        _context.Venues.Remove(venue);
        await _context.SaveChangesAsync();
    }
}
