using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs;
using CarRental.Models.DTOs.Admin;
using CarRental.Models.DTOs.Vehicles;
using CarRental.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Admin;

public class AdminListingService : IAdminListingService
{
    private readonly ApplicationDbContext _db;
    private readonly IClock _clock;
    private readonly ILogger<AdminListingService> _logger;

    public AdminListingService(
        ApplicationDbContext db,
        IClock clock,
        ILogger<AdminListingService> logger)
    {
        _db = db;
        _clock = clock;
        _logger = logger;
    }

    // listing metrics
    public async Task<ServiceResult<AdminListingMetricsDto>> GetListingMetricsAsync(CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        var todayStart = now.Date;
        var cutoff24h = now.AddHours(-24);

        var total = await _db.VehicleListings.AsNoTracking().CountAsync(ct);
        var pending = await _db.VehicleListings.AsNoTracking().CountAsync(l => l.ModerationStatus == ListingModerationStatuses.PendingApproval, ct);
        var pub = await _db.VehicleListings.AsNoTracking().CountAsync(l => l.ModerationStatus == ListingModerationStatuses.Public, ct);
        var hidden = await _db.VehicleListings.AsNoTracking().CountAsync(l => l.ModerationStatus == ListingModerationStatuses.Hidden, ct);
        var pending24h = await _db.VehicleListings.AsNoTracking().CountAsync(l => l.ModerationStatus == ListingModerationStatuses.PendingApproval && l.CreatedAt < cutoff24h, ct);
        var moderatedToday = await _db.VehicleListings.AsNoTracking().CountAsync(l => l.ModeratedAt != null && l.ModeratedAt >= todayStart, ct);

        var metrics = new AdminListingMetricsDto
        {
            TotalListings = total,
            PendingCount = pending,
            PublicCount = pub,
            HiddenCount = hidden,
            PendingOver24hCount = pending24h,
            ModeratedTodayCount = moderatedToday
        };

        return ServiceResult<AdminListingMetricsDto>.Success(metrics);
    }

