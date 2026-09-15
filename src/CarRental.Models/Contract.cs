using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.Models
{
    public class Contract
    {
        [Key]
        public int Id_Contract { get; set; }

        [Required]
        public DateTime Start_Datetime { get; set; }

        [Required]
        public DateTime End_Datetime { get; set; }

        public double Deposit_Amount { get; set; }

        [Required]
        public double Base_Price { get; set; }

        [Required]
        public PaymentStatus Payment_Status { get; set; }

        [Required]
        public ContractStatus Status { get; set; }

        // Khóa ngoại chỉ định Người đi thuê (Renter)
        public int Id_User { get; set; }
        [ForeignKey("Id_User")]
        public virtual User Renter { get; set; }

        // Khóa ngoại chỉ định Chiếc xe được thuê
        public int Id_Vehicle { get; set; }
        [ForeignKey("Id_Vehicle")]
        public virtual Vehicle Vehicle { get; set; }

        // Navigation properties
        public virtual ICollection<Payment> Payments { get; set; }
        public virtual ICollection<Inspection> Inspections { get; set; }
    }
}