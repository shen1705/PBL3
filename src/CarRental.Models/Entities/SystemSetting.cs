using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarRental.Models.Constants;

namespace CarRental.Models.Entities;

public class SystemSetting
{
    [Key, MaxLength(50)]
    public string SettingKey { get; set; } = string.Empty;
    [Required, MaxLength(255)]
    public string SettingValue { get; set; } = string.Empty;
    [MaxLength(255)]
    public string? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser? Updater { get; set; }
}
