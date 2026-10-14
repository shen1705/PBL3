---
status: accepted
updated: 2026-10-01
---

# Software Requirements Specification (SRS)
## Hệ thống web trung gian cho thuê ô tô — Car Rental Marketplace (PBL3)

---

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này mô tả yêu cầu chức năng và phi chức năng của hệ thống web trung gian kết nối chủ xe (Owner) và người thuê (Renter), tham khảo mô hình Mioto. 
### 1.2 Phạm vi sản phẩm
Hệ thống cho phép:
- Chủ xe đăng xe của mình để cho thuê.
- Người thuê tìm kiếm, đặt thuê xe với cọc mô phỏng.
- Nền tảng quản lý toàn bộ vòng đời một yêu cầu thuê: giữ chỗ, duyệt, bàn giao, trả xe, ghi nhận doanh thu.
- Nhân viên và quản trị viên duyệt hồ sơ, xử lý vi phạm, khiếu nại và cấu hình hệ thống.

Toàn bộ giao dịch tiền (cọc, hoàn cọc, phạt, trả tiền cho chủ xe) đều là **mô phỏng**, không kết nối cổng thanh toán thật.

---

## 2. Mô tả tổng quan

### 2.1 Bối cảnh sản phẩm
Hệ thống đóng vai trò trung gian, không sở hữu xe. Chủ xe tự chịu trách nhiệm về xe và giấy tờ; hệ thống chỉ kiểm tra thông tin đã cung cấp, không xác minh tính xác thực với nguồn bên ngoài.

### 2.2 Kiến trúc tổng quan (Architecture)
Kiến trúc 3 tầng:

| Tầng | Vai trò |
| --- | --- |
| `CarRental.Web` | Controllers, Views — nhận yêu cầu, hiển thị, kiểm tra quyền truy cập chức năng |
| `CarRental.Services` | Business logic — kiểm tra quyền sở hữu, trạng thái, lịch trùng, điều kiện chuyển trạng thái |
| `CarRental.Data` | DbContext, Repository, Migrations — đọc/ghi MySQL qua EF Core |
| `CarRental.Models` | Entity và data type trao đổi giữa các tầng |

Hướng tham chiếu: `Web → Services → Data → Models`. Tích hợp mở rộng (sau v1): bản đồ Leaflet.js/OpenStreetMap cho điểm nhận xe; chatbot tra cứu chính sách (dịch vụ Python/FastAPI riêng, gọi qua HTTP, không ảnh hưởng luồng chính nếu gián đoạn).

### 2.3 Tác nhân hệ thống (Actor)

| Actor | Mô tả |
| --- | --- |
| `Visitor` | Chưa đăng nhập — đăng ký, đăng nhập, xem/tìm xe công khai |
| `Base User` | Đã xác thực — chức năng tài khoản chung (xem/sửa hồ sơ, đổi mật khẩu, đăng ký làm chủ xe) |
| `Renter` | Kế thừa `Base User` — tạo, quản lý yêu cầu thuê. Được cấp ngay khi đăng ký công khai |
| `Owner` | Kế thừa `Base User` — quản lý xe, duyệt yêu cầu, bàn giao. Cấp sau khi hồ sơ được duyệt; tài khoản vẫn giữ `Renter` |
| `Staff` | Kế thừa `Base User` — duyệt hồ sơ/tin đăng, xử lý người dùng và khiếu nại trong phạm vi được cấp |
| `Admin` | Kế thừa `Base User`, có toàn bộ chức năng của `Staff` + cấu hình hệ thống, báo cáo toàn nền tảng, quản lý tài khoản Staff/Admin |

`Visitor`/`Base User` chỉ là actor phân tích, không lưu vai trò trong DB. Một tài khoản có thể đồng thời giữ `Renter` và `Owner`. ASP.NET Core Identity chỉ dùng 3 role lưu trữ: `Renter`, `Owner`, `Admin` — `Staff` dùng chung role `Admin`, phân biệt qua claims (`CanManageSystemConfig`, `CanManageAdminAccounts`).

