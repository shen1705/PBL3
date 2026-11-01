using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Bookings;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using CarRental.Services.Availability;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Bookings;

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _db;
    private readonly IVehicleAvailabilityService _availabilityService;
    private readonly IClock _clock;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        ApplicationDbContext db,
        IVehicleAvailabilityService availabilityService,
        IClock clock,
        ILogger<BookingService> logger)
    {
        _db = db;
        _availabilityService = availabilityService;
        _clock = clock;
        _logger = logger;
    }

    private static string ResolveImageUrl(string? rawPath, string brand, string model)
    {
        if (!string.IsNullOrWhiteSpace(rawPath) &&
            (rawPath.StartsWith("http://") || rawPath.StartsWith("https://") || rawPath.StartsWith("/")))
        {
            return rawPath;
        }

        var normalized = $"{brand} {model}".ToUpperInvariant();
        if (normalized.Contains("VIOS") || normalized.Contains("COROLLA"))
            return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("CITY") || normalized.Contains("ACCENT"))
            return "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("CX-5") || normalized.Contains("CX-30"))
            return "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("XPANDER"))
            return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("VF"))
            return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("CR-V") || normalized.Contains("SANTA FE"))
            return "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("TRANSIT") || normalized.Contains("CARNIVAL"))
            return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
        if (normalized.Contains("MORNING") || normalized.Contains("SONET"))
            return "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=600";

        return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600";
    }

    private static string? GetFirstImage(VehicleListing? listing)
    {
        return listing?.Images?
            .OrderByDescending(i => i.IsCover)
            .ThenBy(i => i.SortOrder)
            .FirstOrDefault()?.ImagePath;
    }

    public async Task<ServiceResult<BookingPriceCalculationDto>> CalculatePriceAsync(
        BookingPriceCalculationRequest request,
        CancellationToken ct = default)
    {
        if (request.EndDate <= request.StartDate)
            return ServiceResult<BookingPriceCalculationDto>.Fail("Ngày kết thúc phải sau ngày bắt đầu.", ErrorCodes.Validation);

        var listing = await _db.VehicleListings.AsNoTracking()
            .Include(l => l.Vehicle)
            .FirstOrDefaultAsync(l => l.ListingId == request.ListingId, ct);

        if (listing == null)
            return ServiceResult<BookingPriceCalculationDto>.Fail("Không tìm thấy thông tin tin đăng xe.", ErrorCodes.NotFound);

        int rentalDays = (int)Math.Ceiling((request.EndDate - request.StartDate).TotalDays);
        if (rentalDays < 1) rentalDays = 1;

        decimal rentalSubtotal = listing.PricePerDay * rentalDays;
        decimal deliveryFee = string.Equals(request.DeliveryMethod, "delivery", StringComparison.OrdinalIgnoreCase) ? 100_000m : 0m;
        decimal insuranceFee = 50_000m * rentalDays;
        decimal total = rentalSubtotal + deliveryFee + insuranceFee;
        decimal depositAmount = Math.Round(total * BusinessRules.DepositRate);
        decimal remaining = total - depositAmount;

        var dto = new BookingPriceCalculationDto
        {
            ListingId = listing.ListingId,
            VehicleId = listing.VehicleId,
            VehicleName = $"{listing.Vehicle.Brand} {listing.Vehicle.Model} {listing.Vehicle.Year}",
            PricePerDay = listing.PricePerDay,
            RentalDays = rentalDays,
            RentalSubtotal = rentalSubtotal,
            DeliveryFee = deliveryFee,
            InsuranceFee = insuranceFee,
            PriceLockedTotal = total,
            DepositRate = BusinessRules.DepositRate,
            DepositAmount = depositAmount,
            RemainingAmount = remaining
        };

        return ServiceResult<BookingPriceCalculationDto>.Success(dto);
    }

    public async Task<ServiceResult<BookingDetailDto>> CreateBookingAsync(
        CreateBookingRequest request,
        string renterUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(renterUserId))
            return ServiceResult<BookingDetailDto>.Fail("Yêu cầu đăng nhập để thực hiện đặt xe.", ErrorCodes.Unauthorized);

        if (request.EndDate <= request.StartDate)
            return ServiceResult<BookingDetailDto>.Fail("Ngày trả xe phải sau ngày nhận xe.", ErrorCodes.Validation);

        if (request.StartDate < _clock.UtcNow.AddMinutes(-30))
            return ServiceResult<BookingDetailDto>.Fail("Thời gian nhận xe không thể ở trong quá khứ.", ErrorCodes.Validation);

        // check renter & sanction
        var renter = await _db.Users.FirstOrDefaultAsync(u => u.Id == renterUserId, ct);
        if (renter == null)
            return ServiceResult<BookingDetailDto>.Fail("Không tìm thấy thông tin tài khoản người thuê.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        var activeSanction = await _db.AccountSanctions.AsNoTracking()
            .Where(s => s.UserId == renterUserId && s.LiftedAt == null && (s.ExpiresAt == null || s.ExpiresAt > now))
            .OrderByDescending(s => s.IssuedAt)
            .FirstOrDefaultAsync(ct);

        if (activeSanction != null)
        {
            var msg = activeSanction.ExpiresAt.HasValue
                ? $"Tài khoản của bạn đang chịu chế tài tạm khóa đến {activeSanction.ExpiresAt.Value:dd/MM/yyyy HH:mm}. Lý do: {activeSanction.Reason}"
                : $"Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm quy chế. Lý do: {activeSanction.Reason}";
            return ServiceResult<BookingDetailDto>.Fail(msg, ErrorCodes.Forbidden);
        }

        // find vehicle & listing
        var listing = await _db.VehicleListings
            .Include(l => l.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(l => l.Images)
            .FirstOrDefaultAsync(l => l.ListingId == request.ListingId, ct);

        if (listing == null)
            return ServiceResult<BookingDetailDto>.Fail("Không tìm thấy thông tin xe cần thuê.", ErrorCodes.NotFound);

        if (listing.Vehicle.OwnerId == renterUserId)
            return ServiceResult<BookingDetailDto>.Fail("Bạn không thể tự đặt thuê xe của chính mình.", ErrorCodes.Validation);

        if (listing.ModerationStatus != ListingModerationStatuses.Public)
            return ServiceResult<BookingDetailDto>.Fail("Tin đăng xe này hiện không được công khai cho thuê.", ErrorCodes.Validation);

        if (listing.Vehicle.Status != VehicleStatuses.Approved)
            return ServiceResult<BookingDetailDto>.Fail("Phương tiện chưa được phê duyệt để cho thuê.", ErrorCodes.Validation);

        // check availability
        var avail = await _availabilityService.CheckAsync(listing.VehicleId, request.StartDate, request.EndDate, null, ct);
        if (!avail.IsAvailable)
            return ServiceResult<BookingDetailDto>.Fail(avail.Message ?? "Xe đã có đơn thuê hoặc bận trong khoảng thời gian này.", ErrorCodes.Conflict);

        // calculate price
        int rentalDays = (int)Math.Ceiling((request.EndDate - request.StartDate).TotalDays);
        if (rentalDays < 1) rentalDays = 1;

        decimal rentalSubtotal = listing.PricePerDay * rentalDays;
        decimal deliveryFee = string.Equals(request.DeliveryMethod, "delivery", StringComparison.OrdinalIgnoreCase) ? 100_000m : 0m;
        decimal insuranceFee = 50_000m * rentalDays;
        decimal total = rentalSubtotal + deliveryFee + insuranceFee;
        decimal depositAmount = Math.Round(total * BusinessRules.DepositRate);

        // create deposit hold
        var hold = new DepositHold
        {
            RenterId = renterUserId,
            ListingId = listing.ListingId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            RentalDays = rentalDays,
            PriceLockedTotal = total,
            DepositAmount = depositAmount,
            Status = DepositHoldStatuses.Converted,
            CreatedAt = now
        };
        _db.DepositHolds.Add(hold);
        await _db.SaveChangesAsync(ct);

        // create booking
        var booking = new Booking
        {
            RenterId = renterUserId,
            ListingId = listing.ListingId,
            VehicleId = listing.VehicleId,
            SourceHoldId = hold.HoldId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            RentalDays = rentalDays,
            Status = BookingStatuses.Pending,
            PriceLockedTotal = total,
            DepositAmount = depositAmount,
            CreatedAt = now,
            ResponseDeadline = now.AddHours(BusinessRules.ResponseDeadlineHours)
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Đã tạo đơn đặt xe mới #{BookingId} cho xe {VehicleId} từ người dùng {RenterId}",
            booking.BookingId, listing.VehicleId, renterUserId);

        var firstImage = GetFirstImage(listing);
        var coverUrl = ResolveImageUrl(firstImage, listing.Vehicle.Brand, listing.Vehicle.Model);

        var detail = new BookingDetailDto
        {
            BookingId = booking.BookingId,
            ListingId = listing.ListingId,
            VehicleId = listing.VehicleId,
            VehicleName = $"{listing.Vehicle.Brand} {listing.Vehicle.Model} {listing.Vehicle.Year}",
            LicensePlate = listing.Vehicle.LicensePlate,
            CoverImageUrl = coverUrl,
            City = listing.City,
            District = listing.District,
            RenterId = renter.Id,
            RenterName = renter.FullName ?? renter.UserName ?? "Khách thuê",
            RenterPhone = renter.PhoneNumber,
            RenterEmail = renter.Email,
            OwnerId = listing.Vehicle.Owner.Id,
            OwnerName = listing.Vehicle.Owner.FullName ?? listing.Vehicle.Owner.UserName ?? "Chủ xe",
            OwnerPhone = listing.Vehicle.Owner.PhoneNumber,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            RentalDays = booking.RentalDays,
            Status = booking.Status,
            PriceLockedTotal = booking.PriceLockedTotal,
            DepositAmount = booking.DepositAmount,
            CreatedAt = booking.CreatedAt,
            ResponseDeadline = booking.ResponseDeadline,
            DeliveryMethod = request.DeliveryMethod,
            DeliveryAddress = request.DeliveryAddress
        };

        return ServiceResult<BookingDetailDto>.Success(detail, "Tạo đơn đặt xe và giữ cọc thành công! Chủ xe sẽ phản hồi sớm nhất.");
    }

    public async Task<ServiceResult<List<BookingSummaryDto>>> GetRenterTripsAsync(
        string renterUserId,
        string? statusFilter = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(renterUserId))
            return ServiceResult<List<BookingSummaryDto>>.Fail("Yêu cầu đăng nhập.", ErrorCodes.Unauthorized);

        // expire overdue pending
        await AutoExpireBookingsAsync(ct);

        var query = _db.Bookings.AsNoTracking()
            .Where(b => b.RenterId == renterUserId)
            .Include(b => b.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(b => b.Listing)
                .ThenInclude(l => l.Images)
            .OrderByDescending(b => b.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(statusFilter))
        {
            var filter = statusFilter.Trim().ToLowerInvariant();
            if (filter == "current" || filter == "ongoing")
            {
                query = query.Where(b => b.Status == BookingStatuses.Pending ||
                                         b.Status == BookingStatuses.Accepted ||
                                         b.Status == BookingStatuses.Ongoing);
            }
            else if (filter == "completed" || filter == "history")
            {
                query = query.Where(b => b.Status == BookingStatuses.Completed ||
                                         b.Status == BookingStatuses.Cancelled ||
                                         b.Status == BookingStatuses.Rejected ||
                                         b.Status == BookingStatuses.Expired);
            }
            else
            {
                query = query.Where(b => b.Status.ToLower() == filter);
            }
        }

        var list = await query.ToListAsync(ct);

        var result = list.Select(b =>
        {
            var firstImg = GetFirstImage(b.Listing);
            var coverUrl = ResolveImageUrl(firstImg, b.Vehicle.Brand, b.Vehicle.Model);

            return new BookingSummaryDto
            {
                BookingId = b.BookingId,
                VehicleId = b.VehicleId,
                ListingId = b.ListingId,
                VehicleName = $"{b.Vehicle.Brand} {b.Vehicle.Model} {b.Vehicle.Year}",
                CoverImageUrl = coverUrl,
                LicensePlate = b.Vehicle.LicensePlate,
                City = b.Listing?.City,
                District = b.Listing?.District,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                RentalDays = b.RentalDays,
                Status = b.Status,
                PriceLockedTotal = b.PriceLockedTotal,
                DepositAmount = b.DepositAmount,
                RenterId = b.RenterId,
                RenterName = b.Renter?.FullName ?? "Tôi",
                RenterPhone = b.Renter?.PhoneNumber,
                OwnerId = b.Vehicle.OwnerId,
                OwnerName = b.Vehicle.Owner?.FullName ?? b.Vehicle.Owner?.UserName ?? "Chủ xe",
                OwnerPhone = b.Vehicle.Owner?.PhoneNumber,
                CreatedAt = b.CreatedAt,
                ResponseDeadline = b.ResponseDeadline
            };
        }).ToList();

        return ServiceResult<List<BookingSummaryDto>>.Success(result);
    }

    public async Task<ServiceResult<List<BookingSummaryDto>>> GetOwnerBookingRequestsAsync(
        string ownerUserId,
        string? statusFilter = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(ownerUserId))
            return ServiceResult<List<BookingSummaryDto>>.Fail("Yêu cầu đăng nhập.", ErrorCodes.Unauthorized);

        // release expired pending
        await AutoExpireBookingsAsync(ct);

        var query = _db.Bookings.AsNoTracking()
            .Where(b => b.Vehicle.OwnerId == ownerUserId)
            .Include(b => b.Renter)
            .Include(b => b.Vehicle)
            .Include(b => b.Listing)
                .ThenInclude(l => l.Images)
            .OrderByDescending(b => b.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(statusFilter))
        {
            var filter = statusFilter.Trim().ToLowerInvariant();
            if (filter == "pending")
            {
                query = query.Where(b => b.Status == BookingStatuses.Pending);
            }
            else if (filter == "active" || filter == "current")
            {
                query = query.Where(b => b.Status == BookingStatuses.Accepted || b.Status == BookingStatuses.Ongoing);
            }
            else
            {
                query = query.Where(b => b.Status.ToLower() == filter);
            }
        }

        var list = await query.ToListAsync(ct);

        var result = list.Select(b =>
        {
            var firstImg = GetFirstImage(b.Listing);
            var coverUrl = ResolveImageUrl(firstImg, b.Vehicle.Brand, b.Vehicle.Model);

            return new BookingSummaryDto
            {
                BookingId = b.BookingId,
                VehicleId = b.VehicleId,
                ListingId = b.ListingId,
                VehicleName = $"{b.Vehicle.Brand} {b.Vehicle.Model} {b.Vehicle.Year}",
                CoverImageUrl = coverUrl,
                LicensePlate = b.Vehicle.LicensePlate,
                City = b.Listing?.City,
                District = b.Listing?.District,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                RentalDays = b.RentalDays,
                Status = b.Status,
                PriceLockedTotal = b.PriceLockedTotal,
                DepositAmount = b.DepositAmount,
                RenterId = b.RenterId,
                RenterName = b.Renter?.FullName ?? b.Renter?.UserName ?? "Khách thuê",
                RenterPhone = b.Renter?.PhoneNumber,
                OwnerId = b.Vehicle.OwnerId,
                OwnerName = "Tôi",
                OwnerPhone = b.Vehicle.Owner?.PhoneNumber,
                CreatedAt = b.CreatedAt,
                ResponseDeadline = b.ResponseDeadline
            };
        }).ToList();

        return ServiceResult<List<BookingSummaryDto>>.Success(result);
    }

    public async Task<ServiceResult<BookingDetailDto>> GetBookingDetailAsync(
        int bookingId,
        string currentUserId,
        CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Renter)
            .Include(b => b.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(b => b.Listing)
                .ThenInclude(l => l.Images)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId, ct);

        if (booking == null)
            return ServiceResult<BookingDetailDto>.Fail("Không tìm thấy đơn thuê xe.", ErrorCodes.NotFound);

        if (booking.RenterId != currentUserId && booking.Vehicle.OwnerId != currentUserId)
            return ServiceResult<BookingDetailDto>.Fail("Bạn không có quyền truy cập thông tin đơn thuê này.", ErrorCodes.Forbidden);

        var firstImg = GetFirstImage(booking.Listing);
        var coverUrl = ResolveImageUrl(firstImg, booking.Vehicle.Brand, booking.Vehicle.Model);

        var dto = new BookingDetailDto
        {
            BookingId = booking.BookingId,
            ListingId = booking.ListingId,
            VehicleId = booking.VehicleId,
            VehicleName = $"{booking.Vehicle.Brand} {booking.Vehicle.Model} {booking.Vehicle.Year}",
            LicensePlate = booking.Vehicle.LicensePlate,
            CoverImageUrl = coverUrl,
            City = booking.Listing?.City,
            District = booking.Listing?.District,
            RenterId = booking.RenterId,
            RenterName = booking.Renter?.FullName ?? booking.Renter?.UserName ?? "Khách thuê",
            RenterPhone = booking.Renter?.PhoneNumber,
            RenterEmail = booking.Renter?.Email,
            OwnerId = booking.Vehicle.OwnerId,
            OwnerName = booking.Vehicle.Owner?.FullName ?? booking.Vehicle.Owner?.UserName ?? "Chủ xe",
            OwnerPhone = booking.Vehicle.Owner?.PhoneNumber,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            RentalDays = booking.RentalDays,
            Status = booking.Status,
            PriceLockedTotal = booking.PriceLockedTotal,
            DepositAmount = booking.DepositAmount,
            CreatedAt = booking.CreatedAt,
            ResponseDeadline = booking.ResponseDeadline,
            AcceptedAt = booking.AcceptedAt,
            RespondedAt = booking.RespondedAt,
            RejectReason = booking.RejectReason,
            CompletedAt = booking.CompletedAt,
            CancelledAt = booking.CancelledAt,
            CancelledBy = booking.CancelledBy,
            CancelReason = booking.CancelReason
        };

        return ServiceResult<BookingDetailDto>.Success(dto);
    }

    public async Task<ServiceResult<BookingDetailDto>> RespondToBookingAsync(
        int bookingId,
        RespondBookingRequest request,
        string ownerUserId,
        CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Renter)
            .Include(b => b.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(b => b.Listing)
                .ThenInclude(l => l.Images)
            .Include(b => b.SourceHold)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId, ct);

        if (booking == null)
            return ServiceResult<BookingDetailDto>.Fail("Không tìm thấy đơn thuê xe.", ErrorCodes.NotFound);

        if (booking.Vehicle.OwnerId != ownerUserId)
            return ServiceResult<BookingDetailDto>.Fail("Chỉ chủ xe của phương tiện mới có quyền duyệt đơn này.", ErrorCodes.Forbidden);

        if (booking.Status != BookingStatuses.Pending)
            return ServiceResult<BookingDetailDto>.Fail($"Đơn thuê đang ở trạng thái '{booking.Status}', không thể thao tác duyệt/từ chối.", ErrorCodes.InvalidState);

        var now = _clock.UtcNow;

        // check expire
        if (now > booking.ResponseDeadline)
        {
            booking.Status = BookingStatuses.Expired;
            if (booking.SourceHold != null)
            {
                booking.SourceHold.Status = DepositHoldStatuses.Cancelled;
            }
            await _db.SaveChangesAsync(ct);
            return ServiceResult<BookingDetailDto>.Fail("Đơn thuê đã hết thời hạn phản hồi quy định (24 giờ).", ErrorCodes.Expired);
        }

        if (request.Accept)
        {
            // re-check conflict
            var avail = await _availabilityService.CheckAsync(booking.VehicleId, booking.StartDate, booking.EndDate, booking.BookingId, ct);
            if (!avail.IsAvailable)
            {
                return ServiceResult<BookingDetailDto>.Fail("Không thể chấp nhận đơn do xe đã bị trùng lịch với đơn khác.", ErrorCodes.Conflict);
            }

            booking.Status = BookingStatuses.Accepted;
            booking.AcceptedAt = now;
            booking.RespondedAt = now;
            _logger.LogInformation("Chủ xe {OwnerId} đã CHẤP NHẬN đơn #{BookingId}", ownerUserId, bookingId);
        }
        else
        {
            booking.Status = BookingStatuses.Rejected;
            booking.RespondedAt = now;
            booking.RejectReason = string.IsNullOrWhiteSpace(request.Reason)
                ? "Chủ xe bận lịch hoặc không thể phục vụ chuyến đi này."
                : request.Reason.Trim();

            // refund deposit
            if (booking.SourceHold != null)
            {
                booking.SourceHold.Status = DepositHoldStatuses.Cancelled;
            }
            _logger.LogInformation("Chủ xe {OwnerId} đã TỪ CHỐI đơn #{BookingId}. Lý do: {Reason}", ownerUserId, bookingId, booking.RejectReason);
        }

        await _db.SaveChangesAsync(ct);

        return await GetBookingDetailAsync(bookingId, ownerUserId, ct);
    }

    public async Task<ServiceResult<BookingDetailDto>> CancelBookingAsync(
        int bookingId,
        CancelBookingRequest request,
        string currentUserId,
        CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .Include(b => b.Renter)
            .Include(b => b.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(b => b.Listing)
                .ThenInclude(l => l.Images)
            .Include(b => b.SourceHold)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId, ct);

        if (booking == null)
            return ServiceResult<BookingDetailDto>.Fail("Không tìm thấy đơn thuê xe.", ErrorCodes.NotFound);

        bool isRenter = booking.RenterId == currentUserId;
        bool isOwner = booking.Vehicle.OwnerId == currentUserId;

        if (!isRenter && !isOwner)
            return ServiceResult<BookingDetailDto>.Fail("Bạn không có quyền hủy đơn thuê này.", ErrorCodes.Forbidden);

        if (booking.Status != BookingStatuses.Pending && booking.Status != BookingStatuses.Accepted)
            return ServiceResult<BookingDetailDto>.Fail($"Không thể hủy đơn thuê ở trạng thái '{booking.Status}'.", ErrorCodes.InvalidState);

        var now = _clock.UtcNow;

        if (now >= booking.StartDate && booking.Status == BookingStatuses.Accepted)
            return ServiceResult<BookingDetailDto>.Fail("Không thể hủy đơn thuê khi đã đến hoặc quá thời gian nhận xe.", ErrorCodes.InvalidState);

        booking.Status = BookingStatuses.Cancelled;
        booking.CancelledAt = now;
        booking.CancelledBy = currentUserId;
        booking.CancelReason = !string.IsNullOrWhiteSpace(request.Reason)
            ? request.Reason.Trim()
            : (isRenter ? "Khách thuê chủ động hủy đơn" : "Chủ xe chủ động hủy đơn đã duyệt");

        // release hold
        if (booking.SourceHold != null)
        {
            booking.SourceHold.Status = DepositHoldStatuses.Cancelled;
        }

        _logger.LogInformation("Đơn #{BookingId} đã bị HỦY bởi {UserId} (isRenter: {IsRenter}). Lý do: {Reason}",
            bookingId, currentUserId, isRenter, booking.CancelReason);

        await _db.SaveChangesAsync(ct);

        return await GetBookingDetailAsync(bookingId, currentUserId, ct);
    }

    public async Task<ServiceResult<int>> AutoExpireBookingsAsync(CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        var expiredBookings = await _db.Bookings
            .Include(b => b.SourceHold)
            .Where(b => b.Status == BookingStatuses.Pending && b.ResponseDeadline < now)
            .ToListAsync(ct);

        if (expiredBookings.Count == 0)
            return ServiceResult<int>.Success(0);

        foreach (var b in expiredBookings)
        {
            b.Status = BookingStatuses.Expired;
            if (b.SourceHold != null)
            {
                b.SourceHold.Status = DepositHoldStatuses.Cancelled;
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Đã tự động chuyển {Count} đơn thuê quá hạn phản hồi sang Expired.", expiredBookings.Count);

        return ServiceResult<int>.Success(expiredBookings.Count);
    }
}
