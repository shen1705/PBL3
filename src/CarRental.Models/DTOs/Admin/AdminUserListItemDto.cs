using System;
using System.Collections.Generic;

namespace CarRental.Models.DTOs.Admin;

public class AdminUserListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool Gender { get; set; }
    public List<string> Roles { get; set; } = new();
    public string PrimaryRole { get; set; } = string.Empty;
    public bool IsOwner { get; set; }
    public bool IsStaff { get; set; }
    public bool IsAdmin { get; set; }
    public bool HasDriverLicense { get; set; }
    public string? DriverLicenseClass { get; set; }
    public string? OwnerApprovalStatus { get; set; }
    public bool IsSanctioned { get; set; }
    public string? ActiveSanctionType { get; set; }
    public string? ActiveSanctionReason { get; set; }
    public DateTime? SanctionExpiresAt { get; set; }
    public string AccountStatus { get; set; } = "Active";
    public string StatusBadgeColor { get; set; } = "green";
    public string StatusBadgeText { get; set; } = "Đang hoạt động";
    public int TripsCount { get; set; }
    public int VehiclesCount { get; set; }
    public decimal? Rating { get; set; }
    public DateTime? LastActivityAt { get; set; }
}