### 2.4 Ràng buộc chung (Tech stack)
C#, ASP.NET Core MVC, ASP.NET Core Identity, Entity Framework Core (Pomelo.EntityFrameworkCore.MySql), MySQL, kiến trúc ba tầng.

### 2.5 Giới hạn phạm vi 
Không thực hiện xác minh giấy tờ/danh tính với nguồn bên ngoài; không xử lý thanh toán, bảo hiểm hoặc pháp lý thực tế; hệ thống hoạt động dựa trên mô phỏng cho toàn bộ giao dịch tiền.

---

## 3. Yêu cầu chức năng

### 3.1 Tài khoản và người dùng chung (Base User) 

| Mã | Chức năng |
| --- | --- |
| UC-U-01 | Đăng ký tài khoản — cấp `Renter` ngay, không xác minh email |
| UC-U-02 | Đăng nhập bằng email hoặc số điện thoại |
| UC-U-03 | Đăng xuất |
| UC-U-04 | Xem thông tin cá nhân |
| UC-U-05 | Cập nhật thông tin cá nhân |
| UC-U-06 | Đổi mật khẩu |
| UC-U-07 | Đăng ký làm chủ xe — nộp CCCD + tối thiểu một xe chính chủ kèm giấy tờ; chờ Staff/Admin duyệt |

### 3.2 Người thuê (Renter) 

| Mã | Chức năng |
| --- | --- |
| UC-R-01 | Xem danh sách xe (Visitor/Base User đều dùng được) |
| UC-R-02 | Tìm kiếm và lọc xe |
| UC-R-03 | Tạo đơn thuê — GPLX còn hiệu lực đến hết ngày trả, kiểm tra lịch qua UC-S-01, cọc 25% rồi tạo `Pending` khóa lịch |
| UC-R-04 | Hủy yêu cầu thuê — `Pending` hoàn cọc; `Accepted` mất cọc và chuyển cọc cho Owner sau trừ hoa hồng |
| UC-R-05 | Đặt cọc mô phỏng |
| UC-R-06 | Xác nhận nhận xe đầu chuyến (dùng chung với UC-O-03) |
| UC-R-07 | Xác nhận trả xe (dùng chung với UC-O-04) |
| UC-R-08 | Xem lịch sử thuê xe |
| UC-R-09 | Cung cấp GPLX (số, hạng, ngày hết hạn, ảnh) |

### 3.3 Chủ xe (Owner) 

| Mã | Chức năng |
| --- | --- |
| UC-O-01 | Quản lý xe — thêm/sửa xe, tin chỉ hiển thị sau khi duyệt |
| UC-O-02 | Duyệt yêu cầu thuê — kiểm tra trạng thái, hạn phản hồi, quyền sở hữu và quyền Owner rồi chấp thuận hoặc từ chối |
| UC-O-03 | Giao xe đầu chuyến (= UC-R-06) |
| UC-O-04 | Nhận lại xe cuối chuyến (= UC-R-07) |
| UC-O-05 | Xem lịch sử cho thuê |
| UC-O-06 | Xem doanh thu từ cọc `Transferred`/`Forfeited` của xe thuộc mình |
| UC-O-07 | Hủy yêu cầu đã chấp thuận — hoàn cọc và thanh toán phạt 40% trong cùng transaction |
| UC-O-08 | Thanh toán khoản phạt mô phỏng |

### 3.4 Quản trị (Staff / Admin) 

