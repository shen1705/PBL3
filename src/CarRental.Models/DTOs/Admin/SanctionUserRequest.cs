using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Admin;

public class SanctionUserRequest
{
    [Required(ErrorMessage = "Vui lòng chọn loại chế tài.")]
    public string SanctionType { get; set; } = string.Empty; // Suspend7d, Suspend30d, Ban

    [Required(ErrorMessage = "Vui lòng nhập lý do xử phạt."), MaxLength(255)]
    public string Reason { get; set; } = string.Empty;
}
