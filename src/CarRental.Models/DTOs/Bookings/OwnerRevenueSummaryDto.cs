using System;
using System.Collections.Generic;
using CarRental.Models.Constants;

namespace CarRental.Models.DTOs.Bookings;

public class OwnerRevenueSummaryDto
{
    public int TotalCompletedTrips { get; set; }
    public decimal GrossRentalRevenue { get; set; }
    public decimal TotalCommissionPaid { get; set; }
    public decimal NetEarnings { get; set; }
    public decimal CommissionRate { get; set; } = BusinessRules.DefaultCommissionRate;
    public List<OwnerRevenueTripItemDto> Trips { get; set; } = new();
}

public class OwnerRevenueTripItemDto
{
    public int BookingId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string RenterName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RentalDays { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetEarning { get; set; }
    public DateTime? CompletedAt { get; set; }
}
