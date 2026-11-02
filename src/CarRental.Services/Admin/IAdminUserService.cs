using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;

namespace CarRental.Services.Admin;

public interface IAdminUserService
{
    Task<ServiceResult<AdminUserMetricsDto>> GetUserMetricsAsync(CancellationToken ct = default);
    Task<ServiceResult<PagedResult<AdminUserListItemDto>>> GetUsersAsync(AdminUserFilterDto filter, CancellationToken ct = default);
    Task<ServiceResult<AdminUserDetailDto>> GetUserByIdAsync(string userId, CancellationToken ct = default);
    Task<ServiceResult<bool>> SanctionUserAsync(string targetUserId, SanctionUserRequest request, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> LiftSanctionAsync(string targetUserId, LiftSanctionRequest request, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> ResetUserPasswordAsync(string targetUserId, ResetPasswordByAdminRequest request, string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> UpdateUserRolesAsync(string targetUserId, UpdateUserRolesRequest request, string currentUserId, CancellationToken ct = default);
}
