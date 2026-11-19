using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs.Reviews;

namespace CarRental.Services.Admin;

public interface IAdminReviewService
{
    Task<ServiceResult<List<AdminReviewItemDto>>> GetReportedReviewsAsync(CancellationToken ct = default);
    Task<ServiceResult<bool>> ModerateReviewAsync(int reviewId, ModerateReviewRequest request, string currentUserId, CancellationToken ct = default);
}
