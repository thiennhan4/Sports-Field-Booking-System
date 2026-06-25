using Microsoft.EntityFrameworkCore;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IAppDbContext _context;

    public AdminService(IUserRepository userRepository, IAppDbContext context)
    {
        _userRepository = userRepository;
        _context = context;
    }

    public async Task ApproveOwnerAsync(Guid ownerId)
    {
        var owner = await _userRepository.GetByIdAsync(ownerId);
        if (owner == null)
            throw new AppException("Không tìm thấy chủ sân.", 404);

        if (owner.Role != UserRole.Owner)
            throw new AppException("Người dùng này không phải là chủ sân.", 400);

        if (owner.IsApproved)
            throw new AppException("Chủ sân này đã được duyệt.", 400);

        owner.IsApproved = true;
        await _userRepository.UpdateAsync(owner);
    }

    public async Task RejectOwnerAsync(Guid ownerId)
    {
        var owner = await _userRepository.GetByIdAsync(ownerId);
        if (owner == null)
            throw new AppException("Không tìm thấy chủ sân.", 404);

        if (owner.Role != UserRole.Owner)
            throw new AppException("Người dùng này không phải là chủ sân.", 400);

        if (owner.IsApproved)
            throw new AppException("Không thể từ chối chủ sân đã được duyệt.", 400);

        owner.IsDeleted = true; // Soft delete or just remove
        await _userRepository.UpdateAsync(owner);
    }

    public async Task<IEnumerable<User>> GetPendingOwnersAsync()
    {
        return await _context.Users
            .Where(u => u.Role == UserRole.Owner && !u.IsApproved)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _context.Users
            .IgnoreQueryFilters()
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task ToggleUserBlockAsync(Guid userId)
    {
        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new AppException("Không tìm thấy người dùng.", 404);

        if (user.Role == UserRole.Admin)
            throw new AppException("Không thể khóa tài khoản Admin.", 400);

        user.IsDeleted = !user.IsDeleted;
        await _context.SaveChangesAsync();
    }
}
