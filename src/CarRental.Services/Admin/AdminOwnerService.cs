using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Admin;

public class AdminOwnerService : IAdminOwnerService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IClock _clock;
    private readonly ILogger<AdminOwnerService> _logger;

    public AdminOwnerService(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        IClock clock,
        ILogger<AdminOwnerService> logger)
    {
        _db = db;
        _userManager = userManager;
        _clock = clock;
        _logger = logger;
    }

    // owner metrics
    public async Task<ServiceResult<AdminOwnerMetricsDto>> GetOwnerMetricsAsync(CancellationToken ct = default)
    {
        var total = await _db.OwnerProfiles.AsNoTracking().CountAsync(ct);
        var pending = await _db.OwnerProfiles.AsNoTracking().CountAsync(o => o.ApprovalStatus == OwnerApprovalStatuses.Pending, ct);
        var approved = await _db.OwnerProfiles.AsNoTracking().CountAsync(o => o.ApprovalStatus == OwnerApprovalStatuses.Approved, ct);
        var rejected = await _db.OwnerProfiles.AsNoTracking().CountAsync(o => o.ApprovalStatus == OwnerApprovalStatuses.Rejected, ct);
        var active = await _db.OwnerProfiles.AsNoTracking().CountAsync(o => o.AccessStatus == OwnerAccessStatuses.Active, ct);
        var suspended = await _db.OwnerProfiles.AsNoTracking().CountAsync(o => o.AccessStatus == OwnerAccessStatuses.Suspended, ct);

        var metrics = new AdminOwnerMetricsDto
        {
            TotalProfiles = total,
            PendingCount = pending,
            ApprovedCount = approved,
            RejectedCount = rejected,
            ActiveCount = active,
            SuspendedCount = suspended
        };

        return ServiceResult<AdminOwnerMetricsDto>.Success(metrics);
    }

    // owner list
    public async Task<ServiceResult<PagedResult<AdminOwnerListItemDto>>> GetOwnersAsync(AdminOwnerFilterDto filter, CancellationToken ct = default)
    {
        var query = _db.OwnerProfiles.AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Reviewer)
            .AsQueryable();

        // filter approval status
        if (!string.IsNullOrWhiteSpace(filter.ApprovalStatus) && filter.ApprovalStatus != "all")
        {
            query = query.Where(o => o.ApprovalStatus == filter.ApprovalStatus);
        }

        // filter access status
        if (!string.IsNullOrWhiteSpace(filter.AccessStatus) && filter.AccessStatus != "all")
        {
            query = query.Where(o => o.AccessStatus == filter.AccessStatus);
        }

        // search term
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim();
            query = query.Where(o =>
                o.User.FullName.Contains(term) ||
                (o.User.UserName != null && o.User.UserName.Contains(term)) ||
                (o.User.PhoneNumber != null && o.User.PhoneNumber.Contains(term)) ||
                (o.User.Email != null && o.User.Email.Contains(term)) ||
                o.CccdNumber.Contains(term));
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var profiles = await query
            .OrderByDescending(o => o.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var userIds = profiles.Select(p => p.UserId).Distinct().ToList();
        var carCounts = await _db.Vehicles.AsNoTracking()
            .Where(v => userIds.Contains(v.OwnerId))
            .GroupBy(v => v.OwnerId)
            .Select(g => new { OwnerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.OwnerId, g => g.Count, ct);

        var items = profiles.Select(p => new AdminOwnerListItemDto
        {
            OwnerProfileId = p.OwnerProfileId,
            UserId = p.UserId,
            UserName = p.User?.UserName ?? string.Empty,
            FullName = p.User?.FullName ?? string.Empty,
            PhoneNumber = p.User?.PhoneNumber ?? string.Empty,
            Email = p.User?.Email ?? string.Empty,
            CccdNumber = p.CccdNumber,
            ApprovalStatus = p.ApprovalStatus,
            AccessStatus = p.AccessStatus,
            SubmittedAt = p.SubmittedAt,
            ReviewedBy = p.ReviewedBy,
            ReviewerName = p.Reviewer?.FullName ?? p.Reviewer?.UserName,
            ReviewedAt = p.ReviewedAt,
            RejectReason = p.RejectReason,
            TotalVehicles = carCounts.TryGetValue(p.UserId, out var count) ? count : 0
        }).ToList();

        return ServiceResult<PagedResult<AdminOwnerListItemDto>>.Success(
            PagedResult<AdminOwnerListItemDto>.Create(items, totalCount, page, pageSize));
    }

    // owner detail
    public async Task<ServiceResult<AdminOwnerDetailDto>> GetOwnerByIdAsync(int ownerProfileId, CancellationToken ct = default)
    {
        var profile = await _db.OwnerProfiles.AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Reviewer)
            .FirstOrDefaultAsync(o => o.OwnerProfileId == ownerProfileId, ct);

        if (profile == null)
            return ServiceResult<AdminOwnerDetailDto>.Fail("Không tìm thấy hồ sơ chủ xe.", ErrorCodes.NotFound);

        // vehicles list
        var vehicles = await _db.Vehicles.AsNoTracking()
            .Where(v => v.OwnerId == profile.UserId)
            .Include(v => v.Listings)
            .Select(v => new AdminOwnerVehicleSummaryDto
            {
                VehicleId = v.VehicleId,
                LicensePlate = v.LicensePlate,
                Brand = v.Brand,
                Model = v.Model,
                Year = v.Year,
                Seats = v.Seats,
                Status = v.Status,
                PricePerDay = v.Listings.OrderByDescending(l => l.ListingId).Select(l => l.PricePerDay).FirstOrDefault(),
                City = v.Listings.OrderByDescending(l => l.ListingId).Select(l => l.City).FirstOrDefault() ?? string.Empty,
                District = v.Listings.OrderByDescending(l => l.ListingId).Select(l => l.District).FirstOrDefault() ?? string.Empty
            })
            .ToListAsync(ct);

        var detail = new AdminOwnerDetailDto
        {
            OwnerProfileId = profile.OwnerProfileId,
            UserId = profile.UserId,
            UserName = profile.User?.UserName ?? string.Empty,
            FullName = profile.User?.FullName ?? string.Empty,
            PhoneNumber = profile.User?.PhoneNumber ?? string.Empty,
            Email = profile.User?.Email ?? string.Empty,
            CccdNumber = profile.CccdNumber,
            ApprovalStatus = profile.ApprovalStatus,
            AccessStatus = profile.AccessStatus,
            SubmittedAt = profile.SubmittedAt,
            ReviewedBy = profile.ReviewedBy,
            ReviewerName = profile.Reviewer?.FullName ?? profile.Reviewer?.UserName,
            ReviewedAt = profile.ReviewedAt,
            RejectReason = profile.RejectReason,
            TotalVehicles = vehicles.Count,
            CccdImageFront = profile.CccdImageFront,
            CccdImageBack = profile.CccdImageBack,
            Vehicles = vehicles
        };

        return ServiceResult<AdminOwnerDetailDto>.Success(detail);
    }

    // approve owner
    public async Task<ServiceResult<bool>> ApproveOwnerAsync(int ownerProfileId, string currentUserId, CancellationToken ct = default)
    {
        var profile = await _db.OwnerProfiles
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OwnerProfileId == ownerProfileId, ct);

        if (profile == null)
            return ServiceResult<bool>.Fail("Không tìm thấy hồ sơ chủ xe.", ErrorCodes.NotFound);

        var user = profile.User;
        if (user == null)
            return ServiceResult<bool>.Fail("Không tìm thấy tài khoản người dùng gắn với hồ sơ.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        profile.ApprovalStatus = OwnerApprovalStatuses.Approved;
        profile.AccessStatus = OwnerAccessStatuses.Active;
        profile.ReviewedBy = currentUserId;
        profile.ReviewedAt = now;
        profile.RejectReason = null;

        // assign owner role
        if (!await _userManager.IsInRoleAsync(user, RoleNames.Owner))
        {
            var addRoleResult = await _userManager.AddToRoleAsync(user, RoleNames.Owner);
            if (!addRoleResult.Succeeded)
            {
                var err = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                _logger.LogError("Không thể cấp vai trò Owner cho user {UserId}: {Error}", user.Id, err);
                return ServiceResult<bool>.Fail($"Lỗi cấp vai trò: {err}", ErrorCodes.Unexpected);
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} đã duyệt hồ sơ chủ xe {ProfileId} của user {UserId}", currentUserId, ownerProfileId, user.Id);
        return ServiceResult<bool>.Success(true);
    }

    // reject owner
    public async Task<ServiceResult<bool>> RejectOwnerAsync(int ownerProfileId, RejectOwnerRequest request, string currentUserId, CancellationToken ct = default)
    {
        var profile = await _db.OwnerProfiles
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OwnerProfileId == ownerProfileId, ct);

        if (profile == null)
            return ServiceResult<bool>.Fail("Không tìm thấy hồ sơ chủ xe.", ErrorCodes.NotFound);

        var user = profile.User;
        var now = _clock.UtcNow;

        profile.ApprovalStatus = OwnerApprovalStatuses.Rejected;
        profile.AccessStatus = OwnerAccessStatuses.Inactive;
        profile.RejectReason = request.RejectReason?.Trim();
        profile.ReviewedBy = currentUserId;
        profile.ReviewedAt = now;

        // remove owner role if rejected
        if (user != null && await _userManager.IsInRoleAsync(user, RoleNames.Owner))
        {
            await _userManager.RemoveFromRoleAsync(user, RoleNames.Owner);
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} đã từ chối hồ sơ chủ xe {ProfileId}: {Reason}", currentUserId, ownerProfileId, request.RejectReason);
        return ServiceResult<bool>.Success(true);
    }

    // toggle owner access
    public async Task<ServiceResult<bool>> ToggleOwnerAccessAsync(int ownerProfileId, ToggleOwnerAccessRequest request, string currentUserId, CancellationToken ct = default)
    {
        var profile = await _db.OwnerProfiles.FirstOrDefaultAsync(o => o.OwnerProfileId == ownerProfileId, ct);
        if (profile == null)
            return ServiceResult<bool>.Fail("Không tìm thấy hồ sơ chủ xe.", ErrorCodes.NotFound);

        if (request.AccessStatus != OwnerAccessStatuses.Active && request.AccessStatus != OwnerAccessStatuses.Suspended)
            return ServiceResult<bool>.Fail("Trạng thái truy cập không hợp lệ.", ErrorCodes.Validation);

        profile.AccessStatus = request.AccessStatus;
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Admin {AdminId} đổi trạng thái truy cập hồ sơ {ProfileId} thành {AccessStatus}", currentUserId, ownerProfileId, request.AccessStatus);
        return ServiceResult<bool>.Success(true);
    }
}
