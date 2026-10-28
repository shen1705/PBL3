using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Auth;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Vui lòng nhập số điện thoại hoặc email.")]
    public string Identifier { get; set; } = string.Empty;

    public string? Otp { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.")]
    [DataType(DataType.Password)]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập lại mật khẩu mới.")]
    [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    [DataType(DataType.Password)]
    public string ConfirmPassword { get; set; } = string.Empty;
}
