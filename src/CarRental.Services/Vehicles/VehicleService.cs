using CarRental.Data;
using CarRental.Models.Common;
using CarRental.Models.Constants;
using CarRental.Models.DTOs.Vehicles;
using CarRental.Models.Entities;
using CarRental.Services.Abstractions;
using CarRental.Services.Availability;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Vehicles;

public class VehicleService : IVehicleService
{
    private readonly ApplicationDbContext _db;
    private readonly IVehicleAvailabilityService _availabilityService;
    private readonly IClock _clock;
    private readonly ILogger<VehicleService> _logger;

    public VehicleService(
        ApplicationDbContext db,
        IVehicleAvailabilityService availabilityService,
        IClock clock,
        ILogger<VehicleService> logger)
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

    public async Task<ServiceResult<PagedResult<VehicleCardDto>>> SearchVehiclesAsync(
        VehicleSearchFilter filter, CancellationToken ct = default)
    {
        try
        {
            var query = _db.Vehicles
                .AsNoTracking()
                .Where(v => v.Status == VehicleStatuses.Approved &&
                            v.Listings.Any(l => l.ModerationStatus == ListingModerationStatuses.Public));

            // 1. Lọc theo Thành phố / Tỉnh
            if (!string.IsNullOrWhiteSpace(filter.City))
            {
                var cleanCity = filter.City.Replace("TP.", "").Replace("Tỉnh", "").Trim();
                query = query.Where(v => v.Listings.Any(l =>
                    EF.Functions.Like(l.City, $"%{cleanCity}%") ||
                    EF.Functions.Like(l.Location, $"%{cleanCity}%")));
            }

            // 2. Lọc theo Quận / Huyện
            if (!string.IsNullOrWhiteSpace(filter.District))
            {
                var cleanDistrict = filter.District.Trim();
                query = query.Where(v => v.Listings.Any(l =>
                    EF.Functions.Like(l.District, $"%{cleanDistrict}%") ||
                    EF.Functions.Like(l.Location, $"%{cleanDistrict}%")));
            }

            // 3. Lọc theo Hãng xe
            if (!string.IsNullOrWhiteSpace(filter.Brand) && !filter.Brand.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                var brand = filter.Brand.Trim();
                query = query.Where(v => v.Brand.ToLower() == brand.ToLower());
            }

            // 4. Lọc theo Từ khóa (Model, Hãng, Địa điểm)
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var kw = filter.Keyword.Trim();
                query = query.Where(v =>
                    EF.Functions.Like(v.Brand, $"%{kw}%") ||
                    EF.Functions.Like(v.Model, $"%{kw}%") ||
                    v.Listings.Any(l => EF.Functions.Like(l.Location, $"%{kw}%") || EF.Functions.Like(l.Description, $"%{kw}%")));
            }

            // 5. Lọc theo Số chỗ
            if (filter.Seats.HasValue && filter.Seats.Value > 0)
            {
                if (filter.Seats.Value == 4 || filter.Seats.Value == 5)
                {
                    query = query.Where(v => v.Seats == 4 || v.Seats == 5);
                }
                else
                {
                    query = query.Where(v => v.Seats == filter.Seats.Value);
                }
            }

            // 6. Lọc theo Hộp số
            if (!string.IsNullOrWhiteSpace(filter.Transmission) && !filter.Transmission.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                var trans = filter.Transmission.Trim();
                query = query.Where(v => v.Transmission.ToLower() == trans.ToLower());
            }

            // 7. Lọc theo Nhiên liệu
            if (!string.IsNullOrWhiteSpace(filter.FuelType) && !filter.FuelType.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                var fuel = filter.FuelType.Trim();
                query = query.Where(v => v.FuelType.ToLower() == fuel.ToLower());
            }

            // 8. Lọc theo Khoảng giá
            if (filter.MinPrice.HasValue)
            {
                query = query.Where(v => v.Listings.Any(l => l.PricePerDay >= filter.MinPrice.Value));
            }
            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(v => v.Listings.Any(l => l.PricePerDay <= filter.MaxPrice.Value));
            }

