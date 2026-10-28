using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Auth;

public class RegisterRequest
{
    [Required(ErrorMessage = "Vui lòng nhập tên tài khoản.")]
    [MinLength(3, ErrorMessage = "Tên tài khoản phải có ít nhất 3 ký tự.")]
    [MaxLength(50, ErrorMessage = "Tên tài khoản không vượt quá 50 ký tự.")]
    public string UserName { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "Họ và tên không vượt quá 100 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại.")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập lại mật khẩu xác nhận.")]
    [Compare(nameof(Password), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    [DataType(DataType.Password)]
    public string ConfirmPassword { get; set; } = string.Empty;
}
