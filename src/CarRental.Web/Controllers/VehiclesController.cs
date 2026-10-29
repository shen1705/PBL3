using CarRental.Models.Constants;
using CarRental.Models.DTOs.Vehicles;
using CarRental.Services.Abstractions;
using CarRental.Services.Vehicles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;
    private readonly ICurrentUserService _currentUser;

    public VehiclesController(IVehicleService vehicleService, ICurrentUserService currentUser)
    {
        _vehicleService = vehicleService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Tìm kiếm và lọc danh sách xe công khai
    /// </summary>
    [HttpGet("api/vehicles")]
    public async Task<IActionResult> Search([FromQuery] VehicleSearchFilter filter, CancellationToken ct)
    {
        var result = await _vehicleService.SearchVehiclesAsync(filter, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Xem chi tiết thông tin xe, ảnh và lịch trống/bận
    /// </summary>
    [HttpGet("api/vehicles/{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _vehicleService.GetVehicleByIdAsync(id, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách thành phố có xe đang cho thuê kèm số lượng xe
    /// </summary>
    [HttpGet("api/vehicles/cities")]
    public async Task<IActionResult> GetCities(CancellationToken ct)
    {
        var result = await _vehicleService.GetAvailableCitiesAsync(ct);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách hãng xe đang có trong hệ thống
    /// </summary>
    [HttpGet("api/vehicles/brands")]
    public async Task<IActionResult> GetBrands(CancellationToken ct)
    {
        var result = await _vehicleService.GetAvailableBrandsAsync(ct);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách xe thuộc sở hữu của chủ xe đang đăng nhập
    /// </summary>
    [Authorize]
    [HttpGet("api/vehicles/my-cars")]
    public async Task<IActionResult> GetMyCars(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _vehicleService.GetOwnerVehiclesAsync(userId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Chủ xe đăng ký xe mới
    /// </summary>
    [Authorize]
    [HttpPost("api/vehicles")]
    public async Task<IActionResult> Create([FromBody] CreateVehicleRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _vehicleService.CreateVehicleAsync(userId, request, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.VehicleId }, result);
    }

    /// <summary>
    /// Chủ xe cập nhật thông tin / giá thuê xe
    /// </summary>
    [Authorize]
    [HttpPut("api/vehicles/{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVehicleRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new { isSuccess = false, message = errors, errorCode = ErrorCodes.Validation });
        }

        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _vehicleService.UpdateVehicleAsync(id, userId, request, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return Forbid();
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Chủ xe xóa / gỡ xe
    /// </summary>
    [Authorize]
    [HttpDelete("api/vehicles/{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _vehicleService.DeleteVehicleAsync(id, userId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return Forbid();
            if (result.ErrorCode == ErrorCodes.NotFound)
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Chủ xe cài đặt khoảng thời gian không nhận khách (khóa lịch xe)
    /// </summary>
    [Authorize]
    [HttpPost("api/vehicles/{id:int}/unavailabilities")]
    public async Task<IActionResult> AddUnavailability(int id, [FromBody] SetUnavailabilityRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _vehicleService.AddUnavailabilityAsync(id, userId, request, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return Forbid();
            if (result.ErrorCode == ErrorCodes.Conflict)
                return Conflict(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Chủ xe gỡ khoảng thời gian bận (mở khóa lịch xe)
    /// </summary>
    [Authorize]
    [HttpDelete("api/vehicles/unavailabilities/{unavailabilityId:int}")]
    public async Task<IActionResult> RemoveUnavailability(int unavailabilityId, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _vehicleService.RemoveUnavailabilityAsync(unavailabilityId, userId, ct);
        if (!result.IsSuccess)
        {
            if (result.ErrorCode == ErrorCodes.Forbidden)
                return Forbid();

            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Staff/Admin duyệt hoặc từ chối trạng thái xe (PendingApproval, Approved, Rejected, Removed)
    /// </summary>
    [Authorize(Roles = RoleNames.Admin)]
    [HttpPatch("api/vehicles/{id:int}/status")]
    public async Task<IActionResult> SetVehicleStatus(int id, [FromBody] StatusUpdateRequest req, CancellationToken ct)
    {
        var result = await _vehicleService.SetVehicleStatusAsync(id, req.Status, req.Note, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Staff/Admin duyệt hiển thị hoặc ẩn tin đăng (Public, Hidden, PendingApproval)
    /// </summary>
    [Authorize(Roles = RoleNames.Admin)]
    [HttpPatch("api/vehicles/listings/{listingId:int}/status")]
    public async Task<IActionResult> SetListingStatus(int listingId, [FromBody] StatusUpdateRequest req, CancellationToken ct)
    {
        var result = await _vehicleService.SetListingModerationStatusAsync(listingId, req.Status, req.Note, ct);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}

public class StatusUpdateRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}
