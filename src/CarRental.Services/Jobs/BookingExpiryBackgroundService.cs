using System;
using System.Threading;
using System.Threading.Tasks;
using CarRental.Services.Bookings;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CarRental.Services.Jobs;

public class BookingExpiryBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BookingExpiryBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(2); // Quét định kỳ mỗi 2 phút

    public BookingExpiryBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<BookingExpiryBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BookingExpiryBackgroundService: Tiến trình quét tự động hết hạn đơn Pending bắt đầu...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
                var result = await bookingService.AutoExpireBookingsAsync(stoppingToken);
                if (result.IsSuccess && result.Data > 0)
                {
                    _logger.LogInformation("BookingExpiryBackgroundService: Đã tự động hết hạn {Count} đơn Pending quá hạn 24h và giải phóng lịch xe.", result.Data);
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Lỗi xảy ra trong tiến trình BookingExpiryBackgroundService.");
            }

            try
            {
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("BookingExpiryBackgroundService: Tiến trình kết thúc.");
    }
}
