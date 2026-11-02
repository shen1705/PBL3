namespace CarRental.Models.DTOs.Admin;

public class AdminUserFilterDto
{
    public string? Query { get; set; }
    public string? Role { get; set; } // all, Renter, Owner, Staff, Admin
    public string? Tab { get; set; } // all, active, sanctioned, pending
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
