using System;

namespace CarRental.Services.Infrastructure;

/// <summary>
/// Quản lý múi giờ chuẩn Việt Nam (GMT+7, Asia/Ho_Chi_Minh).
/// Đảm bảo toàn bộ hệ thống AZU Car chạy đồng bộ giờ Việt Nam trên Database, API và Giao diện.
/// </summary>
public static class VietnamTimeZone
{
    public static readonly TimeZoneInfo TimeZone = ResolveTimeZone();

    private static TimeZoneInfo ResolveTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh");
        }
        catch
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
            catch
            {
                return TimeZoneInfo.CreateCustomTimeZone(
                    "SE Asia Standard Time",
                    TimeSpan.FromHours(7),
                    "(UTC+07:00) Bangkok, Hanoi, Jakarta",
                    "SE Asia Standard Time");
            }
        }
    }

    /// <summary>
    /// Giờ hiện tại theo Múi giờ Việt Nam (GMT+7)
    /// </summary>
    public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZone);

    /// <summary>
    /// Ngày hôm nay theo Múi giờ Việt Nam
    /// </summary>
    public static DateOnly Today => DateOnly.FromDateTime(Now);

    /// <summary>
    /// Chuyển đổi DateTime bất kỳ sang giờ Việt Nam
    /// </summary>
    public static DateTime ToVietnamTime(DateTime dt)
    {
        if (dt.Kind == DateTimeKind.Utc)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(dt, TimeZone);
        }

        return dt;
    }
}
