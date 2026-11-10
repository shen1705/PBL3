using System;
using System.Collections.Generic;

namespace CarRental.Models.DTOs.Admin;

public class AdminRevenueReportDto
{
    public decimal TotalGmv { get; set; }
    public decimal TotalPlatformRevenue { get; set; }
    public decimal TotalOwnerPayout { get; set; }
    public int CompletedBookingsCount { get; set; }
    public decimal CommissionRate { get; set; }
    public List<RegionalRevenueDto> RegionalBreakdown { get; set; } = new();
    public List<RevenueSettlementDto> RecentSettlements { get; set; } = new();
}

public class RegionalRevenueDto
{
    public string RegionName { get; set; } = string.Empty;
    public decimal Gmv { get; set; }
    public decimal Percentage { get; set; }
    public int BookingCount { get; set; }
}

public class RevenueSettlementDto
{
    public int BookingId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string VehicleName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal OwnerAmount { get; set; }
    public DateTime SettledAt { get; set; }
}
