using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class BookingPriceCalculationRequest
{
    [Required]
    public int ListingId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public string? DeliveryMethod { get; set; } = "host";
}
