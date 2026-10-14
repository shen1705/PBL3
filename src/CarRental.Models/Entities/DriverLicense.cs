using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class DriverLicense
{
    [Key, MaxLength(255)]
    public string UserId { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string LicenseNumber { get; set; } = string.Empty;
    [Required, MaxLength(10)]
    public string LicenseClass { get; set; } = string.Empty;
    public DateOnly ExpiryDate { get; set; }
    [Required, MaxLength(255)]
    public string ImageFront { get; set; } = string.Empty;

    public ApplicationUser User { get; set; } = null!;
}
