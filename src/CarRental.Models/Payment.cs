using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.Models
{
    public class Payment
    {
        [Key]
        public int Id_Payment { get; set; }

        [Required]
        public double Amount { get; set; }

        [Required]
        public PaymentType Payment_Type { get; set; }

        [Required]
        public PaymentMethod Payment_Method { get; set; }

        public DateTime Created_At { get; set; }

        // Khóa ngoại liên kết tới Đơn thuê
        public int Id_Contract { get; set; }
        [ForeignKey("Id_Contract")]
        public virtual Contract Contract { get; set; }

        // Khóa ngoại liên kết tới Người thực hiện thanh toán
        public int Id_User { get; set; }
        [ForeignKey("Id_User")]
        public virtual User User { get; set; }
    }
}