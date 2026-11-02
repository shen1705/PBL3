using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class CreateReviewRequest
{
    [Required]
    public int BookingId { get; set; }

    [Range(1, 5, ErrorMessage = "Đánh giá từ 1 đến 5 sao.")]
    public int Rating { get; set; } = 5;

    [MaxLength(1000, ErrorMessage = "Nhận xét không vượt quá 1000 ký tự.")]
    public string Comment { get; set; } = string.Empty;
}
