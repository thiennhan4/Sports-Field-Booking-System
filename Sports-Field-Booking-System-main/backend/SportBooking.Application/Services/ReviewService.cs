using SportBooking.Application.DTOs.Review;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IVenueRepository _venueRepository;

    public ReviewService(
        IReviewRepository reviewRepository,
        IBookingRepository bookingRepository,
        IVenueRepository venueRepository)
    {
        _reviewRepository = reviewRepository;
        _bookingRepository = bookingRepository;
        _venueRepository = venueRepository;
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetByVenueIdAsync(Guid venueId)
    {
        var reviews = await _reviewRepository.GetByVenueIdAsync(venueId);
        return reviews.Select(MapToDto);
    }

    public async Task<IEnumerable<ReviewResponseDto>> GetRecentAsync(int count = 6)
    {
        var reviews = await _reviewRepository.GetRecentAsync(count);
        return reviews.Select(MapToDto);
    }

    public async Task<ReviewResponseDto> CreateAsync(Guid userId, CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new AppException("Đánh giá phải từ 1 đến 5 sao.", 400);

        var venue = await _venueRepository.GetByIdAsync(dto.VenueId);
        if (venue == null)
            throw new AppException("Không tìm thấy cơ sở sân.", 404);

        if (dto.BookingId.HasValue)
        {
            var booking = await _bookingRepository.GetByIdAsync(dto.BookingId.Value);
            if (booking == null)
                throw new AppException("Không tìm thấy đơn đặt sân.", 404);

            if (booking.UserId != userId)
                throw new AppException("Bạn không có quyền đánh giá đơn này.", 403);

            if (booking.Status != BookingStatus.Confirmed && booking.Status != BookingStatus.Completed)
                throw new AppException("Chỉ có thể đánh giá sau khi đơn được xác nhận hoặc hoàn thành.", 400);

            var existingReview = await _reviewRepository.GetByBookingIdAsync(dto.BookingId.Value);
            if (existingReview != null)
                throw new AppException("Đơn đặt sân này đã được đánh giá.", 400);
        }

        var review = new Review
        {
            Rating = dto.Rating,
            Comment = dto.Comment,
            UserId = userId,
            VenueId = dto.VenueId,
            BookingId = dto.BookingId
        };

        await _reviewRepository.AddAsync(review);

        var created = await _reviewRepository.GetByIdAsync(review.Id);
        return MapToDto(created!);
    }

    private static ReviewResponseDto MapToDto(Review review) => new()
    {
        Id = review.Id,
        Rating = review.Rating,
        Comment = review.Comment,
        UserId = review.UserId,
        UserName = review.User?.Username ?? "Khách hàng",
        VenueId = review.VenueId,
        VenueName = review.Venue?.Name ?? "",
        BookingId = review.BookingId,
        CreatedAt = review.CreatedAt
    };
}
