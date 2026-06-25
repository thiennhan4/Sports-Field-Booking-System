using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Venue;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using System.Security.Claims;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VenuesController : ControllerBase
{
    private readonly IVenueService _venueService;

    public VenuesController(IVenueService venueService)
    {
        _venueService = venueService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<VenueResponseDto>>> Create([FromBody] CreateVenueDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _venueService.CreateAsync(userId, dto);
        return Ok(ApiResponse<VenueResponseDto>.Ok(result, "Venue created successfully."));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<VenueResponseDto>>>> GetAll()
    {
        var result = await _venueService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<VenueResponseDto>>.Ok(result, "Venues retrieved successfully."));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<VenueResponseDto>>> GetById(Guid id)
    {
        var result = await _venueService.GetByIdAsync(id);
        return Ok(ApiResponse<VenueResponseDto>.Ok(result, "Venue retrieved successfully."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<VenueResponseDto>>> Update(Guid id, [FromBody] UpdateVenueDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _venueService.UpdateAsync(userId, id, dto);
        return Ok(ApiResponse<VenueResponseDto>.Ok(result, "Venue updated successfully."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        await _venueService.DeleteAsync(userId, id);
        return Ok(ApiResponse<object>.Ok(null!, "Venue deleted successfully."));
    }
}
