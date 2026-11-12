using System;
using System.Collections.Generic;
using CarRental.Models.DTOs.Vehicles;

namespace CarRental.Models.DTOs.Bookings;

public class BookingDetailDto
{
    public int BookingId { get; set; }
    public int ListingId { get; set; }
    public int VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string? LicensePlate { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string VehicleStatus { get; set; } = string.Empty;
    public string ListingModerationStatus { get; set; } = string.Empty;
    public bool IsVehicleAvailableForRent { get; set; }
    public List<DateRangeDto> BlockedRanges { get; set; } = new();
    public List<DateRangeDto> BookedRanges { get; set; } = new();

    // Renter
    public string RenterId { get; set; } = string.Empty;
    public string RenterName { get; set; } = string.Empty;
    public string? RenterPhone { get; set; }
    public string? RenterEmail { get; set; }

    // Owner
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string? OwnerPhone { get; set; }

    // Booking Period & Financials
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int RentalDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal PriceLockedTotal { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal RemainingAmount => PriceLockedTotal > DepositAmount ? PriceLockedTotal - DepositAmount : 0m;
    public decimal? PricePerDayAtBooking { get; set; }
    public decimal? RentalSubtotal { get; set; }
    public decimal? DeliveryFee { get; set; }
    public decimal? InsuranceFee { get; set; }
    public string? DepositStatus { get; set; }
    public string? DepositReferenceCode { get; set; }
    public DateTime? DepositPaidAt { get; set; }

    // Lifecycle Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? TermsAcceptedAt { get; set; }
    public DateTime ResponseDeadline { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string? RejectReason { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public string? CancelReason { get; set; }

    // Extras
    public string? DeliveryMethod { get; set; }
    public string? DeliveryAddress { get; set; }

    // Handover & Settlement
    public bool HasPickupConfirmed { get; set; }
    public bool HasReturnConfirmed { get; set; }
    public bool HasReviewed { get; set; }
    public bool HasDispute { get; set; }
    public string? DisputeStatus { get; set; }
    public List<HandoverConfirmationDto> Handovers { get; set; } = new();
    public List<ReviewDto> Reviews { get; set; } = new();
}
