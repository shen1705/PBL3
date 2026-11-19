namespace CarRental.Models.DTOs.Admin;

public class VerifyDriverLicenseRequest
{
    public bool IsApproved { get; set; } = true;
    public string? Reason { get; set; }
}
