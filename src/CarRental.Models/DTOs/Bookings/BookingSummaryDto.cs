using System;

namespace CarRental.Models.DTOs.Bookings;

public class BookingSummaryDto
{
    public int BookingId { get; set; }
    public int VehicleId { get; set; }
    public int ListingId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? LicensePlate { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RentalDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal PriceLockedTotal { get; set; }
    public decimal DepositAmount { get; set; }

    public string RenterId { get; set; } = string.Empty;
    public string RenterName { get; set; } = string.Empty;
    public string? RenterPhone { get; set; }

    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerPhone { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime ResponseDeadline { get; set; }
}
