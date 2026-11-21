using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.Entities;

public class PaymentCard
{
    [Key]
    public int CardId { get; set; }

    [Required, MaxLength(255)]
    public string UserId { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string CardHolderName { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string CardNumberMasked { get; set; } = string.Empty; // e.g. "•••• •••• •••• 8899"

    [Required, MaxLength(4)]
    public string Last4Digits { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string CardBrand { get; set; } = "Visa"; // Visa, MasterCard, JCB, Napas

    public int ExpiryMonth { get; set; } // 1 - 12
    public int ExpiryYear { get; set; }  // e.g. 2028

    public bool IsDefault { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
}
