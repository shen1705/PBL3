using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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

public class AdminUserService : IAdminUserService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IClock _clock;
    private readonly ILogger<AdminUserService> _logger;

    public AdminUserService(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IClock clock,
        ILogger<AdminUserService> logger)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
        _clock = clock;
        _logger = logger;
    }

    public async Task<ServiceResult<AdminUserMetricsDto>> GetUserMetricsAsync(CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        var totalUsers = await _userManager.Users.CountAsync(ct);

        // sanctioned users
        var sanctionedUserIds = await _db.AccountSanctions.AsNoTracking()
            .Where(s => s.LiftedAt == null && (s.ExpiresAt == null || s.ExpiresAt > now))
            .Select(s => s.UserId)
            .Distinct()
            .ToListAsync(ct);

        var sanctionedCount = sanctionedUserIds.Count;
        var activeCount = Math.Max(0, totalUsers - sanctionedCount);

        // owners count
        var ownerUserIds = await _db.OwnerProfiles.AsNoTracking()
            .Where(o => o.ApprovalStatus == OwnerApprovalStatuses.Approved)
            .Select(o => o.UserId)
            .Distinct()
            .ToListAsync(ct);

        // pending owners
        var pendingOwnerCount = await _db.OwnerProfiles.AsNoTracking()
            .Where(o => o.ApprovalStatus == OwnerApprovalStatuses.Pending)
            .Select(o => o.UserId)
            .Distinct()
            .CountAsync(ct);

        var pendingListingCount = await _db.VehicleListings.AsNoTracking()
            .CountAsync(l => l.ModerationStatus == ListingModerationStatuses.PendingApproval, ct);

        var openDisputeCount = await _db.Disputes.AsNoTracking()
            .CountAsync(d => d.Status == DisputeStatuses.Open, ct);

        var completedBookings = await _db.Bookings.AsNoTracking()
            .Where(b => b.Status == BookingStatuses.Completed)
            .Select(b => b.PriceLockedTotal)
            .ToListAsync(ct);

        var completedCount = completedBookings.Count;
        var totalGmv = completedBookings.Sum();
        var platformRevenue = Math.Round(totalGmv * 0.05m, 0);

        var metrics = new AdminUserMetricsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeCount,
            OwnerCount = ownerUserIds.Count,
            SanctionedCount = sanctionedCount,
            PendingVerificationCount = pendingOwnerCount,
            PendingOwnerCount = pendingOwnerCount,
            PendingListingCount = pendingListingCount,
            OpenDisputeCount = openDisputeCount,
            CompletedTripsCount = completedCount,
            TotalGmv = totalGmv,
            PlatformRevenue = platformRevenue
        };

        return ServiceResult<AdminUserMetricsDto>.Success(metrics);
    }

    public async Task<ServiceResult<PagedResult<AdminUserListItemDto>>> GetUsersAsync(AdminUserFilterDto filter, CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        var query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var q = filter.Query.Trim().ToLower();
            query = query.Where(u =>
                (u.UserName != null && u.UserName.ToLower().Contains(q)) ||
                u.FullName.ToLower().Contains(q) ||
                (u.Email != null && u.Email.ToLower().Contains(q)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(q)));
        }

        var allUsers = await query.OrderBy(u => u.UserName).ToListAsync(ct);
        var userIds = allUsers.Select(u => u.Id).ToList();

        // load relations
        var activeSanctions = await _db.AccountSanctions.AsNoTracking()
            .Where(s => userIds.Contains(s.UserId) && s.LiftedAt == null && (s.ExpiresAt == null || s.ExpiresAt > now))
            .OrderByDescending(s => s.IssuedAt)
            .ToListAsync(ct);

        var activeSanctionsByUserId = activeSanctions
            .GroupBy(s => s.UserId)
            .ToDictionary(g => g.Key, g => g.First());

        var driverLicenses = await _db.DriverLicenses.AsNoTracking()
            .Where(d => userIds.Contains(d.UserId))
            .ToDictionaryAsync(d => d.UserId, ct);

        var ownerProfiles = await _db.OwnerProfiles.AsNoTracking()
            .Where(o => userIds.Contains(o.UserId))
            .ToDictionaryAsync(o => o.UserId, ct);

        var tripsCounts = await _db.Bookings.AsNoTracking()
            .Where(b => userIds.Contains(b.RenterId))
            .GroupBy(b => b.RenterId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var vehicleCounts = await _db.Vehicles.AsNoTracking()
            .Where(v => userIds.Contains(v.OwnerId))
            .GroupBy(v => v.OwnerId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        // get roles
        var userRolesMap = new Dictionary<string, IList<string>>();
        foreach (var u in allUsers)
        {
            userRolesMap[u.Id] = await _userManager.GetRolesAsync(u);
        }

        // map dto
        var items = new List<AdminUserListItemDto>();
        foreach (var u in allUsers)
        {
            var roles = userRolesMap[u.Id].ToList();
            var isSanctioned = activeSanctionsByUserId.TryGetValue(u.Id, out var activeSanction);
            var hasDl = driverLicenses.TryGetValue(u.Id, out var dl);
            var hasOwner = ownerProfiles.TryGetValue(u.Id, out var op);
            var trips = tripsCounts.GetValueOrDefault(u.Id, 0);
            var vehicles = vehicleCounts.GetValueOrDefault(u.Id, 0);

            var isAdmin = roles.Contains(RoleNames.Admin);
            var isStaff = roles.Contains(RoleNames.Staff);
            var isOwner = roles.Contains(RoleNames.Owner) || (hasOwner && op!.ApprovalStatus == OwnerApprovalStatuses.Approved);

            string primaryRole = isAdmin ? "Quản trị viên"
                : isStaff ? "Nhân viên"
                : isOwner ? "Chủ xe"
                : "Người thuê";

            string accountStatus;
            string badgeColor;
            string badgeText;

            if (isSanctioned)
            {
                accountStatus = "Sanctioned";
                badgeColor = "red";
                badgeText = activeSanction!.SanctionType == SanctionTypes.Ban ? "Tạm khóa vĩnh viễn" : "Bị hạn chế";
            }
            else if (hasOwner && op!.ApprovalStatus == OwnerApprovalStatuses.Pending)
            {
                accountStatus = "PendingVerification";
                badgeColor = "amber";
                badgeText = "Chờ duyệt hồ sơ";
            }
            else
            {
                accountStatus = "Active";
                badgeColor = "green";
                badgeText = "Đang hoạt động";
            }

            var item = new AdminUserListItemDto
            {
                Id = u.Id,
                UserName = u.UserName ?? string.Empty,
                FullName = u.FullName,
                Email = u.Email ?? string.Empty,
                PhoneNumber = u.PhoneNumber,
                Gender = u.Gender,
                Roles = roles,
                PrimaryRole = primaryRole,
                IsOwner = isOwner,
                IsStaff = isStaff,
                IsAdmin = isAdmin,
                HasDriverLicense = hasDl,
                DriverLicenseClass = dl?.LicenseClass,
                OwnerApprovalStatus = op?.ApprovalStatus,
                IsSanctioned = isSanctioned,
                ActiveSanctionType = activeSanction?.SanctionType,
                ActiveSanctionReason = activeSanction?.Reason,
                SanctionExpiresAt = activeSanction?.ExpiresAt,
                AccountStatus = accountStatus,
                StatusBadgeColor = badgeColor,
                StatusBadgeText = badgeText,
                TripsCount = trips,
                VehiclesCount = vehicles,
                Rating = isOwner ? 4.9m : 5.0m
            };

            items.Add(item);
        }

        // filter tab
        if (!string.IsNullOrWhiteSpace(filter.Tab) && filter.Tab != "all")
        {
            var tab = filter.Tab.Trim().ToLowerInvariant();
            if (tab == "active")
                items = items.Where(x => !x.IsSanctioned).ToList();
            else if (tab == "review" || tab == "sanctioned")
                items = items.Where(x => x.IsSanctioned).ToList();
            else if (tab == "pending")
                items = items.Where(x => x.AccountStatus == "PendingVerification" || !x.HasDriverLicense).ToList();
        }

        // filter role
        if (!string.IsNullOrWhiteSpace(filter.Role) && filter.Role != "all")
        {
            var r = filter.Role.Trim();
            if (r.Equals("Owner", StringComparison.OrdinalIgnoreCase))
                items = items.Where(x => x.IsOwner).ToList();
            else if (r.Equals("Staff", StringComparison.OrdinalIgnoreCase))
                items = items.Where(x => x.IsStaff).ToList();
            else if (r.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                items = items.Where(x => x.IsAdmin).ToList();
            else if (r.Equals("Renter", StringComparison.OrdinalIgnoreCase))
                items = items.Where(x => !x.IsOwner && !x.IsStaff && !x.IsAdmin).ToList();
        }

        var total = items.Count;
        var pageSize = filter.PageSize > 0 ? filter.PageSize : 10;
        var pageNumber = filter.PageNumber > 0 ? filter.PageNumber : 1;

        var pagedItems = items
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var pagedResult = PagedResult<AdminUserListItemDto>.Create(pagedItems, total, pageNumber, pageSize);
        return ServiceResult<PagedResult<AdminUserListItemDto>>.Success(pagedResult);
    }

    public async Task<ServiceResult<AdminUserDetailDto>> GetUserByIdAsync(string userId, CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return ServiceResult<AdminUserDetailDto>.Fail("Không tìm thấy người dùng.", ErrorCodes.NotFound);

        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        var dl = await _db.DriverLicenses.AsNoTracking().FirstOrDefaultAsync(d => d.UserId == userId, ct);
        var op = await _db.OwnerProfiles.AsNoTracking().FirstOrDefaultAsync(o => o.UserId == userId, ct);
        var bank = await _db.MockBankAccounts.AsNoTracking().FirstOrDefaultAsync(b => b.UserId == userId, ct);

        // sanctions
        var sanctions = await _db.AccountSanctions.AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.IssuedAt)
            .ToListAsync(ct);

        var issuerIds = sanctions.Select(s => s.IssuedBy).Concat(sanctions.Where(s => s.LiftedBy != null).Select(s => s.LiftedBy!)).Distinct().ToList();
        var nameMap = await _userManager.Users.AsNoTracking()
            .Where(u => issuerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName, ct);

        var sanctionDtos = sanctions.Select(s => new AdminSanctionDto
        {
            SanctionId = s.SanctionId,
            UserId = s.UserId,
            SanctionType = s.SanctionType,
            Reason = s.Reason,
            IssuedBy = s.IssuedBy,
            IssuerName = nameMap.TryGetValue(s.IssuedBy, out var issName) ? issName : "Quản trị viên",
            IssuedAt = s.IssuedAt,
            ExpiresAt = s.ExpiresAt,
            LiftedBy = s.LiftedBy,
            LifterName = s.LiftedBy != null && nameMap.TryGetValue(s.LiftedBy, out var lifName) ? lifName : null,
            LiftedAt = s.LiftedAt
        }).ToList();

        var activeSanction = sanctionDtos.FirstOrDefault(s => s.IsActive);
        var isSanctioned = activeSanction != null;

        // renter trips
        var recentBookings = await _db.Bookings.AsNoTracking()
            .Include(b => b.Vehicle)
            .Where(b => b.RenterId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new AdminBookingSimpleDto
            {
                BookingId = b.BookingId,
                VehicleName = b.Vehicle != null ? b.Vehicle.Brand + " " + b.Vehicle.Model : "Xe thuê",
                Status = b.Status,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                TotalAmount = b.PriceLockedTotal,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync(ct);

        // owner cars
        var vehicles = await _db.Vehicles.AsNoTracking()
            .Include(v => v.Listings)
            .Where(v => v.OwnerId == userId)
            .Select(v => new AdminVehicleSimpleDto
            {
                VehicleId = v.VehicleId,
                Name = v.Brand + " " + v.Model + " (" + v.Year + ")",
                LicensePlate = v.LicensePlate,
                Status = v.Status,
                DailyRate = v.Listings.Any() ? v.Listings.First().PricePerDay : 0
            })
            .ToListAsync(ct);

        var isAdmin = roles.Contains(RoleNames.Admin);
        var isStaff = roles.Contains(RoleNames.Staff);
        var isOwner = roles.Contains(RoleNames.Owner) || (op != null && op.ApprovalStatus == OwnerApprovalStatuses.Approved);

        string primaryRole = isAdmin ? "Quản trị viên"
            : isStaff ? "Nhân viên"
            : isOwner ? "Chủ xe"
            : "Người thuê";

        string accountStatus = isSanctioned ? "Sanctioned"
            : (op != null && op.ApprovalStatus == OwnerApprovalStatuses.Pending) ? "PendingVerification"
            : "Active";

        string badgeColor = isSanctioned ? "red"
            : (op != null && op.ApprovalStatus == OwnerApprovalStatuses.Pending) ? "amber"
            : "green";

        string badgeText = isSanctioned
            ? (activeSanction!.SanctionType == SanctionTypes.Ban ? "Tạm khóa vĩnh viễn" : "Bị hạn chế")
            : (op != null && op.ApprovalStatus == OwnerApprovalStatuses.Pending) ? "Chờ duyệt hồ sơ"
            : "Đang hoạt động";

        var detail = new AdminUserDetailDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            Gender = user.Gender,
            Roles = roles,
            PrimaryRole = primaryRole,
            IsOwner = isOwner,
            IsStaff = isStaff,
            IsAdmin = isAdmin,
            HasDriverLicense = dl != null,
            DriverLicenseClass = dl?.LicenseClass,
            OwnerApprovalStatus = op?.ApprovalStatus,
            IsSanctioned = isSanctioned,
            ActiveSanctionType = activeSanction?.SanctionType,
            ActiveSanctionReason = activeSanction?.Reason,
            SanctionExpiresAt = activeSanction?.ExpiresAt,
            AccountStatus = accountStatus,
            StatusBadgeColor = badgeColor,
            StatusBadgeText = badgeText,
            TripsCount = recentBookings.Count,
            VehiclesCount = vehicles.Count,
            Rating = isOwner ? 4.9m : 5.0m,
            Sanctions = sanctionDtos,
            RecentBookings = recentBookings,
            Vehicles = vehicles,
            DriverLicense = dl != null ? new DriverLicenseDetailDto
            {
                LicenseNumber = dl.LicenseNumber,
                LicenseClass = dl.LicenseClass,
                ExpiryDate = dl.ExpiryDate,
                ImageFront = dl.ImageFront
            } : null,
            OwnerProfile = op != null ? new OwnerProfileDetailDto
            {
                OwnerProfileId = op.OwnerProfileId,
                CccdNumber = op.CccdNumber,
                CccdImageFront = op.CccdImageFront,
                CccdImageBack = op.CccdImageBack,
                ApprovalStatus = op.ApprovalStatus,
                AccessStatus = op.AccessStatus,
                RejectReason = op.RejectReason,
                SubmittedAt = op.SubmittedAt,
                ReviewedBy = op.ReviewedBy,
                ReviewerName = op.ReviewedBy != null && nameMap.TryGetValue(op.ReviewedBy, out var revName) ? revName : null,
                ReviewedAt = op.ReviewedAt
            } : null,
            BankAccount = bank != null ? new BankAccountDetailDto
            {
                AccountNumber = bank.AccountNumber,
                AccountType = bank.AccountType,
                Status = bank.Status,
                CreatedAt = bank.CreatedAt
            } : null
        };

        return ServiceResult<AdminUserDetailDto>.Success(detail);
    }

    public async Task<ServiceResult<bool>> SanctionUserAsync(string targetUserId, SanctionUserRequest request, string currentUserId, CancellationToken ct = default)
    {
        if (targetUserId == currentUserId)
            return ServiceResult<bool>.Fail("Không thể tự khóa tài khoản của chính mình.", ErrorCodes.Conflict);

        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy tài khoản người dùng mục tiêu.", ErrorCodes.NotFound);

        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        if (currentUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy thông tin quản trị viên thực hiện.", ErrorCodes.Unauthorized);

        var targetRoles = await _userManager.GetRolesAsync(targetUser);
        var currentRoles = await _userManager.GetRolesAsync(currentUser);
        var currentClaims = await _userManager.GetClaimsAsync(currentUser);

        var currentIsAdmin = currentRoles.Contains(RoleNames.Admin) || currentClaims.Any(c => c.Type == AppClaimTypes.CanManageAdminAccounts);
        var targetIsAdminOrStaff = targetRoles.Contains(RoleNames.Admin) || targetRoles.Contains(RoleNames.Staff);

        // staff cannot sanction staff/admin
        if (!currentIsAdmin && targetIsAdminOrStaff)
        {
            _logger.LogWarning("Staff {CurrentUserId} attempted to sanction Admin/Staff {TargetUserId}", currentUserId, targetUserId);
            return ServiceResult<bool>.Fail("Nhân viên (Staff) không có thẩm quyền khóa hoặc áp dụng chế tài lên tài khoản Quản trị viên/Nhân viên khác.", ErrorCodes.Forbidden);
        }

        DateTime? expiresAt = request.SanctionType switch
        {
            SanctionTypes.Suspend7d => _clock.UtcNow.AddDays(7),
            SanctionTypes.Suspend30d => _clock.UtcNow.AddDays(30),
            SanctionTypes.Ban => null,
            _ => _clock.UtcNow.AddDays(7)
        };

        var sanction = new AccountSanction
        {
            UserId = targetUserId,
            SanctionType = request.SanctionType,
            Reason = request.Reason.Trim(),
            IssuedBy = currentUserId,
            IssuedAt = _clock.UtcNow,
            ExpiresAt = expiresAt
        };

        _db.AccountSanctions.Add(sanction);

        // identity lockout
        await _userManager.SetLockoutEnabledAsync(targetUser, true);
        await _userManager.SetLockoutEndDateAsync(targetUser, expiresAt ?? DateTimeOffset.MaxValue);

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("User {TargetUserId} sanctioned with {SanctionType} by {CurrentUserId}. Reason: {Reason}", targetUserId, request.SanctionType, currentUserId, request.Reason);

        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> LiftSanctionAsync(string targetUserId, LiftSanctionRequest request, string currentUserId, CancellationToken ct = default)
    {
        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy tài khoản người dùng mục tiêu.", ErrorCodes.NotFound);

        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        if (currentUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy thông tin quản trị viên thực hiện.", ErrorCodes.Unauthorized);

        var targetRoles = await _userManager.GetRolesAsync(targetUser);
        var currentRoles = await _userManager.GetRolesAsync(currentUser);
        var currentClaims = await _userManager.GetClaimsAsync(currentUser);

        var currentIsAdmin = currentRoles.Contains(RoleNames.Admin) || currentClaims.Any(c => c.Type == AppClaimTypes.CanManageAdminAccounts);
        var targetIsAdminOrStaff = targetRoles.Contains(RoleNames.Admin) || targetRoles.Contains(RoleNames.Staff);

        if (!currentIsAdmin && targetIsAdminOrStaff)
            return ServiceResult<bool>.Fail("Nhân viên (Staff) không có thẩm quyền thao tác trên tài khoản Quản trị viên/Nhân viên khác.", ErrorCodes.Forbidden);

        var now = _clock.UtcNow;
        var activeSanctions = await _db.AccountSanctions
            .Where(s => s.UserId == targetUserId && s.LiftedAt == null && (s.ExpiresAt == null || s.ExpiresAt > now))
            .ToListAsync(ct);

        if (!activeSanctions.Any())
            return ServiceResult<bool>.Fail("Tài khoản này hiện không có chế tài nào đang kích hoạt.", ErrorCodes.Conflict);

        foreach (var s in activeSanctions)
        {
            s.LiftedAt = now;
            s.LiftedBy = currentUserId;
        }

        // reset lockout
        await _userManager.SetLockoutEndDateAsync(targetUser, null);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Sanction lifted for user {TargetUserId} by {CurrentUserId}", targetUserId, currentUserId);
        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> ResetUserPasswordAsync(string targetUserId, ResetPasswordByAdminRequest request, string currentUserId, CancellationToken ct = default)
    {
        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy tài khoản người dùng.", ErrorCodes.NotFound);

        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        if (currentUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy người thực hiện.", ErrorCodes.Unauthorized);

        var targetRoles = await _userManager.GetRolesAsync(targetUser);
        var currentRoles = await _userManager.GetRolesAsync(currentUser);
        var currentClaims = await _userManager.GetClaimsAsync(currentUser);

        var currentIsAdmin = currentRoles.Contains(RoleNames.Admin) || currentClaims.Any(c => c.Type == AppClaimTypes.CanManageAdminAccounts);
        var targetIsAdminOrStaff = targetRoles.Contains(RoleNames.Admin) || targetRoles.Contains(RoleNames.Staff);

        if (!currentIsAdmin && targetIsAdminOrStaff)
            return ServiceResult<bool>.Fail("Nhân viên (Staff) không thể đặt lại mật khẩu cho tài khoản Quản trị/Nhân viên khác.", ErrorCodes.Forbidden);

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(targetUser);
        var result = await _userManager.ResetPasswordAsync(targetUser, resetToken, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return ServiceResult<bool>.Fail($"Không thể đặt lại mật khẩu: {errors}", ErrorCodes.Validation);
        }

        _logger.LogInformation("Password reset for user {TargetUserId} by admin/staff {CurrentUserId}", targetUserId, currentUserId);
        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> UpdateUserRolesAsync(string targetUserId, UpdateUserRolesRequest request, string currentUserId, CancellationToken ct = default)
    {
        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy người dùng.", ErrorCodes.NotFound);

        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        if (currentUser == null)
            return ServiceResult<bool>.Fail("Không tìm thấy người thực hiện.", ErrorCodes.Unauthorized);

        var currentRoles = await _userManager.GetRolesAsync(currentUser);
        var currentClaims = await _userManager.GetClaimsAsync(currentUser);

        var currentIsAdmin = currentRoles.Contains(RoleNames.Admin) || currentClaims.Any(c => c.Type == AppClaimTypes.CanManageAdminAccounts);
        if (!currentIsAdmin)
            return ServiceResult<bool>.Fail("Chỉ Quản trị viên (Admin) mới có quyền phân quyền tài khoản hệ thống.", ErrorCodes.Forbidden);

        var existingRoles = await _userManager.GetRolesAsync(targetUser);
        var newRoles = request.Roles.Where(r => RoleNames.All.Contains(r)).Distinct().ToList();

        // protect last admin
        if (existingRoles.Contains(RoleNames.Admin) && !newRoles.Contains(RoleNames.Admin))
        {
            var adminUsers = await _userManager.GetUsersInRoleAsync(RoleNames.Admin);
            if (adminUsers.Count <= 1)
                return ServiceResult<bool>.Fail("Không thể gỡ quyền Quản trị viên của tài khoản Admin cuối cùng trong hệ thống.", ErrorCodes.Conflict);
        }

        var toRemove = existingRoles.Except(newRoles).ToList();
        var toAdd = newRoles.Except(existingRoles).ToList();

        if (toRemove.Any())
            await _userManager.RemoveFromRolesAsync(targetUser, toRemove);

        if (toAdd.Any())
            await _userManager.AddToRolesAsync(targetUser, toAdd);

        _logger.LogInformation("Roles updated for user {TargetUserId} by {CurrentUserId}: +[{ToAdd}], -[{ToRemove}]",
            targetUserId, currentUserId, string.Join(",", toAdd), string.Join(",", toRemove));

        return ServiceResult<bool>.Success(true);
    }
}
