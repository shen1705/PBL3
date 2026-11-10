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
[Route("api/admin/fees")]
[Authorize(Roles = RoleNames.AdminOrStaff)]
public class AdminFeesController : ControllerBase
{
    private readonly IAdminFeeService _adminFeeService;
    private readonly ICurrentUserService _currentUser;

    public AdminFeesController(IAdminFeeService adminFeeService, ICurrentUserService currentUser)
    {
        _adminFeeService = adminFeeService;
        _currentUser = currentUser;
    }

    // Cấu hình phí & hoa hồng hiện tại
    [HttpGet]
    public async Task<IActionResult> GetFeeSettings(CancellationToken ct)
    {
        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminFeeService.GetFeeSettingsAsync(currentUserId, ct);
        return Ok(result);
    }

    // Cập nhật cấu hình phí & hoa hồng (Yêu cầu quyền Admin)
    [HttpPut]
    public async Task<IActionResult> UpdateFeeSettings([FromBody] UpdateFeeSettingsRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu cấu hình không hợp lệ." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminFeeService.UpdateFeeSettingsAsync(request, currentUserId, ct);
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
}
