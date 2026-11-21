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
        await SeedNotificationsAsync(db, users);
        await SeedPaymentCardsAsync(db, users);

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

            if (isRenterOrOwner && key != "renter3" && key != "renter4")
            {
                var userClaims = await um.GetClaimsAsync(user);
                if (!userClaims.Any(c => c.Type == AppClaimTypes.DriverLicenseVerified))
                {
                    await um.AddClaimAsync(user, new Claim(AppClaimTypes.DriverLicenseVerified, AppClaimTypes.GrantedValue));
                }
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

                // seed comprehensive business scenarios (30 test bookings across Nov 2026, Dec 2026, Jan 2027)
        bool needSeedBookings = !await db.Bookings.AnyAsync(b => b.StartDate.Year == 2027);
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
                DateTime start,
                DateTime end,
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
                var rentalDays = (end.Date - start.Date).Days + 1;
                if (rentalDays < 1) rentalDays = 1;

                var rentalSubtotal = listing.PricePerDay * rentalDays;
                var deliveryFee = delivery ? 100_000m : 0m;
                var insuranceFee = 50_000m * rentalDays;
                var total = rentalSubtotal + deliveryFee + insuranceFee;
                var deposit = Math.Round(total * BusinessRules.DepositRate);

                var created = customCreated ?? (start < now ? start.AddDays(-3) : (now < start ? now.AddHours(-6) : start.AddDays(-1)));
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

            // --- THÁNG 11/2026 (10 đơn) ---
            var bkNov01 = CreateBookingRecord("renter1", "V1", new DateTime(2026, 11, 1), new DateTime(2026, 11, 4), BookingStatuses.Completed, delivery: true, customCreated: new DateTime(2026, 10, 28, 10, 0, 0), customAcceptedAt: new DateTime(2026, 10, 28, 14, 0, 0));
            var bkNov02 = CreateBookingRecord("renter2", "V3", new DateTime(2026, 11, 5), new DateTime(2026, 11, 8), BookingStatuses.Completed, delivery: false, customCreated: new DateTime(2026, 11, 2, 9, 0, 0), customAcceptedAt: new DateTime(2026, 11, 2, 12, 0, 0));
            var bkNov03 = CreateBookingRecord("renter3", "V7", new DateTime(2026, 11, 3), new DateTime(2026, 11, 6), BookingStatuses.Completed, delivery: false, customCreated: new DateTime(2026, 10, 31, 14, 0, 0), customAcceptedAt: new DateTime(2026, 10, 31, 16, 0, 0));
            var bkNov04 = CreateBookingRecord("renter1", "V9", new DateTime(2026, 11, 8), new DateTime(2026, 11, 11), BookingStatuses.Completed, delivery: true, customCreated: new DateTime(2026, 11, 5, 8, 30, 0), customAcceptedAt: new DateTime(2026, 11, 5, 11, 0, 0));
            var bkNov05 = CreateBookingRecord("renter2", "V13", new DateTime(2026, 11, 10), new DateTime(2026, 11, 13), BookingStatuses.Completed, delivery: false, customCreated: new DateTime(2026, 11, 7, 10, 0, 0), customAcceptedAt: new DateTime(2026, 11, 7, 13, 0, 0));
            var bkNov06 = CreateBookingRecord("renter4", "V14", new DateTime(2026, 11, 2), new DateTime(2026, 11, 5), BookingStatuses.Completed, delivery: false, customCreated: new DateTime(2026, 10, 29, 9, 0, 0), customAcceptedAt: new DateTime(2026, 10, 29, 11, 0, 0));
            var bkNov07 = CreateBookingRecord("renter2", "V8", new DateTime(2026, 11, 17), new DateTime(2026, 11, 20), BookingStatuses.Ongoing, delivery: false, customCreated: new DateTime(2026, 11, 15, 14, 0, 0), customAcceptedAt: new DateTime(2026, 11, 15, 16, 0, 0));
            var bkNov08 = CreateBookingRecord("renter3", "V11", new DateTime(2026, 11, 16), new DateTime(2026, 11, 19), BookingStatuses.Ongoing, delivery: true, customCreated: new DateTime(2026, 11, 14, 8, 0, 0), customAcceptedAt: new DateTime(2026, 11, 14, 10, 0, 0));
            var bkNov09 = CreateBookingRecord("renter1", "V10", new DateTime(2026, 11, 21), new DateTime(2026, 11, 24), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 17, 9, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 11, 30, 0));
            var bkNov10 = CreateBookingRecord("renter3", "V2", new DateTime(2026, 11, 24), new DateTime(2026, 11, 27), BookingStatuses.Pending, delivery: false, customCreated: new DateTime(2026, 11, 18, 9, 0, 0));

            // --- THÁNG 12/2026 (10 đơn) ---
            var bkDec01 = CreateBookingRecord("renter2", "V1", new DateTime(2026, 12, 6), new DateTime(2026, 12, 9), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 18, 10, 0, 0), customAcceptedAt: new DateTime(2026, 11, 18, 12, 0, 0));
            var bkDec02 = CreateBookingRecord("renter3", "V4", new DateTime(2026, 12, 10), new DateTime(2026, 12, 13), BookingStatuses.Accepted, delivery: true, customCreated: new DateTime(2026, 11, 17, 15, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 17, 0, 0));
            var bkDec03 = CreateBookingRecord("renter1", "V6", new DateTime(2026, 12, 4), new DateTime(2026, 12, 7), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 16, 10, 0, 0), customAcceptedAt: new DateTime(2026, 11, 16, 14, 0, 0));
            var bkDec04 = CreateBookingRecord("renter2", "V7", new DateTime(2026, 12, 12), new DateTime(2026, 12, 16), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 17, 11, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 14, 0, 0));
            var bkDec05 = CreateBookingRecord("renter3", "V9", new DateTime(2026, 12, 18), new DateTime(2026, 12, 21), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 16, 16, 0, 0), customAcceptedAt: new DateTime(2026, 11, 16, 19, 0, 0));
            var bkDec06 = CreateBookingRecord("renter1", "V12", new DateTime(2026, 12, 24), new DateTime(2026, 12, 27), BookingStatuses.Accepted, delivery: true, customCreated: new DateTime(2026, 11, 15, 10, 0, 0), customAcceptedAt: new DateTime(2026, 11, 15, 13, 0, 0));
            var bkDec07 = CreateBookingRecord("renter2", "V14", new DateTime(2026, 12, 15), new DateTime(2026, 12, 18), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 17, 13, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 15, 0, 0));
            var bkDec08 = CreateBookingRecord("renter3", "V15", new DateTime(2026, 12, 20), new DateTime(2026, 12, 23), BookingStatuses.Pending, delivery: true, customCreated: new DateTime(2026, 11, 18, 11, 0, 0));
            var bkDec09 = CreateBookingRecord("renter1", "V5", new DateTime(2026, 12, 15), new DateTime(2026, 12, 18), BookingStatuses.Cancelled, delivery: false, customCreated: new DateTime(2026, 11, 14, 9, 0, 0), customCancelledAt: new DateTime(2026, 11, 16, 10, 0, 0), cancelledByKey: "renter1", cancelReason: "Gia đình có việc bận đột xuất nên dời lịch trình công tác sang tháng 1.");
            var bkDec10 = CreateBookingRecord("renter2", "V2", new DateTime(2026, 12, 8), new DateTime(2026, 12, 11), BookingStatuses.Rejected, delivery: false, customCreated: new DateTime(2026, 11, 15, 14, 0, 0), rejectReason: "Xe đã có lịch bảo dưỡng và bảo hiểm định kỳ đợt cuối năm, rất tiếc không phục vụ được bạn.");

            // --- THÁNG 01/2027 (10 đơn) ---
            var bkJan01 = CreateBookingRecord("renter1", "V1", new DateTime(2027, 1, 1), new DateTime(2027, 1, 4), BookingStatuses.Accepted, delivery: true, customCreated: new DateTime(2026, 11, 16, 8, 0, 0), customAcceptedAt: new DateTime(2026, 11, 16, 10, 0, 0));
            var bkJan02 = CreateBookingRecord("renter3", "V3", new DateTime(2027, 1, 2), new DateTime(2027, 1, 5), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 17, 9, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 11, 0, 0));
            var bkJan03 = CreateBookingRecord("renter2", "V5", new DateTime(2027, 1, 8), new DateTime(2027, 1, 12), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 16, 14, 0, 0), customAcceptedAt: new DateTime(2026, 11, 16, 17, 0, 0));
            var bkJan04 = CreateBookingRecord("renter1", "V8", new DateTime(2027, 1, 5), new DateTime(2027, 1, 9), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 17, 10, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 12, 0, 0));
            var bkJan05 = CreateBookingRecord("renter3", "V10", new DateTime(2027, 1, 10), new DateTime(2027, 1, 13), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 15, 11, 0, 0), customAcceptedAt: new DateTime(2026, 11, 15, 14, 0, 0));
            var bkJan06 = CreateBookingRecord("renter2", "V11", new DateTime(2027, 1, 15), new DateTime(2027, 1, 19), BookingStatuses.Accepted, delivery: true, customCreated: new DateTime(2026, 11, 16, 15, 0, 0), customAcceptedAt: new DateTime(2026, 11, 16, 18, 0, 0));
            var bkJan07 = CreateBookingRecord("renter1", "V13", new DateTime(2027, 1, 8), new DateTime(2027, 1, 11), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 17, 14, 0, 0), customAcceptedAt: new DateTime(2026, 11, 17, 16, 0, 0));
            var bkJan08 = CreateBookingRecord("renter3", "V14", new DateTime(2027, 1, 12), new DateTime(2027, 1, 15), BookingStatuses.Accepted, delivery: false, customCreated: new DateTime(2026, 11, 16, 9, 0, 0), customAcceptedAt: new DateTime(2026, 11, 16, 11, 0, 0));
            var bkJan09 = CreateBookingRecord("renter2", "V15", new DateTime(2027, 1, 20), new DateTime(2027, 1, 24), BookingStatuses.Pending, delivery: false, customCreated: new DateTime(2026, 11, 18, 8, 30, 0));
            var bkJan10 = CreateBookingRecord("renter1", "V4", new DateTime(2027, 1, 18), new DateTime(2027, 1, 21), BookingStatuses.Cancelled, delivery: false, customCreated: new DateTime(2026, 11, 14, 10, 0, 0), customCancelledAt: new DateTime(2026, 11, 15, 14, 0, 0), cancelledByKey: "admin1", cancelReason: "Hủy bởi Admin do lỗi chủ xe: Chủ xe tự ý đơn phương hủy thỏa thuận sau khi đã duyệt và nhận cọc của khách thuê.");

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
                        Notes = "Nhận xe đúng giờ, ngoại thất và nội thất sạch sẽ."
                    },
                    new HandoverConfirmation
                    {
                        BookingId = b.BookingId,
                        Type = HandoverTypes.Pickup,
                        ConfirmedBy = owner.Id,
                        ConfirmedAt = b.StartDate.AddMinutes(5),
                        Odometer = startOdo,
                        FuelLevel = "Full",
                        Notes = "Đã bàn giao chìa khóa và giấy tờ xe đầy đủ cho khách."
                    },
                    new HandoverConfirmation
                    {
                        BookingId = b.BookingId,
                        Type = HandoverTypes.Return,
                        ConfirmedBy = renter.Id,
                        ConfirmedAt = b.EndDate,
                        Odometer = endOdo,
                        FuelLevel = "Full",
                        Notes = "Trả xe đúng hạn, xe vận hành rất tốt và êm ái.",
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
                        Notes = "Đã nhận lại xe nguyên vẹn, nhận đủ tiền mặt còn lại.",
                        RemainingPaymentMethod = "Cash"
                    }
                );
            }

            AddFullHandovers(bkNov01, u["renter1"], u["owner1"], 18200, 18650);
            AddFullHandovers(bkNov02, u["renter2"], u["owner2"], 12100, 12480);
            AddFullHandovers(bkNov03, u["renter3"], u["owner1"], 15300, 15820);
            AddFullHandovers(bkNov04, u["renter1"], u["owner2"], 9200, 9650);
            AddFullHandovers(bkNov05, u["renter2"], u["owner1"], 21400, 21860);
            AddFullHandovers(bkNov06, u["renter4"], u["owner2"], 10500, 10920);

            // Pickup only for Ongoing
            db.HandoverConfirmations.AddRange(
                new HandoverConfirmation
                {
                    BookingId = bkNov07.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["renter2"].Id,
                    ConfirmedAt = bkNov07.StartDate,
                    Odometer = 24150,
                    FuelLevel = "Full",
                    Notes = "Đã nhận xe, kiểm tra thân vỏ xe hoạt động tốt."
                },
                new HandoverConfirmation
                {
                    BookingId = bkNov07.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["owner1"].Id,
                    ConfirmedAt = bkNov07.StartDate.AddMinutes(5),
                    Odometer = 24150,
                    FuelLevel = "Full",
                    Notes = "Đã bàn giao xe và đầy đủ giấy tờ cho bạn Bình."
                },
                new HandoverConfirmation
                {
                    BookingId = bkNov08.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["renter3"].Id,
                    ConfirmedAt = bkNov08.StartDate,
                    Odometer = 38500,
                    FuelLevel = "Full",
                    Notes = "Nhận xe tại điểm hẹn."
                },
                new HandoverConfirmation
                {
                    BookingId = bkNov08.BookingId,
                    Type = HandoverTypes.Pickup,
                    ConfirmedBy = u["owner3"].Id,
                    ConfirmedAt = bkNov08.StartDate.AddMinutes(5),
                    Odometer = 38500,
                    FuelLevel = "Full",
                    Notes = "Đã bàn giao xe và giấy tờ cho anh Cường."
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

            AddCompletedPayment(bkNov01, "renter1", "owner1");
            AddCompletedPayment(bkNov02, "renter2", "owner2");
            AddCompletedPayment(bkNov03, "renter3", "owner1");
            AddCompletedPayment(bkNov04, "renter1", "owner2");
            AddCompletedPayment(bkNov05, "renter2", "owner1");
            AddCompletedPayment(bkNov06, "renter4", "owner2");

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

            // November active payments
            AddActivePayment(bkNov07, "renter2");
            AddActivePayment(bkNov08, "renter3");
            AddActivePayment(bkNov09, "renter1");
            AddActivePayment(bkNov10, "renter3");

            // December active payments
            AddActivePayment(bkDec01, "renter2");
            AddActivePayment(bkDec02, "renter3");
            AddActivePayment(bkDec03, "renter1");
            AddActivePayment(bkDec04, "renter2");
            AddActivePayment(bkDec05, "renter3");
            AddActivePayment(bkDec06, "renter1");
            AddActivePayment(bkDec07, "renter2");
            AddActivePayment(bkDec08, "renter3");

            // January active payments
            AddActivePayment(bkJan01, "renter1");
            AddActivePayment(bkJan02, "renter3");
            AddActivePayment(bkJan03, "renter2");
            AddActivePayment(bkJan04, "renter1");
            AddActivePayment(bkJan05, "renter3");
            AddActivePayment(bkJan06, "renter2");
            AddActivePayment(bkJan07, "renter1");
            AddActivePayment(bkJan08, "renter3");
            AddActivePayment(bkJan09, "renter2");

            // Cancelled with refund: bkDec09
            var r1Acc = bankAccounts[u["renter1"].Id];
            var bkDec09Payment = new Payment
            {
                BookingId = bkDec09.BookingId,
                DepositStatus = DepositStatuses.Refunded,
                CommissionRate = BusinessRules.DefaultCommissionRate,
                CommissionAmount = null,
                RevenueRecordedAt = null
            };
            db.Payments.Add(bkDec09Payment);
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Deposit(bkDec09.SourceHoldId),
                Payment = bkDec09Payment,
                FromAccount = r1Acc,
                ToAccount = escrowAcc,
                TransactionType = MockTransactionTypes.Deposit,
                Amount = bkDec09.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bkDec09.CreatedAt
            });
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Refund(bkDec09.BookingId),
                Payment = bkDec09Payment,
                FromAccount = escrowAcc,
                ToAccount = r1Acc,
                TransactionType = MockTransactionTypes.Refund,
                Amount = bkDec09.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bkDec09.CancelledAt ?? bkDec09.CreatedAt.AddHours(3)
            });

            // Cancelled with Owner Fault penalty 8%: bkJan10
            var o2Acc = bankAccounts[u["owner2"].Id];
            var bkJan10Penalty = Math.Round(bkJan10.PriceLockedTotal * BusinessRules.OwnerCancelPenaltyRate);
            var bkJan10Payment = new Payment
            {
                BookingId = bkJan10.BookingId,
                DepositStatus = DepositStatuses.Refunded,
                CommissionRate = 0,
                CommissionAmount = 0,
                PenaltyAmount = bkJan10Penalty
            };
            db.Payments.Add(bkJan10Payment);
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Deposit(bkJan10.SourceHoldId),
                Payment = bkJan10Payment,
                FromAccount = r1Acc,
                ToAccount = escrowAcc,
                TransactionType = MockTransactionTypes.Deposit,
                Amount = bkJan10.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bkJan10.CreatedAt
            });
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Refund(bkJan10.BookingId),
                Payment = bkJan10Payment,
                FromAccount = escrowAcc,
                ToAccount = r1Acc,
                TransactionType = MockTransactionTypes.Refund,
                Amount = bkJan10.DepositAmount,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bkJan10.CancelledAt ?? bkJan10.CreatedAt.AddHours(4)
            });
            db.MockBankTransactions.Add(new MockBankTransaction
            {
                ReferenceCode = ReferenceCodes.Penalty(bkJan10.BookingId),
                Payment = bkJan10Payment,
                FromAccount = o2Acc,
                ToAccount = escrowAcc,
                TransactionType = MockTransactionTypes.Penalty,
                Amount = bkJan10Penalty,
                Status = MockTransactionStatuses.Succeeded,
                CreatedAt = bkJan10.CancelledAt ?? bkJan10.CreatedAt.AddHours(4)
            });

            // Reviews
            // BK-NOV-01: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bkNov01.BookingId,
                    ReviewerId = u["renter1"].Id,
                    RevieweeId = u["owner1"].Id,
                    Rating = 5,
                    Comment = "Xe Toyota Vios đi rất êm, máy móc vận hành trơn tru và tiết kiệm nhiên liệu. Chủ xe bàn giao xe sạch sẽ, đúng giờ. 10/10!",
                    IsPublic = true,
                    CreatedAt = bkNov01.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bkNov01.BookingId,
                    ReviewerId = u["owner1"].Id,
                    RevieweeId = u["renter1"].Id,
                    Rating = 5,
                    Comment = "Khách thuê rất lịch sự, giữ gìn xe sạch sẽ và giao trả xe đúng hẹn. Rất mong được tiếp tục đón tiếp anh trong các chuyến đi tới!",
                    IsPublic = true,
                    CreatedAt = bkNov01.EndDate.AddHours(3)
                }
            );

            // BK-NOV-02: Double-Blind Review test! Renter reviewed 5-star, Owner hasn't reviewed yet -> IsPublic = false
            db.Reviews.Add(new Review
            {
                BookingId = bkNov02.BookingId,
                ReviewerId = u["renter2"].Id,
                RevieweeId = u["owner2"].Id,
                Rating = 5,
                Comment = "Xe Mazda CX-5 lái rất đầm chắc, âm thanh Bose nghe hay, chủ xe chu đáo chuẩn bị cả nước hoa và khăn ướt.",
                IsPublic = false,
                CreatedAt = bkNov02.EndDate.AddHours(1)
            });

            // BK-NOV-03: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bkNov03.BookingId,
                    ReviewerId = u["renter3"].Id,
                    RevieweeId = u["owner1"].Id,
                    Rating = 5,
                    Comment = "Chuyến đi công tác Đà Nẵng rất thuận lợi nhờ xe Corolla Cross gầm cao, máy êm và tiết kiệm xăng.",
                    IsPublic = true,
                    CreatedAt = bkNov03.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bkNov03.BookingId,
                    ReviewerId = u["owner1"].Id,
                    RevieweeId = u["renter3"].Id,
                    Rating = 5,
                    Comment = "Khách thuê giao tiếp nhã nhặn, tuân thủ đúng giờ giấc bàn giao xe.",
                    IsPublic = true,
                    CreatedAt = bkNov03.EndDate.AddHours(3)
                }
            );

            // BK-NOV-04: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bkNov04.BookingId,
                    ReviewerId = u["renter1"].Id,
                    RevieweeId = u["owner2"].Id,
                    Rating = 5,
                    Comment = "Trải nghiệm xe điện VinFast VF e34 tại Đà Nẵng cực kỳ thú vị! Trạm sạc nhiều, xe tăng tốc mượt mà.",
                    IsPublic = true,
                    CreatedAt = bkNov04.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bkNov04.BookingId,
                    ReviewerId = u["owner2"].Id,
                    RevieweeId = u["renter1"].Id,
                    Rating = 5,
                    Comment = "Khách trả xe với mức pin 90%, xe sạch sẽ không một hạt bụi. Rất cảm ơn bạn!",
                    IsPublic = true,
                    CreatedAt = bkNov04.EndDate.AddHours(3)
                }
            );

            // BK-NOV-06: 2-way 5-star public reviews
            db.Reviews.AddRange(
                new Review
                {
                    BookingId = bkNov06.BookingId,
                    ReviewerId = u["renter4"].Id,
                    RevieweeId = u["owner2"].Id,
                    Rating = 5,
                    Comment = "Xe CX-30 rất mới, chạy phố Sài Gòn linh hoạt và kiểu dáng rất đẹp.",
                    IsPublic = true,
                    CreatedAt = bkNov06.EndDate.AddHours(2)
                },
                new Review
                {
                    BookingId = bkNov06.BookingId,
                    ReviewerId = u["owner2"].Id,
                    RevieweeId = u["renter4"].Id,
                    Rating = 5,
                    Comment = "Khách hàng thân thiện, trả xe đúng giờ.",
                    IsPublic = true,
                    CreatedAt = bkNov06.EndDate.AddHours(3)
                }
            );

            // Disputes
            // BK-NOV-08: Ongoing with Open Dispute (AC broken & Check Engine)
            db.Disputes.Add(new Dispute
            {
                BookingId = bkNov08.BookingId,
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

            // BK-NOV-05: Completed with Resolved Dispute (ForceComplete - Scratch Dispute)
            db.Disputes.Add(new Dispute
            {
                BookingId = bkNov05.BookingId,
                RaisedBy = u["renter2"].Id,
                Description = "Chủ xe yêu cầu giữ lại 500.000đ tiền đặt cọc vì lý do có vết trầy xước ở mép cản dưới bên phụ. Tôi khẳng định vết xước này đã có sẵn khi nhận xe và đã được chụp lại trong biên bản bàn giao ban đầu.",
                EvidenceImage = "/seed/dispute-evidence-2.jpg",
                Status = DisputeStatuses.Resolved,
                CreatedAt = bkNov05.EndDate.AddHours(1),
                ResolvedBy = staff1.Id,
                ResolvedAt = bkNov05.EndDate.AddHours(4),
                ResolutionAction = ResolutionActions.ForceComplete,
                ResolutionNotes = "Đã đối chiếu hình ảnh chụp lúc nhận xe trong biên bản bàn giao: vết trầy xước cản dưới đã có từ trước chuyến đi. Quyết định hoàn đủ 100% cọc cho khách thuê và hoàn tất thanh toán doanh thu cho chủ xe theo quy định sàn."
            });

            // BK-JAN-10: Cancelled with Resolved Dispute (CancelOwnerFault - Owner Fault Penalty 8%)
            db.Disputes.Add(new Dispute
            {
                BookingId = bkJan10.BookingId,
                RaisedBy = u["renter1"].Id,
                Description = "Chủ xe tự ý đơn phương hủy hợp đồng sau khi đã duyệt thỏa thuận thuê xe, gây gián đoạn lịch trình công tác của tôi.",
                EvidenceImage = "/seed/dispute-evidence-2.jpg",
                Status = DisputeStatuses.Resolved,
                CreatedAt = bkJan10.CreatedAt.AddHours(1),
                ResolvedBy = admin1.Id,
                ResolvedAt = bkJan10.CancelledAt ?? bkJan10.CreatedAt.AddHours(4),
                ResolutionAction = ResolutionActions.CancelOwnerFault,
                ResolutionNotes = "Xác minh chủ xe tự ý hủy chuyến đã duyệt. Phán quyết hủy đơn, hoàn 100% tiền đặt cọc cho khách thuê và áp dụng chế tài phạt vi phạm 8% giá trị hợp đồng đối với chủ xe theo quy chế sàn."
            });

            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedNotificationsAsync(
        ApplicationDbContext db,
        Dictionary<string, ApplicationUser> u)
    {
        if (await db.Notifications.AnyAsync()) return;

        var now = DateTime.UtcNow;

        if (u.TryGetValue("renter1", out var r1))
        {
            db.Notifications.AddRange(
                new Notification
                {
                    UserId = r1.Id,
                    Title = "Chủ xe đã duyệt yêu cầu!",
                    Message = "Chủ xe Trần Thị B đã phê duyệt đơn thuê xe Toyota Vios 2023. Chuyến đi bắt đầu lúc 09:00 ngày mai.",
                    Type = "trip",
                    ActionUrl = "/account#trips",
                    IsRead = false,
                    CreatedAt = now.AddMinutes(-25)
                },
                new Notification
                {
                    UserId = r1.Id,
                    Title = "Đặt xe & Ký quỹ thành công",
                    Message = "Đơn thuê xe Hyundai Tucson (#BK-1004) đã được ký quỹ trực tuyến 100% an toàn tại tài khoản bảo chứng AZU Escrow.",
                    Type = "trip",
                    ActionUrl = "/account#trips",
                    IsRead = true,
                    CreatedAt = now.AddHours(-3)
                }
            );
        }

        if (u.TryGetValue("owner1", out var o1))
        {
            db.Notifications.AddRange(
                new Notification
                {
                    UserId = o1.Id,
                    Title = "Yêu cầu thuê xe mới",
                    Message = "Khách thuê Nguyễn Văn A vừa gửi yêu cầu thuê xe Mazda CX-5 (43A-999.88). Hạn phản hồi: 20:00 tối nay.",
                    Type = "trip",
                    ActionUrl = "/owner",
                    IsRead = false,
                    CreatedAt = now.AddMinutes(-40)
                },
                new Notification
                {
                    UserId = o1.Id,
                    Title = "Chuyến đi hoàn tất & Quyết toán",
                    Message = "Đơn thuê xe Toyota Vios đã hoàn tất nghiệm thu. Doanh thu 1.710.000 đ (sau khi trừ 5% hoa hồng) đã được quyết toán chuyển về tài khoản của bạn.",
                    Type = "trip",
                    ActionUrl = "/owner",
                    IsRead = true,
                    CreatedAt = now.AddDays(-1)
                }
            );
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedPaymentCardsAsync(
        ApplicationDbContext db, Dictionary<string, ApplicationUser> u)
    {
        if (await db.PaymentCards.AnyAsync()) return;

        if (u.TryGetValue("renter1", out var r1))
        {
            var now = DateTime.UtcNow;
            db.PaymentCards.AddRange(
                new PaymentCard
                {
                    UserId = r1.Id,
                    CardHolderName = "NGUYEN VAN THUE",
                    CardNumberMasked = "•••• •••• •••• 8899",
                    Last4Digits = "8899",
                    CardBrand = "Visa",
                    ExpiryMonth = 8,
                    ExpiryYear = 2028,
                    IsDefault = true,
                    CreatedAt = now.AddDays(-15)
                },
                new PaymentCard
                {
                    UserId = r1.Id,
                    CardHolderName = "NGUYEN VAN THUE",
                    CardNumberMasked = "•••• •••• •••• 4321",
                    Last4Digits = "4321",
                    CardBrand = "Mastercard",
                    ExpiryMonth = 12,
                    ExpiryYear = 2027,
                    IsDefault = false,
                    CreatedAt = now.AddDays(-5)
                }
            );
            await db.SaveChangesAsync();
        }
    }
}
