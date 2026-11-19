using System;
using System.Collections.Generic;

namespace CarRental.Models.DTOs.Admin;

public class AdminVerifyLicenseResultDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseClass { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    public bool IsAutoApproved { get; set; }
    public List<string> Issues { get; set; } = new();
}

public class AdminBatchVerifyResultDto
{
    public int TotalScanned { get; set; }
    public int AutoApprovedCount { get; set; }
    public int NeedsManualReviewCount { get; set; }
    public List<AdminVerifyLicenseResultDto> Details { get; set; } = new();
}
