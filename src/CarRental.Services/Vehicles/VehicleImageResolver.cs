namespace CarRental.Services.Vehicles;

public static class VehicleImageResolver
{
    private const string Placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f1f5f9'/%3E%3Cpath d='M140 230h360l-25-75c-8-24-29-40-54-40H220c-25 0-46 16-54 40z' fill='%2394a3b8'/%3E%3Ccircle cx='220' cy='235' r='34' fill='%23334155'/%3E%3Ccircle cx='420' cy='235' r='34' fill='%23334155'/%3E%3C/svg%3E";

    public static string Resolve(string? rawPath, string brand, string model)
    {
        var isSeedPlaceholder = !string.IsNullOrWhiteSpace(rawPath) &&
            rawPath.Contains("/seed/car", StringComparison.OrdinalIgnoreCase);

        if (!isSeedPlaceholder && !string.IsNullOrWhiteSpace(rawPath) &&
            (rawPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
             rawPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
             rawPath.StartsWith('/')))
        {
            return rawPath;
        }

        var normalized = $"{brand} {model}".ToUpperInvariant();
        if (normalized.Contains("COROLLA CROSS"))
            return "https://upload.wikimedia.org/wikipedia/commons/0/0b/Toyota_Corolla_Cross_Hybrid_1X7A1861.jpg";
        if (normalized.Contains("XPANDER"))
            return "https://upload.wikimedia.org/wikipedia/commons/3/38/Mitsubishi_Xpander_Sport_%28depan%29%2C_Palangkaraya.jpg";
        if (normalized.Contains("VF E34"))
            return "https://upload.wikimedia.org/wikipedia/commons/1/18/2024_VinFast_VFe34%2C_06-14-2024.jpg";
        if (normalized.Contains("VF 5"))
            return "https://upload.wikimedia.org/wikipedia/commons/0/0e/2024_VinFast_VF5%2C_front_left%2C_06-14-2024.jpg";
        if (normalized.Contains("VF 8") || normalized.Contains("VF8"))
            return "https://vinfasthanoi247.com/wp-content/uploads/2025/03/e96dddcc-ac5e-4c84-ac0a-e3bbd9950979-800x600-1.jpeg";
        if (normalized.Contains("CITY"))
            return "https://upload.wikimedia.org/wikipedia/commons/d/dd/Honda_City_2020.jpg";
        if (normalized.Contains("SANTA FE"))
            return "https://upload.wikimedia.org/wikipedia/commons/c/c8/2024_Hyundai_Santa_Fe_%28MX5%29_IMG_5295.jpg";
        if (normalized.Contains("CARNIVAL"))
            return "https://upload.wikimedia.org/wikipedia/commons/c/c6/Kia_Carnival_KA4_3.5_LX_V6_Panthera_Metal_diplomatic.jpg";
        if (normalized.Contains("CX-8"))
            return "https://upload.wikimedia.org/wikipedia/commons/a/a6/MAZDA_CX-8_China_%281%29.jpg";
        if (normalized.Contains("VIOS"))
            return "https://upload.wikimedia.org/wikipedia/commons/2/25/Toyota_Vios_%28XP150%29_sedan_front_view.jpg";
        if (normalized.Contains("ACCENT"))
            return "https://upload.wikimedia.org/wikipedia/commons/3/3e/HYUNDAI_ACCENT_SEDAN_%28MC%29_China.jpg";
        if (normalized.Contains("CX-5"))
            return "https://upload.wikimedia.org/wikipedia/commons/4/43/Mazda_CX-5_Newground_1X7A6786.jpg";
        if (normalized.Contains("CX-30"))
            return "https://upload.wikimedia.org/wikipedia/commons/c/c9/Mazda_CX-30_XD_AWD_rear.jpg";
        if (normalized.Contains("CR-V"))
            return "https://upload.wikimedia.org/wikipedia/commons/0/01/Honda_CR-V%2C_Auto_2024%2C_Zurich_%28PANA0740%29.jpg";
        if (normalized.Contains("TUCSON"))
            return "https://upload.wikimedia.org/wikipedia/commons/b/ba/Hyundai_Tucson_Plug-in_N-Line_Auto_Zuerich_2021_IMG_0366.jpg";
        if (normalized.Contains("EVEREST"))
            return "https://upload.wikimedia.org/wikipedia/commons/8/8b/Ford_Everest_U704_2.0_Turbo_Trend_Arctic_White_diplomatic.jpg";
        if (normalized.Contains("TERRITORY"))
            return "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ford_Territory_003.jpg";
        if (normalized.Contains("TRANSIT"))
            return "https://upload.wikimedia.org/wikipedia/commons/e/e4/Ford_Transit_Custom_%282023%29_1X7A1605.jpg";
        if (normalized.Contains("MORNING"))
            return "https://upload.wikimedia.org/wikipedia/commons/9/9e/Kia_Picanto_%28JA%3B_2017%29.jpg";
        if (normalized.Contains("SONET"))
            return "https://upload.wikimedia.org/wikipedia/commons/7/75/2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg";

        return Placeholder;
    }
}