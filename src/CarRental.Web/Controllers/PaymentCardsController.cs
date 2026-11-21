using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.DTOs.PaymentCards;
using CarRental.Services.Abstractions;
using CarRental.Services.PaymentCards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRental.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/payment-cards")]
public class PaymentCardsController : ControllerBase
{
    private readonly IPaymentCardService _cardService;
    private readonly ICurrentUserService _currentUserService;

    public PaymentCardsController(
        IPaymentCardService cardService,
        ICurrentUserService currentUserService)
    {
        _cardService = cardService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCards(CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _cardService.GetUserCardsAsync(userId, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddCard([FromBody] AddPaymentCardRequest req, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        if (!ModelState.IsValid)
            return BadRequest(new { isSuccess = false, message = "Dữ liệu nhập không hợp lệ." });

        var result = await _cardService.AddCardAsync(userId, req, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id:int}/default")]
    public async Task<IActionResult> SetDefaultCard(int id, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _cardService.SetDefaultCardAsync(userId, id, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCard(int id, CancellationToken ct = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { isSuccess = false, message = "Phiên làm việc đã hết hạn." });

        var result = await _cardService.DeleteCardAsync(userId, id, ct);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }
}
