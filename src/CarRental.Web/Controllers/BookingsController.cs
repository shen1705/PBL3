using System.Security.Claims;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Bookings;
using CarRental.Services.Abstractions;
using CarRental.Services.Bookings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ICurrentUserService _currentUser;

    public BookingsController(IBookingService bookingService, ICurrentUserService currentUser)
    {
        _bookingService = bookingService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Tính toán trước chi phí thuê, phụ phí và tiền đặt cọc cần thanh toán
    /// </summary>
    [HttpPost("api/bookings/calculate-price")]
    public async Task<IActionResult> CalculatePrice([FromBody] BookingPriceCalculationRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var result = await _bookingService.CalculatePriceAsync(request, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Tạo yêu cầu đặt xe mới và giữ cọc
    /// </summary>
    [Authorize]
    [HttpPost("api/bookings")]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập để thực hiện đặt xe.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.CreateBookingAsync(request, userId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            if (result.ErrorCode == ErrorCodes.Conflict)
                return Conflict(result);

            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetDetail), new { id = result.Data!.BookingId }, result);
    }

    /// <summary>
    /// Lấy danh sách chuyến đi của người thuê hiện tại
    /// </summary>
    [Authorize]
    [HttpGet("api/bookings/my-trips")]
    public async Task<IActionResult> GetMyTrips([FromQuery] string? status, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.GetRenterTripsAsync(userId, status, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách các yêu cầu đặt xe gửi đến chủ xe hiện tại
    /// </summary>
    [Authorize]
    [HttpGet("api/bookings/owner-requests")]
    public async Task<IActionResult> GetOwnerRequests([FromQuery] string? status, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.GetOwnerBookingRequestsAsync(userId, status, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Xem chi tiết một đơn đặt xe
    /// </summary>
    [Authorize]
    [HttpGet("api/bookings/{id:int}")]
    public async Task<IActionResult> GetDetail(int id, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.GetBookingDetailAsync(id, userId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Chủ xe phản hồi chấp thuận hoặc từ chối đơn thuê
    /// </summary>
    [Authorize]
    [HttpPut("api/bookings/{id:int}/respond")]
    public async Task<IActionResult> Respond(int id, [FromBody] RespondBookingRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.RespondToBookingAsync(id, request, userId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);
            if (result.ErrorCode == ErrorCodes.Conflict)
                return Conflict(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Hủy đơn thuê xe (Áp dụng cho người thuê hoặc chủ xe khi thỏa điều kiện)
    /// </summary>
    [Authorize]
    [HttpPost("api/bookings/{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelBookingRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.CancelBookingAsync(id, request, userId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return StatusCode(StatusCodes.Status403Forbidden, result);

            return BadRequest(result);
        }

        return Ok(result);
    }
}
