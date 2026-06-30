using SportBooking.Application.DTOs.User;

namespace SportBooking.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<UserSettingsDto> GetSettingsAsync(Guid userId);
    Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsDto dto);
}
