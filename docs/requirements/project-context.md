---
title: "PBL — Tổng quan dự án"
project: PBL3
category: documents
type: reference
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/reference]
---

# PBL — Tổng quan dự án

PBL3 xây dựng hệ thống web trung gian cho thuê ô tô, tham khảo mô hình Mioto. Chủ xe đăng xe của mình; nền tảng kết nối với người thuê và hỗ trợ quản lý đơn thuê.

## Công nghệ và kiến trúc

Dự án dùng C#, ASP.NET Core MVC và MySQL, tổ chức theo mô hình ba tầng. ASP.NET Core Identity đảm nhiệm đăng nhập và phân quyền; Entity Framework Core đảm nhiệm truy cập dữ liệu.

| Thành phần | Lựa chọn |
| --- | --- |
| Giao diện và xử lý yêu cầu | ASP.NET Core MVC |
| Đăng nhập và phân quyền | ASP.NET Core Identity |
| Truy cập dữ liệu | Entity Framework Core, `Pomelo.EntityFrameworkCore.MySql` |
| Cơ sở dữ liệu | MySQL |

## Quan hệ giữa các tài liệu thiết kế

Năm phần trên có vai trò khác nhau và phải mô tả **cùng một hệ thống**:

1. **ERD — dữ liệu:** xác định thực thể/bảng, thuộc tính, khóa và quan hệ. Chú ý sự nhất quán giữa tài khoản, xe, lịch giữ chỗ, đơn thuê, thanh toán mô phỏng và bàn giao; không dùng ERD để mô tả thứ tự thao tác.
2. **Use-case diagram — chức năng theo tác nhân:** thể hiện `Visitor` là người chưa đăng nhập, còn `Base User` là người dùng đã xác thực; `Renter`, `Owner`, `Staff` và `Admin` kế thừa `Base User`. Tách chức năng công khai của `Visitor`, chức năng tài khoản của `Base User` và chức năng nghiệp vụ của các actor chuyên biệt. Không đưa bảng dữ liệu hay lớp code thành use case.
3. **Use-case specification — quy tắc của từng chức năng:** ghi tác nhân, mục tiêu, điều kiện trước/sau, luồng chính, luồng thay thế và ngoại lệ. Mã/tên use case phải khớp với sơ đồ; dùng các đặc tả hiện có làm điểm đối chiếu.
4. **Block diagram — cấu trúc:** tạm hiểu là sơ đồ khối kiến trúc của Web, Services, Data, Models, MySQL và tích hợp ngoài nếu có, cùng hướng tương tác. Không thay thế ERD; cần xác nhận mẫu cụ thể với giảng viên.
5. **Sơ đồ luồng hoạt động — quy trình:** tạm hiểu là UML Activity Diagram, gần với flowchart nhưng có thể thể hiện vai trò bằng swimlane, nhánh thay thế và luồng song song. Ưu tiên luồng đặt thuê xe, sau đó là bàn giao–trả xe; mỗi bước phải nhất quán với đặc tả use case. Cần xác nhận với giảng viên nếu đề bài chỉ yêu cầu flowchart thông thường.

Phân biệt **phạm vi chức năng v1 đã chốt**, **lựa chọn thiết kế** và **chi tiết triển khai**. `DepositHold` chưa cọc không khóa lịch; booking `Pending` được tạo sau khi cọc thành công và khóa lịch ngay. Chủ xe phản hồi trong 1 ngày (24 giờ) kể từ lúc cọc thành công. Cọc bằng 25% giá trị chuyến; các trường hợp hoàn cọc và khoản phạt được quy định tại [quy tắc thuê xe](shared-rental-rules.md).

## Vai trò

`Visitor` thực hiện đăng ký, đăng nhập và các chức năng công khai như xem, tìm kiếm xe. `Base User` đại diện cho người dùng đã xác thực và các chức năng tài khoản chung sau đăng nhập; `Renter`, `Owner`, `Staff` và `Admin` kế thừa `Base User`. Hai actor này không phải vai trò lưu trong cơ sở dữ liệu. Đăng ký công khai cấp quyền `Renter`; tài khoản vận hành được cấp riêng. Người thuê cung cấp số, hạng, ngày hết hạn và ảnh GPLX trước khi tạo yêu cầu thuê. Người đăng ký chủ xe nộp ảnh CCCD và tối thiểu một xe chính chủ kèm giấy đăng ký xe, bảo hiểm. Sau khi hồ sơ được chấp thuận, tài khoản có thể vừa thuê vừa cho thuê. Nhân viên xét duyệt hồ sơ, tin xe và xử lý vi phạm, khiếu nại, báo cáo; quản trị viên có toàn bộ chức năng quản trị của nhân viên, đồng thời quản lý tài khoản vận hành và cấu hình.

## Quy trình chính

