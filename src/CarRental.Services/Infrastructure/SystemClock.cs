using CarRental.Services.Abstractions;

namespace CarRental.Services.Infrastructure;

public class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateOnly UtcToday => DateOnly.FromDateTime(DateTime.UtcNow);

    public DateTime ToUtc(DateTime dateTime)
    {
        return dateTime.Kind switch
        {
            DateTimeKind.Utc => dateTime,
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
        };
    }

    public int CompareUtc(DateTime first, DateTime second)
    {
        return DateTime.Compare(ToUtc(first), ToUtc(second));
    }

    public bool IsPastUtc(DateTime dateTime)
    {
        return ToUtc(dateTime) < UtcNow;
    }

    public bool IsFutureUtc(DateTime dateTime)
    {
        return ToUtc(dateTime) > UtcNow;
    }

    public bool IsInRangeUtc(DateTime target, DateTime start, DateTime end)
    {
        var targetUtc = ToUtc(target);
        return targetUtc >= ToUtc(start) && targetUtc <= ToUtc(end);
    }

    public int Compare(DateTime first, DateTime second) => CompareUtc(first, second);

    public bool IsPast(DateTime dateTime) => IsPastUtc(dateTime);

    public bool IsFuture(DateTime dateTime) => IsFutureUtc(dateTime);

    public bool IsInRange(DateTime target, DateTime start, DateTime end) => IsInRangeUtc(target, start, end);
}
