using Microsoft.EntityFrameworkCore;
using CarRental.Models; 

namespace CarRental.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options)
        {
        }

        // Khai báo các bảng (Tables) sẽ được tạo ra trong CSDL MySQL
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Inspection> Inspections { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Ép kiểu cho cột Base_Price và Deposit_Amount không bị cảnh báo độ phân giải số thực
            // Phần này EF Core sẽ tự động map các cấu hình từ thư mục Models
        }
    }
}
