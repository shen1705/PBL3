namespace CarRental.Services.Abstractions;

public interface IClock
{
    DateTime UtcNow { get; }
    DateOnly UtcToday { get; }

    DateTime ToUtc(DateTime dateTime);
    int CompareUtc(DateTime first, DateTime second);
    bool IsPastUtc(DateTime dateTime);
    bool IsFutureUtc(DateTime dateTime);
    bool IsInRangeUtc(DateTime target, DateTime start, DateTime end);

    int Compare(DateTime first, DateTime second);
    bool IsPast(DateTime dateTime);
    bool IsFuture(DateTime dateTime);
    bool IsInRange(DateTime target, DateTime start, DateTime end);
}
