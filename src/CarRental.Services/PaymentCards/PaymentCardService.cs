using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.DTOs.PaymentCards;
using CarRental.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarRental.Services.PaymentCards;

public class PaymentCardService : IPaymentCardService
{
    private readonly ApplicationDbContext _db;

    public PaymentCardService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<List<PaymentCardDto>>> GetUserCardsAsync(string userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return ServiceResult<List<PaymentCardDto>>.Fail("Mã người dùng không hợp lệ.");

        var cards = await _db.PaymentCards
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.IsDefault)
            .ThenByDescending(c => c.CreatedAt)
            .Select(c => new PaymentCardDto
            {
                CardId = c.CardId,
                CardHolderName = c.CardHolderName,
                CardNumberMasked = c.CardNumberMasked,
                Last4Digits = c.Last4Digits,
                CardBrand = c.CardBrand,
                ExpiryMonth = c.ExpiryMonth,
                ExpiryYear = c.ExpiryYear,
                IsDefault = c.IsDefault,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(ct);

        return ServiceResult<List<PaymentCardDto>>.Success(cards);
    }

    public async Task<ServiceResult<PaymentCardDto>> AddCardAsync(string userId, AddPaymentCardRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return ServiceResult<PaymentCardDto>.Fail("Phiên đăng nhập không hợp lệ.");

        if (string.IsNullOrWhiteSpace(req.CardHolderName))
            return ServiceResult<PaymentCardDto>.Fail("Họ tên chủ thẻ không được để trống.");

        var cleanNumber = Regex.Replace(req.CardNumber ?? "", @"\D", "");
        if (cleanNumber.Length < 12 || cleanNumber.Length > 19)
            return ServiceResult<PaymentCardDto>.Fail("Số thẻ thanh toán không hợp lệ (cần từ 12-19 chữ số).");

        var now = DateTime.UtcNow;
        var expiryDate = new DateTime(req.ExpiryYear, req.ExpiryMonth, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
        if (expiryDate <= now)
            return ServiceResult<PaymentCardDto>.Fail("Thẻ thanh toán đã hết hạn.");

        var last4 = cleanNumber.Substring(cleanNumber.Length - 4);
        var brand = DetectCardBrand(cleanNumber);
        var masked = $"•••• •••• •••• {last4}";

        var existingCards = await _db.PaymentCards
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);

        // Check duplicate
        if (existingCards.Any(c => c.Last4Digits == last4 && c.CardBrand == brand && c.ExpiryMonth == req.ExpiryMonth && c.ExpiryYear == req.ExpiryYear))
            return ServiceResult<PaymentCardDto>.Fail("Thẻ thanh toán này đã được liên kết vào tài khoản.");

        var isDefault = req.SetAsDefault || existingCards.Count == 0;

        if (isDefault)
        {
            foreach (var card in existingCards)
            {
                card.IsDefault = false;
            }
        }

        var newCard = new PaymentCard
        {
            UserId = userId,
            CardHolderName = req.CardHolderName.Trim().ToUpperInvariant(),
            CardNumberMasked = masked,
            Last4Digits = last4,
            CardBrand = brand,
            ExpiryMonth = req.ExpiryMonth,
            ExpiryYear = req.ExpiryYear,
            IsDefault = isDefault,
            CreatedAt = now
        };

        _db.PaymentCards.Add(newCard);
        await _db.SaveChangesAsync(ct);

        var dto = new PaymentCardDto
        {
            CardId = newCard.CardId,
            CardHolderName = newCard.CardHolderName,
            CardNumberMasked = newCard.CardNumberMasked,
            Last4Digits = newCard.Last4Digits,
            CardBrand = newCard.CardBrand,
            ExpiryMonth = newCard.ExpiryMonth,
            ExpiryYear = newCard.ExpiryYear,
            IsDefault = newCard.IsDefault,
            CreatedAt = newCard.CreatedAt
        };

        return ServiceResult<PaymentCardDto>.Success(dto);
    }

    public async Task<ServiceResult> DeleteCardAsync(string userId, int cardId, CancellationToken ct = default)
    {
        var card = await _db.PaymentCards
            .FirstOrDefaultAsync(c => c.CardId == cardId && c.UserId == userId, ct);

        if (card == null)
            return ServiceResult.Fail("Không tìm thấy thẻ thanh toán.");

        var wasDefault = card.IsDefault;
        _db.PaymentCards.Remove(card);

        if (wasDefault)
        {
            var nextCard = await _db.PaymentCards
                .Where(c => c.UserId == userId && c.CardId != cardId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (nextCard != null)
            {
                nextCard.IsDefault = true;
            }
        }

        await _db.SaveChangesAsync(ct);
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> SetDefaultCardAsync(string userId, int cardId, CancellationToken ct = default)
    {
        var userCards = await _db.PaymentCards
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);

        var target = userCards.FirstOrDefault(c => c.CardId == cardId);
        if (target == null)
            return ServiceResult.Fail("Không tìm thấy thẻ thanh toán.");

        foreach (var card in userCards)
        {
            card.IsDefault = (card.CardId == cardId);
        }

        await _db.SaveChangesAsync(ct);
        return ServiceResult.Success();
    }

    private static string DetectCardBrand(string number)
    {
        if (number.StartsWith("4")) return "Visa";
        if (number.StartsWith("51") || number.StartsWith("52") || number.StartsWith("53") ||
            number.StartsWith("54") || number.StartsWith("55") ||
            (number.Length >= 4 && int.TryParse(number.Substring(0, 4), out var bin) && bin >= 2221 && bin <= 2720))
            return "Mastercard";
        if (number.StartsWith("35")) return "JCB";
        if (number.StartsWith("9704")) return "Napas";
        return "Visa";
    }
}
