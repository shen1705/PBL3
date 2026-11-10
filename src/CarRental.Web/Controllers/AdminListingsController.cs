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
[Route("api/admin/listings")]
[Authorize(Roles = RoleNames.AdminOrStaff)]
public class AdminListingsController : ControllerBase
{
    private readonly IAdminListingService _adminListingService;
    private readonly ICurrentUserService _currentUser;

    public AdminListingsController(IAdminListingService adminListingService, ICurrentUserService currentUser)
    {
        _adminListingService = adminListingService;
        _currentUser = currentUser;
    }

    // Thống kê tin đăng xe
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken ct)
    {
        var result = await _adminListingService.GetListingMetricsAsync(ct);
        return Ok(result);
    }

    // Danh sách tin đăng xe
    [HttpGet]
    public async Task<IActionResult> GetListings([FromQuery] AdminListingFilterDto filter, CancellationToken ct)
    {
        var result = await _adminListingService.GetListingsAsync(filter, ct);
        return Ok(result);
    }

    // Chi tiết tin đăng xe
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetListingById(int id, CancellationToken ct)
    {
        var result = await _adminListingService.GetListingByIdAsync(id, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Duyệt tin đăng xe công khai
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> ApproveListing(int id, [FromBody] ApproveListingRequest? request, CancellationToken ct)
    {
        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminListingService.ApproveListingAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Từ chối tin đăng xe
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> RejectListing(int id, [FromBody] RejectListingRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Vui lòng nhập lý do từ chối bài đăng." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminListingService.RejectListingAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Gỡ vi phạm / tạm ẩn tin đăng xe
    [HttpPost("{id:int}/hide")]
    public async Task<IActionResult> HideListing(int id, [FromBody] HideListingRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Vui lòng nhập lý do gỡ bài đăng." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminListingService.HideListingAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }
}
