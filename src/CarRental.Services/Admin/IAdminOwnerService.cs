using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;

namespace CarRental.Services.Admin;

public interface IAdminOwnerService
{
    Task<ServiceResult<AdminOwnerMetricsDto>> GetOwnerMetricsAsync(CancellationToken ct = default);
    Task<ServiceResult<PagedResult<AdminOwnerListItemDto>>> GetOwnersAsync(AdminOwnerFilterDto filter, CancellationToken ct = default);
    Task<ServiceResult<AdminOwnerDetailDto>> GetOwnerByIdAsync(int ownerProfileId, CancellationToken ct = default);
    Task<ServiceResult<bool>> ApproveOwnerAsync(int ownerProfileId, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> RejectOwnerAsync(int ownerProfileId, RejectOwnerRequest request, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> ToggleOwnerAccessAsync(int ownerProfileId, ToggleOwnerAccessRequest request, string currentUserId, CancellationToken ct = default);
}
