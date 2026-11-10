using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs.Admin;

namespace CarRental.Services.Admin;

public interface IAdminRevenueService
{
    Task<ServiceResult<AdminRevenueReportDto>> GetPlatformRevenueReportAsync(string currentUserId, CancellationToken ct = default);
}
