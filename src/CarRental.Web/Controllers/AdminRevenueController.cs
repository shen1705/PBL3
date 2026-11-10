using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Constants;
using CarRental.Services.Abstractions;
using CarRental.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
[Route("api/admin/revenue")]
[Authorize(Roles = RoleNames.Admin)]
public class AdminRevenueController : ControllerBase
{
    private readonly IAdminRevenueService _adminRevenueService;
    private readonly ICurrentUserService _currentUser;

    public AdminRevenueController(IAdminRevenueService adminRevenueService, ICurrentUserService currentUser)
    {
        _adminRevenueService = adminRevenueService;
        _currentUser = currentUser;
    }

    // Báo cáo doanh thu toàn sàn
    [HttpGet]
    public async Task<IActionResult> GetRevenueReport(CancellationToken ct)
    {
        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminRevenueService.GetPlatformRevenueReportAsync(currentUserId, ct);
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
