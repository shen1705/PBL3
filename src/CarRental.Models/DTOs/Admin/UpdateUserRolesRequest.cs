using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models.DTOs.Admin;

public class UpdateUserRolesRequest
{
    [Required]
    public List<string> Roles { get; set; } = new();
}
