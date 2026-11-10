using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;

namespace CarRental.Services.Admin;

public interface IAdminFeeService
{
    Task<ServiceResult<AdminFeeSettingsDto>> GetFeeSettingsAsync(string currentUserId, CancellationToken ct = default);
    Task<ServiceResult<bool>> UpdateFeeSettingsAsync(UpdateFeeSettingsRequest request, string currentUserId, CancellationToken ct = default);
}
