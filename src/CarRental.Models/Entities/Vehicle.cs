using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class Vehicle
{
    public int VehicleId { get; set; }
    [Required, MaxLength(255)]
    public string OwnerId { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string LicensePlate { get; set; } = string.Empty;
    [Required, MaxLength(50)]
    public string Brand { get; set; } = string.Empty;
    [Required, MaxLength(50)]
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Seats { get; set; }
    [Required, MaxLength(20)]
    public string Transmission { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string FuelType { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Status { get; set; } = VehicleStatuses.PendingApproval; // approval status 

    public ApplicationUser Owner { get; set; } = null!; // owner 
    public VehicleDocument? Document { get; set; } // vehicle information 
    public ICollection<VehicleListing> Listings { get; set; } = new List<VehicleListing>();
    public ICollection<VehicleUnavailability> Unavailabilities { get; set; } = new List<VehicleUnavailability>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
