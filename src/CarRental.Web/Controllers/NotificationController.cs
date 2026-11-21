using System.Threading;
using System.Threading.Tasks;
using CarRental.Services.Abstractions;
using CarRental.Services.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public NotificationController(
        INotificationService notificationService,
        ICurrentUserService currentUserService)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] int count = 20, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _notificationService.GetMyNotificationsAsync(userId, count, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _notificationService.GetUnreadCountAsync(userId, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _notificationService.MarkAsReadAsync(id, userId, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _notificationService.MarkAllAsReadAsync(userId, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }
}
