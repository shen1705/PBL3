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

    // Tính giá thuê
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

    // Tạo đơn thuê
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

    // Chuyến đi của tôi
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

    // Yêu cầu thuê xe
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

    // Chi tiết đơn thuê
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

    // Phản hồi đơn thuê
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

    // Hủy đơn thuê
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

    // Nhận xe
    [Authorize]
    [HttpPost("api/bookings/{id:int}/pickup")]
    public async Task<IActionResult> ConfirmPickup(int id, [FromBody] ConfirmHandoverRequest? request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        request ??= new ConfirmHandoverRequest { Type = HandoverTypes.Pickup };
        request.Type = HandoverTypes.Pickup;

        var result = await _bookingService.ConfirmPickupAsync(id, request, userId, ct);
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

    // Trả xe
    [Authorize]
    [HttpPost("api/bookings/{id:int}/return")]
    public async Task<IActionResult> ConfirmReturn(int id, [FromBody] ConfirmHandoverRequest? request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        request ??= new ConfirmHandoverRequest { Type = HandoverTypes.Return };
        request.Type = HandoverTypes.Return;

        var result = await _bookingService.ConfirmReturnAsync(id, request, userId, ct);
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

    // Đánh giá
    [Authorize]
    [HttpPost("api/bookings/{id:int}/review")]
    public async Task<IActionResult> SubmitReview(int id, [FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        if (request == null)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu đánh giá không hợp lệ.", errorCode = ErrorCodes.Validation });

        request.BookingId = id;

        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var result = await _bookingService.SubmitReviewAsync(request, userId, ct);
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

    // Khiếu nại sự cố
    [Authorize]
    [HttpPost("api/bookings/{id:int}/dispute")]
    public async Task<IActionResult> CreateDispute(int id, [FromBody] CreateDisputeRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        if (request == null)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu khiếu nại không hợp lệ.", errorCode = ErrorCodes.Validation });

        request.BookingId = id;

        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var result = await _bookingService.CreateDisputeAsync(id, request, userId, ct);
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

    // Doanh thu chủ xe
    [Authorize]
    [HttpGet("api/bookings/owner-revenue")]
    public async Task<IActionResult> GetOwnerRevenue(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { isSuccess = false, message = "Vui lòng đăng nhập.", errorCode = ErrorCodes.Unauthorized });

        var result = await _bookingService.GetOwnerRevenueAsync(userId, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}
