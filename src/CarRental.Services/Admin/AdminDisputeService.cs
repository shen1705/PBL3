using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;
using CarRental.Models.DTOs.Bookings;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Admin;

public class AdminDisputeService : IAdminDisputeService
{
    private readonly ApplicationDbContext _db;
    private readonly IClock _clock;
    private readonly ILogger<AdminDisputeService> _logger;

    public AdminDisputeService(
        ApplicationDbContext db,
        IClock clock,
        ILogger<AdminDisputeService> logger)
    {
        _db = db;
        _clock = clock;
        _logger = logger;
    }

    // dispute metrics
    public async Task<ServiceResult<AdminDisputeMetricsDto>> GetDisputeMetricsAsync(CancellationToken ct = default)
    {
        var total = await _db.Disputes.AsNoTracking().CountAsync(ct);
        var open = await _db.Disputes.AsNoTracking().CountAsync(d => d.Status == DisputeStatuses.Open, ct);
        var resolved = await _db.Disputes.AsNoTracking().CountAsync(d => d.Status == DisputeStatuses.Resolved, ct);

        // high priority: open disputes older than 24h
        var cutoff24h = _clock.UtcNow.AddHours(-24);
        var highPriority = await _db.Disputes.AsNoTracking()
            .CountAsync(d => d.Status == DisputeStatuses.Open && d.CreatedAt < cutoff24h, ct);

        var metrics = new AdminDisputeMetricsDto
        {
            TotalDisputes = total,
            OpenCount = open,
            ResolvedCount = resolved,
            HighPriorityCount = highPriority
        };

        return ServiceResult<AdminDisputeMetricsDto>.Success(metrics);
    }

    // disputes list
    public async Task<ServiceResult<PagedResult<AdminDisputeListItemDto>>> GetDisputesAsync(AdminDisputeFilterDto filter, CancellationToken ct = default)
    {
        var query = _db.Disputes.AsNoTracking()
            .Include(d => d.Raiser)
            .Include(d => d.Resolver)
            .Include(d => d.Booking)
                .ThenInclude(b => b.Vehicle)
            .AsQueryable();

        // filter status
        if (!string.IsNullOrWhiteSpace(filter.Status) && filter.Status != "all")
        {
            query = query.Where(d => d.Status == filter.Status);
        }

        // search term
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim();
            query = query.Where(d =>
                d.Raiser.FullName.Contains(term) ||
                (d.Raiser.UserName != null && d.Raiser.UserName.Contains(term)) ||
                d.Description.Contains(term) ||
                d.Booking.Vehicle.Brand.Contains(term) ||
                d.Booking.Vehicle.Model.Contains(term) ||
                d.Booking.Vehicle.LicensePlate.Contains(term));
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var disputes = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = disputes.Select(d =>
        {
            var isRenter = d.Booking?.RenterId == d.RaisedBy;
            var raiserRole = isRenter ? "Người thuê" : "Chủ xe";

            return new AdminDisputeListItemDto
            {
                DisputeId = d.DisputeId,
                BookingId = d.BookingId,
                RaisedBy = d.RaisedBy,
                RaiserName = d.Raiser?.FullName ?? d.Raiser?.UserName ?? string.Empty,
                RaiserRole = raiserRole,
                Description = d.Description,
                EvidenceImage = d.EvidenceImage,
                Status = d.Status,
                CreatedAt = d.CreatedAt,
                ResolvedBy = d.ResolvedBy,
                ResolverName = d.Resolver?.FullName ?? d.Resolver?.UserName,
                ResolvedAt = d.ResolvedAt,
                ResolutionAction = d.ResolutionAction,
                ResolutionNotes = d.ResolutionNotes,
                VehicleName = d.Booking?.Vehicle != null ? $"{d.Booking.Vehicle.Brand} {d.Booking.Vehicle.Model}" : string.Empty,
                LicensePlate = d.Booking?.Vehicle?.LicensePlate ?? string.Empty,
                BookingStatus = d.Booking?.Status ?? string.Empty,
                PriceLockedTotal = d.Booking?.PriceLockedTotal ?? 0
            };
        }).ToList();

        return ServiceResult<PagedResult<AdminDisputeListItemDto>>.Success(
            PagedResult<AdminDisputeListItemDto>.Create(items, totalCount, page, pageSize));
    }