    // listings list
    public async Task<ServiceResult<PagedResult<AdminListingListItemDto>>> GetListingsAsync(AdminListingFilterDto filter, CancellationToken ct = default)
    {
        var query = _db.VehicleListings.AsNoTracking()
            .Include(l => l.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(l => l.Moderator)
            .Include(l => l.Images)
            .AsQueryable();

        // filter status
        if (!string.IsNullOrWhiteSpace(filter.ModerationStatus) && filter.ModerationStatus != "all")
        {
            query = query.Where(l => l.ModerationStatus == filter.ModerationStatus);
        }

        // filter city
        if (!string.IsNullOrWhiteSpace(filter.City) && filter.City != "all")
        {
            query = query.Where(l => l.City == filter.City);
        }

        // search term
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim();
            query = query.Where(l =>
                l.Vehicle.Brand.Contains(term) ||
                l.Vehicle.Model.Contains(term) ||
                l.Vehicle.LicensePlate.Contains(term) ||
                l.Vehicle.Owner.FullName.Contains(term) ||
                (l.Vehicle.Owner.PhoneNumber != null && l.Vehicle.Owner.PhoneNumber.Contains(term)) ||
                l.City.Contains(term) ||
                l.District.Contains(term));
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var listings = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = listings.Select(l => new AdminListingListItemDto
        {
            ListingId = l.ListingId,
            VehicleId = l.VehicleId,
            LicensePlate = l.Vehicle?.LicensePlate ?? string.Empty,
            Brand = l.Vehicle?.Brand ?? string.Empty,
            Model = l.Vehicle?.Model ?? string.Empty,
            Year = l.Vehicle?.Year ?? 0,
            Seats = l.Vehicle?.Seats ?? 0,
            Transmission = l.Vehicle?.Transmission ?? string.Empty,
            FuelType = l.Vehicle?.FuelType ?? string.Empty,
            PricePerDay = l.PricePerDay,
            Location = l.Location,
            City = l.City,
            District = l.District,
            ModerationStatus = l.ModerationStatus,
            VehicleStatus = l.Vehicle?.Status ?? string.Empty,
            CreatedAt = l.CreatedAt,
            ModeratedBy = l.ModeratedBy,
            ModeratorName = l.Moderator?.FullName ?? l.Moderator?.UserName,
            ModeratedAt = l.ModeratedAt,
            ModerationNote = l.ModerationNote,
            OwnerId = l.Vehicle?.OwnerId ?? string.Empty,
            OwnerName = l.Vehicle?.Owner?.FullName ?? string.Empty,
            OwnerPhone = l.Vehicle?.Owner?.PhoneNumber ?? string.Empty,
            ThumbnailUrl = l.Images.OrderBy(img => img.SortOrder).Select(img => img.ImagePath).FirstOrDefault()
        }).ToList();

        return ServiceResult<PagedResult<AdminListingListItemDto>>.Success(
            PagedResult<AdminListingListItemDto>.Create(items, totalCount, page, pageSize));
    }

    // listing detail
    public async Task<ServiceResult<AdminListingDetailDto>> GetListingByIdAsync(int listingId, CancellationToken ct = default)
    {
        var listing = await _db.VehicleListings.AsNoTracking()
            .Include(l => l.Vehicle)
                .ThenInclude(v => v.Owner)
            .Include(l => l.Vehicle)
                .ThenInclude(v => v.Document)
            .Include(l => l.Moderator)
            .Include(l => l.Images)
            .FirstOrDefaultAsync(l => l.ListingId == listingId, ct);

        if (listing == null)
            return ServiceResult<AdminListingDetailDto>.Fail("Không tìm thấy bài đăng xe.", ErrorCodes.NotFound);

        var doc = listing.Vehicle?.Document;

        var detail = new AdminListingDetailDto
        {
            ListingId = listing.ListingId,
            VehicleId = listing.VehicleId,
            LicensePlate = listing.Vehicle?.LicensePlate ?? string.Empty,
            Brand = listing.Vehicle?.Brand ?? string.Empty,
            Model = listing.Vehicle?.Model ?? string.Empty,
            Year = listing.Vehicle?.Year ?? 0,
            Seats = listing.Vehicle?.Seats ?? 0,
            Transmission = listing.Vehicle?.Transmission ?? string.Empty,
            FuelType = listing.Vehicle?.FuelType ?? string.Empty,
            PricePerDay = listing.PricePerDay,
            Location = listing.Location,
            City = listing.City,
            District = listing.District,
            ModerationStatus = listing.ModerationStatus,
            VehicleStatus = listing.Vehicle?.Status ?? string.Empty,
            CreatedAt = listing.CreatedAt,
            ModeratedBy = listing.ModeratedBy,
            ModeratorName = listing.Moderator?.FullName ?? listing.Moderator?.UserName,
            ModeratedAt = listing.ModeratedAt,
            ModerationNote = listing.ModerationNote,
            OwnerId = listing.Vehicle?.OwnerId ?? string.Empty,
            OwnerName = listing.Vehicle?.Owner?.FullName ?? string.Empty,
            OwnerPhone = listing.Vehicle?.Owner?.PhoneNumber ?? string.Empty,
            ThumbnailUrl = listing.Images.OrderBy(img => img.SortOrder).Select(img => img.ImagePath).FirstOrDefault(),
            Description = listing.Description,
            Latitude = listing.Latitude,
            Longitude = listing.Longitude,
            Images = listing.Images.OrderBy(img => img.SortOrder).Select(img => new ListingImageDto
            {
                ImageId = img.ImageId,
                ImagePath = img.ImagePath,
                SortOrder = img.SortOrder,
                IsCover = img.IsCover
            }).ToList(),
            RegistrationCertImage = doc?.RegistrationCertImage ?? string.Empty,
            InsuranceImage = doc?.InsuranceImage ?? string.Empty,
            InsuranceExpiryDate = doc?.InsuranceExpiryDate,
            InspectionCertImage = doc?.InspectionCertImage ?? string.Empty,
            InspectionExpiryDate = doc?.InspectionExpiryDate
        };

        return ServiceResult<AdminListingDetailDto>.Success(detail);
    }

    // approve listing
    public async Task<ServiceResult<bool>> ApproveListingAsync(int listingId, ApproveListingRequest? request, string currentUserId, CancellationToken ct = default)
    {
        var listing = await _db.VehicleListings
            .Include(l => l.Vehicle)
            .FirstOrDefaultAsync(l => l.ListingId == listingId, ct);

        if (listing == null)
            return ServiceResult<bool>.Fail("Không tìm thấy bài đăng xe.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        listing.ModerationStatus = ListingModerationStatuses.Public;
        listing.ModeratedBy = currentUserId;
        listing.ModeratedAt = now;
        listing.ModerationNote = request?.Note?.Trim();

        if (listing.Vehicle != null)
        {
            listing.Vehicle.Status = VehicleStatuses.Approved;
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} duyệt công khai tin đăng {ListingId} (xe {VehicleId})", currentUserId, listingId, listing.VehicleId);
        return ServiceResult<bool>.Success(true);
    }

    // reject listing
    public async Task<ServiceResult<bool>> RejectListingAsync(int listingId, RejectListingRequest request, string currentUserId, CancellationToken ct = default)
    {
        var listing = await _db.VehicleListings
            .Include(l => l.Vehicle)
            .FirstOrDefaultAsync(l => l.ListingId == listingId, ct);

        if (listing == null)
            return ServiceResult<bool>.Fail("Không tìm thấy bài đăng xe.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        listing.ModerationStatus = ListingModerationStatuses.Hidden;
        listing.ModeratedBy = currentUserId;
        listing.ModeratedAt = now;
        listing.ModerationNote = request.ModerationNote.Trim();

        if (listing.Vehicle != null)
        {
            listing.Vehicle.Status = VehicleStatuses.Rejected;
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} từ chối tin đăng {ListingId}: {Reason}", currentUserId, listingId, request.ModerationNote);
        return ServiceResult<bool>.Success(true);
    }

    // hide listing
    public async Task<ServiceResult<bool>> HideListingAsync(int listingId, HideListingRequest request, string currentUserId, CancellationToken ct = default)
    {
        var listing = await _db.VehicleListings
            .Include(l => l.Vehicle)
            .FirstOrDefaultAsync(l => l.ListingId == listingId, ct);

        if (listing == null)
            return ServiceResult<bool>.Fail("Không tìm thấy bài đăng xe.", ErrorCodes.NotFound);

        var now = _clock.UtcNow;
        listing.ModerationStatus = ListingModerationStatuses.Hidden;
        listing.ModeratedBy = currentUserId;
        listing.ModeratedAt = now;
        listing.ModerationNote = request.Reason.Trim();

        if (listing.Vehicle != null)
        {
            listing.Vehicle.Status = VehicleStatuses.Removed;
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin {AdminId} gỡ / tạm ẩn tin đăng {ListingId}: {Reason}", currentUserId, listingId, request.Reason);
        return ServiceResult<bool>.Success(true);
    }
}
