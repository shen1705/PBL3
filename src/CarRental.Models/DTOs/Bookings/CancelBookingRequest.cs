using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class CancelBookingRequest
{
    [MaxLength(500)]
    public string? Reason { get; set; }
}
