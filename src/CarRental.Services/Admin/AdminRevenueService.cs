using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Admin;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Admin;

public class AdminRevenueService : IAdminRevenueService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IClock _clock;
    private readonly ILogger<AdminRevenueService> _logger;

    public AdminRevenueService(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        IClock clock,
        ILogger<AdminRevenueService> logger)
    {
        _db = db;
        _userManager = userManager;
        _clock = clock;
        _logger = logger;
    }

    // platform revenue report
    public async Task<ServiceResult<AdminRevenueReportDto>> GetPlatformRevenueReportAsync(string currentUserId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(currentUserId);
        if (user == null)
            return ServiceResult<AdminRevenueReportDto>.Fail("Không tìm thấy thông tin tài khoản.", ErrorCodes.NotFound);

        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains(RoleNames.Admin))
            return ServiceResult<AdminRevenueReportDto>.Fail("Chỉ Quản trị viên cấp cao (Admin) mới có quyền truy cập báo cáo doanh thu toàn sàn.", ErrorCodes.Forbidden);

        // commission rate setting
        var commissionSetting = await _db.SystemSettings.AsNoTracking()
            .FirstOrDefaultAsync(s => s.SettingKey == SettingKeys.CommissionRate, ct);

        decimal commissionRate = BusinessRules.DefaultCommissionRate;
        if (commissionSetting != null && decimal.TryParse(commissionSetting.SettingValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedRate))
        {
            commissionRate = parsedRate;
        }

        // completed bookings
        var completedBookings = await _db.Bookings.AsNoTracking()
            .Where(b => b.Status == BookingStatuses.Completed)
            .Include(b => b.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(b => b.Listing)
            .Include(b => b.Payment)
            .OrderByDescending(b => b.CompletedAt ?? b.CreatedAt)
            .ToListAsync(ct);

        decimal totalGmv = completedBookings.Sum(b => b.PriceLockedTotal);

        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.RevenueRecordedAt != null)
            .ToListAsync(ct);

        decimal totalPlatformRevenue = payments.Any()
            ? payments.Sum(p => p.CommissionAmount ?? 0m)
            : Math.Round(totalGmv * commissionRate, 0);

        decimal totalOwnerPayout = totalGmv >= totalPlatformRevenue ? totalGmv - totalPlatformRevenue : 0m;

        // regional breakdown
        var regionalGroups = completedBookings
            .GroupBy(b => string.IsNullOrWhiteSpace(b.Listing?.City) ? "Khác" : b.Listing.City)
            .Select(g => new RegionalRevenueDto
            {
                RegionName = g.Key,
                Gmv = g.Sum(b => b.PriceLockedTotal),
                BookingCount = g.Count(),
                Percentage = totalGmv > 0 ? Math.Round((g.Sum(b => b.PriceLockedTotal) / totalGmv) * 100m, 1) : 0m
            })
            .OrderByDescending(r => r.Gmv)
            .ToList();

        // recent settlements
        var settlements = completedBookings.Take(10).Select(b =>
        {
            decimal comm = b.Payment?.CommissionAmount ?? Math.Round(b.PriceLockedTotal * commissionRate, 0);
            decimal ownerShare = b.PriceLockedTotal >= comm ? b.PriceLockedTotal - comm : 0m;

            return new RevenueSettlementDto
            {
                BookingId = b.BookingId,
                OwnerName = b.Vehicle?.Owner?.FullName ?? b.Vehicle?.Owner?.UserName ?? "Chủ xe",
                VehicleName = $"{b.Vehicle?.Brand} {b.Vehicle?.Model} {b.Vehicle?.Year}".Trim(),
                TotalAmount = b.PriceLockedTotal,
                CommissionAmount = comm,
                OwnerAmount = ownerShare,
                SettledAt = b.CompletedAt ?? b.CreatedAt
            };
        }).ToList();

        var dto = new AdminRevenueReportDto
        {
            TotalGmv = totalGmv,
            TotalPlatformRevenue = totalPlatformRevenue,
            TotalOwnerPayout = totalOwnerPayout,
            CompletedBookingsCount = completedBookings.Count,
            CommissionRate = commissionRate,
            RegionalBreakdown = regionalGroups,
            RecentSettlements = settlements
        };

        return ServiceResult<AdminRevenueReportDto>.Success(dto);
    }
}
