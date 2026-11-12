using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Models.Common;
using CarRental.Models.DTOs.Bookings;

namespace CarRental.Services.Bookings;

public interface IBookingService
{
    Task<ServiceResult<BookingPriceCalculationDto>> CalculatePriceAsync(BookingPriceCalculationRequest request, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> CreateBookingAsync(CreateBookingRequest request, string renterUserId, CancellationToken ct = default);

    Task<ServiceResult<List<BookingSummaryDto>>> GetRenterTripsAsync(string renterUserId, string? statusFilter = null, CancellationToken ct = default);

    Task<ServiceResult<List<BookingSummaryDto>>> GetOwnerBookingRequestsAsync(string ownerUserId, string? statusFilter = null, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> GetBookingDetailAsync(int bookingId, string currentUserId, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> AcceptTermsAsync(int bookingId, string renterUserId, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> RespondToBookingAsync(int bookingId, RespondBookingRequest request, string ownerUserId, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> CancelBookingAsync(int bookingId, CancelBookingRequest request, string currentUserId, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> ConfirmPickupAsync(int bookingId, ConfirmHandoverRequest request, string currentUserId, CancellationToken ct = default);

    Task<ServiceResult<BookingDetailDto>> ConfirmReturnAsync(int bookingId, ConfirmHandoverRequest request, string currentUserId, CancellationToken ct = default);

    Task<ServiceResult<ReviewDto>> SubmitReviewAsync(CreateReviewRequest request, string currentUserId, CancellationToken ct = default);

    Task<ServiceResult<bool>> CreateDisputeAsync(int bookingId, CreateDisputeRequest request, string currentUserId, CancellationToken ct = default);

    Task<ServiceResult<OwnerRevenueSummaryDto>> GetOwnerRevenueAsync(string ownerUserId, CancellationToken ct = default);

    Task<ServiceResult<int>> AutoExpireBookingsAsync(CancellationToken ct = default);
}
