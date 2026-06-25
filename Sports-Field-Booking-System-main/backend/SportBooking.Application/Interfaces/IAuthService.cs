using SportBooking.Application.DTOs.Auth;
using System.Threading.Tasks;

namespace SportBooking.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string token, string refreshToken);
}
