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
            if (!await roleManager.RoleExistsAsync(role))
                Check(await roleManager.CreateAsync(new IdentityRole(role)));

        var users = await SeedUsersAsync(db, userManager);
        await SeedSettingsAndBankAsync(db, users);
        await SeedVehiclesAndBookingsAsync(db, users);
    }

    private static void Check(IdentityResult r)
    {
        if (!r.Succeeded)
            throw new InvalidOperationException(string.Join("; ", r.Errors.Select(e => e.Description)));
    }

    // ---------- 10 tài khoản: 3 renter, 3 owner, 2 staff, 2 admin ----------
    private static async Task<Dictionary<string, ApplicationUser>> SeedUsersAsync(
        ApplicationDbContext db, UserManager<ApplicationUser> um)
    {
        var specs = new (string Key, string Name, bool Female, string[] Roles)[]
        {
            ("renter1", "Nguyễn Văn An",   false, new[] { RoleNames.Renter }),
            ("renter2", "Trần Thị Bình",   true,  new[] { RoleNames.Renter }),
            ("renter3", "Lê Minh Cường",   false, new[] { RoleNames.Renter }),
            ("owner1",  "Phạm Quốc Dũng",  false, new[] { RoleNames.Renter, RoleNames.Owner }),
            ("owner2",  "Hoàng Thị Em",    true,  new[] { RoleNames.Renter, RoleNames.Owner }),
            ("owner3",  "Võ Văn Phúc",     false, new[] { RoleNames.Renter, RoleNames.Owner }),
            ("staff1",  "Đặng Thu Hà",     true,  new[] { RoleNames.Admin }),
            ("staff2",  "Bùi Văn Khoa",    false, new[] { RoleNames.Admin }),
            ("admin1",  "Quản trị Một",    false, new[] { RoleNames.Admin }),
            ("admin2",  "Quản trị Hai",    true,  new[] { RoleNames.Admin }),
        };

        var result = new Dictionary<string, ApplicationUser>();
        for (var i = 0; i < specs.Length; i++)
        {
            var s = specs[i];
            var email = $"{s.Key}@carrental.test";
            var user = await um.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = s.Key,
                    Email = email,
                    EmailConfirmed = true,
                    FullName = s.Name,
                    Gender = s.Female,
                    PhoneNumber = $"090000{i + 1:0000}"
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
                db.DriverLicenses.Add(new DriverLicense
                {
                    UserId = user.Id,
                    LicenseNumber = $"GPLX-{key.ToUpper()}",
                    LicenseClass = "B2",
                    ExpiryDate = DateOnly.FromDateTime(now.AddYears(5)),
                    ImageFront = $"seed/license-{key}.jpg"
                });

            if (key.StartsWith("owner") && !await db.OwnerProfiles.AnyAsync(x => x.UserId == user.Id))
                db.OwnerProfiles.Add(new OwnerProfile
                {
                    UserId = user.Id,
                    CccdNumber = $"00109900000{key[^1]}",
                    CccdImageFront = $"seed/cccd-{key}-front.jpg",
                    CccdImageBack = $"seed/cccd-{key}-back.jpg",
                    ApprovalStatus = OwnerApprovalStatuses.Approved,
                    AccessStatus = OwnerAccessStatuses.Active,
                    SubmittedAt = now.AddDays(-30),
                    ReviewedBy = result["staff1"].Id,
                    ReviewedAt = now.AddDays(-29)
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
            db.SystemSettings.Add(new SystemSetting
            {
                SettingKey = SettingKeys.CommissionRate,
                SettingValue = BusinessRules.DefaultCommissionRate.ToString(CultureInfo.InvariantCulture),
                UpdatedBy = users["admin1"].Id
            });

        if (!await db.MockBankAccounts.AnyAsync())
        {
            db.MockBankAccounts.Add(new MockBankAccount
            {
                UserId = null,
                AccountType = MockAccountTypes.PlatformEscrow,
                AccountNumber = "ESCROW-0001"
            });
            foreach (var (key, user) in users.Where(x => x.Key.StartsWith("renter") || x.Key.StartsWith("owner")))
                db.MockBankAccounts.Add(new MockBankAccount
                {
                    UserId = user.Id,
                    AccountNumber = $"MOCK-{key.ToUpper()}"
                });
        }

        await db.SaveChangesAsync();
    }

    // ---------- 6 xe + 9 đơn thuê + 1 lịch chủ xe khóa, để test lịch khả dụng ----------
    private static async Task SeedVehiclesAndBookingsAsync(
        ApplicationDbContext db, Dictionary<string, ApplicationUser> u)
    {
        if (await db.Vehicles.AnyAsync()) return;

        var now = DateTime.UtcNow;
        var today = now.Date;

        var specs = new (string Key, string Owner, string Plate, string Brand, string Model, int Year,
                         int Seats, string Gearbox, string Fuel, decimal Price, string District, string Moderation)[]
        {
            ("V1", "owner1", "30A-123.45", "Toyota",  "Vios",    2022, 5,  "Automatic", "Gasoline",   700_000m, "Cầu Giấy",      ListingModerationStatuses.Public),
            ("V2", "owner1", "30E-234.56", "Hyundai", "Accent",  2021, 5,  "Manual",    "Gasoline",   600_000m, "Ba Đình",       ListingModerationStatuses.Public),
            ("V3", "owner2", "30F-345.67", "Mazda",   "CX-5",    2023, 5,  "Automatic", "Gasoline", 1_100_000m, "Hai Bà Trưng", ListingModerationStatuses.Public),
            ("V4", "owner2", "30G-456.78", "VinFast", "VF 8",    2023, 5,  "Automatic", "Electric", 1_300_000m, "Nam Từ Liêm",   ListingModerationStatuses.Public),
            ("V5", "owner3", "29A-567.89", "Ford",    "Transit", 2020, 16, "Manual",    "Diesel",   1_500_000m, "Long Biên",     ListingModerationStatuses.Public),
            ("V6", "owner3", "29B-678.90", "Kia",     "Morning", 2019, 4,  "Manual",    "Gasoline",     450_000m, "Đống Đa",      ListingModerationStatuses.Hidden),
        };

        var listings = new Dictionary<string, VehicleListing>();
        var n = 0;
        foreach (var s in specs)
        {
            n++;
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
                Status = VehicleStatuses.Approved,
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
                Location = $"{s.District}, Hà Nội",
                City = "Hà Nội",
                District = s.District,
                Description = $"{s.Brand} {s.Model} (dữ liệu thử)",
                ModerationStatus = s.Moderation,
                ModeratedBy = u["staff1"].Id,
                ModeratedAt = now,
                Images = Enumerable.Range(1, 3)
                    .Select(i => new ListingImage { ImagePath = $"seed/car{n}-{i}.jpg", SortOrder = i, IsCover = i == 1 })
                    .ToList()
            };
            listings[s.Key] = listing;
            db.VehicleListings.Add(listing);
        }

        // Mỗi đơn cần 1 DepositHold (SourceHoldId bắt buộc, unique) nên tạo cùng lúc
        void AddBooking(string renterKey, string vehicleKey, int fromDay, int toDay, string status)
        {
            var renter = u[renterKey];
            var listing = listings[vehicleKey];
            var start = today.AddDays(fromDay);
            var end = today.AddDays(toDay);
            var days = toDay - fromDay;
            var total = listing.PricePerDay * days;
            var deposit = total * BusinessRules.DepositRate;
            var created = fromDay < 0 ? start.AddDays(-5) : now;

            var hold = new DepositHold
            {
                Renter = renter, Listing = listing,
                StartDate = start, EndDate = end, RentalDays = days,
                PriceLockedTotal = total, DepositAmount = deposit,
                Status = DepositHoldStatuses.Converted, CreatedAt = created
            };
            var booking = new Booking
            {
                Renter = renter, Listing = listing, Vehicle = listing.Vehicle, SourceHold = hold,
                StartDate = start, EndDate = end, RentalDays = days,
                Status = status, PriceLockedTotal = total, DepositAmount = deposit,
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
                booking.CompletedAt = end;

            db.Bookings.Add(booking);
        }

        // V1: đơn đã duyệt và đơn chờ duyệt đều CHẶN lịch
        AddBooking("renter1", "V1",   3,   6, BookingStatuses.Accepted);
        AddBooking("renter2", "V1",  10,  12, BookingStatuses.Pending);
        AddBooking("renter3", "V1", -10,  -7, BookingStatuses.Completed);   // đã qua

        // V2: hủy / hết hạn / từ chối đều KHÔNG chặn lịch
        AddBooking("renter1", "V2",   3,   6, BookingStatuses.Cancelled);
        AddBooking("renter2", "V2",   8,  10, BookingStatuses.Expired);
        AddBooking("renter3", "V2",  12,  14, BookingStatuses.Rejected);

        // V3: đang thuê + đơn nối đuôi (kiểm tra biên ngày)
        AddBooking("renter1", "V3",  -1,   2, BookingStatuses.Ongoing);
        AddBooking("renter2", "V3",   2,   4, BookingStatuses.Accepted);

        // V4: không có đơn nào -> luôn trống
        // V5: 1 đơn đã duyệt + chủ xe khóa lịch
        AddBooking("renter3", "V5",   7,   9, BookingStatuses.Accepted);
        db.VehicleUnavailabilities.Add(new VehicleUnavailability
        {
            Vehicle = listings["V5"].Vehicle,
            StartDate = today.AddDays(15),
            EndDate = today.AddDays(20),
            Reason = "Chủ xe không nhận thuê (dữ liệu thử)"
        });

        // V6: tin đăng Hidden -> không được coi là khả dụng
        await db.SaveChangesAsync();
    }
}