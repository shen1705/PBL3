using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Constants;
using CarRental.Models.Common;
using CarRental.Models.DTOs.Reviews;
using CarRental.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Admin;

public class AdminReviewService : IAdminReviewService
{
    private readonly ApplicationDbContext _db;
    private readonly IClock _clock;
    private readonly ILogger<AdminReviewService> _logger;

    public AdminReviewService(
        ApplicationDbContext db,
        IClock clock,
        ILogger<AdminReviewService> logger)
    {
        _db = db;
        _clock = clock;
        _logger = logger;
    }

    public async Task<ServiceResult<List<AdminReviewItemDto>>> GetReportedReviewsAsync(CancellationToken ct = default)
    {
        var reviews = await _db.Reviews.AsNoTracking()
            .Include(r => r.Booking)
                .ThenInclude(b => b.Vehicle)
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewee)
            .Where(r => r.IsReported)
            .OrderByDescending(r => r.ReportedAt)
            .ToListAsync(ct);

        var reporterIds = reviews
            .Where(r => !string.IsNullOrEmpty(r.ReportedByUserId))
            .Select(r => r.ReportedByUserId!)
            .Distinct()
            .ToList();

        var reporters = await _db.Users.AsNoTracking()
            .Where(u => reporterIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName ?? u.UserName ?? string.Empty, ct);

        var items = reviews.Select(r => new AdminReviewItemDto
        {
            ReviewId = r.ReviewId,
            BookingId = r.BookingId,
            VehicleName = r.Booking?.Vehicle != null ? $"{r.Booking.Vehicle.Brand} {r.Booking.Vehicle.Model}" : string.Empty,
            LicensePlate = r.Booking?.Vehicle?.LicensePlate ?? string.Empty,
            ReviewerId = r.ReviewerId,
            ReviewerName = r.Reviewer?.FullName ?? r.Reviewer?.UserName ?? string.Empty,
            RevieweeId = r.RevieweeId,
            RevieweeName = r.Reviewee?.FullName ?? r.Reviewee?.UserName ?? string.Empty,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            IsPublic = r.IsPublic,
            IsReported = r.IsReported,
            ReportReason = r.ReportReason,
            ReportedByUserId = r.ReportedByUserId,
            ReportedByName = !string.IsNullOrEmpty(r.ReportedByUserId) && reporters.TryGetValue(r.ReportedByUserId, out var name) ? name : string.Empty,
            ReportedAt = r.ReportedAt,
            ModeratedByUserId = r.ModeratedByUserId,
            ModeratedAt = r.ModeratedAt,
            ModerationNotes = r.ModerationNotes
        }).ToList();

        return ServiceResult<List<AdminReviewItemDto>>.Success(items);
    }

    public async Task<ServiceResult<bool>> ModerateReviewAsync(int reviewId, ModerateReviewRequest request, string currentUserId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(currentUserId))
            return ServiceResult<bool>.Fail("Yêu cầu đăng nhập quản trị.", ErrorCodes.Unauthorized);

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId, ct);
        if (review == null)
            return ServiceResult<bool>.Fail("Không tìm thấy đánh giá.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        review.IsPublic = request.IsApproved; // true: giữ lại công khai, false: gỡ bỏ / ẩn
        review.IsReported = false; // đã giải quyết xong báo cáo
        review.ModeratedByUserId = currentUserId;
        review.ModeratedAt = now;
        review.ModerationNotes = !string.IsNullOrWhiteSpace(request.Note) ? request.Note.Trim() : (request.IsApproved ? "Duyệt giữ lại đánh giá" : "Gỡ bỏ đánh giá vi phạm");

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} kiểm duyệt đánh giá #{ReviewId}: IsPublic={IsPublic}, Note={Note}", currentUserId, reviewId, review.IsPublic, review.ModerationNotes);

        var msg = request.IsApproved
            ? "Đã phê duyệt giữ lại đánh giá công khai."
            : "Đã gỡ bỏ và ẩn đánh giá vi phạm khỏi hệ thống.";

        return ServiceResult<bool>.Success(true, msg);
    }
}
