namespace CarRental.Models.DTOs.Bookings;

public class BookingPriceCalculationDto
{
    public int ListingId { get; set; }
    public int VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public decimal PricePerDay { get; set; }
    public int RentalDays { get; set; }
    public decimal RentalSubtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal InsuranceFee { get; set; }
    public decimal PriceLockedTotal { get; set; }
    public decimal DepositRate { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal RemainingAmount { get; set; }
}
