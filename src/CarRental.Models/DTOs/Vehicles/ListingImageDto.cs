namespace CarRental.Models.DTOs.Vehicles;

public class ListingImageDto
{
    public int ImageId { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}
