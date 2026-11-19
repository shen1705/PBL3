using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class Review
{
    public int ReviewId { get; set; }
    public int BookingId { get; set; }
    [Required, MaxLength(255)]
    public string ReviewerId { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string RevieweeId { get; set; } = string.Empty;
    [Range(1, 5)]
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsPublic { get; set; }

    public bool IsReported { get; set; }
    [MaxLength(500)]
    public string? ReportReason { get; set; }
    [MaxLength(255)]
    public string? ReportedByUserId { get; set; }
    public DateTime? ReportedAt { get; set; }
    [MaxLength(255)]
    public string? ModeratedByUserId { get; set; }
    public DateTime? ModeratedAt { get; set; }
    [MaxLength(255)]
    public string? ModerationNotes { get; set; }

    public Booking Booking { get; set; } = null!;
    public ApplicationUser Reviewer { get; set; } = null!;
    public ApplicationUser Reviewee { get; set; } = null!;
}
