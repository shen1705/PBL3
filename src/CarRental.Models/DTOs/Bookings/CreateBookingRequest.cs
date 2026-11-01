using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class CreateBookingRequest
{
    [Required]
    public int ListingId { get; set; }

    public int? VehicleId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [MaxLength(50)]
    public string? DeliveryMethod { get; set; } = "host"; // "host" (nhận tại xe) | "delivery" (giao tận nơi)

    [MaxLength(500)]
    public string? DeliveryAddress { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(100)]
    public string? RenterName { get; set; }

    [MaxLength(20)]
    public string? RenterPhone { get; set; }

    [MaxLength(255)]
    public string? RenterEmail { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; } = "qr"; // "qr" | "bank" | "card"
}
