# Vehicle Rental Marketplace

Nền tảng trung gian kết nối chủ xe máy cá nhân với người có nhu cầu thuê xe — tương tự mô hình Airbnb/Mioto, áp dụng cho xe máy.

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
dotnet run --project src/MotorbikeRental.Web
```

## Tài liệu liên quan
