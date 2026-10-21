using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class ListingImage
{
    [Key]
    public int ImageId { get; set; }
    public int ListingId { get; set; }
    [Required, MaxLength(255)]
    public string ImagePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }

    public VehicleListing Listing { get; set; } = null!;
}
