using CarRental.Data;
using CarRental.Models.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Availability;

public class VehicleAvailabilityService : IVehicleAvailabilityService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<VehicleAvailabilityService> _logger;

    public VehicleAvailabilityService(ApplicationDbContext db, ILogger<VehicleAvailabilityService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AvailabilityResult> CheckAsync(
        int vehicleId, DateTime start, DateTime end, int? excludeBookingId = null, CancellationToken ct = default)
    {
        if (end <= start)
            return AvailabilityResult.Unavailable(UnavailableReason.InvalidPeriod,
                "Ngày kết thúc phải sau ngày bắt đầu.");

        try
        {
            // check vehicle & listing
            var vehicleStatus = await _db.Vehicles.AsNoTracking()
                .Where(v => v.VehicleId == vehicleId)
                .Select(v => v.Status)
                .FirstOrDefaultAsync(ct);

            if (vehicleStatus is null)
                return AvailabilityResult.Unavailable(UnavailableReason.VehicleNotFound, "Không tìm thấy xe.");
            if (vehicleStatus != VehicleStatuses.Approved)
                return AvailabilityResult.Unavailable(UnavailableReason.VehicleNotApproved, "Xe chưa được duyệt.");

            var hasPublicListing = await _db.VehicleListings.AsNoTracking()
                .AnyAsync(l => l.VehicleId == vehicleId
                            && l.ModerationStatus == ListingModerationStatuses.Public, ct);
            if (!hasPublicListing)
                return AvailabilityResult.Unavailable(UnavailableReason.ListingNotPublic,
                    "Tin đăng của xe đang không hiển thị công khai.");

            // owner busy dates
            var blockedByOwner = await _db.VehicleUnavailabilities.AsNoTracking()
                .AnyAsync(x => x.VehicleId == vehicleId && x.StartDate < end && x.EndDate > start, ct);
            if (blockedByOwner)
                return AvailabilityResult.Unavailable(UnavailableReason.BlockedByOwner,
                    "Chủ xe không nhận thuê trong khoảng thời gian này.");

            // booked dates
            var lockingStatuses = BookingStatuses.Locking.ToArray();
            var excludeId = excludeBookingId ?? -1;
            var alreadyBooked = await _db.Bookings.AsNoTracking()
                .AnyAsync(b => b.VehicleId == vehicleId
                            && b.BookingId != excludeId
                            && lockingStatuses.Contains(b.Status)
                            && b.StartDate < end
                            && b.EndDate > start, ct);
            if (alreadyBooked)
                return AvailabilityResult.Unavailable(UnavailableReason.AlreadyBooked,
                    "Xe đã có đơn thuê trong khoảng thời gian này.");

            return AvailabilityResult.Available();
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            // fail-safe check
            _logger.LogError(ex, "Không kiểm tra được lịch xe {VehicleId}", vehicleId);
            return AvailabilityResult.Unavailable(UnavailableReason.CheckFailed,
                "Không thể kiểm tra lịch xe lúc này. Vui lòng thử lại.");
        }
    }
}