            // Lấy danh sách ID xe bị bận nếu có khoảng ngày tìm kiếm
            var unavailableVehicleIds = new HashSet<int>();
            if (filter.StartDate.HasValue && filter.EndDate.HasValue && filter.EndDate > filter.StartDate)
            {
                var start = filter.StartDate.Value;
                var end = filter.EndDate.Value;

                var lockingStatuses = BookingStatuses.Locking.ToArray();

                var blockedIds = await _db.VehicleUnavailabilities.AsNoTracking()
                    .Where(x => x.StartDate < end && x.EndDate > start)
                    .Select(x => x.VehicleId)
                    .Distinct()
                    .ToListAsync(ct);

                var bookedIds = await _db.Bookings.AsNoTracking()
                    .Where(b => lockingStatuses.Contains(b.Status) && b.StartDate < end && b.EndDate > start)
                    .Select(b => b.VehicleId)
                    .Distinct()
                    .ToListAsync(ct);

                unavailableVehicleIds.UnionWith(blockedIds);
                unavailableVehicleIds.UnionWith(bookedIds);

                if (filter.OnlyAvailable)
                {
                    query = query.Where(v => !unavailableVehicleIds.Contains(v.VehicleId));
                }
            }

            var totalCount = await query.CountAsync(ct);

            // Sắp xếp
            query = filter.SortBy?.ToLower() switch
            {
                "price-asc" => query.OrderBy(v => v.Listings.OrderBy(l => l.PricePerDay).Select(l => l.PricePerDay).FirstOrDefault()),
                "price-desc" => query.OrderByDescending(v => v.Listings.OrderBy(l => l.PricePerDay).Select(l => l.PricePerDay).FirstOrDefault()),
                "popular" => query.OrderByDescending(v => v.Bookings.Count(b => b.Status == BookingStatuses.Completed)),
                _ => query.OrderByDescending(v => v.Bookings.SelectMany(b => b.Reviews).Where(r => r.IsPublic).Average(r => (double?)r.Rating) ?? 5.0)
                          .ThenByDescending(v => v.Bookings.Count(b => b.Status == BookingStatuses.Completed))
            };

            // Phân trang
            var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
            var pageSize = filter.PageSize < 1 ? 20 : (filter.PageSize > 100 ? 100 : filter.PageSize);

            var vehicles = await query
                .Include(v => v.Owner)
                .Include(v => v.Listings.Where(l => l.ModerationStatus == ListingModerationStatuses.Public))
                    .ThenInclude(l => l.Images)
                .Include(v => v.Bookings)
                    .ThenInclude(b => b.Reviews.Where(r => r.IsPublic))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            var items = vehicles.Select(v =>
            {
                var listing = v.Listings.FirstOrDefault(l => l.ModerationStatus == ListingModerationStatuses.Public)
                           ?? v.Listings.FirstOrDefault();

                var rawCover = listing?.Images.OrderBy(i => i.SortOrder).FirstOrDefault(i => i.IsCover)?.ImagePath
                            ?? listing?.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImagePath;
                var coverImage = ResolveImageUrl(rawCover, v.Brand, v.Model);

                var completedBookings = v.Bookings.Where(b => b.Status == BookingStatuses.Completed).ToList();
                var publicReviews = completedBookings.SelectMany(b => b.Reviews).Where(r => r.IsPublic).ToList();
                var rating = publicReviews.Any() ? Math.Round(publicReviews.Average(r => r.Rating), 1) : 5.0;

                return new VehicleCardDto
                {
                    VehicleId = v.VehicleId,
                    ListingId = listing?.ListingId ?? 0,
                    Name = $"{v.Brand} {v.Model} {v.Year}".ToUpperInvariant(),
                    Brand = v.Brand,
                    Model = v.Model,
                    Year = v.Year,
                    Seats = v.Seats,
                    Transmission = v.Transmission,
                    FuelType = v.FuelType,
                    PricePerDay = listing?.PricePerDay ?? 0,
                    Location = listing?.Location ?? string.Empty,
                    City = listing?.City ?? string.Empty,
                    District = listing?.District ?? string.Empty,
                    Latitude = listing?.Latitude,
                    Longitude = listing?.Longitude,
                    CoverImageUrl = coverImage,
                    Rating = rating,
                    TotalTrips = completedBookings.Count,
                    IsAvailable = !unavailableVehicleIds.Contains(v.VehicleId),
                    Status = v.Status,
                    ModerationStatus = listing?.ModerationStatus ?? string.Empty,
                    OwnerId = v.OwnerId,
                    OwnerName = v.Owner?.FullName ?? string.Empty
                };
            }).ToList();

