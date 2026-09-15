using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.Models
{
    public class User
    {
        [Key]
        public int Id_User { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [StringLength(255)]
        public string Password { get; set; }

        [Required]
        [StringLength(100)]
        public string Email { get; set; }

        // Khóa ngoại liên kết tới Role
        public int Role_Id { get; set; }
        [ForeignKey("Role_Id")]
        public virtual Role Role { get; set; }

        // Navigation properties
        public virtual ICollection<Vehicle> Vehicles { get; set; }
        public virtual ICollection<Contract> Contracts { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
        public virtual ICollection<Inspection> Inspections { get; set; }
    }
}