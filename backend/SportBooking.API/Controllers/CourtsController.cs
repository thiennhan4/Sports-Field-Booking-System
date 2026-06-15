using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Court;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using System.Security.Claims;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api")]
public class CourtsController : ControllerBase
{
    private readonly ICourtService _courtService;

    public CourtsController(ICourtService courtService)
    {
        _courtService = courtService;
    }

    [HttpPost("venues/{venueId}/courts")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<CourtResponseDto>>> Create(Guid venueId, [FromBody] CreateCourtDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _courtService.CreateAsync(userId, venueId, dto);
        return Ok(ApiResponse<CourtResponseDto>.Ok(result, "Court created successfully."));
    }

    [HttpGet("venues/{venueId}/courts")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CourtResponseDto>>>> GetByVenue(Guid venueId)
    {
        var result = await _courtService.GetByVenueIdAsync(venueId);
        return Ok(ApiResponse<IEnumerable<CourtResponseDto>>.Ok(result, "Courts retrieved successfully."));
    }

    [HttpGet("courts/{id}")]
    public async Task<ActionResult<ApiResponse<CourtResponseDto>>> GetById(Guid id)
    {
        var result = await _courtService.GetByIdAsync(id);
        return Ok(ApiResponse<CourtResponseDto>.Ok(result, "Court retrieved successfully."));
    }

    [HttpPut("courts/{id}")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<CourtResponseDto>>> Update(Guid id, [FromBody] UpdateCourtDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _courtService.UpdateAsync(userId, id, dto);
        return Ok(ApiResponse<CourtResponseDto>.Ok(result, "Court updated successfully."));
    }

    [HttpDelete("courts/{id}")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        await _courtService.DeleteAsync(userId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Court deleted successfully."));
    }
}
