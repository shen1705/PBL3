namespace CarRental.Services.Availability;

public interface IVehicleAvailabilityService
{
    /// <param name="excludeBookingId">Mã đơn bỏ qua khi xét trùng</param>
    Task<AvailabilityResult> CheckAsync(
        int vehicleId,
        DateTime start,
        DateTime end,
        int? excludeBookingId = null,
        CancellationToken ct = default);
}