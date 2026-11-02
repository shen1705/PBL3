using System;

namespace CarRental.Models.DTOs.Admin;

public class AdminSanctionDto
{
    public int SanctionId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string SanctionType { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string IssuedBy { get; set; } = string.Empty;
    public string? IssuerName { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? LiftedBy { get; set; }
    public string? LifterName { get; set; }
    public DateTime? LiftedAt { get; set; }
    public bool IsActive => LiftedAt == null && (ExpiresAt == null || ExpiresAt > DateTime.UtcNow);
}
