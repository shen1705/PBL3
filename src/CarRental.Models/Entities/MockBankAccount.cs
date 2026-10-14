using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class MockBankAccount
{
    [Key]
    public int AccountId { get; set; }
    [MaxLength(255)]
    public string? UserId { get; set; } // Null cho PlatformEscrow
    [Required, MaxLength(20)]
    public string AccountType { get; set; } = MockAccountTypes.User;
    [Required, MaxLength(30)]
    public string AccountNumber { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Status { get; set; } = MockAccountStatuses.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser? User { get; set; }
}
