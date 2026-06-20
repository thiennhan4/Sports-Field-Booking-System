using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Auth; // Need to create a minimal DTO maybe, or map User directly
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
