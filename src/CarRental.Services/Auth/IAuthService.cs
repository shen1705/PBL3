using CarRental.Models.Common;
using CarRental.Models.DTOs.Auth;
using CarRental.Models.Entities;

namespace CarRental.Services.Auth;

public interface IAuthService
{
    Task<ServiceResult<AuthUserDto>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<ServiceResult<AuthUserDto>> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<ServiceResult> LogoutAsync(CancellationToken ct = default);
    Task<ServiceResult> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken ct = default);
    Task<ServiceResult> ResetPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default);
    Task<ServiceResult<UserProfileDto>> GetCurrentUserProfileAsync(CancellationToken ct = default);
    Task<ServiceResult<UserProfileDto>> GetUserProfileByIdAsync(string userId, CancellationToken ct = default);
    Task<AccountSanction?> GetActiveSanctionAsync(string userId, CancellationToken ct = default);
}
