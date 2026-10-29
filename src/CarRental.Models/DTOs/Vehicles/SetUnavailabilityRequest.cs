using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Vehicles;

public class SetUnavailabilityRequest
{
    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [MaxLength(255)]
    public string? Reason { get; set; }
}
