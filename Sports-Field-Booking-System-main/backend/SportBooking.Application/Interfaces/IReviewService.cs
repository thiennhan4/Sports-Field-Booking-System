using SportBooking.Application.DTOs.Review;

namespace SportBooking.Application.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewResponseDto>> GetByVenueIdAsync(Guid venueId);
    Task<IEnumerable<ReviewResponseDto>> GetRecentAsync(int count = 6);
    Task<ReviewResponseDto> CreateAsync(Guid userId, CreateReviewDto dto);
}
