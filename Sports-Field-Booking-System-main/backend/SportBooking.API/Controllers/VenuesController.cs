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

    /// <summary>
    /// Tìm kiếm sân với đầy đủ bộ lọc:
    /// GET /api/venues/search?name=...&amp;district=...&amp;sportType=BADMINTON&amp;minPrice=100000&amp;maxPrice=300000&amp;startTime=08:00:00&amp;endTime=10:00:00
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<VenueResponseDto>>>> Search(
        [FromQuery] string? name,
        [FromQuery] string? district,
        [FromQuery] string? sportType,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? startTime,
        [FromQuery] string? endTime)
    {
        var query = new VenueSearchQueryDto
        {
            Name = name,
            District = district,
            SportType = sportType,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            StartTime = !string.IsNullOrWhiteSpace(startTime) && TimeSpan.TryParse(startTime, out var st) ? st : null,
            EndTime = !string.IsNullOrWhiteSpace(endTime) && TimeSpan.TryParse(endTime, out var et) ? et : null
        };

        var result = await _venueService.SearchAsync(query);
        return Ok(ApiResponse<IEnumerable<VenueResponseDto>>.Ok(result, "Search completed successfully."));
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
