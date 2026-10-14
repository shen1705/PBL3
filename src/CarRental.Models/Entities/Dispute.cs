using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class Dispute
{
    public int DisputeId { get; set; }
    public int BookingId { get; set; }
    [Required, MaxLength(255)]
    public string RaisedBy { get; set; } = string.Empty;
    [Required]
    public string Description { get; set; } = string.Empty;
    [MaxLength(255)]
    public string? EvidenceImage { get; set; }
    [Required, MaxLength(20)]
    public string Status { get; set; } = DisputeStatuses.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [MaxLength(255)]
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    [MaxLength(30)]
    public string? ResolutionAction { get; set; } // None / CancelOwnerFault / ForceComplete
    [MaxLength(255)]
    public string? ResolutionNotes { get; set; }

    public Booking Booking { get; set; } = null!;
    public ApplicationUser Raiser { get; set; } = null!;
    public ApplicationUser? Resolver { get; set; }
}
