namespace CarRental.Models.DTOs.Vehicles;

public class VehicleSearchFilter
{
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Brand { get; set; }
    public string? Keyword { get; set; }
    public int? Seats { get; set; }
    public string? Transmission { get; set; }
    public string? FuelType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool OnlyAvailable { get; set; } = false;
    public string? SortBy { get; set; } = "best"; // best, popular, price-asc, price-desc
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
