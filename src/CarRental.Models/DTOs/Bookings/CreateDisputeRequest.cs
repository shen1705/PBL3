using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class CreateDisputeRequest
{
    public int BookingId { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập mô tả chi tiết lý do khiếu nại.")]
    [MinLength(10, ErrorMessage = "Mô tả khiếu nại phải có ít nhất 10 ký tự.")]
    public string Description { get; set; } = string.Empty;

    public string? EvidenceImage { get; set; }
}
