using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Admin;

public class ResetPasswordByAdminRequest
{
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới."), MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự.")]
    public string NewPassword { get; set; } = string.Empty;
}
