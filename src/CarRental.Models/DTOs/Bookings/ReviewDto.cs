using System;

namespace CarRental.Models.DTOs.Bookings;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int BookingId { get; set; }
    public string ReviewerId { get; set; } = string.Empty;
    public string ReviewerName { get; set; } = string.Empty;
    public string RevieweeId { get; set; } = string.Empty;
    public string RevieweeName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
}