    // dispute detail
    public async Task<ServiceResult<AdminDisputeDetailDto>> GetDisputeByIdAsync(int disputeId, CancellationToken ct = default)
    {
        var dispute = await _db.Disputes.AsNoTracking()
            .Include(d => d.Raiser)
            .Include(d => d.Resolver)
            .Include(d => d.Booking)
                .ThenInclude(b => b.Vehicle)
                    .ThenInclude(v => v.Owner)
            .Include(d => d.Booking)
                .ThenInclude(b => b.Renter)
            .Include(d => d.Booking)
                .ThenInclude(b => b.HandoverConfirmations)
                    .ThenInclude(h => h.Confirmer)
            .FirstOrDefaultAsync(d => d.DisputeId == disputeId, ct);

        if (dispute == null)
            return ServiceResult<AdminDisputeDetailDto>.Fail("Không tìm thấy tranh chấp / khiếu nại.", ErrorCodes.NotFound);

        var booking = dispute.Booking;
        var isRenter = booking?.RenterId == dispute.RaisedBy;
        var raiserRole = isRenter ? "Người thuê" : "Chủ xe";

        var handovers = booking?.HandoverConfirmations?
            .OrderBy(h => h.ConfirmedAt)
            .Select(h => new HandoverConfirmationDto
            {
                ConfirmationId = h.ConfirmationId,
                BookingId = h.BookingId,
                Type = h.Type,
                ConfirmedBy = h.ConfirmedBy,
                ConfirmerName = h.Confirmer?.FullName ?? h.Confirmer?.UserName ?? string.Empty,
                ConfirmedAt = h.ConfirmedAt
            }).ToList() ?? new();

        var detail = new AdminDisputeDetailDto
        {
            DisputeId = dispute.DisputeId,
            BookingId = dispute.BookingId,
            RaisedBy = dispute.RaisedBy,
            RaiserName = dispute.Raiser?.FullName ?? dispute.Raiser?.UserName ?? string.Empty,
            RaiserRole = raiserRole,
            Description = dispute.Description,
            EvidenceImage = dispute.EvidenceImage,
            Status = dispute.Status,
            CreatedAt = dispute.CreatedAt,
            ResolvedBy = dispute.ResolvedBy,
            ResolverName = dispute.Resolver?.FullName ?? dispute.Resolver?.UserName,
            ResolvedAt = dispute.ResolvedAt,
            ResolutionAction = dispute.ResolutionAction,
            ResolutionNotes = dispute.ResolutionNotes,
            VehicleName = booking?.Vehicle != null ? $"{booking.Vehicle.Brand} {booking.Vehicle.Model}" : string.Empty,
            LicensePlate = booking?.Vehicle?.LicensePlate ?? string.Empty,
            BookingStatus = booking?.Status ?? string.Empty,
            PriceLockedTotal = booking?.PriceLockedTotal ?? 0,
            RenterId = booking?.RenterId ?? string.Empty,
            RenterName = booking?.Renter?.FullName ?? booking?.Renter?.UserName ?? string.Empty,
            RenterPhone = booking?.Renter?.PhoneNumber ?? string.Empty,
            OwnerId = booking?.Vehicle?.OwnerId ?? string.Empty,
            OwnerName = booking?.Vehicle?.Owner?.FullName ?? booking?.Vehicle?.Owner?.UserName ?? string.Empty,
            OwnerPhone = booking?.Vehicle?.Owner?.PhoneNumber ?? string.Empty,
            StartDate = booking?.StartDate ?? DateTime.MinValue,
            EndDate = booking?.EndDate ?? DateTime.MinValue,
            DepositAmount = booking?.DepositAmount ?? 0,
            Handovers = handovers
        };

        return ServiceResult<AdminDisputeDetailDto>.Success(detail);
    }

