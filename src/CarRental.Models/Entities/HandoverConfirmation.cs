using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class HandoverConfirmation
{
    [Key]
    public int ConfirmationId { get; set; }
    public int BookingId { get; set; }
    [Required, MaxLength(20)]
    public string Type { get; set; } = HandoverTypes.Pickup; // Pickup / Return
    [Required, MaxLength(255)]
    public string ConfirmedBy { get; set; } = string.Empty;
    public DateTime ConfirmedAt { get; set; } = DateTime.UtcNow;

    public Booking Booking { get; set; } = null!;
    public ApplicationUser Confirmer { get; set; } = null!;
}
