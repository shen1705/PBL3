# Báo Cáo Phiên Làm Việc (Session Note) & Kế Hoạch Tiếp Theo

> **Dự án:** Car Rental Marketplace (.NET 10 - Kiến trúc 3 tầng: Web / Services / Data / Models)  
> **Thư mục dự án:** `C:/Users/admin/documents/PBL3/PBL3`  
> **Tài liệu đặc tả liên quan:** [PFIEV-PBL-DuAnCNPM.pdf](file:///C:/Users/admin/documents/PBL3/PFIEV-PBL-DuAnCNPM.pdf)  
> **Nhánh Git hiện tại:** `feature/car-rental-lifecycle`  
> **Thời gian cập nhật:** 02/11/2026 (Phiên làm việc 5)  

---

## 1. Tóm Tắt Các Phiên Trước
- **Session 1 (Auth Services):** Hệ thống xác thực ASP.NET Core Identity, DTOs, kiểm tra chế tài vi phạm `AccountSanctions`, Cookie Auth, sửa seed data số điện thoại duy nhất. Nhánh `feature/auth-services` đã merge vào `develop`.
- **Session 2 (Vehicle Catalog & Search):** Tầng backend danh mục xe MySQL, `VehicleService`, `VehiclesController`, bộ lọc nâng cao trên `/find`, panel kép `/become-owner`, tái cấu trúc route `/account`. Nhánh `feature/account-and-vehicles` đã merge vào `develop`.
- **Session 3 (Booking & Rental Management Service):** Phân hệ đặt xe cốt lõi, tính cọc 25%, kiểm soát lịch trống, giữ cọc `DepositHold`, duyệt/từ chối/hủy chuyến. Nhánh `feature/booking-service` đã merge vào `develop`.
- **Session 4 (UI & Auth Field Separation):** Đồng bộ nút tìm xe (`.nav-find-car-btn`) theo màu Hero Banner (`#212529`); phân tách độc lập `UserName` (chỉ dùng đăng nhập) và `FullName` (hiển thị toàn hệ thống). Nhánh `feature/register-fullname-and-ui` đã merge vào `develop`.

---

## 2. Chi Tiết Phiên Làm Việc Hiện Tại (Session 5: Hoàn Tất Vòng Đời Thuê Xe - End-to-End Car Rental Lifecycle)

Phiên làm việc này đã hoàn thành 100% các chức năng cơ bản của nghiệp vụ cho thuê xe ("finish all the basic function of car rental"):
- `Accepted` $\rightarrow$ `Ongoing`: Bàn giao xe (Pickup Handover) bởi người thuê và chủ xe.
- `Ongoing` $\rightarrow$ `Completed`: Trả xe & Quyết toán (Return Handover), thanh toán 75% giá trị hợp đồng còn lại, tự động trích 5% hoa hồng sàn AZU Car và ghi nhận doanh thu thực nhận 95% cho chủ xe (`Payment`), hoàn tất cọc (`DepositHold`).
- Đánh giá 2 chiều (Reviews & Ratings): Đánh giá 1 - 5 sao và bình luận sau khi hoàn tất chuyến.
- Thống kê doanh thu chủ xe: Báo cáo tổng doanh thu (Gross), hoa hồng nền tảng (5%), thu nhập thực nhận (95%) và bảng kê chi tiết từng chuyến xe hoàn tất.

### 2.1. Tầng Models & DTOs (`src/CarRental.Models/DTOs/Bookings`)
- [`ConfirmHandoverRequest.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/ConfirmHandoverRequest.cs): DTO xác nhận bàn giao (`Type = Pickup | Return`), chỉ số ODO (`Odometer`), mức nhiên liệu/pin (`FuelLevel`), ghi chú tình trạng xe (`Notes`), phương thức quyết toán phần còn lại (`RemainingPaymentMethod`).
- [`HandoverConfirmationDto.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/HandoverConfirmationDto.cs): Thông tin chi tiết các bên đã xác nhận biên bản bàn giao xe.
- [`CreateReviewRequest.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/CreateReviewRequest.cs): Gửi đánh giá chuyến đi (BookingId, Rating từ 1-5 sao, bình luận).
- [`ReviewDto.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/ReviewDto.cs): Trả về thông tin đánh giá, tên người đánh giá và đối tượng được đánh giá.
- [`OwnerRevenueSummaryDto.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/OwnerRevenueSummaryDto.cs) & `OwnerRevenueTripItemDto`: Tổng hợp doanh thu, hoa hồng, thu nhập ròng và bảng kê chuyến đi đã hoàn tất của chủ xe.
- [`BookingSummaryDto.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/BookingSummaryDto.cs) & [`BookingDetailDto.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/BookingDetailDto.cs): Bổ sung `RemainingAmount`, `HasPickupConfirmed`, `HasReturnConfirmed`, `HasReviewed`, danh sách `Handovers` và `Reviews`.

### 2.2. Tầng Dịch Vụ Nghiệp Vụ (`src/CarRental.Services/Bookings`)
- [`IBookingService.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Bookings/IBookingService.cs) & [`BookingService.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Bookings/BookingService.cs):
  - **`ConfirmPickupAsync`:** Xác thực quyền (Renter/Owner), kiểm tra trạng thái `Accepted`, ghi nhận bản ghi `HandoverConfirmation(Type = Pickup)`, chuyển trạng thái đơn sang `Ongoing`.
  - **`ConfirmReturnAsync`:** Xác thực quyền, kiểm tra không có tranh chấp mở (`Disputes`), ghi nhận `HandoverConfirmation(Type = Return)`. Khi chủ xe xác nhận thu xe và quyết toán tiền mặt 75% còn lại:
    - Chuyển trạng thái đơn sang `Completed`, cập nhật `CompletedAt`.
    - Tạo bản ghi thanh toán [`Payment`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/Entities/Payment.cs) ghi nhận 5% hoa hồng nền tảng (`CommissionAmount`) và 95% thu nhập ròng cho chủ xe.
    - Cập nhật trạng thái tiền cọc [`DepositHold`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/Entities/DepositHold.cs) sang `Converted` / `Refunded`.
  - **`SubmitReviewAsync`:** Xác thực chỉ cho phép đánh giá khi đơn `Completed`, ngăn chặn đánh giá trùng lặp (`BookingId`, `ReviewerId`), lưu `Review` vào cơ sở dữ liệu.
  - **`GetOwnerRevenueAsync`:** Thống kê tổng tiền cho thuê các chuyến đã hoàn tất, tính tổng phí hoa hồng 5% và thu nhập thực tế mà chủ xe nhận được.
  - Hỗ trợ lọc trạng thái chuyến đi linh hoạt (`current`, `ongoing`, `completed`, `history`, `past`).

### 2.3. Tầng Web API (`src/CarRental.Web/Controllers/BookingsController.cs`)
- `POST /api/bookings/{id}/pickup`: `[Authorize]` Xác nhận nhận xe đầu chuyến $\rightarrow$ Chuyển trạng thái sang `Ongoing`.
- `POST /api/bookings/{id}/return`: `[Authorize]` Xác nhận trả xe cuối chuyến $\rightarrow$ Chuyển trạng thái sang `Completed` và ghi nhận doanh thu.
- `POST /api/bookings/{id}/review`: `[Authorize]` Gửi đánh giá 1-5 sao và phản hồi sau chuyến đi.
- `GET /api/bookings/owner-revenue`: `[Authorize]` Lấy thống kê tổng doanh thu, hoa hồng, thu nhập ròng và bảng kê các chuyến hoàn tất của chủ xe.

### 2.3.1. Cập Nhật Nhãn Ô Đăng Nhập
- Đổi nhãn (`label`) và văn bản gợi ý (`placeholder`) của trường đăng nhập từ `"Tên hoặc số điện thoại"` thành **`"Username hoặc số điện thoại"`** trên tất cả các view và modal liên quan (`_Modals.cshtml`, `Find.cshtml`, v.v.).

### 2.3.3. Sửa Lỗi Layout Trang Đăng Ký Xe (`/carregistermode`)
- **Nguyên nhân lỗi:** File [`CarRegisterMode.cshtml`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/CarRegisterMode.cshtml) bị thiếu thẻ mở `<main class="owner-register-main">` và `<section class="owner-intro">`, dẫn đến CSS Grid 2 cột (`grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.95fr)`) không được kích hoạt, khiến card đăng ký bị rớt xuống dưới bên trái và nửa phải màn hình bị trống. Ngoài ra còn tồn tại một block `<footer>` trùng lặp với `_Layout.cshtml`.
- **Khắc phục:**
  - Bổ sung đầy đủ thẻ mở `<main class="owner-register-main">` và `<section class="owner-intro">`.
  - Cập nhật liên kết nút quay lại thành `href="/become-owner"`.
  - Loại bỏ block footer trùng lặp.
  - Sau khi sửa, bố cục 2 cột (cột trái: quy trình 4 bước, cột phải: thẻ đăng ký kèm minh họa) hiển thị cân đối ở giữa màn hình.

### 2.3.2. Phân Quyền Hiển Thị Theo Role (Owner vs Renter)
- **Role Owner:** Đổi liên kết điều hướng từ "Trở thành chủ xe" thành **"Quản lý xe"** (tại Header Navigation `_Layout.cshtml`, Sidebar `Account.cshtml`, `MyTrips.cshtml` và `BecomeOwner.cshtml`). Hiển thị toàn bộ các mục: Danh sách xe, Lịch xe, Doanh thu, Hợp đồng, Cẩm nang, Chính sách.
- **Role Renter (Người không phải chủ xe):**
  - Giữ nguyên tên "Trở thành chủ xe".
  - Ẩn hoàn toàn các phân hệ nội bộ của chủ xe: Danh sách xe, Lịch xe, Doanh thu cho thuê, Hợp đồng.
  - Chỉ hiển thị: **Cẩm nang cho thuê xe** (kèm banner đăng ký xe), **Chính sách bảo vệ dữ liệu** và nút **Đăng ký chủ xe** trên sidebar.
  - Ngăn chặn truy cập trực tiếp bằng URL hash của các mục chủ xe, tự động điều hướng về `#cam-nang`.


### 2.3.4. Đồng Bộ Nút Đăng Ký Chủ Xe Theo Thiết Kế Chuẩn (`carregistermode`)
- **Vấn đề:** Nút đăng ký chủ xe trên trang `/become-owner#cam-nang` (tại sidebar và trong banner cẩm nang dành cho người chưa phải chủ xe) sử dụng màu vàng mù tạt (`#c49a49`) lệch với design system.
- **Khắc phục:**
  - Định nghĩa lớp styling `.register-cta` trong [`become-owner.css`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/css/become-owner.css) theo đúng chuẩn nút bấm màu đen bo tròn (pill shape: `#212529`, hover `#111827`, `border-radius: 22px`, chữ trắng `font-weight: 700`, đổ bóng mềm).
  - Cập nhật văn bản nút bấm thành **"Đăng ký xe tự lái"** đồng nhất với trang `/carregistermode`.
  - Cả nút bấm trên sidebar và nút trong banner cẩm nang đều trỏ đến route `/carregistermode`.

### 2.4. Tích Hợp Giao Diện Người Dùng (Frontend Integration)
1. **Trang Chuyến của tôi (`/account#trips`, `mytrips.js`, `account.js`):**
   - Đơn `Accepted`: Hiển thị nút **"Bàn giao / Nhận xe"** $\rightarrow$ gọi API nhận xe, chuyển trạng thái sang `Ongoing`.
   - Đơn `Ongoing`: Hiển thị badge **"Đang trong chuyến"** và nút **"Xác nhận trả xe"** $\rightarrow$ gọi API trả xe.
   - Đơn `Completed`: Hiển thị badge **"Hoàn tất"**. Nếu chưa đánh giá $\rightarrow$ hiển thị nút **"Đánh giá chuyến đi"** (nhập số sao 1-5 và nhận xét); nếu đã đánh giá $\rightarrow$ hiển thị badge **"Đã gửi đánh giá"**.
   - Đơn `Pending` & `Accepted`: Tiếp tục cho phép hủy chuyến với hoàn cọc trực tuyến tự động.
2. **Trang Quản lý chủ xe (`/become-owner`, `BecomeOwner.cshtml`, `become-owner.js`):**
   - Yêu cầu `Accepted`: Hiển thị nút **"Bàn giao xe cho khách"**.
   - Yêu cầu `Ongoing`: Hiển thị nút **"Nhận lại xe & Hoàn tất chuyến"** (thông báo số tiền 75% còn lại cần quyết toán).
   - Yêu cầu `Completed`: Hiển thị nút **"Đánh giá khách thuê"** (1-5 sao) hoặc badge **"Đã gửi đánh giá"**.
   - Bổ sung mục sidebar mới **"Doanh thu cho thuê"** (`#doanh-thu`):
     - Thống kê 4 khối chỉ số: Tổng doanh thu (Gross), Phí sàn (5%), Thu nhập thực nhận (95%), Số chuyến hoàn tất.
     - Bảng kê chi tiết từng chuyến xe hoàn tất (Mã đơn, Xe thuê, Khách thuê, Thời gian, Tổng giá thuê, Phí sàn, Chủ xe nhận).

---

## 3. Kiểm Thử & Biên Dịch (Verification)
- Biên dịch toàn bộ Solution: `dotnet build PBL3\CarRentalMarketplace.slnx`
  - Kết quả: **0 Warning(s), 0 Error(s)**.
- Git Branch: `feature/car-rental-lifecycle`.
  - Đã commit toàn bộ 14 file thay đổi (`1cc3dc2`).

---

## 4. Lộ Trình Triển Khai Kế Tiếp (Roadmap & Next Steps)

```
[1. Auth Services] (Hoàn tất 100%)
       │
       ▼
[2. Vehicle Catalog & Search Service] (Hoàn tất 100%)
       │
       ▼
[3. Booking & Rental Management Service] (Hoàn tất 100%)
       │
       ▼
[4. Handover & Full Rental Lifecycle] (Hoàn tất 100% Core MVP)
       │
       ▼
[5. Admin & Staff Account Management] (Hoàn tất 100% - Branch: feature/admin-account-management)
       │
       ▼
[6. Admin Approvals: Owner Profiles & Vehicle Listings] ◄─── (ƯU TIÊN TIẾP THEO)
       │
       ▼
[7. Admin Financial Settlement, Fees & Disputes]
```


---

## 5. Chi Tiết Phiên Làm Việc (Session 6: Admin & Staff Account Management)

Đã hoàn thành phân hệ Quản lý tài khoản người dùng dành cho Admin và Staff theo đúng đặc tả ca sử dụng `UC-AS-03`, `UC-AS-07`, `UC-AS-09`:

### 5.1. Mô Hình Dữ Liệu & Hằng Số (`CarRental.Models`)
- Bổ sung vai trò `RoleNames.Staff = "Staff"` và `RoleNames.AdminOrStaff = "Admin,Staff"`.
- Bổ sung thư mục DTOs [`src/CarRental.Models/DTOs/Admin/`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Admin/):
  - `AdminUserListItemDto`: Thông tin người dùng tóm tắt, vai trò chính, trạng thái xác minh GPLX/CCCD, chế tài đang áp dụng, số chuyến thuê, số xe sở hữu.
  - `AdminUserDetailDto`: Chi tiết đầy đủ thông tin định danh, tài khoản ngân hàng, lịch sử chế tài (`Sanctions`), 5 chuyến xe gần nhất và danh sách xe sở hữu.
  - `AdminUserFilterDto`: Tham số tìm kiếm đa năng (Query theo tên/username/email/SĐT, Tab trạng thái, Phân quyền vai trò, Phân trang).
  - `AdminUserMetricsDto`: 4 chỉ số thống kê (Tổng người dùng, Đang hoạt động, Chủ xe, Đang bị tạm khóa/chế tài).
  - `SanctionUserRequest`: Tham số áp dụng chế tài (`SanctionType`: `Suspend7d`, `Suspend30d`, `Ban`; `Reason`).
  - `LiftSanctionRequest`: Tham số gỡ bỏ chế tài / mở khóa tài khoản.
  - `ResetPasswordByAdminRequest`: Tham số đặt lại mật khẩu người dùng bởi quản trị viên.
  - `UpdateUserRolesRequest`: Phân quyền vai trò người dùng (Renter, Owner, Staff, Admin).

### 5.2. Tầng Nghiệp Vụ (`CarRental.Services.Admin`)
- Xây dựng [`IAdminUserService`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Admin/IAdminUserService.cs) và [`AdminUserService`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Admin/AdminUserService.cs):
  - `GetUserMetricsAsync()`: Tính toán chính xác 4 chỉ số tổng quan từ cơ sở dữ liệu.
  - `GetUsersAsync(filter)`: Lấy danh sách người dùng kèm batch-loading liên kết quan hệ (GPLX, OwnerProfile, Sanction, thống kê chuyến, thống kê xe) tối ưu hiệu năng.
  - `GetUserByIdAsync(id)`: Lấy chi tiết tài khoản cùng lịch sử chế tài có tên người thực hiện và người gỡ bỏ.
  - `SanctionUserAsync()`: Kiểm tra quyền chặt chẽ theo quy định:
    - Ngăn chặn tự khóa tài khoản của chính mình (`Conflict`).
    - **Staff không được phép khóa tài khoản của Staff khác hoặc Admin** (`Forbidden - 403`).
    - Tính toán thời hạn hết hạn (`Suspend7d` $
ightarrow$ +7 ngày, `Suspend30d` $
ightarrow$ +30 ngày, `Ban` $
ightarrow$ vĩnh viễn).
    - Tạo bản ghi `AccountSanction` và đồng bộ khóa đăng nhập ASP.NET Core Identity (`SetLockoutEndDateAsync`).
  - `LiftSanctionAsync()`: Đánh dấu `LiftedAt` và `LiftedBy`, gỡ bỏ `LockoutEndDate` cho phép người dùng hoạt động bình thường ngay lập tức.
  - `ResetUserPasswordAsync()`: Đặt lại mật khẩu người dùng an toàn qua `UserManager.ResetPasswordAsync`.
  - `UpdateUserRolesAsync()`: Chỉ dành riêng cho Admin; bảo vệ tài khoản Admin cuối cùng không bị gỡ vai trò.
- Cập nhật [`AuthService.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Auth/AuthService.cs): Kiểm tra `s.LiftedAt == null` khi truy vấn chế tài kích hoạt, đảm bảo tài khoản sau khi mở khóa có thể đăng nhập ngay.

### 5.3. Tầng Điều Khiển API (`CarRental.Web.Controllers`)
- Xây dựng [`AdminUsersController`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Controllers/AdminUsersController.cs) với tiền tố route `api/admin/users`:
  - `[Authorize(Roles = RoleNames.AdminOrStaff)]`: Bảo vệ toàn bộ endpoint, chỉ Admin hoặc Staff mới có quyền truy cập.
  - `GET api/admin/users/metrics`: Lấy số liệu thống kê.
  - `GET api/admin/users`: Lấy danh sách, tìm kiếm và lọc người dùng.
  - `GET api/admin/users/{id}`: Xem chi tiết người dùng.
  - `POST api/admin/users/{id}/sanction`: Khóa tài khoản / áp dụng chế tài.
  - `POST api/admin/users/{id}/lift-sanction`: Mở khóa tài khoản.
  - `POST api/admin/users/{id}/reset-password`: Đặt lại mật khẩu.
  - `PUT api/admin/users/{id}/roles`: `[Authorize(Roles = RoleNames.Admin)]` Cập nhật vai trò.

### 5.4. Bảo Vệ Thư Mục Quản Trị & Tích Hợp Frontend
- **Bảo vệ toàn diện thư mục `/admin`:**
  - Bổ sung Middleware trong [`Program.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Program.cs): Bắt mọi truy cập đến `/admin` và `/admin/*.html`. Nếu chưa đăng nhập $
ightarrow$ chuyển hướng về trang đăng nhập; nếu không có vai trò `Admin` hoặc `Staff` $
ightarrow$ chặn và điều hướng về trang chủ.
- **Tích hợp giao diện quản trị:**
  - Xây dựng script tương tác [`admin-users.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/admin/js/admin-users.js) kết nối trực tiếp các API backend vào [`users.html`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/admin/users.html):
    - Tự động hiển thị tên và vai trò quản trị viên trên header.
    - Hiển thị danh sách người dùng với phân trang, tìm kiếm tức thì theo từ khóa, lọc theo tab trạng thái.
    - Panel chi tiết "Tài khoản đang xem" hiển thị thông tin hồ sơ, hoạt động, thông tin chế tài nếu có.
    - Hộp thoại Dialog Modal trực quan cho các thao tác: Khóa tài khoản (chọn 7 ngày / 30 ngày / vĩnh viễn kèm lý do), Mở khóa tài khoản, Đặt lại mật khẩu, Phân quyền vai trò.
  - Đồng bộ nút bấm **"Quản trị"** tại Header điều hướng chính [`_Layout.cshtml`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Shared/_Layout.cshtml) và [`azu-store.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/azu-store.js) tự động hiển thị cho người dùng có vai trò `Admin` hoặc `Staff`.

---

## 6. Kiểm Thử & Biên Dịch (Verification)
- Biên dịch toàn bộ Solution: `dotnet build PBL3\CarRentalMarketplace.slnx`
  - Kết quả: **0 Warning(s), 0 Error(s)**.
- Git Branch: `feature/admin-account-management`.


---

## 7. Đồng Bộ Thông Số Thực Tế Quản Trị & Điều Hướng Trực Tiếp Admin

### 7.1. Đồng bộ số liệu thực tế từ Database vào Trung tâm Quản trị
- **Mở rộng Metrics Service & DTO:**
  - [`AdminUserMetricsDto.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Admin/AdminUserMetricsDto.cs): Bổ sung các chỉ số vận hành: `PendingOwnerCount`, `PendingListingCount`, `OpenDisputeCount`, `CompletedTripsCount`, `TotalGmv`, `PlatformRevenue`.
  - [`AdminUserService.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Admin/AdminUserService.cs): Tính toán chính xác từ CSDL qua EF Core:
    - Tổng số người dùng (`Users.CountAsync`).
    - Số tài khoản đang bị hạn chế/chế tài còn hiệu lực (`AccountSanctions`).
    - Số chủ xe đã duyệt (`OwnerProfiles`).
    - Số hồ sơ chủ xe đang chờ duyệt (`PendingOwnerCount`).
    - Số tin đăng xe chờ kiểm duyệt (`PendingListingCount`).
    - Số tranh chấp đang mở (`OpenDisputeCount`).
    - Số chuyến đi hoàn tất, Tổng giá trị giao dịch (GMV), và Doanh thu nền tảng (`Bookings.Where(Completed)`).
- **Đồng bộ giao diện Quản lý người dùng (`/admin/users.html`):**
  - Khắc phục triệt để lỗi selector DOM trong [`admin-users.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/admin/js/admin-users.js): cập nhật thẻ `.admin-metrics .admin-metric strong` và `small`.
  - Đồng bộ số liệu động trên cả 4 thẻ thống kê: Tổng tài khoản, Đang hoạt động (% tổng), Chủ xe đã duyệt, Tài khoản bị hạn chế.
  - Tự động cập nhật thanh thông báo (`.admin-notice`), tiêu đề danh sách và số lượng trên toàn bộ các tab bộ lọc (`Tất cả (N)`, `Đang hoạt động (N)`, `Hạn chế (N)`, `Chờ duyệt (N)`).
  - Tự động cập nhật huy hiệu số lượng chờ xử lý trên Sidebar (`owners`, `listings`, `disputes`).
- **Đồng bộ giao diện Tổng quan hệ thống (`/admin/index.html`):**
  - Xây dựng `syncAdminLayoutData` trong [`layout.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/admin/js/layout.js):
    - Đồng bộ 4 thẻ thống kê đầu trang: Tổng GMV (VNĐ), Doanh thu nền tảng (VNĐ), Chuyến đi hoàn tất, Số tài khoản người dùng.
    - Đồng bộ nhãn công việc cần xử lý và danh sách việc ưu tiên (Hồ sơ chủ xe, Tin đăng, Tranh chấp).
    - Cập nhật avatar ký tự đầu, họ tên và vai trò (`Quản trị viên` / `Nhân viên`) của tài khoản đang đăng nhập.

### 7.2. Điều hướng trực tiếp khi Admin đăng nhập & Tự động chuyển hướng
- **Không qua trang chủ khi đăng nhập:**
  - Cập nhật [`index.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/index.js) và [`azu-store.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/azu-store.js): Khi người dùng có vai trò `Admin` hoặc `Staff` đăng nhập thành công, hệ thống lập tức chuyển hướng trực tiếp tới `/admin/users.html`, không bao giờ điều hướng về trang chủ `/`.
- **Chặn truy cập trang chủ cho tài khoản quản trị:**
  - Cập nhật [`HomeController.cs`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Controllers/HomeController.cs): Action `Index()` kiểm tra nếu người dùng đã đăng nhập có vai trò `Admin` hoặc `Staff`, máy chủ tự động trả về `Redirect("/admin/users.html")`.
  - Đồng bộ kiểm tra phía client trong `checkAuth()` để ngăn mọi trường hợp flash giao diện người dùng phổ thông.

### 7.3. Xóa hoàn toàn nút Quản trị trên Header trang chủ
- Gỡ bỏ hoàn toàn phần tử `#admin-nav-link` khỏi [`_Layout.cshtml`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Shared/_Layout.cshtml).
- Loại bỏ mã xử lý hiển thị nút quản trị trong [`azu-store.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/azu-store.js) và [`src/A2U-Frontend/JS/azu-store.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/A2U-Frontend/JS/azu-store.js).

### 7.4. Kết quả Kiểm thử & Biên dịch
- `dotnet build PBL3\CarRentalMarketplace.slnx`: **0 Warning(s), 0 Error(s)**.
- Kiểm thử tích hợp tự động qua script Python:
  - Trang chủ hoàn toàn không còn nút hoặc liên kết quản trị.
  - Đăng nhập tài khoản `admin1` (`Test@12345`) thành công nhận vai trò `Admin`.
  - Truy cập route `/` với cookie Admin trả về HTTP 302 Redirect thẳng đến `/admin/users.html`.
  - API `GET /api/admin/users/metrics` trả về số liệu thực tế khớp 100% với dữ liệu CSDL.
