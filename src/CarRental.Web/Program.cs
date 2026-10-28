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
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapStaticAssets();

// Friendly routes
app.MapControllerRoute("about", "about", new { controller = "Home", action = "About" });
app.MapControllerRoute("find", "find", new { controller = "Home", action = "Find" });
app.MapControllerRoute("become-owner", "become-owner", new { controller = "Home", action = "BecomeOwner" });
app.MapControllerRoute("carregistermode", "carregistermode", new { controller = "Home", action = "CarRegisterMode" });
app.MapControllerRoute("my-trips", "my-trips", new { controller = "Home", action = "MyTrips" });
app.MapControllerRoute("support", "support", new { controller = "Home", action = "Support" });
app.MapControllerRoute("chatbot", "chatbot", new { controller = "Home", action = "Chatbot" });

// Legacy .html redirects for seamless JS navigation
app.MapGet("/index.html", () => Results.Redirect("/", permanent: true));
app.MapGet("/about.html", () => Results.Redirect("/about", permanent: true));
app.MapGet("/find.html", () => Results.Redirect("/find", permanent: true));
app.MapGet("/become-owner.html", () => Results.Redirect("/become-owner", permanent: true));
app.MapGet("/carregistermode.html", () => Results.Redirect("/carregistermode", permanent: true));
app.MapGet("/my-trips.html", () => Results.Redirect("/my-trips", permanent: true));
app.MapGet("/support.html", () => Results.Redirect("/support", permanent: true));
app.MapGet("/chatbot.html", () => Results.Redirect("/chatbot", permanent: true));
app.MapGet("/admin", () => Results.Redirect("/admin/index.html"));

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
