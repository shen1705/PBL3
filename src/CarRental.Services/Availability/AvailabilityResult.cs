namespace CarRental.Services.Availability;

public enum UnavailableReason
{
    None,
    InvalidPeriod,
    VehicleNotFound,
    VehicleNotApproved,
    ListingNotPublic,
    BlockedByOwner,
    AlreadyBooked,
    CheckFailed
}

public sealed record AvailabilityResult(bool IsAvailable, UnavailableReason Reason, string Message)
{
    public static AvailabilityResult Available() =>
        new(true, UnavailableReason.None, "Xe còn lịch trong khoảng thời gian này.");

    public static AvailabilityResult Unavailable(UnavailableReason reason, string message) =>
        new(false, reason, message);
}