| Mã | Chức năng | Staff | Admin |
| --- | --- | --- | --- |
| UC-AS-01 | Duyệt hồ sơ chủ xe | Có | Có |
| UC-AS-02 | Kiểm duyệt tin đăng | Có | Có |
| UC-AS-03 | Xem và quản lý người thuê/chủ xe; không sửa trực tiếp thông tin cá nhân | Có | Có |
| UC-AS-04 | Xử lý khiếu nại — `None` / `CancelOwnerFault` / `ForceComplete` | Trong phạm vi người dùng/tin đăng | Có |
| UC-AS-05 | Xem báo cáo toàn nền tảng | Không | Có |
| UC-AS-06 | Cấu hình hoa hồng trong `[0; 0,25]` | Không | Có |
| UC-AS-07 | Quản lý tài khoản Staff/Admin; bảo vệ Admin hoạt động cuối cùng | Không | Có |
| UC-AS-08 | Gỡ tin vi phạm bằng trạng thái `Hidden` | Có | Có |
| UC-AS-09 | Khóa/mở khóa tài khoản bằng `account_sanction` | Có | Có |
| UC-AS-10 | Xử lý báo cáo đánh giá | Có | Có |
| UC-AS-11 | Tạm dừng quyền chủ xe, gồm trường hợp khoản phạt chưa thanh toán | Có | Có |

Staff không được thao tác lên tài khoản `Staff`/`Admin` khác.

### 3.5 Chức năng dùng chung 

| Mã | Chức năng |
| --- | --- |
| UC-S-01 | Kiểm tra lịch xe (internal, gọi bởi UC-R-03 và UC-R-05) |
| UC-S-02 | Đánh giá bên còn lại (sau `Completed`, một lần/bên) |
| UC-S-03 | Gửi khiếu nại (mô tả bắt buộc, ảnh tùy chọn; không được sửa sau khi gửi) |
| UC-S-04 | Báo cáo đánh giá |

---

## 4. Quy tắc nghiệp vụ cốt lõi

### 4.1 Trạng thái yêu cầu thuê
`Pending → Accepted → Ongoing → Completed`

### 4.2 Đặt cọc và giữ lịch
- Giá thuê tính theo ngày: `rental_days = max(1, ceil((endDate - startDate) / 24 giờ))`; phần ngày lẻ làm tròn lên và một khoảng thuê dương luôn tính tối thiểu một ngày.
- Cọc = 25% giá trị chuyến và được tính, lưu phía máy chủ trong `DepositHold`; client không gửi số tiền.
- `DepositHold`/`AwaitingDeposit` không khóa lịch; nhiều hold có thể giao nhau cho cùng xe.
- Hold không có thời hạn tự hết hiệu lực. Hold bị người thuê bỏ hoặc không còn hợp lệ khi cọc chuyển `Cancelled`.
- Khi cọc, hệ thống khóa hold và dữ liệu theo xe; kiểm tra đúng Renter, trạng thái `AwaitingDeposit`, `start_date` ở tương lai, tin `Public`, xe `Approved`, bảo hiểm còn hạn, Owner `Active`, giá tin không đổi, GPLX còn hiệu lực đến hết `end_date`, không có `account_sanction` còn hiệu lực, không giao lịch xe.
- Nếu hợp lệ, hệ thống ghi giao dịch cọc, tạo booking `Pending` và payment, chuyển hold sang `Converted` trong cùng một transaction. Hold được giữ làm lịch sử qua `source_hold_id`; điều kiện không hợp lệ, giao dịch mô phỏng thất bại hoặc lỗi xử lý đều rollback và chuyển hold sang `Cancelled`.
- Booking `Pending` khóa lịch ngay từ lúc được tạo và bắt đầu hạn phản hồi 24 giờ của chủ xe. `Accepted`, `Ongoing` tiếp tục khóa lịch; `Rejected`, `Expired`, `Cancelled` không khóa và `Completed` không ảnh hưởng lịch tương lai.
- Chủ xe chỉ chấp thuận hoặc từ chối booking hiện tại. Chấp thuận chuyển sang `Accepted` và tiếp tục giữ lịch; từ chối hoặc hết 24 giờ không phản hồi thì hoàn cọc và giải phóng lịch.

