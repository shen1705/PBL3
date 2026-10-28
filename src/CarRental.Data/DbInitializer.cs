using System.Globalization;
using System.Security.Claims;
using CarRental.Models.Constants;
using CarRental.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CarRental.Data;

public static class DbInitializer
{
    private const string SeedPassword = "Test@12345";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await db.Database.MigrateAsync();

        foreach (var role in RoleNames.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                Check(await roleManager.CreateAsync(new IdentityRole(role)));
        }

        var users = await SeedUsersAsync(db, userManager);
        await SeedSettingsAndBankAsync(db, users);
        await SeedVehiclesAndBookingsAsync(db, users);
    }

    private static void Check(IdentityResult r)
    {
        if (!r.Succeeded)
            throw new InvalidOperationException(string.Join("; ", r.Errors.Select(e => e.Description)));
    }

    // ---------- Danh sách tài khoản: Renter, Owner, Staff, Admin ----------
    private static async Task<Dictionary<string, ApplicationUser>> SeedUsersAsync(
        ApplicationDbContext db, UserManager<ApplicationUser> um)
    {
        var specs = new (string Key, string Name, bool Female, string Phone, string[] Roles)[]
        {
            ("renter1", "Nguyễn Văn An",   false, "0900000001", new[] { RoleNames.Renter }),
            ("renter2", "Trần Thị Bình",   true,  "0900000002", new[] { RoleNames.Renter }),
            ("renter3", "Lê Minh Cường",   false, "0900000003", new[] { RoleNames.Renter }),
            ("renter4", "Đỗ Thị Mai",      true,  "0900000011", new[] { RoleNames.Renter }),
            ("owner1",  "Phạm Quốc Dũng",  false, "0900000004", new[] { RoleNames.Renter, RoleNames.Owner }),
            ("owner2",  "Hoàng Thị Em",    true,  "0900000005", new[] { RoleNames.Renter, RoleNames.Owner }),
            ("owner3",  "Võ Văn Phúc",     false, "0900000006", new[] { RoleNames.Renter, RoleNames.Owner }),
            ("owner4",  "Lê Hoàng Duy",    false, "0900000012", new[] { RoleNames.Renter, RoleNames.Owner }),
            ("staff1",  "Đặng Thu Hà",     true,  "0900000007", new[] { RoleNames.Admin }),
            ("staff2",  "Bùi Văn Khoa",    false, "0900000008", new[] { RoleNames.Admin }),
            ("admin1",  "Quản trị Một",    false, "0900000009", new[] { RoleNames.Admin }),
            ("admin2",  "Quản trị Hai",    true,  "0900000010", new[] { RoleNames.Admin }),
        };

        var result = new Dictionary<string, ApplicationUser>();
        foreach (var s in specs)
        {
            var email = $"{s.Key}@carrental.test";
            var user = await um.FindByEmailAsync(email);
            if (user == null)
            {
                user = await um.FindByNameAsync(s.Key);
            }
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = s.Key,
                    Email = email,
                    EmailConfirmed = true,
                    FullName = s.Name,
                    Gender = s.Female,
                    PhoneNumber = s.Phone
                };
                Check(await um.CreateAsync(user, SeedPassword));
                Check(await um.AddToRolesAsync(user, s.Roles));

                // Admin = có thêm 2 claim; Staff thì không có
                if (s.Key.StartsWith("admin"))
                {
                    Check(await um.AddClaimAsync(user, new Claim(AppClaimTypes.CanManageSystemConfig, AppClaimTypes.GrantedValue)));
                    Check(await um.AddClaimAsync(user, new Claim(AppClaimTypes.CanManageAdminAccounts, AppClaimTypes.GrantedValue)));
                }
            }
            result[s.Key] = user;
        }

        var now = DateTime.UtcNow;
        foreach (var (key, user) in result)
        {
            var isRenterOrOwner = key.StartsWith("renter") || key.StartsWith("owner");
            if (isRenterOrOwner && !await db.DriverLicenses.AnyAsync(x => x.UserId == user.Id))
            {
                db.DriverLicenses.Add(new DriverLicense
                {
                    UserId = user.Id,
                    LicenseNumber = $"GPLX-{key.ToUpper()}",
                    LicenseClass = "B2",
                    ExpiryDate = DateOnly.FromDateTime(now.AddYears(5)),
                    ImageFront = $"seed/license-{key}.jpg"
                });
            }

            if (key.StartsWith("owner") && !await db.OwnerProfiles.AnyAsync(x => x.UserId == user.Id))
            {
                var isPending = key == "owner4";
                db.OwnerProfiles.Add(new OwnerProfile
                {
                    UserId = user.Id,
                    CccdNumber = $"00109900000{key[^1]}",
                    CccdImageFront = $"seed/cccd-{key}-front.jpg",
                    CccdImageBack = $"seed/cccd-{key}-back.jpg",
                    ApprovalStatus = isPending ? OwnerApprovalStatuses.Pending : OwnerApprovalStatuses.Approved,
                    AccessStatus = isPending ? OwnerAccessStatuses.Inactive : OwnerAccessStatuses.Active,
                    SubmittedAt = isPending ? now.AddDays(-2) : now.AddDays(-30),
                    ReviewedBy = isPending ? null : result["staff1"].Id,
                    ReviewedAt = isPending ? null : now.AddDays(-29)
                });
            }
        }

        // Xử phạt mẫu: renter4 bị tạm khóa 7 ngày
        if (!await db.AccountSanctions.AnyAsync())
        {
            var renter4 = result["renter4"];
            var staff1 = result["staff1"];
            db.AccountSanctions.Add(new AccountSanction
            {
                UserId = renter4.Id,
                SanctionType = SanctionTypes.Suspend7d,
                Reason = "Hủy chuyến sát giờ và vi phạm quy định bàn giao xe",
                IssuedBy = staff1.Id,
                IssuedAt = now.AddDays(-1),
                ExpiresAt = now.AddDays(6)
            });
        }

        await db.SaveChangesAsync();
        return result;
    }

    // ---------- Cấu hình hoa hồng + tài khoản ngân hàng giả lập ----------
    private static async Task SeedSettingsAndBankAsync(
        ApplicationDbContext db, Dictionary<string, ApplicationUser> users)
    {
        if (!await db.SystemSettings.AnyAsync(x => x.SettingKey == SettingKeys.CommissionRate))
        {
            db.SystemSettings.Add(new SystemSetting
            {
                SettingKey = SettingKeys.CommissionRate,
                SettingValue = BusinessRules.DefaultCommissionRate.ToString(CultureInfo.InvariantCulture),
                UpdatedBy = users["admin1"].Id
            });
        }

        if (!await db.MockBankAccounts.AnyAsync(x => x.AccountNumber == "ESCROW-0001"))
        {
            db.MockBankAccounts.Add(new MockBankAccount
            {
                UserId = null,
                AccountType = MockAccountTypes.PlatformEscrow,
                AccountNumber = "ESCROW-0001"
            });
        }

        foreach (var (key, user) in users.Where(x => x.Key.StartsWith("renter") || x.Key.StartsWith("owner")))
        {
            var accNum = $"MOCK-{key.ToUpper()}";
            if (!await db.MockBankAccounts.AnyAsync(x => x.AccountNumber == accNum || x.UserId == user.Id))
            {
                db.MockBankAccounts.Add(new MockBankAccount
                {
                    UserId = user.Id,
                    AccountNumber = accNum
                });
            }
        }

        await db.SaveChangesAsync();
    }

    // ---------- Xe, Tin đăng, Lịch khóa, Đơn thuê, Bàn giao, Thanh toán, Đánh giá & Khiếu nại ----------
    private static async Task SeedVehiclesAndBookingsAsync(
        ApplicationDbContext db, Dictionary<string, ApplicationUser> u)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;

        var specs = new (string Key, string Owner, string Plate, string Brand, string Model, int Year,
                         int Seats, string Gearbox, string Fuel, decimal Price, string City, string District,
                         decimal Lat, decimal Lng, string VehStatus, string ModStatus)[]
        {
            // Hà Nội
            ("V1",  "owner1", "30A-123.45", "Toyota",     "Vios",          2022, 5,  "Automatic", "Gasoline",   700_000m, "Hà Nội",        "Cầu Giấy",      21.0333m, 105.7944m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V2",  "owner1", "30E-234.56", "Hyundai",    "Accent",        2021, 5,  "Manual",    "Gasoline",   600_000m, "Hà Nội",        "Ba Đình",       21.0341m, 105.8239m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V3",  "owner2", "30F-345.67", "Mazda",      "CX-5",          2023, 5,  "Automatic", "Gasoline", 1_100_000m, "Hà Nội",        "Hai Bà Trưng",  21.0069m, 105.8524m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V4",  "owner2", "30G-456.78", "VinFast",    "VF 8",          2023, 5,  "Automatic", "Electric", 1_300_000m, "Hà Nội",        "Nam Từ Liêm",   21.0175m, 105.7840m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V5",  "owner3", "29A-567.89", "Ford",       "Transit",       2020, 16, "Manual",    "Diesel",   1_500_000m, "Hà Nội",        "Long Biên",     21.0362m, 105.8920m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V6",  "owner3", "29B-678.90", "Kia",        "Morning",       2019, 4,  "Manual",    "Gasoline",   450_000m, "Hà Nội",        "Đống Đa",       21.0180m, 105.8270m, VehicleStatuses.Approved,        ListingModerationStatuses.Hidden),

            // TP. Đà Nẵng (Khớp giao diện người dùng và bộ lọc địa điểm)
            ("V7",  "owner1", "43A-111.22", "Toyota",     "Corolla Cross", 2023, 5,  "Automatic", "Gasoline",   950_000m, "TP. Đà Nẵng",   "Hải Châu",      16.0544m, 108.2022m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V8",  "owner1", "43A-222.33", "Mitsubishi", "Xpander",       2023, 7,  "Automatic", "Gasoline",   850_000m, "TP. Đà Nẵng",   "Liên Chiểu",    16.0712m, 108.1518m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V9",  "owner2", "43B-333.44", "VinFast",    "VF e34",        2023, 5,  "Automatic", "Electric",   750_000m, "TP. Đà Nẵng",   "Sơn Trà",       16.0601m, 108.2394m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V10", "owner2", "43C-444.55", "Honda",      "City",          2022, 5,  "Automatic", "Gasoline",   650_000m, "TP. Đà Nẵng",   "Thanh Khê",     16.0620m, 108.1830m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V11", "owner3", "43D-555.66", "Hyundai",    "Santa Fe",      2023, 7,  "Automatic", "Diesel",   1_400_000m, "TP. Đà Nẵng",   "Cẩm Lệ",        16.0180m, 108.2160m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V12", "owner3", "43E-666.77", "Kia",        "Carnival",      2024, 7,  "Automatic", "Diesel",   1_600_000m, "TP. Đà Nẵng",   "Ngũ Hành Sơn",  16.0290m, 108.2520m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),

            // TP. Hồ Chí Minh
            ("V13", "owner1", "51F-777.88", "Toyota",     "Vios",          2023, 5,  "Automatic", "Gasoline",   650_000m, "TP. Hồ Chí Minh", "Quận 1",         10.7769m, 106.7009m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V14", "owner2", "51G-888.99", "Mazda",      "CX-30",         2023, 5,  "Automatic", "Gasoline",   850_000m, "TP. Hồ Chí Minh", "Bình Thạnh",     10.8031m, 106.6944m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
            ("V15", "owner3", "51H-999.00", "Honda",      "CR-V",          2023, 7,  "Automatic", "Gasoline", 1_200_000m, "TP. Hồ Chí Minh", "Quận 7",         10.7327m, 106.7188m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),

            // Xe chờ duyệt (Owner4 - kiểm tra hàng đợi duyệt xe của Staff/Admin)
            ("V16", "owner4", "43A-999.88", "VinFast",    "VF 5 Plus",     2024, 5,  "Automatic", "Electric",   550_000m, "TP. Đà Nẵng",   "Hải Châu",      16.0600m, 108.2100m, VehicleStatuses.PendingApproval, ListingModerationStatuses.PendingApproval),
        };

        var listings = new Dictionary<string, VehicleListing>();
        var n = 0;
        foreach (var s in specs)
        {
            n++;
            var existingVehicle = await db.Vehicles
                .Include(v => v.Listings)
                .ThenInclude(l => l.Images)
                .FirstOrDefaultAsync(v => v.LicensePlate == s.Plate);

            if (existingVehicle == null)
            {
                var vehicle = new Vehicle
                {
                    Owner = u[s.Owner],
                    LicensePlate = s.Plate,
                    Brand = s.Brand,
                    Model = s.Model,
                    Year = s.Year,
                    Seats = s.Seats,
                    Transmission = s.Gearbox,
                    FuelType = s.Fuel,
                    Status = s.VehStatus,
                    Document = new VehicleDocument
                    {
                        RegistrationCertImage = $"seed/reg{n}.jpg",
                        InsuranceImage = $"seed/ins{n}.jpg",
                        InsuranceExpiryDate = DateOnly.FromDateTime(today.AddYears(1)),
                        InspectionCertImage = $"seed/insp{n}.jpg",
                        InspectionExpiryDate = DateOnly.FromDateTime(today.AddYears(1))
                    }
                };

                var listing = new VehicleListing
                {
                    Vehicle = vehicle,
                    PricePerDay = s.Price,
                    Location = $"{s.District}, {s.City}",
                    City = s.City,
                    District = s.District,
                    Latitude = s.Lat,
                    Longitude = s.Lng,
                    Description = $"{s.Brand} {s.Model} đời {s.Year}, xe gia đình giữ gìn sạch sẽ, bảo dưỡng định kỳ.",
                    ModerationStatus = s.ModStatus,
                    ModeratedBy = s.ModStatus == ListingModerationStatuses.Public ? u["staff1"].Id : null,
                    ModeratedAt = s.ModStatus == ListingModerationStatuses.Public ? now : null,
                    Images = Enumerable.Range(1, 3)
                        .Select(i => new ListingImage { ImagePath = $"seed/car{n}-{i}.jpg", SortOrder = i, IsCover = i == 1 })
                        .ToList()
                };
                listings[s.Key] = listing;
                db.VehicleListings.Add(listing);
            }
            else
            {
                var firstListing = existingVehicle.Listings.FirstOrDefault();
                if (firstListing != null)
                {
                    firstListing.Latitude ??= s.Lat;
                    firstListing.Longitude ??= s.Lng;
                    if (string.IsNullOrEmpty(firstListing.City)) firstListing.City = s.City;
                    listings[s.Key] = firstListing;
                }
            }
        }

        await db.SaveChangesAsync();

        // Cập nhật lại từ DB để đảm bảo có đầy đủ ID
        foreach (var s in specs)
        {
            if (!listings.ContainsKey(s.Key))
            {
                var lst = await db.VehicleListings
                    .Include(l => l.Vehicle)
                    .FirstOrDefaultAsync(l => l.Vehicle.LicensePlate == s.Plate);
                if (lst != null) listings[s.Key] = lst;
            }
        }

        // Khóa lịch chủ xe mẫu
        if (listings.TryGetValue("V5", out var v5Listing) &&
            !await db.VehicleUnavailabilities.AnyAsync(x => x.VehicleId == v5Listing.VehicleId))
        {
            db.VehicleUnavailabilities.Add(new VehicleUnavailability
            {
                VehicleId = v5Listing.VehicleId,
                StartDate = today.AddDays(15),
                EndDate = today.AddDays(20),
                Reason = "Chủ xe bảo dưỡng định kỳ (dữ liệu thử)"
            });
        }

        if (listings.TryGetValue("V11", out var v11Listing) &&
            !await db.VehicleUnavailabilities.AnyAsync(x => x.VehicleId == v11Listing.VehicleId))
        {
            db.VehicleUnavailabilities.Add(new VehicleUnavailability
            {
                VehicleId = v11Listing.VehicleId,
                StartDate = today.AddDays(25),
                EndDate = today.AddDays(28),
                Reason = "Chủ xe bận công tác (dữ liệu thử)"
            });
        }

        // Tạo đơn thuê nếu chưa có
        if (!await db.Bookings.AnyAsync())
        {
            void AddBooking(string renterKey, string vehicleKey, int fromDay, int toDay, string status)
            {
                if (!listings.TryGetValue(vehicleKey, out var listing)) return;

                var renter = u[renterKey];
                var start = today.AddDays(fromDay);
                var end = today.AddDays(toDay);
                var days = toDay - fromDay;
                var total = listing.PricePerDay * days;
                var deposit = total * BusinessRules.DepositRate;
                var created = fromDay < 0 ? start.AddDays(-5) : now.AddDays(-1);

                var hold = new DepositHold
                {
                    Renter = renter,
                    Listing = listing,
                    StartDate = start,
                    EndDate = end,
                    RentalDays = days,
                    PriceLockedTotal = total,
                    DepositAmount = deposit,
                    Status = DepositHoldStatuses.Converted,
                    CreatedAt = created
                };
                var booking = new Booking
                {
                    Renter = renter,
                    Listing = listing,
                    Vehicle = listing.Vehicle,
                    SourceHold = hold,
                    StartDate = start,
                    EndDate = end,
                    RentalDays = days,
                    Status = status,
                    PriceLockedTotal = total,
                    DepositAmount = deposit,
                    CreatedAt = created,
                    ResponseDeadline = created.AddHours(BusinessRules.ResponseDeadlineHours)
                };

                if (status is BookingStatuses.Accepted or BookingStatuses.Ongoing or BookingStatuses.Completed)
                {
                    booking.RespondedAt = created.AddHours(2);
                    booking.AcceptedAt = created.AddHours(2);
                }
                if (status == BookingStatuses.Rejected)
                {
                    booking.RespondedAt = created.AddHours(2);
                    booking.RejectReason = "Xe đã có lịch (dữ liệu thử)";
                }
                if (status == BookingStatuses.Cancelled)
                {
                    booking.CancelledAt = created.AddHours(3);
                    booking.CancelledBy = renter.Id;
                    booking.CancelReason = "Đổi kế hoạch (dữ liệu thử)";
                }
                if (status == BookingStatuses.Completed)
                {
                    booking.CompletedAt = end;
                }

                db.Bookings.Add(booking);
            }

            // Hà Nội bookings
            AddBooking("renter1", "V1",   3,   6, BookingStatuses.Accepted);
            AddBooking("renter2", "V1",  10,  12, BookingStatuses.Pending);
            AddBooking("renter3", "V1", -10,  -7, BookingStatuses.Completed);

            AddBooking("renter1", "V2",   3,   6, BookingStatuses.Cancelled);
            AddBooking("renter2", "V2",  -5,  -3, BookingStatuses.Expired);
            AddBooking("renter3", "V2",  12,  14, BookingStatuses.Rejected);

            AddBooking("renter1", "V3",  -1,   2, BookingStatuses.Ongoing);
            AddBooking("renter2", "V3",   2,   4, BookingStatuses.Accepted);

            AddBooking("renter3", "V5",   7,   9, BookingStatuses.Accepted);

            // Đà Nẵng bookings
            AddBooking("renter1", "V7", -15, -12, BookingStatuses.Completed);
            AddBooking("renter2", "V8",   1,   5, BookingStatuses.Accepted);
            AddBooking("renter3", "V9",  -4,  -1, BookingStatuses.Completed);

            await db.SaveChangesAsync();
        }

        // Bàn giao xe (HandoverConfirmations)
        if (!await db.HandoverConfirmations.AnyAsync())
        {
            var bV1Completed = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Completed && b.Vehicle.LicensePlate == "30A-123.45");
            var bV3Ongoing = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Ongoing && b.Vehicle.LicensePlate == "30F-345.67");
            var bV7Completed = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Completed && b.Vehicle.LicensePlate == "43A-111.22");
            var bV9Completed = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Completed && b.Vehicle.LicensePlate == "43B-333.44");

            if (bV1Completed != null)
            {
                var owner1 = u["owner1"];
                db.HandoverConfirmations.AddRange(
                    new HandoverConfirmation { BookingId = bV1Completed.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = bV1Completed.RenterId, ConfirmedAt = bV1Completed.StartDate },
                    new HandoverConfirmation { BookingId = bV1Completed.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = owner1.Id, ConfirmedAt = bV1Completed.StartDate.AddMinutes(5) },
                    new HandoverConfirmation { BookingId = bV1Completed.BookingId, Type = HandoverTypes.Return, ConfirmedBy = bV1Completed.RenterId, ConfirmedAt = bV1Completed.EndDate },
                    new HandoverConfirmation { BookingId = bV1Completed.BookingId, Type = HandoverTypes.Return, ConfirmedBy = owner1.Id, ConfirmedAt = bV1Completed.EndDate.AddMinutes(10) }
                );
            }

            if (bV3Ongoing != null)
            {
                var owner2 = u["owner2"];
                db.HandoverConfirmations.AddRange(
                    new HandoverConfirmation { BookingId = bV3Ongoing.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = bV3Ongoing.RenterId, ConfirmedAt = bV3Ongoing.StartDate },
                    new HandoverConfirmation { BookingId = bV3Ongoing.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = owner2.Id, ConfirmedAt = bV3Ongoing.StartDate.AddMinutes(5) }
                );
            }

            if (bV7Completed != null)
            {
                var owner1 = u["owner1"];
                db.HandoverConfirmations.AddRange(
                    new HandoverConfirmation { BookingId = bV7Completed.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = bV7Completed.RenterId, ConfirmedAt = bV7Completed.StartDate },
                    new HandoverConfirmation { BookingId = bV7Completed.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = owner1.Id, ConfirmedAt = bV7Completed.StartDate.AddMinutes(5) },
                    new HandoverConfirmation { BookingId = bV7Completed.BookingId, Type = HandoverTypes.Return, ConfirmedBy = bV7Completed.RenterId, ConfirmedAt = bV7Completed.EndDate },
                    new HandoverConfirmation { BookingId = bV7Completed.BookingId, Type = HandoverTypes.Return, ConfirmedBy = owner1.Id, ConfirmedAt = bV7Completed.EndDate.AddMinutes(10) }
                );
            }

            if (bV9Completed != null)
            {
                var owner2 = u["owner2"];
                db.HandoverConfirmations.AddRange(
                    new HandoverConfirmation { BookingId = bV9Completed.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = bV9Completed.RenterId, ConfirmedAt = bV9Completed.StartDate },
                    new HandoverConfirmation { BookingId = bV9Completed.BookingId, Type = HandoverTypes.Pickup, ConfirmedBy = owner2.Id, ConfirmedAt = bV9Completed.StartDate.AddMinutes(5) },
                    new HandoverConfirmation { BookingId = bV9Completed.BookingId, Type = HandoverTypes.Return, ConfirmedBy = bV9Completed.RenterId, ConfirmedAt = bV9Completed.EndDate },
                    new HandoverConfirmation { BookingId = bV9Completed.BookingId, Type = HandoverTypes.Return, ConfirmedBy = owner2.Id, ConfirmedAt = bV9Completed.EndDate.AddMinutes(10) }
                );
            }

            await db.SaveChangesAsync();
        }

        // Thanh toán & Giao dịch ngân hàng giả lập (Payments & MockBankTransactions)
        if (!await db.Payments.AnyAsync())
        {
            var escrowAcc = await db.MockBankAccounts.FirstAsync(x => x.AccountNumber == "ESCROW-0001");
            var bankAccounts = await db.MockBankAccounts.Where(x => x.UserId != null).ToDictionaryAsync(x => x.UserId!, x => x);

            var allBookings = await db.Bookings.Include(b => b.Vehicle).ToListAsync();
            foreach (var bk in allBookings)
            {
                if (!bankAccounts.TryGetValue(bk.RenterId, out var renterAcc)) continue;
                if (!bankAccounts.TryGetValue(bk.Vehicle.OwnerId, out var ownerAcc)) continue;

                var commission = bk.PriceLockedTotal * BusinessRules.DefaultCommissionRate;

                if (bk.Status == BookingStatuses.Completed)
                {
                    var payment = new Payment
                    {
                        BookingId = bk.BookingId,
                        DepositStatus = DepositStatuses.Refunded,
                        CommissionRate = BusinessRules.DefaultCommissionRate,
                        CommissionAmount = commission,
                        RevenueRecordedAt = bk.EndDate.AddHours(1)
                    };
                    db.Payments.Add(payment);

                    // Giao dịch đặt cọc: Renter -> Escrow
                    db.MockBankTransactions.Add(new MockBankTransaction
                    {
                        ReferenceCode = ReferenceCodes.Deposit(bk.SourceHoldId),
                        Payment = payment,
                        FromAccount = renterAcc,
                        ToAccount = escrowAcc,
                        TransactionType = MockTransactionTypes.Deposit,
                        Amount = bk.DepositAmount,
                        Status = MockTransactionStatuses.Succeeded,
                        CreatedAt = bk.CreatedAt
                    });

                    // Giao dịch thanh toán chủ xe: Escrow -> Owner
                    db.MockBankTransactions.Add(new MockBankTransaction
                    {
                        ReferenceCode = ReferenceCodes.Settle(bk.BookingId),
                        Payment = payment,
                        FromAccount = escrowAcc,
                        ToAccount = ownerAcc,
                        TransactionType = MockTransactionTypes.Transfer,
                        Amount = bk.DepositAmount - commission,
                        Status = MockTransactionStatuses.Succeeded,
                        CreatedAt = bk.EndDate.AddMinutes(30)
                    });

                    // Giao dịch hoàn cọc: Escrow -> Renter
                    db.MockBankTransactions.Add(new MockBankTransaction
                    {
                        ReferenceCode = ReferenceCodes.Refund(bk.BookingId),
                        Payment = payment,
                        FromAccount = escrowAcc,
                        ToAccount = renterAcc,
                        TransactionType = MockTransactionTypes.Refund,
                        Amount = bk.DepositAmount,
                        Status = MockTransactionStatuses.Succeeded,
                        CreatedAt = bk.EndDate.AddHours(1)
                    });
                }
                else if (bk.Status is BookingStatuses.Accepted or BookingStatuses.Ongoing)
                {
                    var payment = new Payment
                    {
                        BookingId = bk.BookingId,
                        DepositStatus = DepositStatuses.Held,
                        CommissionRate = BusinessRules.DefaultCommissionRate,
                        CommissionAmount = null,
                        RevenueRecordedAt = null
                    };
                    db.Payments.Add(payment);

                    db.MockBankTransactions.Add(new MockBankTransaction
                    {
                        ReferenceCode = ReferenceCodes.Deposit(bk.SourceHoldId),
                        Payment = payment,
                        FromAccount = renterAcc,
                        ToAccount = escrowAcc,
                        TransactionType = MockTransactionTypes.Deposit,
                        Amount = bk.DepositAmount,
                        Status = MockTransactionStatuses.Succeeded,
                        CreatedAt = bk.CreatedAt
                    });
                }
                else if (bk.Status == BookingStatuses.Cancelled)
                {
                    var payment = new Payment
                    {
                        BookingId = bk.BookingId,
                        DepositStatus = DepositStatuses.Refunded,
                        CommissionRate = BusinessRules.DefaultCommissionRate,
                        CommissionAmount = null,
                        RevenueRecordedAt = null
                    };
                    db.Payments.Add(payment);

                    db.MockBankTransactions.Add(new MockBankTransaction
                    {
                        ReferenceCode = ReferenceCodes.Deposit(bk.SourceHoldId),
                        Payment = payment,
                        FromAccount = renterAcc,
                        ToAccount = escrowAcc,
                        TransactionType = MockTransactionTypes.Deposit,
                        Amount = bk.DepositAmount,
                        Status = MockTransactionStatuses.Succeeded,
                        CreatedAt = bk.CreatedAt
                    });

                    db.MockBankTransactions.Add(new MockBankTransaction
                    {
                        ReferenceCode = ReferenceCodes.Refund(bk.BookingId),
                        Payment = payment,
                        FromAccount = escrowAcc,
                        ToAccount = renterAcc,
                        TransactionType = MockTransactionTypes.Refund,
                        Amount = bk.DepositAmount,
                        Status = MockTransactionStatuses.Succeeded,
                        CreatedAt = bk.CancelledAt ?? bk.CreatedAt.AddHours(3)
                    });
                }
            }

            await db.SaveChangesAsync();
        }

        // Đánh giá 2 chiều (Reviews)
        if (!await db.Reviews.AnyAsync())
        {
            var bV1Completed = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Completed && b.Vehicle.LicensePlate == "30A-123.45");
            var bV7Completed = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Completed && b.Vehicle.LicensePlate == "43A-111.22");

            if (bV1Completed != null)
            {
                db.Reviews.AddRange(
                    new Review
                    {
                        BookingId = bV1Completed.BookingId,
                        ReviewerId = bV1Completed.RenterId,
                        RevieweeId = bV1Completed.Vehicle.OwnerId,
                        Rating = 5,
                        Comment = "Xe Toyota Vios đi rất êm, máy móc vận hành trơn tru và tiết kiệm nhiên liệu. Chủ xe bàn giao xe sạch sẽ, đúng giờ. 10/10!",
                        IsPublic = true,
                        CreatedAt = bV1Completed.EndDate.AddHours(2)
                    },
                    new Review
                    {
                        BookingId = bV1Completed.BookingId,
                        ReviewerId = bV1Completed.Vehicle.OwnerId,
                        RevieweeId = bV1Completed.RenterId,
                        Rating = 5,
                        Comment = "Khách thuê rất lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn. Rất mong được tiếp tục đón tiếp anh trong các chuyến đi tới!",
                        IsPublic = true,
                        CreatedAt = bV1Completed.EndDate.AddHours(3)
                    }
                );
            }

            if (bV7Completed != null)
            {
                db.Reviews.AddRange(
                    new Review
                    {
                        BookingId = bV7Completed.BookingId,
                        ReviewerId = bV7Completed.RenterId,
                        RevieweeId = bV7Completed.Vehicle.OwnerId,
                        Rating = 5,
                        Comment = "Chuyến đi Đà Nẵng tuyệt vời! Xe Corolla Cross gầm cao, đi đèo dốc và đường ven biển rất đầm chắc và thoải mái cho cả gia đình.",
                        IsPublic = true,
                        CreatedAt = bV7Completed.EndDate.AddHours(2)
                    },
                    new Review
                    {
                        BookingId = bV7Completed.BookingId,
                        ReviewerId = bV7Completed.Vehicle.OwnerId,
                        RevieweeId = bV7Completed.RenterId,
                        Rating = 5,
                        Comment = "Khách hàng tuyệt vời, lái xe cẩn thận, trả xe đúng giờ quy định.",
                        IsPublic = true,
                        CreatedAt = bV7Completed.EndDate.AddHours(3)
                    }
                );
            }

            await db.SaveChangesAsync();
        }

        // Khiếu nại & Tranh chấp (Disputes)
        if (!await db.Disputes.AnyAsync())
        {
            var bV9Completed = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Completed && b.Vehicle.LicensePlate == "43B-333.44");
            var bV2Cancelled = await db.Bookings.Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Status == BookingStatuses.Cancelled && b.Vehicle.LicensePlate == "30E-234.56");
            var staff1 = u["staff1"];

            if (bV9Completed != null)
            {
                // Tranh chấp đã được xử lý (Resolved)
                db.Disputes.Add(new Dispute
                {
                    BookingId = bV9Completed.BookingId,
                    RaisedBy = bV9Completed.RenterId,
                    Description = "Chủ xe yêu cầu cấn trừ 500.000đ tiền cọc vì vết xước ở cản trước, tuy nhiên vết xước này đã có từ trước khi bàn giao xe.",
                    EvidenceImage = "seed/dispute-evidence-1.jpg",
                    Status = DisputeStatuses.Resolved,
                    CreatedAt = bV9Completed.EndDate.AddHours(1),
                    ResolvedBy = staff1.Id,
                    ResolvedAt = bV9Completed.EndDate.AddHours(6),
                    ResolutionAction = ResolutionActions.ForceComplete,
                    ResolutionNotes = "Đã đối chiếu ảnh chụp lúc nhận xe tại biên bản bàn giao: vết xước đã tồn tại trước chuyến đi. Chấp thuận hoàn cọc đầy đủ cho khách thuê."
                });
            }

            if (bV2Cancelled != null)
            {
                // Tranh chấp đang mở (Open)
                db.Disputes.Add(new Dispute
                {
                    BookingId = bV2Cancelled.BookingId,
                    RaisedBy = bV2Cancelled.RenterId,
                    Description = "Chủ xe không phản hồi tin nhắn và cuộc gọi vào sáng ngày nhận xe, buộc tôi phải hủy đơn và thuê xe khác ngoài đường.",
                    EvidenceImage = "seed/dispute-evidence-2.jpg",
                    Status = DisputeStatuses.Open,
                    CreatedAt = now.AddHours(-14),
                    ResolvedBy = null,
                    ResolvedAt = null,
                    ResolutionAction = null,
                    ResolutionNotes = null
                });
            }

            await db.SaveChangesAsync();
        }
    }
}
