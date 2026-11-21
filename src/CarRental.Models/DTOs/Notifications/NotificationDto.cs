using System;
using System.Collections.Generic;

namespace CarRental.Models.DTOs.Notifications;

public class NotificationDto
{
    public int NotificationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "trip";
    public int? ReferenceId { get; set; }
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string TimeAgo { get; set; } = string.Empty;
}

public class NotificationListDto
{
    public List<NotificationDto> Items { get; set; } = new();
    public int UnreadCount { get; set; }
}