### 4.3 Hủy và khoản phạt
| Trường hợp | Kết quả |
| --- | --- |
| Renter hủy khi `Pending` | Hoàn toàn bộ cọc |
| Renter hủy sau `Accepted`, trước chuyến | Mất cọc; cọc chuyển cho Owner sau trừ hoa hồng, trạng thái `Forfeited` |
| Owner tự hủy sau `Accepted` | Hoàn cọc + thanh toán phạt mô phỏng 40% trong cùng transaction; lỗi thì giữ `Accepted` |
| Staff/Admin chọn `CancelOwnerFault` khi xử lý khiếu nại Owner không giao xe | `Accepted → Cancelled`, hoàn cọc, giải phóng lịch, tạo khoản phạt 40% `Pending` |
| Bị từ chối / hết hạn / do tạm dừng quyền Owner | Hoàn toàn bộ cọc |
| Sau khi `Ongoing` | Không hủy được — chuyển sang khiếu nại |

### 4.4 Bàn giao và trả xe
Mỗi bên xác nhận riêng, hệ thống lưu người + thời điểm; đủ hai xác nhận giao → `Ongoing`; đủ hai xác nhận trả → `Completed` mà không phụ thuộc trạng thái khiếu nại. Nếu mới một bên xác nhận, hệ thống giữ nguyên xác nhận đó cho đến khi bên còn lại xác nhận hoặc booking không còn hợp lệ; không xóa hoặc đặt lại do thời gian chờ. Không bắt buộc ảnh, không theo dõi số km/nhiên liệu, không OTP/QR. Thiếu xác nhận hoặc bất đồng → gửi khiếu nại; Staff/Admin có thể dùng `ForceComplete` khi vụ việc đã kết thúc.

### 4.5 Doanh thu và hoa hồng
Khi `Completed`, trong cùng transaction, hệ thống lấy tỷ lệ hoa hồng hiện tại, tính trên `price_locked_total`, chuyển `deposit_amount - commission_amount` từ `PlatformEscrow` cho Owner, giữ hoa hồng, đặt cọc thành `Transferred` và ghi `revenue_recorded_at`. Cọc bị mất do Renter hủy booking `Accepted` được xử lý cùng công thức và đặt thành `Forfeited`. Chủ xe xem tổng tiền thuê, hoa hồng, phần nhận qua hệ thống, phần còn lại thu trực tiếp để tham khảo; dòng `Forfeited` tách riêng. Tỷ lệ mặc định là 5%, được Admin cấu hình trong `[0; 0,25]`.

### 4.6 Đánh giá và khiếu nại
Mỗi bên đánh giá một lần/đơn sau `Completed`, không sửa/xóa. Công khai khi cả hai đã gửi hoặc sau 7 ngày, tùy điều kiện nào đến trước. Khiếu nại cần mô tả, có thể đính kèm ảnh nhưng không bắt buộc; nội dung không được sửa sau khi gửi và không có thời hạn gửi. Việc gửi khiếu nại không tự kết luận vi phạm hay khóa tài khoản/tiền/xe. `CancelOwnerFault` chỉ áp dụng khi dispute `Open`, booking `Accepted`, đã đến `start_date` và xác định lỗi Owner; `ForceComplete` chỉ áp dụng cho booking `Ongoing` đã thực tế kết thúc nhưng thiếu xác nhận `Return`; `None` không đổi booking hoặc dòng tiền. Khiếu nại sau `Completed` chỉ dùng `None`.

### 4.7 Vi phạm và tạm dừng
| Mức độ | Thời hạn khóa |
| --- | --- |
| Nhẹ | 7 ngày |
| Trung bình | 30 ngày |
| Nặng | Vĩnh viễn |

Tạm dừng quyền `Owner`: ẩn toàn bộ xe, hủy + hoàn cọc các `Pending`/`Accepted`; `Ongoing` không tự hủy; quyền `Renter` không bị ảnh hưởng.

