using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;

namespace CarRental.Services.Admin;

public interface IAdminListingService
{
    Task<ServiceResult<AdminListingMetricsDto>> GetListingMetricsAsync(CancellationToken ct = default);
    Task<ServiceResult<PagedResult<AdminListingListItemDto>>> GetListingsAsync(AdminListingFilterDto filter, CancellationToken ct = default);
    Task<ServiceResult<AdminListingDetailDto>> GetListingByIdAsync(int listingId, CancellationToken ct = default);
    Task<ServiceResult<bool>> ApproveListingAsync(int listingId, ApproveListingRequest? request, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> RejectListingAsync(int listingId, RejectListingRequest request, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> HideListingAsync(int listingId, HideListingRequest request, string currentUserId, CancellationToken ct = default);
}
