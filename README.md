# Car Rental Marketplace

Nền tảng web trung gian kết nối chủ xe cá nhân với người có nhu cầu thuê ô tô.

## Tech Stack

- Backend: C# / ASP.NET Core MVC
- Database: MySQL + Entity Framework Core
- Authentication: ASP.NET Core Identity
- Kiến trúc: MVC + 3-layer (`Web → Services → Data → Models`)

## Cách chạy dự án

```bash
dotnet restore
dotnet build
dotnet run --project src/CarRental.Web
```

## Tài liệu triển khai

- [Tổng quan và phạm vi hệ thống](docs/requirements/project-context.md)
- [Software Requirements Specification](docs/requirements/srs.md)
- [Quy tắc nghiệp vụ](docs/requirements/shared-rental-rules.md)
- [Thiết kế hệ thống](docs/architecture/system-design.md)
- [ERD và DBML](docs/architecture/erd.md)
- [Ghi chú kỹ thuật](docs/architecture/technical-notes.md)
- Đặc tả use case: [Base User](docs/use-cases/base-user.md), [Renter](docs/use-cases/renter.md), [Owner](docs/use-cases/owner.md), [Staff/Admin](docs/use-cases/admin-staff.md), [dùng chung](docs/use-cases/shared.md)
- [Use case diagrams](docs/diagrams/use-case-diagrams.md)

Không lưu credential, connection string thật hoặc dữ liệu cá nhân trong repository.