    // resolve dispute
    public async Task<ServiceResult<bool>> ResolveDisputeAsync(int disputeId, ResolveDisputeRequest request, string currentUserId, CancellationToken ct = default)
    {
        var dispute = await _db.Disputes
            .Include(d => d.Booking)
                .ThenInclude(b => b.SourceHold)
            .Include(d => d.Booking)
                .ThenInclude(b => b.HandoverConfirmations)
            .FirstOrDefaultAsync(d => d.DisputeId == disputeId, ct);

        if (dispute == null)
            return ServiceResult<bool>.Fail("Không tìm thấy tranh chấp / khiếu nại.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        dispute.Status = DisputeStatuses.Resolved;
        dispute.ResolvedBy = currentUserId;
        dispute.ResolvedAt = now;
        dispute.ResolutionAction = request.ResolutionAction;
        dispute.ResolutionNotes = request.ResolutionNotes.Trim();

        var booking = dispute.Booking;

        // force complete action
        if (request.ResolutionAction == ResolutionActions.ForceComplete && booking != null)
        {
            if (booking.Status == BookingStatuses.Ongoing)
            {
                booking.Status = BookingStatuses.Completed;
                booking.CompletedAt = now;

                if (booking.SourceHold != null)
                {
                    booking.SourceHold.Status = DepositHoldStatuses.Converted;
                }

                var payment = await _db.Payments.FirstOrDefaultAsync(p => p.BookingId == booking.BookingId, ct);
                decimal commissionRate = BusinessRules.DefaultCommissionRate;
                decimal commissionAmount = Math.Round(booking.PriceLockedTotal * commissionRate);

                if (payment == null)
                {
                    payment = new Payment
                    {
                        BookingId = booking.BookingId,
                        DepositStatus = DepositStatuses.Refunded,
                        CommissionRate = commissionRate,
                        CommissionAmount = commissionAmount,
                        RevenueRecordedAt = now
                    };
                    _db.Payments.Add(payment);
                }
                else
                {
                    payment.DepositStatus = DepositStatuses.Refunded;
                    payment.CommissionRate = commissionRate;
                    payment.CommissionAmount = commissionAmount;
                    payment.RevenueRecordedAt = now;
                }
            }
        }
        // cancel owner fault action
        else if (request.ResolutionAction == ResolutionActions.CancelOwnerFault && booking != null)
        {
            if (booking.Status != BookingStatuses.Completed && booking.Status != BookingStatuses.Cancelled)
            {
                booking.Status = BookingStatuses.Cancelled;
                booking.CancelledBy = currentUserId;
                booking.CancelledAt = now;
                booking.CancelReason = $"Hủy bởi Admin do lỗi chủ xe: {request.ResolutionNotes}";

                if (booking.SourceHold != null)
                {
                    booking.SourceHold.Status = DepositHoldStatuses.Cancelled;
                }

                var payment = await _db.Payments.FirstOrDefaultAsync(p => p.BookingId == booking.BookingId, ct);
                if (payment == null)
                {
                    payment = new Payment
                    {
                        BookingId = booking.BookingId,
                        DepositStatus = DepositStatuses.Refunded,
                        CommissionRate = 0,
                        CommissionAmount = 0
                    };
                    _db.Payments.Add(payment);
                }
                else
                {
                    payment.DepositStatus = DepositStatuses.Refunded;
                }
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} giải quyết tranh chấp #{DisputeId} theo hướng {Action}: {Notes}",
            currentUserId, disputeId, request.ResolutionAction, request.ResolutionNotes);

        return ServiceResult<bool>.Success(true);
    }
}
