using Microsoft.AspNetCore.Mvc;
using SportBooking.Application.DTOs.Auth;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Common;

namespace SportBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository;

    public AuthController(IAuthService authService, IUserRepository userRepository)
    {
        _authService = authService;
        _userRepository = userRepository;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Đăng ký thành công"));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Đăng nhập thành công"));
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto.Token, dto.RefreshToken);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Làm mới token thành công"));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<object>>> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);
        return Ok(ApiResponse<object>.Ok(null, "OTP đã được gửi đến email của bạn"));
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<ApiResponse<bool>>> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        var result = await _authService.VerifyOtpAsync(dto);
        return Ok(ApiResponse<bool>.Ok(result, result ? "OTP hợp lệ" : "OTP không hợp lệ"));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto);
        return Ok(ApiResponse<object>.Ok(null, "Đặt lại mật khẩu thành công"));
    }

    // DEV ONLY: Get OTP for testing (remove in production)
    [HttpGet("dev/get-otp")]
    public async Task<ActionResult<ApiResponse<string>>> GetOtp([FromQuery] string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            return BadRequest(ApiResponse<string>.Fail("Email không tồn tại"));

        return Ok(ApiResponse<string>.Ok(user.PasswordResetOtp ?? "Không có OTP", $"OTP cho {email}"));
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        await _authService.ChangePasswordAsync(dto);
        return Ok(ApiResponse<object>.Ok(null, "Đổi mật khẩu thành công"));
    }
}
