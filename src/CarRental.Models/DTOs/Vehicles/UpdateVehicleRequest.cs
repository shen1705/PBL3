using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Vehicles;

public class UpdateVehicleRequest
{
    [Range(100_000, 100_000_000, ErrorMessage = "Giá thuê phải từ 100.000 đ đến 100.000.000 đ / ngày")]
    public decimal? PricePerDay { get; set; }

    [MaxLength(50)]
    public string? City { get; set; }

    [MaxLength(50)]
    public string? District { get; set; }

    [MaxLength(255)]
    public string? Location { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public List<string>? ImageUrls { get; set; }
}
