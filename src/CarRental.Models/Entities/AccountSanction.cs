using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class AccountSanction
{
    [Key]
    public int SanctionId { get; set; }
    [Required, MaxLength(255)]
    public string UserId { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string SanctionType { get; set; } = string.Empty; // Suspend7d / Suspend30d / Ban
    [Required, MaxLength(255)]
    public string Reason { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string IssuedBy { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    [MaxLength(255)]
    public string? LiftedBy { get; set; }
    public DateTime? LiftedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public ApplicationUser Issuer { get; set; } = null!;
    public ApplicationUser? Lifter { get; set; }
}
