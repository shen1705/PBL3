using System;
using System.Globalization;
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

public class AdminFeeService : IAdminFeeService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IClock _clock;
    private readonly ILogger<AdminFeeService> _logger;

    public AdminFeeService(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        IClock clock,
        ILogger<AdminFeeService> logger)
    {
        _db = db;
        _userManager = userManager;
        _clock = clock;
        _logger = logger;
    }

    // fee settings
    public async Task<ServiceResult<AdminFeeSettingsDto>> GetFeeSettingsAsync(string currentUserId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(currentUserId);
        bool canEdit = false;
        if (user != null)
        {
            var claims = await _userManager.GetClaimsAsync(user);
            canEdit = claims.Any(c => c.Type == AppClaimTypes.CanManageSystemConfig && c.Value == AppClaimTypes.GrantedValue);
        }

        // read commission setting
        var commissionSetting = await _db.SystemSettings
            .Include(s => s.Updater)
            .FirstOrDefaultAsync(s => s.SettingKey == SettingKeys.CommissionRate, ct);

        decimal commissionRate = BusinessRules.DefaultCommissionRate;
        if (commissionSetting != null && decimal.TryParse(commissionSetting.SettingValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var cr))
        {
            commissionRate = cr;
        }

        // read other settings or defaults
        var depositSetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "deposit_rate", ct);
        decimal depositRate = BusinessRules.DepositRate;
        if (depositSetting != null && decimal.TryParse(depositSetting.SettingValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var dr))
        {
            depositRate = dr;
        }

        var penaltySetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "owner_cancel_penalty_rate", ct);
        decimal penaltyRate = BusinessRules.OwnerCancelPenaltyRate;
        if (penaltySetting != null && decimal.TryParse(penaltySetting.SettingValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var pr))
        {
            penaltyRate = pr;
        }

        var deadlineSetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "response_deadline_hours", ct);
        int deadlineHours = BusinessRules.ResponseDeadlineHours;
        if (deadlineSetting != null && int.TryParse(deadlineSetting.SettingValue, out var dh))
        {
            deadlineHours = dh;
        }

        // platform financial stats
        var completedBookings = await _db.Bookings.AsNoTracking()
            .Where(b => b.Status == BookingStatuses.Completed)
            .ToListAsync(ct);

        decimal totalGmv = completedBookings.Sum(b => b.PriceLockedTotal);
        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.RevenueRecordedAt != null)
            .ToListAsync(ct);
        decimal totalPlatformRevenue = payments.Sum(p => p.CommissionAmount ?? 0m);

        var dto = new AdminFeeSettingsDto
        {
            CommissionRate = commissionRate,
            DepositRate = depositRate,
            OwnerCancelPenaltyRate = penaltyRate,
            ResponseDeadlineHours = deadlineHours,
            CanEditConfig = canEdit,
            UpdatedBy = commissionSetting?.UpdatedBy,
            UpdaterName = commissionSetting?.Updater?.FullName ?? commissionSetting?.Updater?.UserName,
            UpdatedAt = commissionSetting?.UpdatedAt,
            TotalPlatformRevenue = totalPlatformRevenue,
            TotalGmv = totalGmv,
            CompletedBookingsCount = completedBookings.Count
        };

        return ServiceResult<AdminFeeSettingsDto>.Success(dto);
    }

    // update fee settings
    public async Task<ServiceResult<bool>> UpdateFeeSettingsAsync(UpdateFeeSettingsRequest request, string currentUserId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(currentUserId);
        if (user == null)
            return ServiceResult<bool>.Fail("Không tìm thấy tài khoản quản trị.", ErrorCodes.NotFound);

        var claims = await _userManager.GetClaimsAsync(user);
        bool canEdit = claims.Any(c => c.Type == AppClaimTypes.CanManageSystemConfig && c.Value == AppClaimTypes.GrantedValue);

        if (!canEdit)
            return ServiceResult<bool>.Fail("Chỉ Quản trị viên cấp cao (Admin) có quyền thay đổi cấu hình hoa hồng.", ErrorCodes.Forbidden);

        var now = _clock.UtcNow;

        // commission rate
        var commissionSetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == SettingKeys.CommissionRate, ct);
        if (commissionSetting == null)
        {
            commissionSetting = new SystemSetting
            {
                SettingKey = SettingKeys.CommissionRate,
                SettingValue = request.CommissionRate.ToString(CultureInfo.InvariantCulture),
                UpdatedBy = currentUserId,
                UpdatedAt = now
            };
            _db.SystemSettings.Add(commissionSetting);
        }
        else
        {
            commissionSetting.SettingValue = request.CommissionRate.ToString(CultureInfo.InvariantCulture);
            commissionSetting.UpdatedBy = currentUserId;
            commissionSetting.UpdatedAt = now;
        }

        // deposit rate
        if (request.DepositRate.HasValue)
        {
            var drSetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "deposit_rate", ct);
            if (drSetting == null)
            {
                _db.SystemSettings.Add(new SystemSetting
                {
                    SettingKey = "deposit_rate",
                    SettingValue = request.DepositRate.Value.ToString(CultureInfo.InvariantCulture),
                    UpdatedBy = currentUserId,
                    UpdatedAt = now
                });
            }
            else
            {
                drSetting.SettingValue = request.DepositRate.Value.ToString(CultureInfo.InvariantCulture);
                drSetting.UpdatedBy = currentUserId;
                drSetting.UpdatedAt = now;
            }
        }

        // penalty rate
        if (request.OwnerCancelPenaltyRate.HasValue)
        {
            var prSetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "owner_cancel_penalty_rate", ct);
            if (prSetting == null)
            {
                _db.SystemSettings.Add(new SystemSetting
                {
                    SettingKey = "owner_cancel_penalty_rate",
                    SettingValue = request.OwnerCancelPenaltyRate.Value.ToString(CultureInfo.InvariantCulture),
                    UpdatedBy = currentUserId,
                    UpdatedAt = now
                });
            }
            else
            {
                prSetting.SettingValue = request.OwnerCancelPenaltyRate.Value.ToString(CultureInfo.InvariantCulture);
                prSetting.UpdatedBy = currentUserId;
                prSetting.UpdatedAt = now;
            }
        }

        // response deadline
        if (request.ResponseDeadlineHours.HasValue)
        {
            var dlSetting = await _db.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "response_deadline_hours", ct);
            if (dlSetting == null)
            {
                _db.SystemSettings.Add(new SystemSetting
                {
                    SettingKey = "response_deadline_hours",
                    SettingValue = request.ResponseDeadlineHours.Value.ToString(),
                    UpdatedBy = currentUserId,
                    UpdatedAt = now
                });
            }
            else
            {
                dlSetting.SettingValue = request.ResponseDeadlineHours.Value.ToString();
                dlSetting.UpdatedBy = currentUserId;
                dlSetting.UpdatedAt = now;
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} đã cập nhật tỷ lệ hoa hồng thành {Rate}%: {Note}",
            currentUserId, request.CommissionRate * 100, request.Note);

        return ServiceResult<bool>.Success(true);
    }
}
