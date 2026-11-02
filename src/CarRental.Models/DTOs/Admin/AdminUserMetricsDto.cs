namespace CarRental.Models.DTOs.Admin;

public class AdminUserMetricsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int OwnerCount { get; set; }
    public int SanctionedCount { get; set; }
    public int PendingVerificationCount { get; set; }
}
