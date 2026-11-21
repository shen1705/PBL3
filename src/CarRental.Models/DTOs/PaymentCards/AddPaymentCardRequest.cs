using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.PaymentCards;

public class AddPaymentCardRequest
{
    [Required(ErrorMessage = "Vui lòng nhập họ và tên chủ thẻ.")]
    [MaxLength(100)]
    public string CardHolderName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số thẻ.")]
    [MaxLength(25)]
    public string CardNumber { get; set; } = string.Empty;

    [Range(1, 12, ErrorMessage = "Tháng hết hạn không hợp lệ (1-12).")]
    public int ExpiryMonth { get; set; }

    [Range(2024, 2045, ErrorMessage = "Năm hết hạn không hợp lệ.")]
    public int ExpiryYear { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập mã bảo mật CVV/CVC.")]
    [RegularExpression(@"^\d{3,4}$", ErrorMessage = "Mã CVV phải gồm 3 hoặc 4 chữ số.")]
    public string Cvv { get; set; } = string.Empty;

    public bool SetAsDefault { get; set; } = false;
}