            var paged = PagedResult<VehicleCardDto>.Create(items, totalCount, pageNumber, pageSize);
            return ServiceResult<PagedResult<VehicleCardDto>>.Success(paged);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi tìm kiếm xe");
            return ServiceResult<PagedResult<VehicleCardDto>>.Fail("Không thể tải danh sách xe lúc này. Vui lòng thử lại sau.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<VehicleDetailDto>> GetVehicleByIdAsync(
        int vehicleId, CancellationToken ct = default)
    {
        try
        {
            var v = await _db.Vehicles
                .AsNoTracking()
                .Include(x => x.Owner)
                .Include(x => x.Listings)
                    .ThenInclude(l => l.Images)
                .Include(x => x.Unavailabilities)
                .Include(x => x.Bookings)
                    .ThenInclude(b => b.Reviews.Where(r => r.IsPublic))
                .FirstOrDefaultAsync(x => x.VehicleId == vehicleId, ct);

            if (v == null)
                return ServiceResult<VehicleDetailDto>.Fail("Không tìm thấy thông tin xe.", ErrorCodes.NotFound);

            var listing = v.Listings.FirstOrDefault(l => l.ModerationStatus == ListingModerationStatuses.Public)
                       ?? v.Listings.OrderByDescending(l => l.ListingId).FirstOrDefault();

            var completedBookings = v.Bookings.Where(b => b.Status == BookingStatuses.Completed).ToList();
            var publicReviews = completedBookings.SelectMany(b => b.Reviews).Where(r => r.IsPublic).ToList();
            var rating = publicReviews.Any() ? Math.Round(publicReviews.Average(r => r.Rating), 1) : 5.0;

            var images = listing?.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new ListingImageDto
                {
                    ImageId = i.ImageId,
                    ImagePath = ResolveImageUrl(i.ImagePath, v.Brand, v.Model),
                    SortOrder = i.SortOrder,
                    IsCover = i.IsCover
                }).ToList() ?? new List<ListingImageDto>();

            var coverImage = images.FirstOrDefault(i => i.IsCover)?.ImagePath
                          ?? images.FirstOrDefault()?.ImagePath
                          ?? ResolveImageUrl(null, v.Brand, v.Model);

            var now = _clock.UtcNow;

            var blockedRanges = v.Unavailabilities
                .Where(u => u.EndDate >= now)
                .OrderBy(u => u.StartDate)
                .Select(u => new DateRangeDto
                {
                    StartDate = u.StartDate,
                    EndDate = u.EndDate,
                    Reason = u.Reason
                }).ToList();

            var lockingStatuses = BookingStatuses.Locking.ToArray();
            var bookedRanges = v.Bookings
                .Where(b => lockingStatuses.Contains(b.Status) && b.EndDate >= now)
                .OrderBy(b => b.StartDate)
                .Select(b => new DateRangeDto
                {
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    Reason = "Đã có khách đặt"
                }).ToList();

            var detail = new VehicleDetailDto
            {
                VehicleId = v.VehicleId,
                ListingId = listing?.ListingId ?? 0,
                Name = $"{v.Brand} {v.Model} {v.Year}".ToUpperInvariant(),
                Brand = v.Brand,
                Model = v.Model,
                Year = v.Year,
                Seats = v.Seats,
                Transmission = v.Transmission,
                FuelType = v.FuelType,
                PricePerDay = listing?.PricePerDay ?? 0,
                Location = listing?.Location ?? string.Empty,
                City = listing?.City ?? string.Empty,
                District = listing?.District ?? string.Empty,
                Latitude = listing?.Latitude,
                Longitude = listing?.Longitude,
                CoverImageUrl = coverImage,
                Rating = rating,
                TotalTrips = completedBookings.Count,
                IsAvailable = v.Status == VehicleStatuses.Approved && listing?.ModerationStatus == ListingModerationStatuses.Public,
                Status = v.Status,
                ModerationStatus = listing?.ModerationStatus ?? string.Empty,
                LicensePlate = v.LicensePlate,
                Description = listing?.Description ?? string.Empty,
                OwnerId = v.OwnerId,
                OwnerName = v.Owner?.FullName ?? string.Empty,
                OwnerPhoneNumber = v.Owner?.PhoneNumber ?? string.Empty,
                OwnerEmail = v.Owner?.Email ?? string.Empty,
                CreatedAt = listing?.CreatedAt ?? DateTime.UtcNow,
                Images = images,
                BlockedRanges = blockedRanges,
                BookedRanges = bookedRanges
            };

            return ServiceResult<VehicleDetailDto>.Success(detail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin chi tiết xe {VehicleId}", vehicleId);
            return ServiceResult<VehicleDetailDto>.Fail("Không thể lấy chi tiết xe lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<IReadOnlyList<VehicleCardDto>>> GetOwnerVehiclesAsync(
        string ownerId, CancellationToken ct = default)
    {
        try
        {
            var vehicles = await _db.Vehicles
                .AsNoTracking()
                .Where(v => v.OwnerId == ownerId && v.Status != VehicleStatuses.Removed)
                .Include(v => v.Owner)
                .Include(v => v.Listings)
                    .ThenInclude(l => l.Images)
                .Include(v => v.Bookings)
                    .ThenInclude(b => b.Reviews.Where(r => r.IsPublic))
                .OrderByDescending(v => v.VehicleId)
                .ToListAsync(ct);

            var dtos = vehicles.Select(v =>
            {
                var listing = v.Listings.OrderByDescending(l => l.ListingId).FirstOrDefault();
                var rawCover = listing?.Images.OrderBy(i => i.SortOrder).FirstOrDefault(i => i.IsCover)?.ImagePath
                            ?? listing?.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImagePath;
                var coverImage = ResolveImageUrl(rawCover, v.Brand, v.Model);

                var completedBookings = v.Bookings.Where(b => b.Status == BookingStatuses.Completed).ToList();
                var rating = completedBookings.SelectMany(b => b.Reviews).Where(r => r.IsPublic).Select(r => (double)r.Rating).DefaultIfEmpty(5.0).Average();

                return new VehicleCardDto
                {
                    VehicleId = v.VehicleId,
                    ListingId = listing?.ListingId ?? 0,
                    Name = $"{v.Brand} {v.Model} {v.Year}".ToUpperInvariant(),
                    Brand = v.Brand,
                    Model = v.Model,
                    Year = v.Year,
                    Seats = v.Seats,
                    Transmission = v.Transmission,
                    FuelType = v.FuelType,
                    PricePerDay = listing?.PricePerDay ?? 0,
                    Location = listing?.Location ?? string.Empty,
                    City = listing?.City ?? string.Empty,
                    District = listing?.District ?? string.Empty,
                    Latitude = listing?.Latitude,
                    Longitude = listing?.Longitude,
                    CoverImageUrl = coverImage,
                    Rating = Math.Round(rating, 1),
                    TotalTrips = completedBookings.Count,
                    IsAvailable = v.Status == VehicleStatuses.Approved && listing?.ModerationStatus == ListingModerationStatuses.Public,
                    Status = v.Status,
                    ModerationStatus = listing?.ModerationStatus ?? string.Empty,
                    OwnerId = v.OwnerId,
                    OwnerName = v.Owner?.FullName ?? string.Empty
                };
            }).ToList();

            return ServiceResult<IReadOnlyList<VehicleCardDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách xe của chủ xe {OwnerId}", ownerId);
            return ServiceResult<IReadOnlyList<VehicleCardDto>>.Fail("Không thể tải danh sách xe của bạn.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<VehicleDetailDto>> CreateVehicleAsync(
        string ownerId, CreateVehicleRequest request, CancellationToken ct = default)
    {
        try
        {
            // Kiểm tra biển số xe có bị trùng không
            var cleanPlate = request.LicensePlate.Trim().ToUpperInvariant();
            var plateExists = await _db.Vehicles
                .AnyAsync(v => v.LicensePlate == cleanPlate && v.Status != VehicleStatuses.Removed, ct);

            if (plateExists)
            {
                return ServiceResult<VehicleDetailDto>.Fail(
                    $"Biển số xe '{cleanPlate}' đã được đăng ký trên hệ thống.", ErrorCodes.Conflict);
            }

            var vehicle = new Vehicle
            {
                OwnerId = ownerId,
                LicensePlate = cleanPlate,
                Brand = request.Brand.Trim(),
                Model = request.Model.Trim(),
                Year = request.Year,
                Seats = request.Seats,
                Transmission = request.Transmission.Trim(),
                FuelType = request.FuelType.Trim(),
                Status = VehicleStatuses.PendingApproval
            };

            // Giấy tờ xe nếu có
            if (!string.IsNullOrEmpty(request.RegistrationCertImage) ||
                !string.IsNullOrEmpty(request.InsuranceImage) ||
                !string.IsNullOrEmpty(request.InspectionCertImage))
            {
                vehicle.Document = new VehicleDocument
                {
                    RegistrationCertImage = request.RegistrationCertImage ?? string.Empty,
                    InsuranceImage = request.InsuranceImage ?? string.Empty,
                    InsuranceExpiryDate = request.InsuranceExpiryDate ?? DateOnly.FromDateTime(_clock.UtcNow.AddYears(1)),
                    InspectionCertImage = request.InspectionCertImage ?? string.Empty,
                    InspectionExpiryDate = request.InspectionExpiryDate ?? DateOnly.FromDateTime(_clock.UtcNow.AddYears(1))
                };
            }

            // Tin đăng xe
            var listing = new VehicleListing
            {
                Vehicle = vehicle,
                PricePerDay = request.PricePerDay,
                Location = request.Location.Trim(),
                City = request.City.Trim(),
                District = request.District.Trim(),
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Description = request.Description?.Trim() ?? string.Empty,
                ModerationStatus = ListingModerationStatuses.PendingApproval,
                CreatedAt = _clock.UtcNow
            };

            // Ảnh xe
            if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                for (int i = 0; i < request.ImageUrls.Count; i++)
                {
                    listing.Images.Add(new ListingImage
                    {
                        ImagePath = request.ImageUrls[i].Trim(),
                        SortOrder = i + 1,
                        IsCover = i == 0
                    });
                }
            }

            _db.Vehicles.Add(vehicle);
            _db.VehicleListings.Add(listing);
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("Chủ xe {OwnerId} đã đăng ký xe mới {VehicleId} ({Plate})", ownerId, vehicle.VehicleId, cleanPlate);

            return await GetVehicleByIdAsync(vehicle.VehicleId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo xe mới cho chủ xe {OwnerId}", ownerId);
            return ServiceResult<VehicleDetailDto>.Fail("Không thể đăng ký xe mới lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<VehicleDetailDto>> UpdateVehicleAsync(
        int vehicleId, string ownerId, UpdateVehicleRequest request, CancellationToken ct = default)
    {
        try
        {
            var vehicle = await _db.Vehicles
                .Include(v => v.Listings)
                    .ThenInclude(l => l.Images)
                .FirstOrDefaultAsync(v => v.VehicleId == vehicleId, ct);

            if (vehicle == null || vehicle.Status == VehicleStatuses.Removed)
                return ServiceResult<VehicleDetailDto>.Fail("Không tìm thấy xe.", ErrorCodes.NotFound);

            if (vehicle.OwnerId != ownerId)
                return ServiceResult<VehicleDetailDto>.Fail("Bạn không có quyền chỉnh sửa xe này.", ErrorCodes.Forbidden);

            var listing = vehicle.Listings.OrderByDescending(l => l.ListingId).FirstOrDefault();
            if (listing == null)
            {
                listing = new VehicleListing
                {
                    VehicleId = vehicleId,
                    CreatedAt = _clock.UtcNow,
                    ModerationStatus = ListingModerationStatuses.PendingApproval
                };
                _db.VehicleListings.Add(listing);
            }

            if (request.PricePerDay.HasValue) listing.PricePerDay = request.PricePerDay.Value;
            if (!string.IsNullOrWhiteSpace(request.City)) listing.City = request.City.Trim();
            if (!string.IsNullOrWhiteSpace(request.District)) listing.District = request.District.Trim();
            if (!string.IsNullOrWhiteSpace(request.Location)) listing.Location = request.Location.Trim();
            if (request.Latitude.HasValue) listing.Latitude = request.Latitude.Value;
            if (request.Longitude.HasValue) listing.Longitude = request.Longitude.Value;
            if (request.Description != null) listing.Description = request.Description.Trim();

            if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                _db.ListingImages.RemoveRange(listing.Images);
                listing.Images.Clear();
                for (int i = 0; i < request.ImageUrls.Count; i++)
                {
                    listing.Images.Add(new ListingImage
                    {
                        ImagePath = request.ImageUrls[i].Trim(),
                        SortOrder = i + 1,
                        IsCover = i == 0
                    });
                }
            }

            await _db.SaveChangesAsync(ct);
            return await GetVehicleByIdAsync(vehicleId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật xe {VehicleId}", vehicleId);
            return ServiceResult<VehicleDetailDto>.Fail("Không thể cập nhật xe lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult> DeleteVehicleAsync(
        int vehicleId, string ownerId, CancellationToken ct = default)
    {
        try
        {
            var vehicle = await _db.Vehicles
                .Include(v => v.Listings)
                .Include(v => v.Bookings)
                .FirstOrDefaultAsync(v => v.VehicleId == vehicleId, ct);

            if (vehicle == null || vehicle.Status == VehicleStatuses.Removed)
                return ServiceResult.Fail("Không tìm thấy xe.", ErrorCodes.NotFound);

            if (vehicle.OwnerId != ownerId)
                return ServiceResult.Fail("Bạn không có quyền xóa xe này.", ErrorCodes.Forbidden);

            // Kiểm tra các đơn thuê đang khóa lịch
            var lockingStatuses = BookingStatuses.Locking.ToArray();
            var hasActiveBookings = vehicle.Bookings.Any(b => lockingStatuses.Contains(b.Status));
            if (hasActiveBookings)
            {
                return ServiceResult.Fail(
                    "Không thể gỡ xe đang có đơn thuê chờ duyệt hoặc đang được thuê.", ErrorCodes.InvalidState);
            }

            vehicle.Status = VehicleStatuses.Removed;
            foreach (var l in vehicle.Listings)
            {
                l.ModerationStatus = ListingModerationStatuses.Hidden;
            }

            await _db.SaveChangesAsync(ct);
            return ServiceResult.Success("Đã gỡ xe thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa xe {VehicleId}", vehicleId);
            return ServiceResult.Fail("Không thể gỡ xe lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult> SetVehicleStatusAsync(
        int vehicleId, string newStatus, string? note = null, CancellationToken ct = default)
    {
        try
        {
            if (!VehicleStatuses.All.Contains(newStatus))
                return ServiceResult.Fail("Trạng thái xe không hợp lệ.", ErrorCodes.Validation);

            var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.VehicleId == vehicleId, ct);
            if (vehicle == null)
                return ServiceResult.Fail("Không tìm thấy xe.", ErrorCodes.NotFound);

            vehicle.Status = newStatus;
            await _db.SaveChangesAsync(ct);
            return ServiceResult.Success($"Đã cập nhật trạng thái xe thành '{newStatus}'.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật trạng thái xe {VehicleId}", vehicleId);
            return ServiceResult.Fail("Không thể cập nhật trạng thái xe lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult> SetListingModerationStatusAsync(
        int listingId, string newStatus, string? note = null, CancellationToken ct = default)
    {
        try
        {
            if (!ListingModerationStatuses.All.Contains(newStatus))
                return ServiceResult.Fail("Trạng thái kiểm duyệt tin không hợp lệ.", ErrorCodes.Validation);

            var listing = await _db.VehicleListings.FirstOrDefaultAsync(l => l.ListingId == listingId, ct);
            if (listing == null)
                return ServiceResult.Fail("Không tìm thấy tin đăng xe.", ErrorCodes.NotFound);

            listing.ModerationStatus = newStatus;
            listing.ModerationNote = note;
            listing.ModeratedAt = _clock.UtcNow;

            await _db.SaveChangesAsync(ct);
            return ServiceResult.Success($"Đã cập nhật trạng thái tin đăng thành '{newStatus}'.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật trạng thái tin đăng {ListingId}", listingId);
            return ServiceResult.Fail("Không thể cập nhật trạng thái tin đăng lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<int>> AddUnavailabilityAsync(
        int vehicleId, string ownerId, SetUnavailabilityRequest request, CancellationToken ct = default)
    {
        try
        {
            if (request.EndDate <= request.StartDate)
                return ServiceResult<int>.Fail("Ngày kết thúc phải sau ngày bắt đầu.", ErrorCodes.Validation);

            var vehicle = await _db.Vehicles
                .Include(v => v.Bookings)
                .FirstOrDefaultAsync(v => v.VehicleId == vehicleId, ct);

            if (vehicle == null || vehicle.Status == VehicleStatuses.Removed)
                return ServiceResult<int>.Fail("Không tìm thấy xe.", ErrorCodes.NotFound);

            if (vehicle.OwnerId != ownerId)
                return ServiceResult<int>.Fail("Bạn không có quyền khóa lịch của xe này.", ErrorCodes.Forbidden);

            // Kiểm tra trùng với các đơn đã được duyệt hoặc đang chờ
            var lockingStatuses = BookingStatuses.Locking.ToArray();
            var hasConflict = vehicle.Bookings.Any(b =>
                lockingStatuses.Contains(b.Status) &&
                b.StartDate < request.EndDate &&
                b.EndDate > request.StartDate);

            if (hasConflict)
            {
                return ServiceResult<int>.Fail(
                    "Khoảng thời gian này đã có đơn thuê đặt trước. Không thể khóa lịch.", ErrorCodes.Conflict);
            }

            var unavailability = new VehicleUnavailability
            {
                VehicleId = vehicleId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Reason = request.Reason?.Trim()
            };

            _db.VehicleUnavailabilities.Add(unavailability);
            await _db.SaveChangesAsync(ct);

            return ServiceResult<int>.Success(unavailability.UnavailabilityId, "Đã khóa lịch xe thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi thêm lịch bận cho xe {VehicleId}", vehicleId);
            return ServiceResult<int>.Fail("Không thể khóa lịch lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult> RemoveUnavailabilityAsync(
        int unavailabilityId, string ownerId, CancellationToken ct = default)
    {
        try
        {
            var item = await _db.VehicleUnavailabilities
                .Include(u => u.Vehicle)
                .FirstOrDefaultAsync(u => u.UnavailabilityId == unavailabilityId, ct);

            if (item == null)
                return ServiceResult.Fail("Không tìm thấy khoảng lịch bận.", ErrorCodes.NotFound);

            if (item.Vehicle.OwnerId != ownerId)
                return ServiceResult.Fail("Bạn không có quyền mở khóa lịch này.", ErrorCodes.Forbidden);

            _db.VehicleUnavailabilities.Remove(item);
            await _db.SaveChangesAsync(ct);

            return ServiceResult.Success("Đã mở khóa lịch thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa lịch bận {UnavailabilityId}", unavailabilityId);
            return ServiceResult.Fail("Không thể mở khóa lịch lúc này.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<IReadOnlyList<CitySummaryDto>>> GetAvailableCitiesAsync(
        CancellationToken ct = default)
    {
        try
        {
            var summaries = await _db.VehicleListings
                .AsNoTracking()
                .Where(l => l.ModerationStatus == ListingModerationStatuses.Public &&
                            l.Vehicle.Status == VehicleStatuses.Approved)
                .GroupBy(l => l.City)
                .Select(g => new CitySummaryDto
                {
                    City = g.Key,
                    CarCount = g.Count()
                })
                .OrderByDescending(x => x.CarCount)
                .ToListAsync(ct);

            return ServiceResult<IReadOnlyList<CitySummaryDto>>.Success(summaries);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách thành phố");
            return ServiceResult<IReadOnlyList<CitySummaryDto>>.Fail("Không thể lấy danh sách thành phố.", ErrorCodes.Unexpected);
        }
    }

    public async Task<ServiceResult<IReadOnlyList<string>>> GetAvailableBrandsAsync(
        CancellationToken ct = default)
    {
        try
        {
            var brands = await _db.Vehicles
                .AsNoTracking()
                .Where(v => v.Status == VehicleStatuses.Approved &&
                            v.Listings.Any(l => l.ModerationStatus == ListingModerationStatuses.Public))
                .Select(v => v.Brand)
                .Distinct()
                .OrderBy(b => b)
                .ToListAsync(ct);

            return ServiceResult<IReadOnlyList<string>>.Success(brands);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách hãng xe");
            return ServiceResult<IReadOnlyList<string>>.Fail("Không thể lấy danh sách hãng xe.", ErrorCodes.Unexpected);
        }
    }
}
