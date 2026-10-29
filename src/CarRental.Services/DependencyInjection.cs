using CarRental.Services.Abstractions;
using CarRental.Services.Auth;
using CarRental.Services.Availability;
using CarRental.Services.Infrastructure;
using CarRental.Services.Vehicles;
using Microsoft.Extensions.DependencyInjection;

namespace CarRental.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();

        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IVehicleAvailabilityService, VehicleAvailabilityService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVehicleService, VehicleService>();

        return services;
    }
}
