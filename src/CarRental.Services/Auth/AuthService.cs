using System.Security.Claims;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Auth;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUserService;
    private readonly IClock _clock;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext db,
        ICurrentUserService currentUserService,
        IClock clock,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _db = db;
        _currentUserService = currentUserService;
        _clock = clock;
        _logger = logger;
    }
    // Login ( Dang nhap)
    public async Task<ServiceResult<AuthUserDto>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Identifier) || string.IsNullOrWhiteSpace(request.Password))
            return ServiceResult<AuthUserDto>.Fail("Vui lòng điền đầy đủ tài khoản và mật khẩu.", "REQUIRED_FIELDS_MISSING");

        var cleanId = request.Identifier.Trim();

        // Find User by Name 
        ApplicationUser? user = await _userManager.FindByNameAsync(cleanId);
        if (user == null && cleanId.Contains('@'))
        {
            user = await _userManager.FindByEmailAsync(cleanId);
        }
        if (user == null)
        {
            var cleanPhone = cleanId.Replace(" ", "").Replace("-", "").Replace(".", "");
            user = await _db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == cleanId || u.PhoneNumber == cleanPhone, ct);
        }

        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found for identifier {Identifier}", cleanId);
            return ServiceResult<AuthUserDto>.Fail("Tài khoản hoặc mật khẩu không chính xác.", "INVALID_CREDENTIALS");
        }

        // Password check 
        var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!passwordCheck.Succeeded)
        {
            _logger.LogWarning("Login failed: Invalid password for user {UserName}", user.UserName);
            return ServiceResult<AuthUserDto>.Fail("Tài khoản hoặc mật khẩu không chính xác.", "INVALID_CREDENTIALS");
        }

        // check for sanctions status 
        var sanction = await GetActiveSanctionAsync(user.Id, ct);
        if (sanction != null)
        {
            var durationText = sanction.ExpiresAt.HasValue
                ? $"Thời hạn khóa đến: {sanction.ExpiresAt.Value:dd/MM/yyyy HH:mm}."
                : "Thời hạn khóa: Vĩnh viễn.";

            _logger.LogWarning("Login blocked: User {UserName} has active sanction {SanctionType}", user.UserName, sanction.SanctionType);
            return ServiceResult<AuthUserDto>.Fail(
                $"Tài khoản của bạn đang bị khóa do vi phạm: {sanction.Reason}. {durationText}",
                "ACCOUNT_SANCTIONED");
        }

        // Cookie sign in
        await _signInManager.SignInAsync(user, isPersistent: request.RememberMe);

        var dto = await BuildAuthUserDtoAsync(user, ct);
        _logger.LogInformation("User {UserName} logged in successfully.", user.UserName);
        return ServiceResult<AuthUserDto>.Success(dto, "Đăng nhập thành công.");
    }
    // Register ( Dang ki )
    public async Task<ServiceResult<AuthUserDto>> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            return ServiceResult<AuthUserDto>.Fail("Vui lòng điền đầy đủ các thông tin bắt buộc.", "REQUIRED_FIELDS_MISSING");

        if (request.Password != request.ConfirmPassword)
            return ServiceResult<AuthUserDto>.Fail("Mật khẩu xác nhận không khớp.", "PASSWORD_MISMATCH");

        var cleanUserName = request.UserName.Trim();
        var cleanPhone = request.PhoneNumber?.Trim().Replace(" ", "").Replace("-", "").Replace(".", "") ?? string.Empty;

        // Kiểm tra username đã tồn tại
        var existingUser = await _userManager.FindByNameAsync(cleanUserName);
        if (existingUser != null)
            return ServiceResult<AuthUserDto>.Fail("Tên tài khoản này đã được sử dụng.", "USERNAME_TAKEN");

        // check phone 
        if (!string.IsNullOrEmpty(cleanPhone))
        {
            var phoneTaken = await _db.Users.AnyAsync(u => u.PhoneNumber == cleanPhone || u.PhoneNumber == request.PhoneNumber, ct);
            if (phoneTaken)
                return ServiceResult<AuthUserDto>.Fail("Số điện thoại này đã được đăng ký tài khoản.", "PHONE_TAKEN");
        }

        // email 
        var email = string.IsNullOrWhiteSpace(request.Email)
            ? $"{cleanUserName.ToLowerInvariant()}@carrental.test"
            : request.Email.Trim().ToLowerInvariant();

        var emailTaken = await _userManager.FindByEmailAsync(email);
        if (emailTaken != null)
            return ServiceResult<AuthUserDto>.Fail("Địa chỉ email này đã được sử dụng.", "EMAIL_TAKEN");

        // create new user 
        var newUser = new ApplicationUser
        {
            UserName = cleanUserName,
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? cleanUserName : request.FullName.Trim(),
            Email = email,
            PhoneNumber = cleanPhone,
            EmailConfirmed = true,
            PhoneNumberConfirmed = !string.IsNullOrEmpty(cleanPhone)
        };

        var createResult = await _userManager.CreateAsync(newUser, request.Password);
        if (!createResult.Succeeded)
        {
            var errorMsg = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return ServiceResult<AuthUserDto>.Fail(errorMsg, "CREATE_USER_FAILED");
        }

        // Renter role 
        var roleResult = await _userManager.AddToRoleAsync(newUser, RoleNames.Renter);
        if (!roleResult.Succeeded)
        {
            _logger.LogWarning("Failed to assign default role to user {UserName}", cleanUserName);
        }

        // sign in after sign up 
        await _signInManager.SignInAsync(newUser, isPersistent: true);

        var dto = await BuildAuthUserDtoAsync(newUser, ct);
        _logger.LogInformation("User {UserName} registered and signed in.", cleanUserName);
        return ServiceResult<AuthUserDto>.Success(dto, "Đăng ký tài khoản thành công.");
    }

    public async Task<ServiceResult> LogoutAsync(CancellationToken ct = default)
    {
        await _signInManager.SignOutAsync();
        return ServiceResult.Success("Đăng xuất thành công.");
    }
    // Change pass 
    public async Task<ServiceResult> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
            return ServiceResult.Fail("Mật khẩu xác nhận không khớp.", "PASSWORD_MISMATCH");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return ServiceResult.Fail("Không tìm thấy thông tin tài khoản.", "USER_NOT_FOUND");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var error = string.Join("; ", result.Errors.Select(e => e.Description));
            return ServiceResult.Fail(error, "CHANGE_PASSWORD_FAILED");
        }

        await _signInManager.RefreshSignInAsync(user);
        return ServiceResult.Success("Đổi mật khẩu thành công.");
    }
    // Reset Password 
    public async Task<ServiceResult> ResetPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
            return ServiceResult.Fail("Mật khẩu xác nhận không khớp.", "PASSWORD_MISMATCH");

        var cleanId = request.Identifier.Trim();
        ApplicationUser? user = await _userManager.FindByNameAsync(cleanId);
        if (user == null && cleanId.Contains('@'))
        {
            user = await _userManager.FindByEmailAsync(cleanId);
        }
        if (user == null)
        {
            var cleanPhone = cleanId.Replace(" ", "").Replace("-", "").Replace(".", "");
            user = await _db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == cleanId || u.PhoneNumber == cleanPhone, ct);
        }

        if (user == null)
            return ServiceResult.Fail("Không tìm thấy tài khoản tương ứng với thông tin đã nhập.", "USER_NOT_FOUND");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
        {
            var error = string.Join("; ", result.Errors.Select(e => e.Description));
            return ServiceResult.Fail(error, "RESET_PASSWORD_FAILED");
        }

        return ServiceResult.Success("Mật khẩu mới đã được cập nhật thành công.");
    }

    public async Task<ServiceResult<UserProfileDto>> GetCurrentUserProfileAsync(CancellationToken ct = default)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return ServiceResult<UserProfileDto>.Fail("Chưa đăng nhập.", "UNAUTHORIZED");

        return await GetUserProfileByIdAsync(currentUserId, ct);
    }

    public async Task<ServiceResult<UserProfileDto>> GetUserProfileByIdAsync(string userId, CancellationToken ct = default)
    {
        var user = await _db.Users.AsNoTracking()
            .Include(u => u.DriverLicense)
            .Include(u => u.OwnerProfile)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
            return ServiceResult<UserProfileDto>.Fail("Không tìm thấy người dùng.", "USER_NOT_FOUND");

        var roles = await _userManager.GetRolesAsync(user);
        var claims = (await _userManager.GetClaimsAsync(user)).Select(c => c.Type).ToList();
        var sanction = await GetActiveSanctionAsync(userId, ct);

        var dto = new UserProfileDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Gender = user.Gender,
            Roles = roles,
            Claims = claims,
            HasDriverLicense = user.DriverLicense != null,
            LicenseNumber = user.DriverLicense?.LicenseNumber,
            LicenseClass = user.DriverLicense?.LicenseClass,
            LicenseExpiryDate = user.DriverLicense?.ExpiryDate,
            HasOwnerProfile = user.OwnerProfile != null,
            CccdNumber = user.OwnerProfile?.CccdNumber,
            OwnerApprovalStatus = user.OwnerProfile?.ApprovalStatus,
            OwnerAccessStatus = user.OwnerProfile?.AccessStatus,
            IsSanctioned = sanction != null,
            ActiveSanctionType = sanction?.SanctionType,
            SanctionReason = sanction?.Reason,
            SanctionExpiresAt = sanction?.ExpiresAt
        };

        return ServiceResult<UserProfileDto>.Success(dto);
    }

    public async Task<AccountSanction?> GetActiveSanctionAsync(string userId, CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        return await _db.AccountSanctions.AsNoTracking()
            .Where(s => s.UserId == userId && (s.ExpiresAt == null || s.ExpiresAt > now))
            .OrderByDescending(s => s.IssuedAt)
            .FirstOrDefaultAsync(ct);
    }

    private async Task<AuthUserDto> BuildAuthUserDtoAsync(ApplicationUser user, CancellationToken ct)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = (await _userManager.GetClaimsAsync(user)).Select(c => c.Type).ToList();
        var hasDl = await _db.DriverLicenses.AnyAsync(d => d.UserId == user.Id, ct);
        var ownerProfile = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(o => o.UserId == user.Id, ct);

        return new AuthUserDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Roles = roles,
            Claims = claims,
            HasDriverLicense = hasDl,
            IsOwner = roles.Contains(RoleNames.Owner),
            OwnerApprovalStatus = ownerProfile?.ApprovalStatus
        };
    }
}
