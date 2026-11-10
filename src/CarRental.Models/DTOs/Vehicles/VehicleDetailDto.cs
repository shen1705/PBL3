using System.Collections.Generic;
using CarRental.Models.DTOs.Bookings;

namespace CarRental.Models.DTOs.Vehicles;

public class DateRangeDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}

public class VehicleDetailDto : VehicleCardDto
{
    public string LicensePlate { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OwnerPhoneNumber { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public DateTime? OwnerJoinedDate { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<ListingImageDto> Images { get; set; } = new();
    public List<DateRangeDto> BlockedRanges { get; set; } = new();
    public List<DateRangeDto> BookedRanges { get; set; } = new();
    public List<ReviewDto> Reviews { get; set; } = new();
    public int TotalReviews { get; set; }
}
