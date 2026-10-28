using CarRental.Models.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace CarRental.Data.Repositories;

public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    IRepository<AccountSanction> AccountSanctions { get; }
    IRepository<DriverLicense> DriverLicenses { get; }
    IRepository<OwnerProfile> OwnerProfiles { get; }
    IRepository<Vehicle> Vehicles { get; }
    IRepository<VehicleDocument> VehicleDocuments { get; }
    IRepository<VehicleListing> VehicleListings { get; }
    IRepository<ListingImage> ListingImages { get; }
    IRepository<VehicleUnavailability> VehicleUnavailabilities { get; }
    IRepository<DepositHold> DepositHolds { get; }
    IRepository<Booking> Bookings { get; }
    IRepository<HandoverConfirmation> HandoverConfirmations { get; }
    IRepository<Payment> Payments { get; }
    IRepository<MockBankAccount> MockBankAccounts { get; }
    IRepository<MockBankTransaction> MockBankTransactions { get; }
    IRepository<SystemSetting> SystemSettings { get; }
    IRepository<Dispute> Disputes { get; }
    IRepository<Review> Reviews { get; }
    IRepository<ApplicationUser> Users { get; }

    IRepository<T> Repository<T>() where T : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
