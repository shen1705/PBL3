namespace CarRental.Models.DTOs.Admin;

public class AdminUserMetricsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int OwnerCount { get; set; }
    public int SanctionedCount { get; set; }
    public int PendingVerificationCount { get; set; }
    public int PendingOwnerCount { get; set; }
    public int PendingListingCount { get; set; }
    public int OpenDisputeCount { get; set; }
    public int CompletedTripsCount { get; set; }
    public decimal TotalGmv { get; set; }
    public decimal PlatformRevenue { get; set; }
}
