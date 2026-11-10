using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.DTOs.Vehicles;

namespace CarRental.Models.DTOs.Admin;

// filter listing
public class AdminListingFilterDto
{
    public string? ModerationStatus { get; set; }
    public string? City { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// listing list item
public class AdminListingListItemDto
{
    public int ListingId { get; set; }
    public int VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
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
    public string ModerationStatus { get; set; } = string.Empty;
    public string VehicleStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? ModeratedBy { get; set; }
    public string? ModeratorName { get; set; }
    public DateTime? ModeratedAt { get; set; }
    public string? ModerationNote { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerPhone { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
}

// listing detail
public class AdminListingDetailDto : AdminListingListItemDto
{
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<ListingImageDto> Images { get; set; } = new();
    public string RegistrationCertImage { get; set; } = string.Empty;
    public string InsuranceImage { get; set; } = string.Empty;
    public DateOnly? InsuranceExpiryDate { get; set; }
    public string InspectionCertImage { get; set; } = string.Empty;
    public DateOnly? InspectionExpiryDate { get; set; }
}

// approve request
public class ApproveListingRequest
{
    public string? Note { get; set; }
}

// reject request
public class RejectListingRequest
{
    [Required(ErrorMessage = "Vui lòng nhập lý do từ chối bài đăng.")]
    [MaxLength(255)]
    public string ModerationNote { get; set; } = string.Empty;
}

// hide request
public class HideListingRequest
{
    [Required(ErrorMessage = "Vui lòng nhập lý do gỡ / tạm ẩn bài đăng.")]
    [MaxLength(255)]
    public string Reason { get; set; } = string.Empty;
}

// listing metrics
public class AdminListingMetricsDto
{
    public int TotalListings { get; set; }
    public int PendingCount { get; set; }
    public int PublicCount { get; set; }
    public int HiddenCount { get; set; }
    public int PendingOver24hCount { get; set; }
    public int ModeratedTodayCount { get; set; }
}
