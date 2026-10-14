---
title: "PBL — Ghi chú kỹ thuật"
project: PBL3
category: documents
type: design
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/design]
---

# PBL — Ghi chú kỹ thuật

Các lựa chọn kỹ thuật dùng cho [thiết kế hệ thống](system-design.md). Quy tắc nghiệp vụ xem [quy tắc thuê xe](../requirements/shared-rental-rules.md).

## Vai trò và quyền truy cập

- Trong Use Case Diagram, `Visitor` là tác nhân chưa đăng nhập; `Base User` là tác nhân đã xác thực. `Renter`, `Owner`, `Staff` và `Admin` kế thừa `Base User`; `Admin` có toàn bộ chức năng quản trị của `Staff`. Đây là quan hệ giữa tác nhân; một tài khoản vẫn có thể mang đồng thời quyền `Renter` và `Owner`.
- `Visitor` và `Base User` không phải vai trò được lưu trong cơ sở dữ liệu. Hệ thống chỉ dùng ba vai trò `Renter`, `Owner`, `Admin`. Đăng ký công khai cấp `Renter`; tài khoản vận hành được cấp riêng. Duyệt hồ sơ chủ xe bổ sung `Owner` và giữ quyền thuê xe.
- Quan hệ người dùng và vai trò lưu trong `user_roles`; quyền chi tiết lưu trong `user_claims`. ERD dùng tên logic `users`, `roles`, `user_roles`, `user_claims` và giữ `user_id` kiểu chuỗi. Không cần tạo lớp tài khoản kế thừa riêng cho người thuê và chủ xe.
- Nhân viên và quản trị viên cùng dùng vai trò `Admin`, nhưng quyền chi tiết trong `user_claims` khác nhau. `CanManageSystemConfig` và `CanManageAdminAccounts` là các quyền dành cho quản trị viên.
- Nhân viên chỉ quản lý người thuê, chủ xe và tin đăng; không được sửa tài khoản nhân viên hoặc quản trị viên. Báo cáo toàn nền tảng dành cho quản trị viên trong phạm vi hiện tại.
- Tài khoản quản trị ban đầu được tạo bằng dữ liệu khởi tạo, tách khỏi đăng ký công khai và vai trò thuê, cho thuê.
- Controller kiểm tra quyền vào chức năng; Service kiểm tra người dùng có sở hữu xe hoặc tham gia đơn tương ứng không. Ví dụ: `resource.OwnerId == currentUser.Id`.
- Không cho người dùng thuê xe của mình hoặc tự đánh giá mình.

## Dữ liệu tài khoản và hồ sơ

- Tài khoản bổ sung `full_name` và `gender`. Tên đăng nhập, email và số điện thoại cần được kiểm tra trùng theo quy tắc đăng ký. Số điện thoại được chuẩn hóa và lưu trong một trường duy nhất có ràng buộc unique.
- Mật khẩu dùng `PasswordHasher` của ASP.NET Core Identity (PBKDF2): lưu hash một chiều và kiểm tra mật khẩu nhập vào bằng phép xác thực hash, không giải mã mật khẩu.
- Phiên bản v1 không mã hóa số điện thoại ở cấp trường dữ liệu để giữ thiết kế đơn giản. Hệ thống chuẩn hóa số trước khi lưu hoặc tra cứu, giới hạn quyền xem, không công khai và không ghi đầy đủ số điện thoại vào log.
- Thông tin GPLX thuộc hồ sơ người dùng. Dữ liệu `driver_licenses` gắn một-một với tài khoản, gồm số GPLX, hạng, ngày hết hạn và ảnh; không cần bảng `renter_profiles` riêng chỉ để lưu GPLX. Service kiểm tra đủ thông tin, ảnh đã lưu và ngày còn hạn trước mỗi lần tạo yêu cầu thuê, không xác minh giấy tờ.
- Lịch sử khóa tài khoản lưu trong `account_sanction`: tài khoản bị xử lý, mức khóa, lý do, người xử lý, thời điểm bắt đầu, thời điểm hết hạn và hiệu lực. Trạng thái tài khoản được suy ra từ hình phạt còn hiệu lực; không lưu thêm cột trạng thái khóa trong tài khoản. Mỗi tài khoản không có hai hình phạt cùng hiệu lực.
- ERD chi tiết được lưu tại [ERD](erd.md). Hồ sơ chủ xe ghi nhận ảnh CCCD, tối thiểu một xe cùng giấy đăng ký và bảo hiểm, kết quả xét duyệt và lý do từ chối. Việc duyệt là thủ công, không có bộ tiêu chí thẩm định phức tạp và không ghi kết quả xác minh pháp lý thực tế. Tạm dừng quyền `Owner` là trạng thái nghiệp vụ riêng với khóa tài khoản.
- Mỗi tài khoản người dùng được tạo một `mock_bank_account` khi đăng ký. `PlatformEscrow` được tạo sẵn và không gắn với người dùng.

