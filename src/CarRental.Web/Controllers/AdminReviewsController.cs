using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Reviews;
using CarRental.Services.Abstractions;
using CarRental.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[Authorize(Roles = RoleNames.Staff + "," + RoleNames.Admin)]
[ApiController]
[Route("api/admin/reviews")]
public class AdminReviewsController : ControllerBase
{
    private readonly IAdminReviewService _adminReviewService;
    private readonly ICurrentUserService _currentUser;

    public AdminReviewsController(
        IAdminReviewService adminReviewService,
        ICurrentUserService currentUser)
    {
        _adminReviewService = adminReviewService;
        _currentUser = currentUser;
    }

    [HttpGet("reported")]
    public async Task<IActionResult> GetReportedReviews(CancellationToken ct)
    {
        var result = await _adminReviewService.GetReportedReviewsAsync(ct);
        return Ok(result);
    }

    [HttpPost("{id:int}/moderate")]
    public async Task<IActionResult> ModerateReview(int id, [FromBody] ModerateReviewRequest request, CancellationToken ct)
    {
        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminReviewService.ModerateReviewAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }
}
