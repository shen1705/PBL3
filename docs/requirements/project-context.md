---
title: "PBL — Tổng quan dự án"
project: PBL3
category: documents
type: reference
status: working
updated: 2026-09-09
tags: [project/pbl, type/reference]
---

# PBL — Tổng quan dự án

PBL3 xây dựng hệ thống web trung gian cho thuê ô tô, tham khảo mô hình Mioto. Chủ xe đăng xe của mình; nền tảng kết nối với người thuê và hỗ trợ quản lý đơn thuê. Nhóm gồm Quốc Anh, Ân và Uyên, dự kiến thực hiện khoảng 10 tuần theo tiến độ học phần.

## Công nghệ và yêu cầu học phần

Dự án dùng C#, ASP.NET Core MVC và MySQL, tổ chức theo mô hình ba tầng. Đăng nhập, phân quyền, cơ sở dữ liệu MySQL và tài liệu đặc tả, thiết kế là các yêu cầu học phần. Phân tích và thiết kế cần hoàn thành trước giữa kỳ; xem [PBL - Yêu cầu dự án](project-requirements.md).

| Thành phần | Lựa chọn |
| --- | --- |
| Giao diện và xử lý yêu cầu | ASP.NET Core MVC |
| Đăng nhập và phân quyền | ASP.NET Core Identity |
| Truy cập dữ liệu | Entity Framework Core, `Pomelo.EntityFrameworkCore.MySql` |
| Cơ sở dữ liệu | MySQL |

## Vai trò

Người thuê tìm xe và đặt thuê. Chủ xe quản lý xe, duyệt đơn và bàn giao; một tài khoản có thể vừa thuê vừa cho thuê. Nhân viên quản lý người thuê, chủ xe và tin đăng. Quản trị viên có toàn quyền, gồm cấu hình hoa hồng và quản lý nhân viên, quản trị viên khác.

## Quy trình chính

Người thuê chọn xe, thời gian và đặt cọc trực tuyến qua mô phỏng. Đơn chờ duyệt giữ lịch ngay; chủ xe phản hồi trong khoảng 1–2 ngày. Hết thời hạn chưa phản hồi thì đơn hết hạn và giải phóng lịch. Sau khi được duyệt, hai bên bàn giao xe với ảnh và thời điểm xác nhận.

Khi trả xe, cả hai bên phải xác nhận. Đơn đã trả xe chỉ hoàn tất khi không còn vấn đề phát sinh hoặc khiếu nại đang mở. Doanh thu và quyền đánh giá được ghi nhận từ lúc hoàn tất.

`Pending → Approved → InRental → Returned → Completed`

Quy tắc đầy đủ ở [PBL - Shared Rental Rules](shared-rental-rules.md).

## Phạm vi thực hiện

**Chức năng chính:** đăng ký và đăng nhập; gửi, duyệt hồ sơ chủ xe; quản lý tin đăng và lịch xe; tìm kiếm và lọc; đặt cọc mô phỏng; tạo và duyệt đơn; bàn giao có ảnh; lịch sử thuê và cho thuê; doanh thu cơ bản; quản lý tài khoản, tin đăng và cấu hình hoa hồng.

**Thực hiện sau khi luồng chính ổn định:** đánh giá hai chiều, khiếu nại, bản đồ điểm nhận xe, chatbot tra cứu chính sách, thông báo và báo cáo nâng cao. Quy tắc đánh giá, khiếu nại đã chốt vẫn áp dụng khi triển khai các phần này.

**Ngoài phạm vi:** thanh toán thật, ví và rút tiền kể cả mô phỏng, thuế, OTP/QR bàn giao, ứng dụng di động, theo dõi GPS trực tiếp, gợi ý xe bằng AI, xác minh giấy tờ tự động, khóa xe thông minh, xử lý bảo hiểm và xác minh pháp lý thực tế.

## Cấu trúc ứng dụng

```text
VehicleRentalMarketplace.sln
└── src/
    ├── CarRental.Web       # Giao diện, Controllers và Views
    ├── CarRental.Services  # Xử lý nghiệp vụ
    ├── CarRental.Data      # DbContext, Repositories và Migrations
    └── CarRental.Models    # Thực thể và dữ liệu trao đổi
```

Hướng tham chiếu chính: `Web → Services → Data → Models`. Chi tiết tại [PBL - Thiết kế hệ thống](../architecture/system-design.md) và [PBL design notes](../architecture/technical-notes.md).

## Tài liệu chức năng

- [Chức năng người thuê](../use-cases/renter.md)
- [Chức năng chủ xe](../use-cases/owner.md)
- [Chức năng quản trị viên và nhân viên](../use-cases/admin-staff.md)
- [Chức năng dùng chung](../use-cases/shared.md)
- [Kế hoạch thực hiện](../MIGRATION-REVIEW.md#internal-notes)
