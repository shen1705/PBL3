using System;
using System.Collections.Generic;

namespace CarRental.Models.DTOs.Admin;

public class AdminUserDetailDto : AdminUserListItemDto
{
    public DriverLicenseDetailDto? DriverLicense { get; set; }
    public OwnerProfileDetailDto? OwnerProfile { get; set; }
    public BankAccountDetailDto? BankAccount { get; set; }
    public List<AdminSanctionDto> Sanctions { get; set; } = new();
    public List<AdminBookingSimpleDto> RecentBookings { get; set; } = new();
    public List<AdminVehicleSimpleDto> Vehicles { get; set; } = new();
}

public class DriverLicenseDetailDto
{
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseClass { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public string ImageFront { get; set; } = string.Empty;
}

public class OwnerProfileDetailDto
{
    public int OwnerProfileId { get; set; }
    public string CccdNumber { get; set; } = string.Empty;
    public string CccdImageFront { get; set; } = string.Empty;
    public string CccdImageBack { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;
    public string AccessStatus { get; set; } = string.Empty;
    public string? RejectReason { get; set; }
    public DateTime SubmittedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewerName { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class BankAccountDetailDto
{
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminBookingSimpleDto
{
    public int BookingId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminVehicleSimpleDto
{
    public int VehicleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal DailyRate { get; set; }
}
