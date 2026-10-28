using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập, email hoặc số điện thoại.")]
    public string Identifier { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = true;
}
