using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class VehicleDocument
{
    [Key]
    public int DocumentId { get; set; }
    public int VehicleId { get; set; }
    [Required, MaxLength(255)]
    public string RegistrationCertImage { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string InsuranceImage { get; set; } = string.Empty;
    public DateOnly InsuranceExpiryDate { get; set; }
    [Required, MaxLength(255)]
    public string InspectionCertImage { get; set; } = string.Empty;
    public DateOnly InspectionExpiryDate { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
}
