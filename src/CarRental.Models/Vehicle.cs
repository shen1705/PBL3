using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.Models
{
    public class Vehicle
    {
        [Key]
        public int Id_Vehicle { get; set; }

        [StringLength(50)]
        public string Brand { get; set; }

        [StringLength(50)]
        public string Model { get; set; }

        [Required]
        [StringLength(20)]
        public string License_Plate { get; set; }

        [Required]
        public double Price_Day { get; set; }

        // Khóa ngoại chỉ định ai là Chủ xe (Owner)
        public int Id_User { get; set; }
        [ForeignKey("Id_User")]
        public virtual User Owner { get; set; }

        // Navigation property (1 Xe có nhiều Đơn thuê)
        public virtual ICollection<Contract> Contracts { get; set; }
    }
}