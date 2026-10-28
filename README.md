# Car Rental Marketplace

Nền tảng trung gian kết nối chủ xe oto cá nhân với người có nhu cầu thuê xe — tương tự mô hình Airbnb

## Tech Stack
- Backend: C# / ASP.NET Core MVC (.NET 10)
- Database: MySQL + Entity Framework Core
- Auth: ASP.NET Core Identity (role-based: Người thuê / Chủ xe / Admin)
- Kiến trúc: MVC + 3-layer (Presentation / Business Logic / Data Access)

## Cách chạy dự án (local)

```bash
git clone <repo-url>
cd <project-folder>
dotnet restore
dotnet build
dotnet run --project src/CarRental.Web
```

## Dữ liệu mẫu kiểm thử (Seeded Sample Data)

Hệ thống tự động khởi tạo dữ liệu mẫu khi chạy môi trường `Development`.  
Mật khẩu mặc định cho toàn bộ tài khoản: **`Test@12345`**

| Username | Họ và tên | Vai trò | Trạng thái / Mục đích |
| :--- | :--- | :--- | :--- |
| `renter1` - `renter3` | Nguyễn Văn An, Trần Thị Bình, Lê Minh Cường | `Renter` | Đầy đủ GPLX; có các đơn Accepted, Completed, Ongoing |
| `renter4` | Đỗ Thị Mai | `Renter` | Bị tạm khóa 7 ngày (`AccountSanction`) |
| `owner1` - `owner3` | Phạm Quốc Dũng, Hoàng Thị Em, Võ Văn Phúc | `Renter`, `Owner` | Chủ xe đã xác minh CCCD, đang hoạt động |
| `owner4` | Lê Hoàng Duy | `Renter`, `Owner` | Chủ xe chờ duyệt (`OwnerApprovalStatuses.Pending`) |
| `staff1` - `staff2` | Đặng Thu Hà, Bùi Văn Khoa | `Admin` | Nhân viên vận hành duyệt hồ sơ, xử lý tranh chấp |
| `admin1` - `admin2` | Quản trị Một, Quản trị Hai | `Admin` | Quản trị viên cấp cao (đầy đủ Claims hệ thống) |

*Chi tiết toàn bộ bảng dữ liệu mẫu (16 xe, 12 đơn thuê, bàn giao, thanh toán, đánh giá & khiếu nại) có tại: [SEED_DATA.md](SEED_DATA.md).*

## Tài liệu liên quan

- [Bảng dữ liệu mẫu kiểm thử (Seed Data)](SEED_DATA.md)
- [Tổng quan và phạm vi dự án](docs/requirements/project-context.md)
- [Yêu cầu dự án](docs/requirements/project-requirements.md)
- [Các quyết định nghiệp vụ còn mở](docs/requirements/open-decisions.md)
- [Thiết kế hệ thống](docs/architecture/system-design.md)
- [Nguồn báo cáo cuối kỳ](docs/report/README.md)
