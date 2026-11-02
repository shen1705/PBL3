using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Admin;
using CarRental.Services.Abstractions;
using CarRental.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = RoleNames.AdminOrStaff)]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;
    private readonly ICurrentUserService _currentUser;

    public AdminUsersController(IAdminUserService adminUserService, ICurrentUserService currentUser)
    {
        _adminUserService = adminUserService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Thống kê tổng quan số liệu tài khoản người dùng
    /// </summary>
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken ct)
    {
        var result = await _adminUserService.GetUserMetricsAsync(ct);
        return Ok(result);
    }

    /// <summary>
    /// Tìm kiếm và lọc danh sách người dùng trên hệ thống
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] AdminUserFilterDto filter, CancellationToken ct)
    {
        var result = await _adminUserService.GetUsersAsync(filter, ct);
        return Ok(result);
    }

    /// <summary>
    /// Xem chi tiết thông tin hồ sơ, lịch sử giao dịch và chế tài của một người dùng
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id, CancellationToken ct)
    {
        var result = await _adminUserService.GetUserByIdAsync(id, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Áp dụng chế tài tạm khóa hoặc cấm vĩnh viễn (UC-AS-09)
    /// </summary>
    [HttpPost("{id}/sanction")]
    public async Task<IActionResult> SanctionUser(string id, [FromBody] SanctionUserRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu không hợp lệ." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminUserService.SanctionUserAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Conflict)
                return Conflict(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Mở khóa / gỡ bỏ chế tài cho tài khoản người dùng
    /// </summary>
    [HttpPost("{id}/lift-sanction")]
    public async Task<IActionResult> LiftSanction(string id, [FromBody] LiftSanctionRequest request, CancellationToken ct)
    {
        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminUserService.LiftSanctionAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Conflict)
                return Conflict(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Đặt lại mật khẩu tài khoản người dùng bởi Admin / Staff (UC-AS-03)
    /// </summary>
    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordByAdminRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Mật khẩu mới không hợp lệ." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminUserService.ResetUserPasswordAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Cập nhật vai trò / phân quyền người dùng (Chỉ Admin mới có quyền - UC-AS-07)
    /// </summary>
    [HttpPut("{id}/roles")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> UpdateRoles(string id, [FromBody] UpdateUserRolesRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu phân quyền không hợp lệ." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminUserService.UpdateUserRolesAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Conflict)
                return Conflict(result);

            return BadRequest(result);
        }

        return Ok(result);
    }
}
