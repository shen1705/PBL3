using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.DTOs.Bookings;

public class ConfirmHandoverRequest
{
    [Required]
    public string Type { get; set; } = HandoverTypes.Pickup; // Pickup / Return

    public int? Odometer { get; set; }

    [MaxLength(20)]
    public string? FuelLevel { get; set; } // e.g. "100%", "8/8", "4/8"

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(20)]
    public string? RemainingPaymentMethod { get; set; } = "cash"; // "cash" / "transfer"
}
