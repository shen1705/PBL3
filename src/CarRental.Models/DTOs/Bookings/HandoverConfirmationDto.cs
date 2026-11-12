using System;

namespace CarRental.Models.DTOs.Bookings;

public class HandoverConfirmationDto
{
    public int ConfirmationId { get; set; }
    public int BookingId { get; set; }
    public string Type { get; set; } = string.Empty; // Pickup / Return
    public string ConfirmedBy { get; set; } = string.Empty;
    public string ConfirmerName { get; set; } = string.Empty;
    public DateTime ConfirmedAt { get; set; }
    public int? Odometer { get; set; }
    public string? FuelLevel { get; set; }
    public string? Notes { get; set; }
    public string? RemainingPaymentMethod { get; set; }
}
