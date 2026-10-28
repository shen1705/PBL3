using CarRental.Data;
using CarRental.Models.Entities;
using CarRental.Services;
using CarRental.Services.Availability;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddData(builder.Configuration);

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(o => o.User.RequireUniqueEmail = true)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddServices();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapStaticAssets();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

if (app.Environment.IsDevelopment())
{
    // test endpoint
    app.MapGet("/dev/availability", async (
        int vehicleId, DateTime start, DateTime end, int? excludeBookingId,
        IVehicleAvailabilityService svc) =>
    {
        var r = await svc.CheckAsync(vehicleId, start, end, excludeBookingId);
        return Results.Ok(new { r.IsAvailable, Reason = r.Reason.ToString(), r.Message });
    });

    using var scope = app.Services.CreateScope();
    await DbInitializer.SeedAsync(scope.ServiceProvider);
}

app.Run();
