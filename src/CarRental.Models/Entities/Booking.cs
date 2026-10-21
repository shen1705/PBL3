using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class Booking
{
    public int BookingId { get; set; }
    [Required, MaxLength(255)]
    public string RenterId { get; set; } = string.Empty;
    public int ListingId { get; set; }
    public int VehicleId { get; set; }
    public int SourceHoldId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RentalDays { get; set; }
    [Required, MaxLength(20)]
    public string Status { get; set; } = BookingStatuses.Pending;
    public decimal PriceLockedTotal { get; set; }
    public decimal DepositAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ResponseDeadline { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    [MaxLength(255)]
    public string? RejectReason { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    [MaxLength(255)]
    public string? CancelledBy { get; set; }
    [MaxLength(255)]
    public string? CancelReason { get; set; }

    public ApplicationUser Renter { get; set; } = null!;
    public VehicleListing Listing { get; set; } = null!;
    public Vehicle Vehicle { get; set; } = null!;
    public DepositHold SourceHold { get; set; } = null!;
    public ApplicationUser? Canceller { get; set; }
    public Payment? Payment { get; set; }
    public ICollection<HandoverConfirmation> HandoverConfirmations { get; set; } = new List<HandoverConfirmation>();
    public ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
