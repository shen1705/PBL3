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

        // seed staff role
        var staff1User = await userManager.FindByNameAsync("staff1");
        if (staff1User != null && !await userManager.IsInRoleAsync(staff1User, RoleNames.Staff))
            Check(await userManager.AddToRoleAsync(staff1User, RoleNames.Staff));

        var staff2User = await userManager.FindByNameAsync("staff2");
        if (staff2User != null)
        {
            if (!await userManager.IsInRoleAsync(staff2User, RoleNames.Staff))
                Check(await userManager.AddToRoleAsync(staff2User, RoleNames.Staff));
            if (await userManager.IsInRoleAsync(staff2User, RoleNames.Admin))
                Check(await userManager.RemoveFromRoleAsync(staff2User, RoleNames.Admin));
        }
    }

    private static void Check(IdentityResult r)
    {
        if (!r.Succeeded)
            throw new InvalidOperationException(string.Join("; ", r.Errors.Select(e => e.Description)));
    }

    // seed accounts
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
            ("staff1",  "Đặng Thu Hà",     true,  "0900000007", new[] { RoleNames.Staff, RoleNames.Admin }),
            ("staff2",  "Bùi Văn Khoa",    false, "0900000008", new[] { RoleNames.Staff }),
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

                // admin claims
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
                    ImageFront = $"/seed/license-{key}.jpg"
                });
            }

            if (key.StartsWith("owner") && !await db.OwnerProfiles.AnyAsync(x => x.UserId == user.Id))
            {
                var isPending = key == "owner4";
                db.OwnerProfiles.Add(new OwnerProfile
                {
                    UserId = user.Id,
                    CccdNumber = $"00109900000{key[^1]}",
                    CccdImageFront = $"/seed/cccd-{key}-front.jpg",
                    CccdImageBack = $"/seed/cccd-{key}-back.jpg",
                    ApprovalStatus = isPending ? OwnerApprovalStatuses.Pending : OwnerApprovalStatuses.Approved,
                    AccessStatus = isPending ? OwnerAccessStatuses.Inactive : OwnerAccessStatuses.Active,
                    SubmittedAt = isPending ? now.AddDays(-2) : now.AddDays(-30),
                    ReviewedBy = isPending ? null : result["staff1"].Id,
                    ReviewedAt = isPending ? null : now.AddDays(-29)
                });
            }
        }

        // sample sanction
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

    // configs & mock bank
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

    // seed vehicles & bookings
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

            // Da Nang
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

            // pending cars for admin testing
            ("V16", "owner4", "43A-999.88", "VinFast",    "VF 5 Plus",     2024, 5,  "Automatic", "Electric",   550_000m, "TP. Đà Nẵng",   "Hải Châu",      16.0600m, 108.2100m, VehicleStatuses.PendingApproval, ListingModerationStatuses.PendingApproval),
            ("V17", "owner1", "30H-999.11", "Hyundai",    "Tucson",        2024, 5,  "Automatic", "Gasoline", 1_000_000m, "Hà Nội",        "Cầu Giấy",      21.0333m, 105.7944m, VehicleStatuses.PendingApproval, ListingModerationStatuses.PendingApproval),
            ("V18", "owner2", "51K-888.22", "Ford",       "Everest",       2024, 7,  "Automatic", "Diesel",   1_500_000m, "TP. Hồ Chí Minh", "Quận 2",        10.7850m, 106.7450m, VehicleStatuses.PendingApproval, ListingModerationStatuses.PendingApproval),
            ("V19", "owner3", "43F-777.33", "Mazda",      "CX-8",          2024, 7,  "Automatic", "Gasoline", 1_300_000m, "TP. Đà Nẵng",   "Sơn Trà",       16.0601m, 108.2394m, VehicleStatuses.Approved,        ListingModerationStatuses.Public),
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
                        RegistrationCertImage = $"/seed/reg{n}.jpg",
                        InsuranceImage = $"/seed/ins{n}.jpg",
                        InsuranceExpiryDate = DateOnly.FromDateTime(today.AddYears(1)),
                        InspectionCertImage = $"/seed/insp{n}.jpg",
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
                        .Select(i => new ListingImage { ImagePath = $"/seed/car{n}-{i}.jpg", SortOrder = i, IsCover = i == 1 })
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

                    // Update listing images to real downloaded vehicle photos
                    if (firstListing.Images != null && firstListing.Images.Any())
                    {
                        var imgs = firstListing.Images.OrderBy(i => i.SortOrder).ToList();
                        for (int i = 0; i < imgs.Count; i++)
                        {
                            var imgIdx = (i % 3) + 1;
                            imgs[i].ImagePath = $"/seed/car{n}-{imgIdx}.jpg";
                            imgs[i].IsCover = (i == 0);
                        }
                        for (int i = imgs.Count + 1; i <= 3; i++)
                        {
                            firstListing.Images.Add(new ListingImage { ImagePath = $"/seed/car{n}-{i}.jpg", SortOrder = i, IsCover = false });
                        }
                    }
                    else
                    {
                        firstListing.Images = Enumerable.Range(1, 3)
                            .Select(i => new ListingImage { ImagePath = $"/seed/car{n}-{i}.jpg", SortOrder = i, IsCover = i == 1 })
                            .ToList();
                    }
                }
            }
        }

        // normalize locations
        var nonAccentDaNangListings = await db.VehicleListings
            .Where(l => l.City == "TP. Da Nang" || l.City == "Da Nang" || l.City == "TP Da Nang")
            .ToListAsync();
        foreach (var l in nonAccentDaNangListings)
        {
            l.City = "TP. Đà Nẵng";
            if (!string.IsNullOrEmpty(l.Location))
            {
                l.Location = l.Location.Replace("TP. Da Nang", "TP. Đà Nẵng")
                                       .Replace("TP Da Nang", "TP. Đà Nẵng")
                                       .Replace("Quan Hai Chau", "Hải Châu")
                                       .Replace("Hai Chau", "Hải Châu");
            }
            if (l.District == "Hai Chau") l.District = "Hải Châu";
        }

        await db.SaveChangesAsync();

        // refresh ids
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

        // busy schedule & vehicle unavailabilities
        if (!await db.VehicleUnavailabilities.AnyAsync(x => x.Reason != null && x.Reason.Contains("40.000km")))
        {
            var oldUnavailabilities = await db.VehicleUnavailabilities.ToListAsync();
            db.VehicleUnavailabilities.RemoveRange(oldUnavailabilities);

            if (listings.TryGetValue("V1", out var v1Listing))
            {
                db.VehicleUnavailabilities.Add(new VehicleUnavailability
                {
                    VehicleId = v1Listing.VehicleId,
                    StartDate = today.AddDays(14),
                    EndDate = today.AddDays(16),
                    Reason = "Bảo dưỡng định kỳ 40.000km và thay dầu máy"
                });
            }

            if (listings.TryGetValue("V3", out var v3Listing))
            {
                db.VehicleUnavailabilities.Add(new VehicleUnavailability
                {
                    VehicleId = v3Listing.VehicleId,
                    StartDate = today.AddDays(12),
                    EndDate = today.AddDays(15),
                    Reason = "Chủ xe đi công tác ngoại tỉnh"
                });
            }

            if (listings.TryGetValue("V5", out var v5Listing))
            {
                db.VehicleUnavailabilities.Add(new VehicleUnavailability
                {
                    VehicleId = v5Listing.VehicleId,
                    StartDate = today.AddDays(18),
                    EndDate = today.AddDays(22),
                    Reason = "Đăng kiểm và bảo trì hệ thống lái"
                });
            }

            await db.SaveChangesAsync();
        }

        // seed comprehensive business scenarios (15 test bookings)
        bool needSeedBookings = !await db.Disputes.AnyAsync(d => d.ResolutionAction == ResolutionActions.CancelOwnerFault);
        if (needSeedBookings)
        {
            // clean up previous seed data to guarantee 100% data integrity
            var oldTx = await db.MockBankTransactions.ToListAsync();
            db.MockBankTransactions.RemoveRange(oldTx);
            var oldPayments = await db.Payments.ToListAsync();
            db.Payments.RemoveRange(oldPayments);
            var oldReviews = await db.Reviews.ToListAsync();
            db.Reviews.RemoveRange(oldReviews);
            var oldDisputes = await db.Disputes.ToListAsync();
            db.Disputes.RemoveRange(oldDisputes);
            var oldHandovers = await db.HandoverConfirmations.ToListAsync();
            db.HandoverConfirmations.RemoveRange(oldHandovers);
            var oldBookings = await db.Bookings.ToListAsync();
            db.Bookings.RemoveRange(oldBookings);
            var oldHolds = await db.DepositHolds.ToListAsync();
            db.DepositHolds.RemoveRange(oldHolds);
            await db.SaveChangesAsync();

            var escrowAcc = await db.MockBankAccounts.FirstAsync(x => x.AccountNumber == "ESCROW-0001");
            var bankAccounts = await db.MockBankAccounts.Where(x => x.UserId != null).ToDictionaryAsync(x => x.UserId!, x => x);
            var staff1 = u["staff1"];
            var admin1 = u["admin1"];

            Booking CreateBookingRecord(
                string renterKey,
                string vehicleKey,
                int fromDay,
                int toDay,
                string status,
                bool delivery = false,
                DateTime? customCreated = null,
                DateTime? customResponseDeadline = null,
                string? rejectReason = null,
                string? cancelReason = null,
                string? cancelledByKey = null,
                DateTime? customAcceptedAt = null,
                DateTime? customCancelledAt = null,
                DateTime? customCompletedAt = null)
            {
                var listing = listings[vehicleKey];
                var renter = u[renterKey];
                var start = today.AddDays(fromDay);
                var end = today.AddDays(toDay);
                var rentalDays = (end.Date - start.Date).Days + 1;
                if (rentalDays < 1) rentalDays = 1;

                var rentalSubtotal = listing.PricePerDay * rentalDays;
                var deliveryFee = delivery ? 100_000m : 0m;
                var insuranceFee = 50_000m * rentalDays;
                var total = rentalSubtotal + deliveryFee + insuranceFee;
                var deposit = Math.Round(total * BusinessRules.DepositRate);

                var created = customCreated ?? (fromDay < 0 ? start.AddDays(-5) : now.AddHours(-10));
                var deadline = customResponseDeadline ?? created.AddHours(BusinessRules.ResponseDeadlineHours);

                var hold = new DepositHold
                {
                    Renter = renter,
                    Listing = listing,
                    StartDate = start,
                    EndDate = end,
                    RentalDays = rentalDays,
                    PriceLockedTotal = total,
                    DepositAmount = deposit,
                    Status = (status is BookingStatuses.Cancelled or BookingStatuses.Rejected or BookingStatuses.Expired)
                        ? DepositHoldStatuses.Cancelled
                        : DepositHoldStatuses.Converted,
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
                    RentalDays = rentalDays,
                    Status = status,
                    PriceLockedTotal = total,
                    DepositAmount = deposit,
                    PricePerDayAtBooking = listing.PricePerDay,
                    RentalSubtotal = rentalSubtotal,
                    DeliveryFee = deliveryFee,
                    InsuranceFee = insuranceFee,
                    TermsAcceptedAt = created,
                    CreatedAt = created,
                    ResponseDeadline = deadline,
                    RespondedAt = (status is BookingStatuses.Accepted or BookingStatuses.Ongoing or BookingStatuses.Completed)
                        ? (customAcceptedAt ?? created.AddHours(2))
                        : (status == BookingStatuses.Rejected ? created.AddHours(3) : null),
                    AcceptedAt = (status is BookingStatuses.Accepted or BookingStatuses.Ongoing or BookingStatuses.Completed)
                        ? (customAcceptedAt ?? created.AddHours(2))
                        : null,
                    RejectReason = rejectReason,
                    CompletedAt = customCompletedAt ?? (status == BookingStatuses.Completed ? end : null),
                    CancelledAt = customCancelledAt ?? (status == BookingStatuses.Cancelled ? (created.AddHours(4)) : null),
                    CancelledBy = cancelledByKey != null ? u[cancelledByKey].Id : (status == BookingStatuses.Cancelled ? renter.Id : null),
                    CancelReason = cancelReason
                };

                db.Bookings.Add(booking);
                return booking;
            }

            // 15 Comprehensive Test Bookings
            // BK01: Completed, Hà Nội, V1 (Vios), renter1. 2-way 5-star public reviews
            var bk01 = CreateBookingRecord("renter1", "V1", -12, -9, BookingStatuses.Completed);

            // BK02: Completed, Hà Nội, V3 (CX-5), renter2. Double-blind (renter2 reviewed, owner2 hasn't)
            var bk02 = CreateBookingRecord("renter2", "V3", -4, -2, BookingStatuses.Completed, delivery: true);

            // BK03: Completed, TP. Đà Nẵng, V7 (Cross), renter3. Settled revenue for owner1
            var bk03 = CreateBookingRecord("renter3", "V7", -15, -12, BookingStatuses.Completed);

            // BK04: Completed, TP. Đà Nẵng, V9 (e34), renter1. Electric vehicle settled for owner2
            var bk04 = CreateBookingRecord("renter1", "V9", -8, -5, BookingStatuses.Completed, delivery: true);

            // BK05: Ongoing, TP. Đà Nẵng, V8 (Xpander), renter2. Pickup confirmed yesterday
            var bk05 = CreateBookingRecord("renter2", "V8", -1, 2, BookingStatuses.Ongoing);

            // BK06: Ongoing + Open Dispute, TP. Đà Nẵng, V11 (Santa Fe), renter3. AC failure & check engine
            var bk06 = CreateBookingRecord("renter3", "V11", -2, 1, BookingStatuses.Ongoing, delivery: true);

            // BK07: Completed + ForceComplete Dispute, TP. HCM, V13 (Vios), renter1. Scratch dispute resolved
            var bk07 = CreateBookingRecord("renter1", "V13", -7, -4, BookingStatuses.Completed);

            // BK08: Cancelled + CancelOwnerFault Dispute, Hà Nội, V2 (Accent), renter2. Owner no-show penalty 195k
            var bk08 = CreateBookingRecord("renter2", "V2", -3, -1, BookingStatuses.Cancelled,
                cancelledByKey: "admin1",
                cancelReason: "Hủy bởi Admin do lỗi chủ xe: Chủ xe tự ý hủy hẹn và vi phạm nghiêm trọng cam kết bàn giao xe.",
                customCancelledAt: today.AddDays(-3).AddHours(5));

            // BK09: Pending (10h remaining), TP. HCM, V14 (CX-30), renter1.
            var bk09 = CreateBookingRecord("renter1", "V14", 4, 7, BookingStatuses.Pending, delivery: true,
                customCreated: now.AddHours(-2),
                customResponseDeadline: now.AddHours(10));

            // BK10: Pending (Urgent - 1h remaining), TP. Đà Nẵng, V10 (City), renter2.
            var bk10 = CreateBookingRecord("renter2", "V10", 2, 4, BookingStatuses.Pending,
                customCreated: now.AddHours(-11),
                customResponseDeadline: now.AddHours(1));

            // BK11: Accepted (Ready for pickup), Hà Nội, V1 (Vios), renter3.
            var bk11 = CreateBookingRecord("renter3", "V1", 2, 5, BookingStatuses.Accepted,
                customCreated: now.AddHours(-8),
                customAcceptedAt: now.AddHours(-6));

            // BK12: Cancelled by Renter, Hà Nội, V4 (VF 8), renter1.
            var bk12 = CreateBookingRecord("renter1", "V4", 6, 9, BookingStatuses.Cancelled,
                customCreated: now.AddDays(-2),
                customCancelledAt: now.AddDays(-1),
                cancelledByKey: "renter1",
                cancelReason: "Gia đình có việc bận đột xuất nên dời lịch trình sang tuần sau.");

            // BK13: Rejected by Owner, Hà Nội, V5 (Transit), renter2.
            var bk13 = CreateBookingRecord("renter2", "V5", 8, 11, BookingStatuses.Rejected,
                customCreated: now.AddDays(-3),
                rejectReason: "Xe đã xếp lịch đưa đón đoàn du lịch ký hợp đồng dài hạn trước đó, rất tiếc không phục vụ được quý khách đợt này.");

            // BK14: Expired (past 12h deadline), TP. HCM, V15 (CR-V), renter3.
            var bk14 = CreateBookingRecord("renter3", "V15", 5, 8, BookingStatuses.Expired,
                customCreated: now.AddHours(-20),
                customResponseDeadline: now.AddHours(-8));

            // BK15: Completed, TP. HCM, V14 (CX-30), renter4. Settled revenue for owner2
            var bk15 = CreateBookingRecord("renter4", "V14", -20, -17, BookingStatuses.Completed);

            await db.SaveChangesAsync();

            // Handover Confirmations
            void AddFullHandovers(Booking b, ApplicationUser renter, ApplicationUser owner, int startOdo, int endOdo)
            {
                db.HandoverConfirmations.AddRange(
                    new HandoverConfirmation
                    {
                        BookingId = b.BookingId,
                        Type = HandoverTypes.Pickup,
                        ConfirmedBy = renter.Id,
                        ConfirmedAt = b.StartDate,
                        Odometer = startOdo,
                        FuelLevel = "Full",
                        Notes = "Nhận xe đúng giờ, kiểm tra xe hoạt động bình thường."
                    },
                    new HandoverConfirmation
                    {
                        BookingId = b.BookingId,
                        Type = HandoverTypes.Pickup,
                        ConfirmedBy = owner.Id,
                        ConfirmedAt = b.StartDate.AddMinutes(5),
                        Odometer = startOdo,
                        FuelLevel = "Full",
                        Notes = "Bàn giao xe sạch sẽ và đầy đủ giấy tờ xe."
                    },
                    new HandoverConfirmation
                    {
                        BookingId = b.BookingId,
                        Type = HandoverTypes.Return,
                        ConfirmedBy = renter.Id,
                        ConfirmedAt = b.EndDate,
                        Odometer = endOdo,
                        FuelLevel = "Full",
                        Notes = "Trả xe đúng hạn, xe vận hành rất tốt.",
                        RemainingPaymentMethod = "Cash"
                    },
                    new HandoverConfirmation
                    {
                        BookingId = b.BookingId,
                        Type = HandoverTypes.Return,
                        ConfirmedBy = owner.Id,
                        ConfirmedAt = b.EndDate.AddMinutes(10),
                        Odometer = endOdo,
                        FuelLevel = "Full",
                        Notes = "Đã nhận lại đủ chìa khóa, xe nguyên vẹn và sạch sẽ.",
                        RemainingPaymentMethod = "Cash"
                    }
                );
            }

            AddFullHandovers(bk01, u["renter1"], u["owner1"], 18200, 18650);
            AddFullHandovers(bk02, u["renter2"], u["owner2"], 12100, 12480);
            AddFullHandovers(bk03, u["renter3"], u["owner1"], 15300, 15820);
            AddFullHandovers(bk04, u["renter1"], u["owner2"], 9200, 9650);
            AddFullHandovers(bk07, u["renter1"], u["owner1"], 21400, 21860);
            AddFullHandovers(bk15, u["renter4"], u["owner2"], 10500, 10920);

            // Pickup only for Ongoing
            db.HandoverConfirmations.AddRange(
                new HandoverConfirmation
                {
                    BookingId = bk05.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["renter2"].Id,
                    ConfirmedAt = bk05.StartDate,
                    Odometer = 24150,
                    FuelLevel = "Full",
                    Notes = "Xe sạch sẽ, đã kiểm tra thân vỏ không trầy xước."
                },
                new HandoverConfirmation
                {
                    BookingId = bk05.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["owner1"].Id,
                    ConfirmedAt = bk05.StartDate.AddMinutes(5),
                    Odometer = 24150,
                    FuelLevel = "Full",
                    Notes = "Bàn giao xe thành công cho bạn Bình."
                },
                new HandoverConfirmation
                {
                    BookingId = bk06.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["renter3"].Id,
                    ConfirmedAt = bk06.StartDate,
                    Odometer = 38500,
                    FuelLevel = "Full",
                    Notes = "Nhận xe tại điểm hẹn."
                },
                new HandoverConfirmation
                {
                    BookingId = bk06.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["owner3"].Id,
                    ConfirmedAt = bk06.StartDate.AddMinutes(5),
                    Odometer = 38500,
                    FuelLevel = "Full",
                    Notes = "Đã bàn giao xe và giấy tờ."
                }
            );

            // Payments & Bank Transactions
            void AddCompletedPayment(Booking b, string renterKey, string ownerKey)
            {
                var renterAcc = bankAccounts[u[renterKey].Id];
                var ownerAcc = bankAccounts[u[ownerKey].Id];
                var commission = Math.Round(b.PriceLockedTotal * BusinessRules.DefaultCommissionRate);

                var payment = new Payment
                {
                    BookingId = b.BookingId,
                    DepositStatus = DepositStatuses.Refunded,
                    CommissionRate = BusinessRules.DefaultCommissionRate,
                    CommissionAmount = commission,
                    RevenueRecordedAt = b.EndDate.AddHours(1)
                };
                db.Payments.Add(payment);

                // Deposit tx
                db.MockBankTransactions.Add(new MockBankTransaction
                {
                    ReferenceCode = ReferenceCodes.Deposit(b.SourceHoldId),
                    Payment = payment,
                    FromAccount = renterAcc,
                    ToAccount = escrowAcc,
                    TransactionType = MockTransactionTypes.Deposit,
                    Amount = b.DepositAmount,
                    Status = MockTransactionStatuses.Succeeded,
                    CreatedAt = b.CreatedAt
                });

                // Payout / Settle tx
                db.MockBankTransactions.Add(new MockBankTransaction
                {
                    ReferenceCode = ReferenceCodes.Settle(b.BookingId),
                    Payment = payment,
                    FromAccount = escrowAcc,
                    ToAccount = ownerAcc,
                    TransactionType = MockTransactionTypes.Transfer,
                    Amount = b.PriceLockedTotal - commission,
                    Status = MockTransactionStatuses.Succeeded,
                    CreatedAt = b.EndDate.AddMinutes(30)
                });

                // Refund deposit tx
                db.MockBankTransactions.Add(new MockBankTransaction
                {
                    ReferenceCode = ReferenceCodes.Refund(b.BookingId),
                    Payment = payment,
                    FromAccount = escrowAcc,
                    ToAccount = renterAcc,
                    TransactionType = MockTransactionTypes.Refund,
                    Amount = b.DepositAmount,
                    Status = MockTransactionStatuses.Succeeded,
                    CreatedAt = b.EndDate.AddHours(1)
                });
            }

            AddCompletedPayment(bk01, "renter1", "owner1");
            AddCompletedPayment(bk02, "renter2", "owner2");
            AddCompletedPayment(bk03, "renter3", "owner1");
            AddCompletedPayment(bk04, "renter1", "owner2");
            AddCompletedPayment(bk07, "renter1", "owner1");
            AddCompletedPayment(bk15, "renter4", "owner2");

            void AddActivePayment(Booking b, string renterKey)
            {
                var renterAcc = bankAccounts[u[renterKey].Id];
                var payment = new Payment
                {
                    BookingId = b.BookingId,
                    DepositStatus = DepositStatuses.Held,
                    CommissionRate = BusinessRules.DefaultCommissionRate,
                    CommissionAmount = null,
                    RevenueRecordedAt = null
                };
                db.Payments.Add(payment);

                db.MockBankTransactions.Add(new MockBankTransaction
                {
                    ReferenceCode = ReferenceCodes.Deposit(b.SourceHoldId),
                    Payment = payment,
                    FromAccount = renterAcc,
                    ToAccount = escrowAcc,
                    TransactionType = MockTransactionTypes.Deposit,
                    Amount = b.DepositAmount,
                    Status = MockTransactionStatuses.Succeeded,
                    CreatedAt = b.CreatedAt
                });
            }

            AddActivePayment(bk05, "renter2");
            AddActivePayment(bk06, "renter3");
            AddActivePayment(bk11, "renter3");

            // BK12: Cancelled by Renter
            var r1Acc = bankAccounts[u["renter1"].Id];
            var bk12Payment = new Payment
            {
                BookingId = bk12.BookingId,
                DepositStatus = DepositStatuses.Refunded,
                CommissionRate = BusinessRules.DefaultCommissionRate,
                CommissionAmount = null,
                RevenueRecordedAt = null
            };
            db.Payments.Add(bk12Payment);
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Deposit(bk12.SourceHoldId),
                Payment = bk12Payment,
                FromAccount = r1Acc,
                ToAccount = escrowAcc,
                TransactionType = MockTransactionTypes.Deposit,
                Amount = bk12.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bk12.CreatedAt
            });
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Refund(bk12.BookingId),
                Payment = bk12Payment,
                FromAccount = escrowAcc,
                ToAccount = r1Acc,
                TransactionType = MockTransactionTypes.Refund,
                Amount = bk12.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bk12.CancelledAt ?? bk12.CreatedAt.AddHours(3)
            });

            // BK08: Cancelled with Owner Fault penalty
            var r2Acc = bankAccounts[u["renter2"].Id];
            var o1Acc = bankAccounts[u["owner1"].Id];
            var bk08Penalty = 195_000m;
            var bk08Payment = new Payment
            {
                BookingId = bk08.BookingId,
                DepositStatus = DepositStatuses.Refunded,
                CommissionRate = 0,
                CommissionAmount = 0,
                PenaltyAmount = bk08Penalty
            };
            db.Payments.Add(bk08Payment);
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Deposit(bk08.SourceHoldId),
                Payment = bk08Payment,
                FromAccount = r2Acc,
                ToAccount = escrowAcc,
                TransactionType = MockTransactionTypes.Deposit,
                Amount = bk08.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bk08.CreatedAt
            });
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Refund(bk08.BookingId),
                Payment = bk08Payment,
                FromAccount = escrowAcc,
                ToAccount = r2Acc,
                TransactionType = MockTransactionTypes.Refund,
                Amount = bk08.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bk08.CancelledAt ?? bk08.CreatedAt.AddHours(4)
            });
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Penalty(bk08.BookingId),
                Payment = bk08Payment,
                FromAccount = o1Acc,
                ToAccount = escrowAcc,
                TransactionType = MockTransactionTypes.Penalty,
                Amount = bk08Penalty,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bk08.CancelledAt ?? bk08.CreatedAt.AddHours(4)
            });

            // Reviews
            // BK01: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bk01.BookingId,
                    ReviewerId = u["renter1"].Id,
                    RevieweeId = u["owner1"].Id,
                    Rating = 5,
                    Comment = "Xe Toyota Vios đi rất êm, máy móc vận hành trơn tru và tiết kiệm nhiên liệu. Chủ xe bàn giao xe sạch sẽ, đúng giờ. 10/10!",
                    IsPublic = true,
                    CreatedAt = bk01.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bk01.BookingId,
                    ReviewerId = u["owner1"].Id,
                    RevieweeId = u["renter1"].Id,
                    Rating = 5,
                    Comment = "Khách thuê rất lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn. Rất mong được tiếp tục đón tiếp anh trong các chuyến đi tới!",
                    IsPublic = true,
                    CreatedAt = bk01.EndDate.AddHours(3)
                }
            );

            // BK02: Double-Blind Review test! Renter reviewed 5-star, Owner hasn't reviewed yet -> IsPublic = false
            db.Reviews.Add(new Review
            {
                BookingId = bk02.BookingId,
                ReviewerId = u["renter2"].Id,
                RevieweeId = u["owner2"].Id,
                Rating = 5,
                Comment = "Xe Mazda CX-5 lái rất đầm chắc, âm thanh Bose nghe hay, chủ xe chu đáo chuẩn bị cả nước hoa và khăn ướt.",
                IsPublic = false,
                CreatedAt = bk02.EndDate.AddHours(1)
            });

            // BK03: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bk03.BookingId,
                    ReviewerId = u["renter3"].Id,
                    RevieweeId = u["owner1"].Id,
                    Rating = 5,
                    Comment = "Chuyến đi công tác Đà Nẵng rất thuận lợi nhờ xe Corolla Cross gầm cao, máy êm và tiết kiệm xăng.",
                    IsPublic = true,
                    CreatedAt = bk03.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bk03.BookingId,
                    ReviewerId = u["owner1"].Id,
                    RevieweeId = u["renter3"].Id,
                    Rating = 5,
                    Comment = "Khách thuê giao tiếp nhã nhặn, tuân thủ đúng giờ giấc bàn giao xe.",
                    IsPublic = true,
                    CreatedAt = bk03.EndDate.AddHours(3)
                }
            );

            // BK04: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bk04.BookingId,
                    ReviewerId = u["renter1"].Id,
                    RevieweeId = u["owner2"].Id,
                    Rating = 5,
                    Comment = "Trải nghiệm xe điện VinFast VF e34 tại Đà Nẵng cực kỳ thú vị! Trạm sạc nhiều, xe tăng tốc mượt mà.",
                    IsPublic = true,
                    CreatedAt = bk04.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bk04.BookingId,
                    ReviewerId = u["owner2"].Id,
                    RevieweeId = u["renter1"].Id,
                    Rating = 5,
                    Comment = "Khách trả xe với mức pin 90%, xe sạch sẽ không một hạt bụi. Rất cảm ơn bạn!",
                    IsPublic = true,
                    CreatedAt = bk04.EndDate.AddHours(3)
                }
            );

            // BK15: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bk15.BookingId,
                    ReviewerId = u["renter4"].Id,
                    RevieweeId = u["owner2"].Id,
                    Rating = 5,
                    Comment = "Xe CX-30 rất mới, chạy phố Sài Gòn linh hoạt và kiểu dáng rất đẹp.",
                    IsPublic = true,
                    CreatedAt = bk15.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bk15.BookingId,
                    ReviewerId = u["owner2"].Id,
                    RevieweeId = u["renter4"].Id,
                    Rating = 5,
                    Comment = "Khách hàng thân thiện, trả xe đúng giờ.",
                    IsPublic = true,
                    CreatedAt = bk15.EndDate.AddHours(3)
                }
            );

            // Disputes
            // BK06: Ongoing with Open Dispute (AC broken & Check Engine)
            db.Disputes.Add(new Dispute
            {
                BookingId = bk06.BookingId,
                RaisedBy = u["renter3"].Id,
                Description = "Khi nhận xe chạy được khoảng 30km trên cao tốc thì hệ thống điều hòa ngừng làm mát, khoang xe phả hơi nóng bức bí và bảng taplo xuất hiện đèn báo check-engine nhấp nháy. Tôi đã liên hệ chủ xe nhiều lần nhưng không được phản hồi, đề nghị Ban quản trị sàn can thiệp khẩn cấp hỗ trợ giải quyết sự cố kỹ thuật này.",
                EvidenceImage = "/seed/dispute-evidence-1.jpg",
                Status = DisputeStatuses.Open,
                CreatedAt = now.AddHours(-16),
                ResolvedBy = null,
                ResolvedAt = null,
                ResolutionAction = null,
                ResolutionNotes = null
            });

            // BK07: Completed with Resolved Dispute (ForceComplete - Scratch Dispute)
            db.Disputes.Add(new Dispute
            {
                BookingId = bk07.BookingId,
                RaisedBy = u["renter1"].Id,
                Description = "Chủ xe yêu cầu giữ lại 500.000đ tiền đặt cọc vì lý do có vết trầy xước ở mép cản dưới bên phụ. Tôi khẳng định vết xước này đã có sẵn khi nhận xe và đã được chụp lại trong biên bản bàn giao ban đầu.",
                EvidenceImage = "/seed/dispute-evidence-2.jpg",
                Status = DisputeStatuses.Resolved,
                CreatedAt = bk07.EndDate.AddHours(1),
                ResolvedBy = staff1.Id,
                ResolvedAt = bk07.EndDate.AddHours(4),
                ResolutionAction = ResolutionActions.ForceComplete,
                ResolutionNotes = "Đã đối chiếu hình ảnh chụp lúc nhận xe trong biên bản bàn giao: vết trầy xước cản dưới đã có từ trước chuyến đi. Quyết định hoàn đủ 100% cọc cho khách thuê và hoàn tất thanh toán doanh thu cho chủ xe theo quy định sàn."
            });

            // BK08: Cancelled with Resolved Dispute (CancelOwnerFault - Owner No-show & Penalty)
            db.Disputes.Add(new Dispute
            {
                BookingId = bk08.BookingId,
                RaisedBy = u["renter2"].Id,
                Description = "Sáng ngày nhận xe, tôi đến điểm hẹn đúng giờ nhưng chủ xe không có mặt, tắt máy điện thoại không liên lạc được và sau đó nhắn báo bận cho mượn xe ngoài. Hành vi này làm hỏng toàn bộ lịch trình công tác của đoàn chúng tôi.",
                EvidenceImage = "/seed/dispute-evidence-2.jpg",
                Status = DisputeStatuses.Resolved,
                CreatedAt = bk08.StartDate.AddHours(1),
                ResolvedBy = admin1.Id,
                ResolvedAt = bk08.StartDate.AddHours(4),
                ResolutionAction = ResolutionActions.CancelOwnerFault,
                ResolutionNotes = "Xác minh chủ xe tự ý hủy hẹn và vi phạm nghiêm trọng cam kết bàn giao xe. Phán quyết hủy đơn, hoàn trả 100% tiền đặt cọc cho khách thuê và áp dụng chế tài phạt vi phạm 10% giá trị hợp đồng (195.000đ) đối với chủ xe."
            });

            await db.SaveChangesAsync();
        }
    }
}
