using System;
using CarRental.Services.Abstractions;

namespace CarRental.Services.Infrastructure;

public class SystemClock : IClock
{
    // Giờ Việt Nam (GMT+7)
    public DateTime Now => VietnamTimeZone.Now;

    public DateOnly Today => VietnamTimeZone.Today;

    // Giữ UtcNow trả về giờ hệ thống Việt Nam để toàn bộ DB và Service lưu đồng bộ giờ Việt Nam
    public DateTime UtcNow => VietnamTimeZone.Now;

    public DateOnly UtcToday => VietnamTimeZone.Today;

    public DateTime ToUtc(DateTime dateTime)
    {
        return dateTime;
    }

    public int CompareUtc(DateTime first, DateTime second)
    {
        return DateTime.Compare(first, second);
    }

    public bool IsPastUtc(DateTime dateTime)
    {
        return dateTime < Now;
    }

    public bool IsFutureUtc(DateTime dateTime)
    {
        return dateTime > Now;
    }

    public bool IsInRangeUtc(DateTime target, DateTime start, DateTime end)
    {
        return target >= start && target <= end;
    }

    public int Compare(DateTime first, DateTime second) => CompareUtc(first, second);

    public bool IsPast(DateTime dateTime) => IsPastUtc(dateTime);

    public bool IsFuture(DateTime dateTime) => IsFutureUtc(dateTime);

    public bool IsInRange(DateTime target, DateTime start, DateTime end) => IsInRangeUtc(target, start, end);
}
