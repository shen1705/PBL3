using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;

namespace CarRental.Services.Admin;

public interface IAdminDisputeService
{
    Task<ServiceResult<AdminDisputeMetricsDto>> GetDisputeMetricsAsync(CancellationToken ct = default);
    Task<ServiceResult<PagedResult<AdminDisputeListItemDto>>> GetDisputesAsync(AdminDisputeFilterDto filter, CancellationToken ct = default);
    Task<ServiceResult<AdminDisputeDetailDto>> GetDisputeByIdAsync(int disputeId, CancellationToken ct = default);
    Task<ServiceResult<bool>> ResolveDisputeAsync(int disputeId, ResolveDisputeRequest request, string currentUserId, CancellationToken ct = default);
}
