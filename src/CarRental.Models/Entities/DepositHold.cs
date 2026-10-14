using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class DepositHold
{
    [Key]
    public int HoldId { get; set; }
    [Required, MaxLength(255)]
    public string RenterId { get; set; } = string.Empty;
    public int ListingId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RentalDays { get; set; }
    public decimal PriceLockedTotal { get; set; }
    public decimal DepositAmount { get; set; }
    [Required, MaxLength(20)]
    public string Status { get; set; } = DepositHoldStatuses.AwaitingDeposit;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser Renter { get; set; } = null!;
    public VehicleListing Listing { get; set; } = null!;
    public Booking? Booking { get; set; }
}
