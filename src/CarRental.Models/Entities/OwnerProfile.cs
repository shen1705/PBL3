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
    public string CccdImageFront { get; set; } = string.Empty; // url cccd img
    [Required, MaxLength(255)]
    public string CccdImageBack { get; set; } = string.Empty; // url cccd img 
    [Required, MaxLength(255)]
    public string CccdNumber { get; set; } = string.Empty; 
    [Required, MaxLength(20)]
    public string ApprovalStatus { get; set; } = OwnerApprovalStatuses.Pending; // owner apply status
    [Required, MaxLength(20)]
    public string AccessStatus { get; set; } = OwnerAccessStatuses.Inactive; // owner account status 
    [MaxLength(255)]
    public string? RejectReason { get; set; } // nullable -> owner apply rejected 
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow; // apply info 
    [MaxLength(255)]
    public string? ReviewedBy { get; set; } // staff/admin id 
    public DateTime? ReviewedAt { get; set; } //review info 
    public ApplicationUser User { get; set; } = null!; // existed user (base user)
    public ApplicationUser? Reviewer { get; set; } // staff/admin 
}
