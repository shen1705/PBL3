using CarRental.Models.Common;
using CarRental.Models.DTOs.Vehicles;

namespace CarRental.Services.Vehicles;

public interface IVehicleService
{
    Task<ServiceResult<PagedResult<VehicleCardDto>>> SearchVehiclesAsync(
        VehicleSearchFilter filter, CancellationToken ct = default);

    Task<ServiceResult<VehicleDetailDto>> GetVehicleByIdAsync(
        int vehicleId, CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<VehicleCardDto>>> GetOwnerVehiclesAsync(
        string ownerId, CancellationToken ct = default);

    Task<ServiceResult<VehicleDetailDto>> CreateVehicleAsync(
        string ownerId, CreateVehicleRequest request, CancellationToken ct = default);

    Task<ServiceResult<VehicleDetailDto>> UpdateVehicleAsync(
        int vehicleId, string ownerId, UpdateVehicleRequest request, CancellationToken ct = default);

    Task<ServiceResult> DeleteVehicleAsync(
        int vehicleId, string ownerId, CancellationToken ct = default);

    Task<ServiceResult> SetVehicleStatusAsync(
        int vehicleId, string newStatus, string? note = null, CancellationToken ct = default);

    Task<ServiceResult> SetListingModerationStatusAsync(
        int listingId, string newStatus, string? note = null, CancellationToken ct = default);

    Task<ServiceResult<int>> AddUnavailabilityAsync(
        int vehicleId, string ownerId, SetUnavailabilityRequest request, CancellationToken ct = default);

    Task<ServiceResult> RemoveUnavailabilityAsync(
        int unavailabilityId, string ownerId, CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<CitySummaryDto>>> GetAvailableCitiesAsync(
        CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<string>>> GetAvailableBrandsAsync(
        CancellationToken ct = default);
}
