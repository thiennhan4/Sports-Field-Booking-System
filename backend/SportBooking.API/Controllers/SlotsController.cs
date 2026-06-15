using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Slot;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using System.Security.Claims;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotsController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    [HttpPost("courts/{courtId}/slots")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<SlotResponseDto>>> Create(Guid courtId, [FromBody] CreateSlotDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _slotService.CreateAsync(userId, courtId, dto);
        return Ok(ApiResponse<SlotResponseDto>.Ok(result, "Slot template created successfully."));
    }

    [HttpGet("courts/{courtId}/slots")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SlotResponseDto>>>> GetByCourt(Guid courtId)
    {
        var result = await _slotService.GetByCourtIdAsync(courtId);
        return Ok(ApiResponse<IEnumerable<SlotResponseDto>>.Ok(result, "Slot templates retrieved successfully."));
    }

    [HttpDelete("slots/{id}")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        await _slotService.DeleteAsync(userId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Slot template deleted successfully."));
    }
}
