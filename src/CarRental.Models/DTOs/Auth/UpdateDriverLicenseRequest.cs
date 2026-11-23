using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Auth;

public class UpdateDriverLicenseRequest
{
    [Required(ErrorMessage = "Vui lòng nhập số GPLX.")]
    [MaxLength(50, ErrorMessage = "Số GPLX không vượt quá 50 ký tự.")]
    public string LicenseNumber { get; set; } = string.Empty;

    public string? LicenseClass { get; set; } = "B2";

    public DateOnly? ExpiryDate { get; set; }

    public string? ImageFront { get; set; }
}
