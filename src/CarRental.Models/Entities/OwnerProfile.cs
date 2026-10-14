using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class OwnerProfile
{
    public int OwnerProfileId { get; set; }
    [Required, MaxLength(255)]
    public string UserId { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string CccdImageFront { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string CccdImageBack { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string CccdNumber { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string ApprovalStatus { get; set; } = OwnerApprovalStatuses.Pending;
    [Required, MaxLength(20)]
    public string AccessStatus { get; set; } = OwnerAccessStatuses.Inactive;
    [MaxLength(255)]
    public string? RejectReason { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    [MaxLength(255)]
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public ApplicationUser? Reviewer { get; set; }
}
