using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CarRental.Web.Models;

namespace CarRental.Web.Controllers;

public class HomeController : Controller
{
    public IActionResult Index() => View();

    public IActionResult About() => View();

    public IActionResult Find() => View();

    public IActionResult BecomeOwner() => View();

    public IActionResult CarRegisterMode() => View();

    public IActionResult MyTrips() => View();

    public IActionResult Support() => View();

    public IActionResult Chatbot() => View();

    public IActionResult Privacy() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
