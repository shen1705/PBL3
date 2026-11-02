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
[5. Admin Portal Authorization & Management APIs] ◄─── (ƯU TIÊN TIẾP THEO)
       │
       ▼
[6. Real-time Notifications & Chatbot Integration]
```

### Hướng Triển Khai Ưu Tiên Tiếp Theo: Admin Portal Authorization & Management APIs
1. **Bảo vệ thư mục Quản trị:** Cấu hình Middleware/Endpoint routing để chặn truy cập trái phép vào `/admin/*` đối với người dùng không có role `Admin`.
2. **Quản lý danh mục & phê duyệt:**
   - API phê duyệt / từ chối hồ sơ đăng ký chủ xe và xe cho thuê.
   - API xem lịch sử giao dịch toàn hệ thống và tổng doanh thu phí sàn (5%).
   - API quản lý chế tài vi phạm tài khoản (`AccountSanction`).
