using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.DTOs.Notifications;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Notifications;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _db;
    private readonly IClock _clock;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext db,
        IClock clock,
        ILogger<NotificationService> logger)
    {
        _db = db;
        _clock = clock;
        _logger = logger;
    }

    public async Task<ServiceResult<NotificationListDto>> GetMyNotificationsAsync(
        string userId,
        int count = 20,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return ServiceResult<NotificationListDto>.Fail("UserId không hợp lệ.");

        var now = _clock.UtcNow;

        var items = await _db.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(Math.Clamp(count, 1, 50))
            .ToListAsync(ct);

        var unreadCount = await _db.Notifications.AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);

        var dtos = items.Select(n => new NotificationDto
        {
            NotificationId = n.NotificationId,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            ReferenceId = n.ReferenceId,
            ActionUrl = n.ActionUrl,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            TimeAgo = FormatTimeAgo(n.CreatedAt, now)
        }).ToList();

        return ServiceResult<NotificationListDto>.Success(new NotificationListDto
        {
            Items = dtos,
            UnreadCount = unreadCount
        });
    }

    public async Task<ServiceResult<int>> GetUnreadCountAsync(
        string userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return ServiceResult<int>.Fail("UserId không hợp lệ.");

        var unread = await _db.Notifications.AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);

        return ServiceResult<int>.Success(unread);
    }

    public async Task<ServiceResult> MarkAsReadAsync(
        int notificationId,
        string userId,
        CancellationToken ct = default)
    {
        var notif = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId, ct);

        if (notif == null)
            return ServiceResult.Fail("Không tìm thấy thông báo.", "NOT_FOUND");

        if (!notif.IsRead)
        {
            notif.IsRead = true;
            await _db.SaveChangesAsync(ct);
        }

        return ServiceResult.Success();
    }

    public async Task<ServiceResult> MarkAllAsReadAsync(
        string userId,
        CancellationToken ct = default)
    {
        var unreadList = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        if (unreadList.Count > 0)
        {
            foreach (var n in unreadList)
            {
                n.IsRead = true;
            }
            await _db.SaveChangesAsync(ct);
        }

        return ServiceResult.Success();
    }

    public async Task<ServiceResult<int>> CreateNotificationAsync(
        string userId,
        string title,
        string message,
        string type = "trip",
        int? referenceId = null,
        string? actionUrl = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return ServiceResult<int>.Fail("UserId không hợp lệ.");

        var notif = new Notification
        {
            UserId = userId,
            Title = title.Trim(),
            Message = message.Trim(),
            Type = string.IsNullOrWhiteSpace(type) ? "trip" : type.Trim().ToLowerInvariant(),
            ReferenceId = referenceId,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = _clock.UtcNow
        };

        _db.Notifications.Add(notif);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Đã tạo thông báo #{NotificationId} cho người dùng {UserId}: {Title}",
            notif.NotificationId, userId, notif.Title);

        return ServiceResult<int>.Success(notif.NotificationId);
    }

    private static string FormatTimeAgo(DateTime createdAt, DateTime now)
    {
        var span = now - createdAt;
        if (span.TotalMinutes < 1)
            return "Vừa xong";
        if (span.TotalMinutes < 60)
            return $"{(int)span.TotalMinutes} phút trước";
        if (span.TotalHours < 24)
            return $"{(int)span.TotalHours} giờ trước";
        if (span.TotalDays < 7)
            return $"{(int)span.TotalDays} ngày trước";
        return createdAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm");
    }
}
