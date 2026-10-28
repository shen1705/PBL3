using CarRental.Services.Abstractions;
using CarRental.Services.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace CarRental.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();

        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}