Giá thuê tính theo ngày, phần ngày lẻ làm tròn lên và tối thiểu một ngày. Người thuê chọn xe, thời gian và xem khoản cọc bằng 25% giá trị chuyến do hệ thống lưu trong `DepositHold`. Hold chưa cọc không khóa lịch, không tự hết hiệu lực nên nhiều hold cùng xe có thể giao nhau. GPLX phải còn hiệu lực đến hết ngày trả. Khi cọc, hệ thống khóa hold và dữ liệu theo xe, kiểm tra lại toàn bộ điều kiện hiện hành, rồi ghi giao dịch, booking `Pending`, payment và hold `Converted` trong một transaction bằng số tiền phía máy chủ. Hold bị bỏ hoặc không còn hợp lệ chuyển `Cancelled`. Booking `Pending` khóa lịch ngay và chủ xe có 1 ngày (24 giờ) để chấp thuận hoặc từ chối. `Accepted` và `Ongoing` tiếp tục khóa lịch; `Rejected`, `Expired`, `Cancelled` giải phóng lịch, còn `Completed` không ảnh hưởng lịch tương lai. Chủ xe chỉ xử lý booking hiện tại; quyết định không tác động booking khác.

Hai bên xác nhận giao xe trên hệ thống để bắt đầu chuyến; khi trả xe, cả hai tiếp tục xác nhận để hoàn tất. Hệ thống lưu thời điểm từng xác nhận; xác nhận của một bên được giữ nguyên cho đến khi bên còn lại xác nhận hoặc booking không còn hợp lệ, không bị xóa hoặc đặt lại do thời gian chờ. Không bắt buộc ảnh hoặc theo dõi số km, nhiên liệu. Bất đồng được gửi khiếu nại và xử lý riêng. Trong UC-AS-04, `Staff`/`Admin` có thể chọn `CancelOwnerFault` để hủy booking `Accepted` khi xác định `Owner` không giao xe, hoặc `ForceComplete` để hoàn tất booking `Ongoing` khi chuyến đã kết thúc nhưng thiếu xác nhận trả xe. Khi booking `Completed`, cọc tự động chuyển cho `Owner` sau khi trừ hoa hồng. Phần tiền thuê còn lại chỉ hiển thị để tham khảo và do hai bên tự xử lý ngoài hệ thống.

`Pending → Accepted → Ongoing → Completed`

Quy tắc đầy đủ ở [quy tắc thuê xe](shared-rental-rules.md).

## Phạm vi thực hiện

**Phạm vi chức năng v1:** đăng ký, đăng nhập bằng email hoặc số điện thoại, đăng xuất và cập nhật tài khoản; hồ sơ GPLX; đăng ký, xét duyệt và tạm dừng quyền chủ xe; đăng xe, duyệt tin và giấy tờ; tìm kiếm, đặt thuê, cọc 25%, hủy, hoàn cọc, phạt 40% và hệ thống ngân hàng giả lập không lưu giá trị tiền trong tài khoản; xác nhận giao, trả xe; đánh giá, báo cáo đánh giá, khiếu nại và các kết quả xử lý `None`, `CancelOwnerFault`, `ForceComplete`; lịch sử, doanh thu, hoa hồng mặc định 5%, xử lý vi phạm và quản trị. Không có use case hoặc background job riêng cho Owner không giao xe. Hệ thống tự động chuyển cọc cho Owner sau khi trừ hoa hồng; phần tiền thuê còn lại do hai bên xử lý ngoài hệ thống. Xóa tài khoản nằm ngoài phạm vi.

**Thực hiện sau khi luồng chính ổn định:** đánh giá, báo cáo, khiếu nại; bản đồ điểm nhận xe, chatbot tra cứu chính sách, thông báo và báo cáo nâng cao. Thứ tự triển khai không thay đổi phạm vi nghiệp vụ v1 đã chốt.

**Ngoài phạm vi:** thanh toán, chuyển tiền và thu nợ thật; thuế; OTP/QR bàn giao; ứng dụng di động, GPS trực tiếp, gợi ý xe bằng AI, khóa xe thông minh; xác minh tính xác thực của giấy tờ hoặc danh tính bằng nguồn bên ngoài; xử lý bảo hiểm, định giá thiệt hại và phân xử pháp lý thực tế.

## Cấu trúc ứng dụng

```text
VehicleRentalMarketplace.sln
└── src/
    ├── CarRental.Web       # Giao diện, Controllers và Views
    ├── CarRental.Services  # Xử lý nghiệp vụ
    ├── CarRental.Data      # DbContext, Repositories và Migrations
    └── CarRental.Models    # Thực thể và dữ liệu trao đổi
```

Hướng tham chiếu chính: `Web → Services → Data → Models`. Chi tiết tại [thiết kế hệ thống](../architecture/system-design.md) và [ghi chú kỹ thuật](../architecture/technical-notes.md).

## Tài liệu chức năng

- [Chức năng Visitor và Base User](../use-cases/base-user.md)
- [Chức năng người thuê](../use-cases/renter.md)
- [Chức năng chủ xe](../use-cases/owner.md)
- [Chức năng quản trị viên và nhân viên](../use-cases/admin-staff.md)
- [Chức năng dùng chung](../use-cases/shared.md)
