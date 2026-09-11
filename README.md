# Car Rental Marketplace

Nền tảng trung gian kết nối chủ xe oto cá nhân với người có nhu cầu thuê xe — tương tự mô hình Airbnb

## Tech Stack
Backend: C# / ASP.NET Core MVC
Database: MySQL + Entity Framework Core
Auth: ASP.NET Core Identity (role-based: Người thuê / Chủ xe / Admin)
Kiến trúc: MVC + 3-layer (Presentation / Business Logic / Data Access)

## Cách chạy dự án (local)
 
*(sẽ cập nhật sau khi solution được setup xong)*
 
```bash
git clone <repo-url>
cd <project-folder>
dotnet restore
dotnet build
dotnet run --project src/CarRental.Web
```

## Tài liệu liên quan

- [Tổng quan và phạm vi dự án](docs/requirements/project-context.md)
- [Yêu cầu dự án](docs/requirements/project-requirements.md)
- [Các quyết định nghiệp vụ còn mở](docs/requirements/open-decisions.md)
- [Thiết kế hệ thống](docs/architecture/system-design.md)
- [Nguồn báo cáo cuối kỳ](docs/report/README.md)
