using CarRental.Data;
using CarRental.Models.Entities;
using CarRental.Services;
using CarRental.Services.Availability;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddData(builder.Configuration);

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(o =>
{
    o.User.RequireUniqueEmail = true;
    o.Password.RequireDigit = false;
    o.Password.RequireLowercase = false;
    o.Password.RequireUppercase = false;
    o.Password.RequireNonAlphanumeric = false;
    o.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/";
    options.LogoutPath = "/logout";
    options.AccessDeniedPath = "/";
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
    options.SlidingExpiration = true;
    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
});

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
app.MapControllerRoute("account", "account", new { controller = "Home", action = "Account" });
app.MapControllerRoute("my-trips", "my-trips", new { controller = "Home", action = "MyTrips" });
app.MapControllerRoute("support", "support", new { controller = "Home", action = "Support" });
app.MapControllerRoute("chatbot", "chatbot", new { controller = "Home", action = "Chatbot" });

// Legacy .html redirects for seamless JS navigation
app.MapGet("/index.html", () => Results.Redirect("/", permanent: true));
app.MapGet("/about.html", () => Results.Redirect("/about", permanent: true));
app.MapGet("/find.html", () => Results.Redirect("/find", permanent: true));
app.MapGet("/become-owner.html", () => Results.Redirect("/become-owner", permanent: true));
app.MapGet("/carregistermode.html", () => Results.Redirect("/carregistermode", permanent: true));
app.MapGet("/account.html", () => Results.Redirect("/account", permanent: true));
app.MapGet("/my-trips", () => Results.Redirect("/account#trips", permanent: true));
app.MapGet("/my-trips.html", () => Results.Redirect("/account#trips", permanent: true));
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

    app.MapGet("/dev/auth-test", async (CarRental.Services.Auth.IAuthService auth) =>
    {
        var loginRenter1 = await auth.LoginAsync(new CarRental.Models.DTOs.Auth.LoginRequest { Identifier = "renter1", Password = "Test@12345" });
        var loginRenter4 = await auth.LoginAsync(new CarRental.Models.DTOs.Auth.LoginRequest { Identifier = "renter4", Password = "Test@12345" });
        var loginBad = await auth.LoginAsync(new CarRental.Models.DTOs.Auth.LoginRequest { Identifier = "renter1", Password = "WrongPassword" });
        return Results.Ok(new
        {
            ValidLogin = new { loginRenter1.IsSuccess, loginRenter1.Message, User = loginRenter1.Data?.UserName, Roles = loginRenter1.Data?.Roles },
            SuspendedLogin = new { loginRenter4.IsSuccess, loginRenter4.Message, loginRenter4.ErrorCode },
            InvalidLogin = new { loginBad.IsSuccess, loginBad.Message, loginBad.ErrorCode }
        });
    });

    app.MapGet("/dev/vehicles-test", async (CarRental.Services.Vehicles.IVehicleService vehicles) =>
    {
        var all = await vehicles.SearchVehiclesAsync(new CarRental.Models.DTOs.Vehicles.VehicleSearchFilter());
        var daNang = await vehicles.SearchVehiclesAsync(new CarRental.Models.DTOs.Vehicles.VehicleSearchFilter { City = "TP. Đà Nẵng" });
        var cities = await vehicles.GetAvailableCitiesAsync();
        return Results.Ok(new
        {
            TotalPublic = all.Data?.TotalCount,
            SampleNames = all.Data?.Items.Select(x => $"{x.Name} ({x.City})").Take(5),
            DaNangCars = daNang.Data?.TotalCount,
            Cities = cities.Data
        });
    });

    using var scope = app.Services.CreateScope();
    await DbInitializer.SeedAsync(scope.ServiceProvider);
}

app.Run();
