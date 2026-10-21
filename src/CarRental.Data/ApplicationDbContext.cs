using CarRental.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Text.RegularExpressions;

namespace CarRental.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<AccountSanction> AccountSanctions => Set<AccountSanction>();
    public DbSet<DriverLicense> DriverLicenses => Set<DriverLicense>();
    public DbSet<OwnerProfile> OwnerProfiles => Set<OwnerProfile>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<VehicleDocument> VehicleDocuments => Set<VehicleDocument>();
    public DbSet<VehicleListing> VehicleListings => Set<VehicleListing>();
    public DbSet<ListingImage> ListingImages => Set<ListingImage>();
    public DbSet<VehicleUnavailability> VehicleUnavailabilities => Set<VehicleUnavailability>();
    public DbSet<DepositHold> DepositHolds => Set<DepositHold>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<HandoverConfirmation> HandoverConfirmations => Set<HandoverConfirmation>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<MockBankAccount> MockBankAccounts => Set<MockBankAccount>();
    public DbSet<MockBankTransaction> MockBankTransactions => Set<MockBankTransaction>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<Dispute> Disputes => Set<Dispute>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Identity Auth Table 
        builder.Entity<ApplicationUser>(b =>
        {
            b.ToTable("users");
            b.Property(u => u.Id).HasColumnName("user_id").HasMaxLength(255);
            b.Property(u => u.UserName).HasColumnName("username").HasMaxLength(50);
            b.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255);
            b.Property(u => u.FullName).HasColumnName("full_name").HasMaxLength(100);
            b.Property(u => u.Gender).HasColumnName("gender");
            b.Property(u => u.Email).HasColumnName("email").HasMaxLength(255);
            b.Property(u => u.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20);

            b.HasIndex(u => u.UserName).IsUnique();
            b.HasIndex(u => u.Email).IsUnique();
            b.HasIndex(u => u.PhoneNumber).IsUnique();
        });

        builder.Entity<IdentityRole>(b =>
        {
            b.ToTable("roles");
            b.Property(r => r.Id).HasColumnName("role_id").HasMaxLength(255);
            b.Property(r => r.Name).HasColumnName("role_name").HasMaxLength(20);
            b.HasIndex(r => r.Name).IsUnique();
        });

        builder.Entity<IdentityUserRole<string>>(b =>
        {
            b.ToTable("user_roles");
            b.Property(ur => ur.UserId).HasColumnName("user_id").HasMaxLength(255);
            b.Property(ur => ur.RoleId).HasColumnName("role_id").HasMaxLength(255);
        });

        builder.Entity<IdentityUserClaim<string>>(b =>
        {
            b.ToTable("user_claims");
            b.Property(uc => uc.Id).HasColumnName("claim_id");
            b.Property(uc => uc.UserId).HasColumnName("user_id").HasMaxLength(255);
            b.Property(uc => uc.ClaimType).HasColumnName("claim_type").HasMaxLength(100);
            b.Property(uc => uc.ClaimValue).HasColumnName("claim_value").HasMaxLength(100);
        });

        builder.Entity<AccountSanction>(b =>
        {
            b.ToTable("account_sanction");
            b.HasKey(x => x.SanctionId);
            b.HasOne(x => x.User).WithMany(u => u.Sanctions).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Issuer).WithMany().HasForeignKey(x => x.IssuedBy).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Lifter).WithMany().HasForeignKey(x => x.LiftedBy).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<DriverLicense>(b =>
        {
            b.ToTable("driver_licenses");
            b.HasKey(x => x.UserId);
            b.HasIndex(x => x.LicenseNumber).IsUnique();
            b.HasOne(x => x.User).WithOne(u => u.DriverLicense).HasForeignKey<DriverLicense>(x => x.UserId);
        });

        // Vehicle 
        builder.Entity<OwnerProfile>(b =>
        {
            b.ToTable("owner_profiles");
            b.HasKey(x => x.OwnerProfileId);
            b.HasIndex(x => x.UserId).IsUnique();
            b.HasIndex(x => x.CccdNumber).IsUnique();
            b.HasOne(x => x.User).WithOne(u => u.OwnerProfile).HasForeignKey<OwnerProfile>(x => x.UserId);
            b.HasOne(x => x.Reviewer).WithMany().HasForeignKey(x => x.ReviewedBy).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Vehicle>(b =>
        {
            b.ToTable("vehicles");
            b.HasKey(x => x.VehicleId);
            b.HasIndex(x => x.LicensePlate).IsUnique();
            b.HasOne(x => x.Owner).WithMany(u => u.Vehicles).HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<VehicleDocument>(b =>
        {
            b.ToTable("vehicle_documents");
            b.HasKey(x => x.DocumentId);
            b.HasIndex(x => x.VehicleId).IsUnique();
            b.HasOne(x => x.Vehicle).WithOne(v => v.Document).HasForeignKey<VehicleDocument>(x => x.VehicleId);
        });

        builder.Entity<VehicleListing>(b =>
        {
            b.ToTable("vehicle_listings");
            b.HasKey(x => x.ListingId);
            b.Property(x => x.PricePerDay).HasPrecision(12, 2);
            b.Property(x => x.Latitude).HasPrecision(9, 6);
            b.Property(x => x.Longitude).HasPrecision(9, 6);
            b.HasOne(x => x.Vehicle).WithMany(v => v.Listings).HasForeignKey(x => x.VehicleId);
            b.HasOne(x => x.Moderator).WithMany().HasForeignKey(x => x.ModeratedBy).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ListingImage>(b =>
        {
            b.ToTable("listing_images");
            b.HasKey(x => x.ImageId);
            b.HasOne(x => x.Listing).WithMany(l => l.Images).HasForeignKey(x => x.ListingId);
        });

        builder.Entity<VehicleUnavailability>(b =>
        {
            b.ToTable("vehicle_unavailability");
            b.HasKey(x => x.UnavailabilityId);
            b.HasOne(x => x.Vehicle).WithMany(v => v.Unavailabilities).HasForeignKey(x => x.VehicleId);
        });

        // Rental 
        builder.Entity<DepositHold>(b =>
        {
            b.ToTable("deposit_holds");
            b.HasKey(x => x.HoldId);
            b.Property(x => x.PriceLockedTotal).HasPrecision(12, 2);
            b.Property(x => x.DepositAmount).HasPrecision(12, 2);
            b.HasOne(x => x.Renter).WithMany().HasForeignKey(x => x.RenterId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Listing).WithMany(l => l.DepositHolds).HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Booking>(b =>
        {
            b.ToTable("bookings");
            b.HasKey(x => x.BookingId);
            b.Property(x => x.PriceLockedTotal).HasPrecision(12, 2);
            b.Property(x => x.DepositAmount).HasPrecision(12, 2);
            b.HasIndex(x => x.SourceHoldId).IsUnique();
            b.HasIndex(x => new { x.VehicleId, x.Status, x.StartDate, x.EndDate });
            b.HasIndex(x => new { x.Status, x.ResponseDeadline });

            b.HasOne(x => x.Renter).WithMany().HasForeignKey(x => x.RenterId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Listing).WithMany(l => l.Bookings).HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Vehicle).WithMany(v => v.Bookings).HasForeignKey(x => x.VehicleId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.SourceHold).WithOne(h => h.Booking).HasForeignKey<Booking>(x => x.SourceHoldId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Canceller).WithMany().HasForeignKey(x => x.CancelledBy).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<HandoverConfirmation>(b =>
        {
            b.ToTable("handover_confirmations");
            b.HasKey(x => x.ConfirmationId);
            b.HasIndex(x => new { x.BookingId, x.Type, x.ConfirmedBy }).IsUnique();
            b.HasOne(x => x.Booking).WithMany(bk => bk.HandoverConfirmations).HasForeignKey(x => x.BookingId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Confirmer).WithMany().HasForeignKey(x => x.ConfirmedBy).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Dispute>(b =>
        {
            b.ToTable("disputes");
            b.HasKey(x => x.DisputeId);
            b.HasOne(x => x.Booking).WithMany(bk => bk.Disputes).HasForeignKey(x => x.BookingId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Raiser).WithMany().HasForeignKey(x => x.RaisedBy).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Resolver).WithMany().HasForeignKey(x => x.ResolvedBy).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Review>(b =>
        {
            b.ToTable("reviews");
            b.HasKey(x => x.ReviewId);
            b.HasIndex(x => new { x.BookingId, x.ReviewerId }).IsUnique();
            b.HasOne(x => x.Booking).WithMany(bk => bk.Reviews).HasForeignKey(x => x.BookingId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Reviewer).WithMany().HasForeignKey(x => x.ReviewerId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.Reviewee).WithMany().HasForeignKey(x => x.RevieweeId).OnDelete(DeleteBehavior.Restrict);
        });

        // Payment Simulation 
        builder.Entity<Payment>(b =>
        {
            b.ToTable("payments");
            b.HasKey(x => x.PaymentId);
            b.HasIndex(x => x.BookingId).IsUnique();
            b.Property(x => x.PenaltyAmount).HasPrecision(12, 2);
            b.Property(x => x.CommissionRate).HasPrecision(5, 4);
            b.Property(x => x.CommissionAmount).HasPrecision(12, 2);
            b.HasOne(x => x.Booking).WithOne(bk => bk.Payment).HasForeignKey<Payment>(x => x.BookingId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<MockBankAccount>(b =>
        {
            b.ToTable("mock_bank_accounts");
            b.HasKey(x => x.AccountId);
            b.HasIndex(x => x.UserId).IsUnique();
            b.HasIndex(x => x.AccountNumber).IsUnique();
            b.HasOne(x => x.User).WithOne(u => u.MockBankAccount).HasForeignKey<MockBankAccount>(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<MockBankTransaction>(b =>
        {
            b.ToTable("mock_bank_transactions");
            b.HasKey(x => x.TransactionId);
            b.HasIndex(x => x.ReferenceCode).IsUnique();
            b.Property(x => x.Amount).HasPrecision(12, 2);
            b.HasOne(x => x.Payment).WithMany(p => p.Transactions).HasForeignKey(x => x.PaymentId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.FromAccount).WithMany().HasForeignKey(x => x.FromAccountId).OnDelete(DeleteBehavior.Restrict);
            b.HasOne(x => x.ToAccount).WithMany().HasForeignKey(x => x.ToAccountId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<SystemSetting>(b =>
        {
            b.ToTable("system_settings");
            b.HasKey(x => x.SettingKey);
            b.HasOne(x => x.Updater).WithMany().HasForeignKey(x => x.UpdatedBy).OnDelete(DeleteBehavior.Restrict);
        });

        foreach (var entity in builder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName();
            if (tableName is null) continue;

            var table = StoreObjectIdentifier.Table(tableName, entity.GetSchema());
            foreach (var property in entity.GetProperties())
            {
                var current = property.GetColumnName(table);
                if (current is null) continue;
                property.SetColumnName(ToSnakeCase(current));
            }
        }
    }

    private static string ToSnakeCase(string name) =>
        Regex.Replace(name, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
}