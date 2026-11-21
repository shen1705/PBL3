# HƯỚNG DẪN IMPORT CƠ SỞ DỮ LIỆU AZU CAR (DATABASE DUMP)

File `database_dump.sql` chứa toàn bộ schema bảng và dữ liệu mẫu mới nhất của dự án **AZU Car** (gồm tài khoản, xe, hồ sơ chủ xe, hợp đồng ký quỹ 100% Escrow, giao dịch ngân hàng ảo và hệ thống thông báo).

---

## Cách 1: Sử dụng Command Line (Nhanh nhất)

1. Mở PowerShell hoặc Terminal tại thư mục chứa file `database_dump.sql`.
2. Tạo database nếu chưa có (chỉ cần làm lần đầu):
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS carrental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
3. Import dữ liệu từ file dump vào database:
   ```bash
   mysql -u root -p carrental < database_dump.sql
   ```
   *(Nhập mật khẩu MySQL của bạn khi được hỏi)*.

---

## Cách 2: Sử dụng MySQL Workbench

1. Mở **MySQL Workbench** và kết nối vào Server Localhost của bạn.
2. Trên thanh menu, chọn **Server** -> **Data Import**.
3. Chọn tùy chọn **Import from Self-Contained File** và bấm `...` duyệt tới file `database_dump.sql`.
4. Tại mục **Default Target Schema**, chọn schema `carrental` (nếu chưa có bấm `New...` đặt tên `carrental`).
5. Bấm nút **Start Import** ở góc dưới cùng bên phải.

---

## Cấu hình chuỗi kết nối trong Web

Mở file `src/CarRental.Web/appsettings.json` (hoặc `appsettings.Development.json`) và cập nhật mật khẩu MySQL của máy bạn:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=carrental;User=root;Password=<MẬT_KHẨU_MYSQL_CỦA_BẠN>;AllowPublicKeyRetrieval=True;SslMode=None;CharSet=utf8mb4;"
}
```

Sau khi import, chạy dự án bằng lệnh:
```bash
dotnet run --project src/CarRental.Web/CarRental.Web.csproj
```
Truy cập web tại: `http://localhost:5051`.
