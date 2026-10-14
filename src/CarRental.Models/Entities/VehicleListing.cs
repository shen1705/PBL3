using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class VehicleListing
{
    [Key]
    public int ListingId { get; set; }
    public int VehicleId { get; set; }
    public decimal PricePerDay { get; set; }
    [Required, MaxLength(255)]
    public string Location { get; set; } = string.Empty;
    [Required, MaxLength(50)]
    public string City { get; set; } = string.Empty;
    [Required, MaxLength(50)]
    public string District { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string Description { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string ModerationStatus { get; set; } = ListingModerationStatuses.PendingApproval;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [MaxLength(255)]
    public string? ModeratedBy { get; set; }
    public DateTime? ModeratedAt { get; set; }
    [MaxLength(255)]
    public string? ModerationNote { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
    public ApplicationUser? Moderator { get; set; }
    public ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
    public ICollection<DepositHold> DepositHolds { get; set; } = new List<DepositHold>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
