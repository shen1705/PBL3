    using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class VehicleUnavailability
{
    [Key]
    public int UnavailabilityId { get; set; }
    public int VehicleId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    [MaxLength(255)]
    public string? Reason { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
}
