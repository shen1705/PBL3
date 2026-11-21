using System;

namespace CarRental.Models.DTOs.PaymentCards;

public class PaymentCardDto
{
    public int CardId { get; set; }
    public string CardHolderName { get; set; } = string.Empty;
    public string CardNumberMasked { get; set; } = string.Empty;
    public string Last4Digits { get; set; } = string.Empty;
    public string CardBrand { get; set; } = "Visa";
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string ExpiryFormatted => $"{ExpiryMonth:D2}/{ExpiryYear % 100:D2}";
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}
