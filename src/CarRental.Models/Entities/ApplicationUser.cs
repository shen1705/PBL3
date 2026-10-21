using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;
using Microsoft.AspNetCore.Identity;

namespace CarRental.Models.Entities;

public class ApplicationUser : IdentityUser
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    public bool Gender { get; set; } // 0 = m, 1 = f 

    // Navigation properties
    public DriverLicense? DriverLicense { get; set; } // nullable 
    public OwnerProfile? OwnerProfile { get; set; } // nullable 
    public MockBankAccount? MockBankAccount { get; set; } // nullable 
    public ICollection<AccountSanction> Sanctions { get; set; } = new List<AccountSanction>();
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
