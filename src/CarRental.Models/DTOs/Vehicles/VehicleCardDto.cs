namespace CarRental.Models.DTOs.Vehicles;

public class VehicleCardDto
{
    public int VehicleId { get; set; }
    public int ListingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Seats { get; set; }
    public string Transmission { get; set; } = string.Empty;
    public string FuelType { get; set; } = string.Empty;
    public decimal PricePerDay { get; set; }
    public string Location { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int TotalTrips { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string Status { get; set; } = string.Empty;
    public string ModerationStatus { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
}
