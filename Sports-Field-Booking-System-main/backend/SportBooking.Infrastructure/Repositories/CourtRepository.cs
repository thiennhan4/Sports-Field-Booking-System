using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Repositories;

public class CourtRepository : ICourtRepository
{
    private readonly AppDbContext _context;

    public CourtRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Court?> GetByIdAsync(Guid id)
    {
        return await _context.Courts
            .Include(c => c.SlotTemplates)
            .Include(c => c.Venue)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Court>> GetByVenueIdAsync(Guid venueId)
    {
        return await _context.Courts
            .Where(c => c.VenueId == venueId)
            .ToListAsync();
    }

    public async Task AddAsync(Court court)
    {
        await _context.Courts.AddAsync(court);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Court court)
    {
        _context.Courts.Update(court);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Court court)
    {
        _context.Courts.Remove(court);
        await _context.SaveChangesAsync();
    }
}