Staff/Admin không sửa trực tiếp thông tin cá nhân của người dùng. Khóa tài khoản tạo `account_sanction`; mở khóa ghi `lifted_at`, `lifted_by` và không xóa lịch sử; mỗi tài khoản chỉ có một sanction còn hiệu lực. Admin không được tạm dừng hoặc thu hồi quyền của Admin hoạt động cuối cùng có `CanManageAdminAccounts`. Gỡ tin chuyển listing sang `Hidden`, chặn hold mới, giữ dữ liệu và không thay đổi booking đã tạo; tin muốn hiển thị lại phải được duyệt lại.

---

## 5. Yêu cầu phi chức năng

### 5.1 Bảo mật
- Mật khẩu băm một chiều bằng `PasswordHasher` của ASP.NET Core Identity (PBKDF2).
- Số điện thoại được chuẩn hóa trước khi lưu, dùng trực tiếp để tra cứu đăng nhập và kiểm tra trùng; phiên bản v1 không mã hóa số điện thoại ở cấp trường dữ liệu. Hệ thống giới hạn quyền truy cập, không công khai và không ghi đầy đủ số điện thoại vào log.
- Giấy tờ, tài khoản ngân hàng giả lập và ảnh khiếu nại không công khai.
- Người dùng chỉ xem/sửa thông tin của chính mình; chỉ Staff/Admin xem thông tin người khác trong phạm vi nhiệm vụ.

### 5.2 Toàn vẹn dữ liệu và xử lý đồng thời
Khi chuyển hold sau thao tác cọc, hệ thống phải khóa hold và dữ liệu theo xe, kiểm tra lại toàn bộ điều kiện rồi ghi cọc, booking `Pending`, payment và trạng thái hold `Converted` trong cùng một transaction. Hai khoảng trùng nhau khi `new_start < existing_end` và `new_end > existing_start`; việc khóa theo xe bảo đảm hai hold giao nhau không cùng vượt qua kiểm tra. Giao dịch ngân hàng giả lập dùng mã duy nhất: `DEPOSIT-{holdId}`, `REFUND-{bookingId}`, `SETTLE-{bookingId}`, `FORFEIT-{bookingId}`, `PENALTY-{bookingId}`. Không ghi trùng cọc, hoàn cọc, booking, xác nhận bàn giao, doanh thu hoặc đánh giá. Các field thời gian được lưu theo UTC.

### 5.3 Khả dụng
Luồng đặt thuê chính không phụ thuộc vào các dịch vụ mở rộng (chatbot, bản đồ) — vẫn hoạt động khi các dịch vụ này gián đoạn.

### 5.4 Khả năng mở rộng
Đánh giá, khiếu nại, bản đồ điểm nhận xe, chatbot, thông báo và báo cáo nâng cao được thiết kế để triển khai sau khi luồng chính ổn định.

---

## 6. Yêu cầu dữ liệu

ERD chính gồm các nhóm bảng: `users`/`roles`/`user_roles`/`user_claims`, `account_sanction` và `driver_licenses`; `owner_profiles`; `vehicles`/`vehicle_documents`/`vehicle_listings`/`listing_images`/`vehicle_unavailability`; `deposit_holds`; `bookings` có `vehicle_id`; `handover_confirmations`; `disputes`; `reviews`; `payments`/`mock_bank_accounts`/`mock_bank_transactions`; `system_settings`. Tài khoản giả lập không lưu giá trị tiền. Payment không lưu khoản tiền còn lại; giá trị này được tính khi hiển thị. Chi tiết cột, khóa và quan hệ xem [ERD](../architecture/erd.md).

---

## 7. Phạm vi ngoài đề tài
Cổng thanh toán và chuyển tiền thật, thuế, OTP/QR bàn giao, ứng dụng di động, GPS trực tiếp, gợi ý xe bằng AI, xác minh giấy tờ/danh tính tự động, khóa xe thông minh, xử lý bảo hiểm, định giá thiệt hại và phân xử pháp lý thực tế.
