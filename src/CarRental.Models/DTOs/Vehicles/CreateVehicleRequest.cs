using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Vehicles;

public class CreateVehicleRequest
{
    [Required(ErrorMessage = "Hãng xe không được để trống")]
    [MaxLength(50)]
    public string Brand { get; set; } = string.Empty;

    [Required(ErrorMessage = "Dòng xe / Mẫu xe không được để trống")]
    [MaxLength(50)]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Năm sản xuất không được để trống")]
    [Range(1990, 2030, ErrorMessage = "Năm sản xuất phải từ 1990 đến 2030")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Số chỗ ngồi không được để trống")]
    [Range(2, 50, ErrorMessage = "Số chỗ ngồi phải từ 2 đến 50")]
    public int Seats { get; set; }

    [Required(ErrorMessage = "Biển số xe không được để trống")]
    [MaxLength(20)]
    public string LicensePlate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hộp số không được để trống")]
    [MaxLength(20)]
    public string Transmission { get; set; } = string.Empty; // Automatic, Manual

    [Required(ErrorMessage = "Loại nhiên liệu không được để trống")]
    [MaxLength(20)]
    public string FuelType { get; set; } = string.Empty; // Gasoline, Diesel, Electric

    [Required(ErrorMessage = "Giá thuê theo ngày không được để trống")]
    [Range(100_000, 100_000_000, ErrorMessage = "Giá thuê phải từ 100.000 đ đến 100.000.000 đ / ngày")]
    public decimal PricePerDay { get; set; }

    [Required(ErrorMessage = "Tỉnh/Thành phố không được để trống")]
    [MaxLength(50)]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Quận/Huyện không được để trống")]
    [MaxLength(50)]
    public string District { get; set; } = string.Empty;

    [Required(ErrorMessage = "Địa chỉ nhận xe chi tiết không được để trống")]
    [MaxLength(255)]
    public string Location { get; set; } = string.Empty;

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public List<string> ImageUrls { get; set; } = new();

    // Giấy tờ xe tùy chọn (đăng ký, bảo hiểm, đăng kiểm)
    public string? RegistrationCertImage { get; set; }
    public string? InsuranceImage { get; set; }
    public DateOnly? InsuranceExpiryDate { get; set; }
    public string? InspectionCertImage { get; set; }
    public DateOnly? InspectionExpiryDate { get; set; }
}
