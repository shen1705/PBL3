using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.Models
{
    public class Inspection
    {
        [Key]
        public int Id_Inspection { get; set; }

        [Required]
        public InspectionType Inspection_Type { get; set; }

        // Lưu đường dẫn ảnh, nếu nhiều ảnh có thể lưu dạng chuỗi cách nhau dấu phẩy hoặc JSON
        public string Inspection_Images { get; set; }

        public string Note { get; set; }

        public DateTime Created_At { get; set; }

        // Khóa ngoại liên kết tới Đơn thuê
        public int Id_Contract { get; set; }
        [ForeignKey("Id_Contract")]
        public virtual Contract Contract { get; set; }

        // Khóa ngoại liên kết tới Người thực hiện bàn giao
        public int Id_User { get; set; }
        [ForeignKey("Id_User")]
        public virtual User User { get; set; }
    }
}