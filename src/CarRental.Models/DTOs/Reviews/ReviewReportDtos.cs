using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Reviews;

public class ReportReviewRequest
{
    public int ReviewId { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập lý do báo cáo đánh giá.")]
    [MinLength(5, ErrorMessage = "Lý do báo cáo phải có ít nhất 5 ký tự.")]
    [MaxLength(500, ErrorMessage = "Lý do báo cáo tối đa 500 ký tự.")]
    public string Reason { get; set; } = string.Empty;
}

public class ModerateReviewRequest
{
    public bool IsApproved { get; set; } // true: Duyệt giữ lại (công khai), false: Ẩn / gỡ bỏ

    [MaxLength(255)]
    public string? Note { get; set; }
}

public class AdminReviewItemDto
{
    public int ReviewId { get; set; }
    public int BookingId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string ReviewerId { get; set; } = string.Empty;
    public string ReviewerName { get; set; } = string.Empty;
    public string RevieweeId { get; set; } = string.Empty;
    public string RevieweeName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
    public bool IsReported { get; set; }
    public string? ReportReason { get; set; }
    public string? ReportedByUserId { get; set; }
    public string? ReportedByName { get; set; }
    public DateTime? ReportedAt { get; set; }
    public string? ModeratedByUserId { get; set; }
    public DateTime? ModeratedAt { get; set; }
    public string? ModerationNotes { get; set; }
}