## Cấu trúc và cấu hình

Các phần chính gồm `CarRental.Web`, `CarRental.Services`, `CarRental.Data`, `CarRental.Models`; hướng tham chiếu `Web → Services → Data → Models`. Cấu trúc MySQL được đồng bộ bằng các tệp migration lưu trong Git.

Thông tin bí mật trong cấu hình không đưa vào kho mã nguồn. Quy ước hiện có bỏ qua `appsettings.Development.json`, `bin/` và `obj/`.

Hoa hồng mặc định là 5% và là một giá trị cấu hình do quản trị viên quản lý trong khoảng `[0; 0,25]`. Thay đổi có hiệu lực ngay, không lập lịch trong tương lai và không tính lại doanh thu đã ghi nhận. Khi cọc được chuyển cho `Owner`, hệ thống trừ hoa hồng tính trên tổng giá chuyến và giữ lại tại `PlatformEscrow`. Cọc bằng 25% giá trị chuyến; số tiền được tính và lưu phía máy chủ trong `DepositHold`. Hạn phản hồi của chủ xe là 1 ngày (24 giờ) kể từ khi cọc thành công.

## Các điểm cần kiểm soát khi triển khai

- Giá tính theo ngày, phần ngày lẻ làm tròn lên và tối thiểu một ngày. `DepositHold`/`AwaitingDeposit` lưu giá và cọc nhưng không khóa lịch; nhiều hold cùng xe có thể giao nhau. Cọc thành công mới tạo booking `Pending`, và booking này khóa lịch ngay. Hết hạn phản hồi 24 giờ thì chuyển `Expired`, hoàn cọc và giải phóng lịch.
- Hai khoảng được xem là trùng nếu `new_start < existing_end` và `new_end > existing_start`. Khả dụng được kiểm tra theo xe với `vehicle_unavailability` và booking `Pending`, `Accepted`, `Ongoing`; các trạng thái `Rejected`, `Expired`, `Cancelled` không khóa lịch, còn `Completed` không ảnh hưởng lịch tương lai.
- Khi cọc, Service phải khóa hold và dữ liệu theo xe; kiểm tra hold thuộc `Renter` hiện tại, đang `AwaitingDeposit`, `start_date` còn ở tương lai, tin `Public`, xe `Approved`, bảo hiểm còn hạn, `Owner` còn `Active`, giá tin không đổi, GPLX còn hiệu lực đến hết `end_date`, `Renter` không có `account_sanction` còn hiệu lực, không giao lịch xe. Sau đó Service dùng `deposit_amount` từ hold để ghi giao dịch, booking `Pending`, payment và hold `Converted` trong cùng một transaction. Điều kiện không hợp lệ, xung đột lịch, giao dịch mô phỏng thất bại hoặc lỗi xử lý đều rollback và chuyển hold sang `Cancelled`; giữ `source_hold_id`, không xóa hold sau khi chuyển đổi.
- Chủ xe chỉ chấp thuận hoặc từ chối booking `Pending` hiện tại. Chấp thuận chuyển sang `Accepted` và tiếp tục khóa lịch; quyết định không tác động booking khác.
- Khi chủ xe bị tạm dừng quyền, giữ nguyên vai trò `Owner` nhưng đặt `owner_profiles.access_status = Suspended`; Service từ chối chức năng Owner khi trạng thái không phải `Active`. Đồng thời ẩn mọi xe, hủy và hoàn cọc các yêu cầu `Pending`/`Accepted`; không tự hủy chuyến `Ongoing`. Quyền `Renter` không bị ảnh hưởng.
- Phần tiền thuê còn lại chỉ được tính khi hiển thị bằng `price_locked_total - deposit_amount`; hai bên tự xử lý ngoài hệ thống.
- Lưu riêng người và thời điểm xác nhận giao, trả xe của từng bên. Đủ xác nhận giao xe mới chuyển `Ongoing`; đủ xác nhận trả xe mới chuyển `Completed` mà không phụ thuộc trạng thái khiếu nại. Xác nhận của một bên được giữ đến khi bên còn lại xác nhận hoặc booking không còn hợp lệ; không có cơ chế hết hạn, xóa hoặc đặt lại do thời gian chờ. Khiếu nại được theo dõi riêng.
- Không bắt buộc ảnh; hệ thống không theo dõi số công-tơ-mét hoặc nhiên liệu.
- Giữ giá đã xác nhận của đơn. Khi booking `Completed`, chuyển cọc cho `Owner` sau khi trừ hoa hồng; khi `Renter` hủy booking `Accepted`, chuyển cọc theo cùng công thức và ghi `Forfeited`. Chống ghi lặp cọc, xác nhận, doanh thu và đánh giá.
- Cọc, hoàn cọc, chuyển cọc và khoản phạt 40% là giao dịch qua các tài khoản ngân hàng giả lập; tài khoản không lưu giá trị tiền, không hỗ trợ bổ sung tiền và hệ thống không kiểm tra khả năng chi trả. Giao dịch mô phỏng vẫn có thể thất bại hoặc bị hủy thao tác. Dùng các mã duy nhất `DEPOSIT-{holdId}`, `REFUND-{bookingId}`, `SETTLE-{bookingId}`, `FORFEIT-{bookingId}`, `PENALTY-{bookingId}`. `Owner` tự hủy booking `Accepted` phải hoàn cọc và thanh toán phạt trong cùng transaction; Staff hủy do `Owner` không giao xe thì tạo khoản phạt `Pending`.
- `ReviewService` và `DisputeService` dùng chung cho người thuê và chủ xe. Mỗi bên chỉ đánh giá một lần sau `Completed`, không sửa/xóa. Khiếu nại yêu cầu mô tả, cho phép một ảnh tùy chọn, không được sửa sau khi gửi và không có thời hạn gửi. `CancelOwnerFault` chỉ áp dụng cho dispute `Open`, booking `Accepted`, đã đến `start_date` và xác định Owner không giao xe; hệ thống hủy booking, hoàn cọc, giải phóng lịch, tạo khoản phạt `Pending` và resolve dispute trong cùng transaction. `ForceComplete` chỉ áp dụng cho booking `Ongoing` đã thực tế kết thúc nhưng thiếu xác nhận `Return`; `None` không đổi booking hoặc dòng tiền. Khiếu nại sau `Completed` chỉ dùng `None`. Không có use case hoặc background job no-show riêng.
- Staff/Admin không sửa trực tiếp thông tin cá nhân. Khóa tài khoản tạo `account_sanction`; mở khóa ghi `lifted_at`, `lifted_by`; mỗi tài khoản chỉ có một sanction còn hiệu lực. Admin không được tạm dừng hoặc thu hồi quyền của Admin hoạt động cuối cùng có `CanManageAdminAccounts`. Gỡ tin chuyển listing sang `Hidden`, chặn hold mới, giữ dữ liệu và booking đã tạo; tin muốn hiển thị lại phải được duyệt lại.
- Không triển khai chức năng xóa tài khoản trong phạm vi v1.
- Các field thời gian có trong ERD lưu theo UTC; chỉ chuyển múi giờ khi hiển thị.
- `BookingResponseExpiryJob` xử lý booking `Pending` quá 24 giờ, chuyển `Expired`, giải phóng lịch và tạo hoàn cọc theo `reference_code` duy nhất; job phải chạy lặp an toàn.
- Hash mật khẩu bằng Identity; mã hóa dữ liệu nhạy cảm nếu lưu, bảo vệ khóa mã hóa và không ghi dữ liệu này vào record dưới dạng commit.

## Tích hợp

`vehicle_listings.latitude` và `vehicle_listings.longitude` phục vụ bản đồ Leaflet.js, OpenStreetMap. Chatbot Python/FastAPI chạy riêng, chỉ tra cứu chính sách tĩnh qua HTTP. Chi tiết tại [thiết kế hệ thống](system-design.md).
