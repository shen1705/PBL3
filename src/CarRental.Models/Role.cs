using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarRental.Models
{
    public class Role
    {
        [Key]
        public int Id_Role { get; set; }

        [Required]
        [StringLength(50)]
        public string Role_Name { get; set; }

        public string Description { get; set; }

        // Navigation property (1 Role có nhiều Users)
        public virtual ICollection<User> Users { get; set; }
    }
}