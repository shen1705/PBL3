using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs.PaymentCards;

namespace CarRental.Services.PaymentCards;

public interface IPaymentCardService
{
    Task<ServiceResult<List<PaymentCardDto>>> GetUserCardsAsync(string userId, CancellationToken ct = default);
    Task<ServiceResult<PaymentCardDto>> AddCardAsync(string userId, AddPaymentCardRequest req, CancellationToken ct = default);
    Task<ServiceResult> DeleteCardAsync(string userId, int cardId, CancellationToken ct = default);
    Task<ServiceResult> SetDefaultCardAsync(string userId, int cardId, CancellationToken ct = default);
}
