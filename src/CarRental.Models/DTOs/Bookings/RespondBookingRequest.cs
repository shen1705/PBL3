using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class RespondBookingRequest
{
    [Required]
    public bool Accept { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
