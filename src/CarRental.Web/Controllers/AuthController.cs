using CarRental.Models.DTOs.Auth;
using CarRental.Services.Abstractions;
using CarRental.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAuthService authService, ICurrentUserService currentUserService)
    {
        _authService = authService;
        _currentUserService = currentUserService;
    }

    [HttpPost("api/auth/login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = "VALIDATION_FAILED" });
        }

        var result = await _authService.LoginAsync(request, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("api/auth/register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = "VALIDATION_FAILED" });
        }

        var result = await _authService.RegisterAsync(request, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("api/auth/logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var result = await _authService.LogoutAsync(ct);
        return Ok(result);
    }

    [HttpGet("logout")]
    public async Task<IActionResult> LogoutAndRedirect(CancellationToken ct)
    {
        await _authService.LogoutAsync(ct);
        return Redirect("~/");
    }

    [HttpGet("api/auth/me")]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        if (!_currentUserService.IsAuthenticated)
            return Unauthorized(new { isSuccess = false, message = "Chưa đăng nhập." });

        var result = await _authService.GetCurrentUserProfileAsync(ct);
        if (!result.IsSuccess)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost("api/auth/forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = "VALIDATION_FAILED" });
        }

        var result = await _authService.ResetPasswordAsync(request, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [Authorize]
    [HttpPost("api/auth/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = "VALIDATION_FAILED" });
        }

        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _authService.ChangePasswordAsync(userId, request, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}
