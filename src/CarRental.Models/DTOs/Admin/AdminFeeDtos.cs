using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Admin;

// fee and commission settings
public class AdminFeeSettingsDto
{
    public decimal CommissionRate { get; set; }
    public decimal DepositRate { get; set; }
    public decimal OwnerCancelPenaltyRate { get; set; }
    public int ResponseDeadlineHours { get; set; }
    public bool CanEditConfig { get; set; }
    public string? UpdatedBy { get; set; }
    public string? UpdaterName { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal TotalPlatformRevenue { get; set; }
    public decimal TotalGmv { get; set; }
    public int CompletedBookingsCount { get; set; }
}

// update fee settings request
public class UpdateFeeSettingsRequest
{
    [Range(0.01, 0.50, ErrorMessage = "Tỷ lệ hoa hồng phải từ 1% đến 50%.")]
    public decimal CommissionRate { get; set; }

    [Range(0.05, 0.90, ErrorMessage = "Tỷ lệ cọc phải từ 5% đến 90%.")]
    public decimal? DepositRate { get; set; }

    [Range(0.05, 0.90, ErrorMessage = "Tỷ lệ phạt hủy phải từ 5% đến 90%.")]
    public decimal? OwnerCancelPenaltyRate { get; set; }

    [Range(1, 168, ErrorMessage = "Hạn phản hồi phải từ 1 đến 168 giờ.")]
    public int? ResponseDeadlineHours { get; set; }

    [MaxLength(255)]
    public string? Note { get; set; }
}

// fee history entry
public class AdminFeeHistoryDto
{
    public string SettingKey { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? UpdatedBy { get; set; }
    public string? UpdaterName { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? Note { get; set; }
}
