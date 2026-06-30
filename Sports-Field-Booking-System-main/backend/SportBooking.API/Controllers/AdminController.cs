using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Admin;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(ApiResponse<DashboardStatsDto>.Ok(stats, "Lấy thống kê thành công."));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<object>>> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        var result = users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Phone = u.Phone,
            Role = u.Role.ToString(),
            IsApproved = u.IsApproved,
            IsBlocked = u.IsDeleted,
            CreatedAt = u.CreatedAt
        });
        return Ok(ApiResponse<object>.Ok(result, "Lấy danh sách người dùng thành công."));
    }

    [HttpPost("users/{id}/toggle-block")]
    public async Task<ActionResult<ApiResponse<string>>> ToggleUserBlock(Guid id)
    {
        await _adminService.ToggleUserBlockAsync(id);
        return Ok(ApiResponse<string>.Ok("Success", "Cập nhật trạng thái người dùng thành công."));
    }

    [HttpGet("owners/pending")]
    public async Task<ActionResult<ApiResponse<object>>> GetPendingOwners()
    {
        var owners = await _adminService.GetPendingOwnersAsync();
        var result = owners.Select(o => new { o.Id, o.Username, o.Email, o.Phone, o.CreatedAt });
        return Ok(ApiResponse<object>.Ok(result, "Lấy danh sách chủ sân chờ duyệt thành công."));
    }

    [HttpPost("owners/{id}/approve")]
    public async Task<ActionResult<ApiResponse<string>>> ApproveOwner(Guid id)
    {
        await _adminService.ApproveOwnerAsync(id);
        return Ok(ApiResponse<string>.Ok("Success", "Duyệt chủ sân thành công."));
    }

    [HttpPost("owners/{id}/reject")]
    public async Task<ActionResult<ApiResponse<string>>> RejectOwner(Guid id)
    {
        await _adminService.RejectOwnerAsync(id);
        return Ok(ApiResponse<string>.Ok("Success", "Từ chối chủ sân thành công."));
    }
}
