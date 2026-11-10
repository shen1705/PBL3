using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Admin;

// filter owner profile
public class AdminOwnerFilterDto
{
    public string? ApprovalStatus { get; set; }
    public string? AccessStatus { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// owner list item
public class AdminOwnerListItemDto
{
    public int OwnerProfileId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CccdNumber { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;
    public string AccessStatus { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewerName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? RejectReason { get; set; }
    public int TotalVehicles { get; set; }
}

// owner detail
public class AdminOwnerDetailDto : AdminOwnerListItemDto
{
    public string CccdImageFront { get; set; } = string.Empty;
    public string CccdImageBack { get; set; } = string.Empty;
    public List<AdminOwnerVehicleSummaryDto> Vehicles { get; set; } = new();
}

// vehicle summary in owner detail
public class AdminOwnerVehicleSummaryDto
{
    public int VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Seats { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal PricePerDay { get; set; }
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
}

// approve request
public class ApproveOwnerRequest
{
    public string? Note { get; set; }
}

// reject request
public class RejectOwnerRequest
{
    [Required(ErrorMessage = "Vui lòng nhập lý do từ chối hồ sơ.")]
    [MaxLength(255)]
    public string RejectReason { get; set; } = string.Empty;
}

// toggle access request
public class ToggleOwnerAccessRequest
{
    [Required]
    public string AccessStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

// owner metrics
public class AdminOwnerMetricsDto
{
    public int TotalProfiles { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int ActiveCount { get; set; }
    public int SuspendedCount { get; set; }
}
