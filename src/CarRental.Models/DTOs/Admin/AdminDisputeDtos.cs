using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.DTOs.Bookings;

namespace CarRental.Models.DTOs.Admin;

// filter dispute
public class AdminDisputeFilterDto
{
    public string? Status { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// dispute list item
public class AdminDisputeListItemDto
{
    public int DisputeId { get; set; }
    public int BookingId { get; set; }
    public string RaisedBy { get; set; } = string.Empty;
    public string RaiserName { get; set; } = string.Empty;
    public string RaiserRole { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? EvidenceImage { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public string? ResolverName { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionAction { get; set; }
    public string? ResolutionNotes { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string BookingStatus { get; set; } = string.Empty;
    public decimal PriceLockedTotal { get; set; }
}

// dispute detail
public class AdminDisputeDetailDto : AdminDisputeListItemDto
{
    public string RenterId { get; set; } = string.Empty;
    public string RenterName { get; set; } = string.Empty;
    public string RenterPhone { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerPhone { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal DepositAmount { get; set; }
    public List<HandoverConfirmationDto> Handovers { get; set; } = new();
}

// resolve dispute request
public class ResolveDisputeRequest
{
    [Required(ErrorMessage = "Vui lòng chọn hướng xử lý.")]
    [MaxLength(30)]
    public string ResolutionAction { get; set; } = string.Empty; // None / CancelOwnerFault / ForceComplete

    [Required(ErrorMessage = "Vui lòng nhập ghi chú kết quả giải quyết.")]
    [MaxLength(255)]
    public string ResolutionNotes { get; set; } = string.Empty;
}

// dispute metrics
public class AdminDisputeMetricsDto
{
    public int TotalDisputes { get; set; }
    public int OpenCount { get; set; }
    public int ResolvedCount { get; set; }
    public int HighPriorityCount { get; set; }
}
