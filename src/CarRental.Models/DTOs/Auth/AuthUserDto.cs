namespace CarRental.Models.DTOs.Auth;

public class AuthUserDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
    public IList<string> Claims { get; set; } = new List<string>();
    public bool HasDriverLicense { get; set; }
    public bool IsOwner { get; set; }
    public string? OwnerApprovalStatus { get; set; }
}
