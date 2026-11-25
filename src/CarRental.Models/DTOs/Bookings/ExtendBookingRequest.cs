using System;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Bookings;

public class ExtendBookingRequest
{
    [Required(ErrorMessage = "Vui lòng chọn thời gian trả xe mới.")]
    public DateTime NewEndDate { get; set; }
}
