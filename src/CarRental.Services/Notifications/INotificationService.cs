using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs.Notifications;

namespace CarRental.Services.Notifications;

public interface INotificationService
{
    Task<ServiceResult<NotificationListDto>> GetMyNotificationsAsync(string userId, int count = 20, CancellationToken ct = default);
    Task<ServiceResult<int>> GetUnreadCountAsync(string userId, CancellationToken ct = default);
    Task<ServiceResult> MarkAsReadAsync(int notificationId, string userId, CancellationToken ct = default);
    Task<ServiceResult> MarkAllAsReadAsync(string userId, CancellationToken ct = default);
    Task<ServiceResult<int>> CreateNotificationAsync(
        string userId,
        string title,
        string message,
        string type = "trip",
        int? referenceId = null,
        string? actionUrl = null,
        CancellationToken ct = default);
}
