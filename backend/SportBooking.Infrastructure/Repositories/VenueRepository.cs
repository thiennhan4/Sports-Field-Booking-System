using Microsoft.EntityFrameworkCore;
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
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<IEnumerable<Venue>> GetAllAsync()
    {
        return await _context.Venues.ToListAsync();
    }

    public async Task<IEnumerable<Venue>> GetByOwnerIdAsync(Guid ownerId)
    {
        return await _context.Venues
            .Where(v => v.OwnerId == ownerId)
            .ToListAsync();
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
