using SportBooking.Application.DTOs.User;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Exceptions;

namespace SportBooking.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new AppException("Không tìm thấy người dùng.", 404);

        return MapToDto(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new AppException("Không tìm thấy người dùng.", 404);

        if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (await _userRepository.ExistsByEmailAsync(dto.Email))
                throw new AppException("Email đã được sử dụng.", 409);
        }

        if (!string.Equals(user.Username, dto.Username, StringComparison.OrdinalIgnoreCase))
        {
            if (await _userRepository.ExistsByUsernameAsync(dto.Username))
                throw new AppException("Username đã tồn tại.", 409);
        }

        user.Username = dto.Username;
        user.Email = dto.Email;
        user.Phone = dto.Phone;

        await _userRepository.UpdateAsync(user);

        return MapToDto(user);
    }

    public async Task<UserSettingsDto> GetSettingsAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new AppException("Không tìm thấy người dùng.", 404);

        return MapSettingsToDto(user);
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new AppException("Không tìm thấy người dùng.", 404);

        if (dto.Language is not ("vi" or "en"))
            throw new AppException("Ngôn ngữ không hợp lệ. Chỉ hỗ trợ vi hoặc en.", 400);

        user.DarkMode = dto.DarkMode;
        user.EmailNotifications = dto.EmailNotifications;
        user.Language = dto.Language;

        await _userRepository.UpdateAsync(user);

        return MapSettingsToDto(user);
    }

    private static UserSettingsDto MapSettingsToDto(Domain.Entities.User user) => new()
    {
        DarkMode = user.DarkMode,
        EmailNotifications = user.EmailNotifications,
        Language = user.Language
    };

    private static UserProfileDto MapToDto(Domain.Entities.User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        FullName = user.Username, // Map Username to FullName for frontend
        Email = user.Email,
        Phone = user.Phone,
        Role = user.Role.ToString(),
        IsApproved = user.IsApproved,
        CreatedAt = user.CreatedAt
    };
}
