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
[Route("api/admin/disputes")]
[Authorize(Roles = RoleNames.AdminOrStaff)]
public class AdminDisputesController : ControllerBase
{
    private readonly IAdminDisputeService _adminDisputeService;
    private readonly ICurrentUserService _currentUser;

    public AdminDisputesController(IAdminDisputeService adminDisputeService, ICurrentUserService currentUser)
    {
        _adminDisputeService = adminDisputeService;
        _currentUser = currentUser;
    }

    // Thống kê khiếu nại tranh chấp
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken ct)
    {
        var result = await _adminDisputeService.GetDisputeMetricsAsync(ct);
        return Ok(result);
    }

    // Danh sách khiếu nại tranh chấp
    [HttpGet]
    public async Task<IActionResult> GetDisputes([FromQuery] AdminDisputeFilterDto filter, CancellationToken ct)
    {
        var result = await _adminDisputeService.GetDisputesAsync(filter, ct);
        return Ok(result);
    }

    // Chi tiết khiếu nại tranh chấp
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDisputeById(int id, CancellationToken ct)
    {
        var result = await _adminDisputeService.GetDisputeByIdAsync(id, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }

    // Giải quyết khiếu nại tranh chấp
    [HttpPost("{id:int}/resolve")]
    public async Task<IActionResult> ResolveDispute(int id, [FromBody] ResolveDisputeRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Vui lòng nhập đầy đủ thông tin giải quyết." });

        var currentUserId = _currentUser.UserId;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập lại." });

        var result = await _adminDisputeService.ResolveDisputeAsync(id, request, currentUserId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }
        return Ok(result);
    }
}
