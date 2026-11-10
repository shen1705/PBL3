using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Admin;
using CarRental.Services.Abstractions;
using CarRental.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
[Route("api/admin/owners")]
[Authorize(Roles = RoleNames.AdminOrStaff)]
public class AdminOwnersController : ControllerBase
{
    private readonly IAdminOwnerService _adminOwnerService;
    private readonly ICurrentUserService _currentUser;

    public AdminOwnersController(IAdminOwnerService adminOwnerService, ICurrentUserService currentUser)
    {
        _adminOwnerService = adminOwnerService;
        _currentUser = currentUser;
    }

    // Thống kê hồ sơ chủ xe
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken ct)
    {
        var result = await _adminOwnerService.GetOwnerMetricsAsync(ct);
        return Ok(result);
    }

    // Danh sách hồ sơ chủ xe
    [HttpGet]
    public async Task<IActionResult> GetOwners([FromQuery] AdminOwnerFilterDto filter, CancellationToken ct)
    {
        var result = await _adminOwnerService.GetOwnersAsync(filter, ct);
        return Ok(result);
    }

    // Chi tiết hồ sơ chủ xe
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOwnerById(int id, CancellationToken ct)
    {
        var result = await _adminOwnerService.GetOwnerByIdAsync(id, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Duyệt hồ sơ chủ xe
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> ApproveOwner(int id, CancellationToken ct)
    {
        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminOwnerService.ApproveOwnerAsync(id, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Từ chối hồ sơ chủ xe
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> RejectOwner(int id, [FromBody] RejectOwnerRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Vui lòng nhập đầy đủ lý do từ chối." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminOwnerService.RejectOwnerAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Cập nhật trạng thái truy cập (Active / Suspended)
    [HttpPost("{id:int}/access")]
    public async Task<IActionResult> ToggleAccess(int id, [FromBody] ToggleOwnerAccessRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu không hợp lệ." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminOwnerService.ToggleOwnerAccessAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }
}
