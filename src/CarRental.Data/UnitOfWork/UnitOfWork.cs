using CarRental.Models.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace CarRental.Data.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public IRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);
        if (!_repositories.TryGetValue(type, out var repository))
        {
            repository = new Repository<T>(_context);
            _repositories[type] = repository;
        }

        return (IRepository<T>)repository;
    }

    public IRepository<AccountSanction> AccountSanctions => Repository<AccountSanction>();
    public IRepository<DriverLicense> DriverLicenses => Repository<DriverLicense>();
    public IRepository<OwnerProfile> OwnerProfiles => Repository<OwnerProfile>();
    public IRepository<Vehicle> Vehicles => Repository<Vehicle>();
    public IRepository<VehicleDocument> VehicleDocuments => Repository<VehicleDocument>();
    public IRepository<VehicleListing> VehicleListings => Repository<VehicleListing>();
    public IRepository<ListingImage> ListingImages => Repository<ListingImage>();
    public IRepository<VehicleUnavailability> VehicleUnavailabilities => Repository<VehicleUnavailability>();
    public IRepository<DepositHold> DepositHolds => Repository<DepositHold>();
    public IRepository<Booking> Bookings => Repository<Booking>();
    public IRepository<HandoverConfirmation> HandoverConfirmations => Repository<HandoverConfirmation>();
    public IRepository<Payment> Payments => Repository<Payment>();
    public IRepository<MockBankAccount> MockBankAccounts => Repository<MockBankAccount>();
    public IRepository<MockBankTransaction> MockBankTransactions => Repository<MockBankTransaction>();
    public IRepository<SystemSetting> SystemSettings => Repository<SystemSetting>();
    public IRepository<Dispute> Disputes => Repository<Dispute>();
    public IRepository<Review> Reviews => Repository<Review>();
    public IRepository<ApplicationUser> Users => Repository<ApplicationUser>();

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
        {
            return _currentTransaction;
        }

        _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        return _currentTransaction;
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            if (_currentTransaction != null)
            {
                await _currentTransaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync(cancellationToken);
            }
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _currentTransaction?.Dispose();
                _context.Dispose();
            }
            _disposed = true;
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (!_disposed)
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }

            await _context.DisposeAsync();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}
