namespace CarRental.Services.Availability;

public interface IVehicleAvailabilityService
{
    /// <param name="excludeBookingId">
    /// Khi duyệt đơn, truyền mã đơn đang xét để không coi lịch giữ của chính nó là trùng.
    /// </param>
    Task<AvailabilityResult> CheckAsync(
        int vehicleId,
        DateTime start,
        DateTime end,
        int? excludeBookingId = null,
        CancellationToken ct = default);
}