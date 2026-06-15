using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Infrastructure.Data;

namespace SportBooking.Infrastructure.Repositories;

public class SlotRepository : ISlotRepository
{
    private readonly AppDbContext _context;

    public SlotRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SlotTemplate?> GetByIdAsync(Guid id)
    {
        return await _context.SlotTemplates
            .Include(s => s.Court)
                .ThenInclude(c => c.Venue)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<SlotTemplate>> GetByCourtIdAsync(Guid courtId)
    {
        return await _context.SlotTemplates
            .Where(s => s.CourtId == courtId)
            .ToListAsync();
    }

    public async Task AddAsync(SlotTemplate slot)
    {
        await _context.SlotTemplates.AddAsync(slot);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(SlotTemplate slot)
    {
        _context.SlotTemplates.Update(slot);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(SlotTemplate slot)
    {
        _context.SlotTemplates.Remove(slot);
        await _context.SaveChangesAsync();
    }
}
