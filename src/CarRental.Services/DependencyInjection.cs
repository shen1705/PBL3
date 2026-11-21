using CarRental.Services.Abstractions;
using CarRental.Services.Admin;
using CarRental.Services.Auth;
using CarRental.Services.Availability;
using CarRental.Services.Bookings;
using CarRental.Services.Chatbot;
using CarRental.Services.Infrastructure;
using CarRental.Services.Notifications;
using CarRental.Services.Vehicles;
using Microsoft.Extensions.DependencyInjection;

namespace CarRental.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddHttpClient();

        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IVehicleAvailabilityService, VehicleAvailabilityService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVehicleService, VehicleService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IChatbotService, GeminiChatbotService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IAdminOwnerService, AdminOwnerService>();
        services.AddScoped<IAdminListingService, AdminListingService>();
        services.AddScoped<IAdminDisputeService, AdminDisputeService>();
        services.AddScoped<IAdminReviewService, AdminReviewService>();
        services.AddScoped<IAdminFeeService, AdminFeeService>();
        services.AddScoped<IAdminRevenueService, AdminRevenueService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
