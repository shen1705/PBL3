using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CarRental.Web.Models;
using CarRental.Models.Constants;

namespace CarRental.Web.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        if (User.Identity?.IsAuthenticated == true &&
            (User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.Staff)))
        {
            return Redirect("/admin/users.html");
        }
        return View();
    }

    public IActionResult About() => View();

    public IActionResult Find() => View();

    public IActionResult BecomeOwner() => View();

    public IActionResult CarRegisterMode() => View();

    public IActionResult Account() => View();

    public IActionResult MyTrips() => RedirectPermanent("/account#trips");

    public IActionResult Support() => View();

    public IActionResult Chatbot() => View();

    public IActionResult Privacy() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
