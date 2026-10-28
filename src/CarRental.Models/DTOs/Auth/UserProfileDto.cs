namespace CarRental.Models.DTOs.Auth;

public class UserProfileDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool Gender { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
    public IList<string> Claims { get; set; } = new List<string>();

    // Driver License
    public bool HasDriverLicense { get; set; }
    public string? LicenseNumber { get; set; }
    public string? LicenseClass { get; set; }
    public DateOnly? LicenseExpiryDate { get; set; }

    // Owner Profile
    public bool HasOwnerProfile { get; set; }
    public string? CccdNumber { get; set; }
    public string? OwnerApprovalStatus { get; set; }
    public string? OwnerAccessStatus { get; set; }

    // Sanction
    public bool IsSanctioned { get; set; }
    public string? ActiveSanctionType { get; set; }
    public string? SanctionReason { get; set; }
    public DateTime? SanctionExpiresAt { get; set; }
}
