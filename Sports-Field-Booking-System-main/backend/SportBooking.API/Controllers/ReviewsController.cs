using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Review;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;
using System.Security.Claims;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("venue/{venueId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewResponseDto>>>> GetByVenue(Guid venueId)
    {
        var result = await _reviewService.GetByVenueIdAsync(venueId);
        return Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.Ok(result, "Lấy đánh giá thành công."));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReviewResponseDto>>>> GetRecent([FromQuery] int count = 6)
    {
        var result = await _reviewService.GetRecentAsync(count);
        return Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.Ok(result, "Lấy đánh giá gần đây thành công."));
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> Create([FromBody] CreateReviewDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var result = await _reviewService.CreateAsync(userId, dto);
        return Ok(ApiResponse<ReviewResponseDto>.Ok(result, "Đánh giá thành công."));
    }
}
