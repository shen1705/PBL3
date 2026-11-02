using System.Security.Claims;
using System.Threading.Tasks;
using CarRental.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace CarRental.Services.Infrastructure;

public class AppUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>
{
    public AppUserClaimsPrincipalFactory(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<IdentityOptions> optionsAccessor)
        : base(userManager, roleManager, optionsAccessor)
    {
    }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        if (!string.IsNullOrWhiteSpace(user.FullName))
        {
            identity.AddClaim(new Claim("fullname", user.FullName));
            identity.AddClaim(new Claim(ClaimTypes.GivenName, user.FullName));
        }
        return identity;
    }
}
