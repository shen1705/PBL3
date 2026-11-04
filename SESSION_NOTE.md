# Báo Cáo Phiên Làm Việc (Session Note) & Kế Hoạch Tiếp Theo

> **Dự án:** Car Rental Marketplace (.NET 10 - Kiến trúc 3 tầng: Web / Services / Data / Models)  
> **Thư mục dự án:** `C:/Users/admin/documents/PBL3/PBL3`  
> **Tài liệu đặc tả liên quan:** [PFIEV-PBL-DuAnCNPM.pdf](file:///C:/Users/admin/documents/PBL3/PFIEV-PBL-DuAnCNPM.pdf)  
> **Nhánh Git hiện tại:** `feature/admin-account-management`  
> **Thời gian cập nhật:** 04/11/2026 (Phiên làm việc 7)  

---

## 1. Tóm Tắt Các Phiên Trước
- **Session 1 (Auth Services):** Hệ thống xác thực ASP.NET Core Identity, DTOs, kiểm tra chế tài vi phạm `AccountSanctions`, Cookie Auth, sửa seed data số điện thoại duy nhất. Nhánh `feature/auth-services` đã merge vào `develop`.
- **Session 2 (Vehicle Catalog & Search):** Tầng backend danh mục xe MySQL, `VehicleService`, `VehiclesController`, bộ lọc nâng cao trên `/find`, panel kép `/become-owner`, tái cấu trúc route `/account`. Nhánh `feature/account-and-vehicles` đã merge vào `develop`.
- **Session 3 (Booking & Rental Management Service):** Phân hệ đặt xe cốt lõi, tính cọc 25%, kiểm soát lịch trống, giữ cọc `DepositHold`, duyệt/từ chối/hủy chuyến. Nhánh `feature/booking-service` đã merge vào `develop`.
- **Session 4 (UI & Auth Field Separation):** Đồng bộ nút tìm xe (`.nav-find-car-btn`) theo màu Hero Banner (`#212529`); phân tách độc lập `UserName` (chỉ dùng đăng nhập) và `FullName` (hiển thị toàn hệ thống). Nhánh `feature/register-fullname-and-ui` đã merge vào `develop`.
- **Session 5 (End-to-End Car Rental Lifecycle):** Hoàn tất vòng đời thuê xe: `Accepted` -> `Ongoing` (Nhận xe / Pickup Handover) -> `Completed` (Trả xe / Return Handover, thanh toán 75% còn lại, trích 5% hoa hồng sàn AZU Car và ghi nhận 95% thu nhập ròng cho chủ xe, chuyển cọc `DepositHold`). Đánh giá 2 chiều (1 - 5 sao), báo cáo doanh thu chủ xe. Nhánh `feature/car-rental-lifecycle`.
- **Session 6 (Admin & Staff Account Management):** Quản lý tài khoản người dùng (`/admin/users.html`), chế tài vi phạm (`Suspend7d`, `Suspend30d`, `Ban`), mở khóa, phân quyền vai trò. Đồng bộ số liệu thực tế từ Database vào Dashboard Quản trị và điều hướng trực tiếp Admin/Staff khi đăng nhập. Nhánh `feature/admin-account-management`.

---

## 2. Chi Tiết Phiên Làm Việc (Session 7: Sửa Lỗi Danh Sách Xe Của Chủ Xe & Hiển Thị Quyền Sở Hữu Trong Bài Đăng)

Phiên làm việc này tập trung phát hiện nguyên nhân gốc rễ và xử lý triệt để hai vấn đề: danh sách xe tại mục Quản lý xe của Owner không hiển thị xe của họ, và trong bài đăng xe không hiển thị thông tin chủ sở hữu thực tế mà chỉ hiện theo UI tĩnh mặc định có sẵn.

### 2.1. Nguyên Nhân Gốc Rễ Gây Lỗi (Root Cause Analysis - RCA)

1. **Lỗi 1 - Danh sách xe tại mục Quản lý xe của Owner không hiển thị xe của họ:**
   - **Vị trí file:** [`src/CarRental.Web/wwwroot/js/become-owner.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/become-owner.js)
   - **Lý do lỗi:** Hàm `renderOwnerCars()` gọi `window.AzuStore.getOwnerCars()`. Hàm này chỉ đọc mảng `azuCarOwnerCars` từ `localStorage` của trình duyệt vốn bị rỗng. Hệ thống **hoàn toàn không gọi API backend** `GET /api/vehicles/my-cars` (trong khi cơ sở dữ liệu MySQL đã có sẵn xe của các tài khoản `owner1`, `owner2`, `owner3`).
   - Thêm vào đó, hàm render cũ chỉ tạo khung xe dạng placeholder với icon tĩnh `<i class="fa-solid fa-car-side"></i>`, không hiển thị ảnh bìa thật (`coverImageUrl`), không có biển số, giá thuê, địa chỉ, lượt đi hay trạng thái kiểm duyệt.

2. **Lỗi 2 - Bài đăng xe không hiển thị chủ sở hữu thực tế, chỉ hiện mặc định theo UI tĩnh có sẵn:**
   - **Vị trí file:** [`src/CarRental.Web/Views/Home/Find.cshtml`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/Find.cshtml) & [`src/CarRental.Web/wwwroot/js/find.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/find.js)
   - **Lý do lỗi:**
     - Trong modal chi tiết xe (`#carDetailModal`), block thông tin chủ xe bị fix cứng (hardcoded: avatar ảnh Unsplash tĩnh, tên chủ xe "Linh", đánh giá 5.0 • 24 chuyến).
     - Trong `find.js`, hàm `createCarCardFromApi` không lưu `ownerId` hay `ownerName` vào dataset của thẻ xe.
     - Hàm `openCarPopup` dù gọi `GET /api/vehicles/{id}` lấy được `VehicleDetailDto` nhưng không gán `d.ownerName`, `d.rating`, `d.totalTrips`, `d.location`, `d.description` vào DOM.
     - Không có cơ chế đối chiếu quyền sở hữu giữa tài khoản đang đăng nhập (`sessionStorage.getItem('azuCarUserId')`) và `car.ownerId`, khiến chủ xe khi xem bài đăng của chính mình vẫn thấy UI khách thuê bình thường và nút "CHỌN THUÊ" vẫn cho phép tự đặt xe của chính mình.

3. **Lỗi 3 - Quy trình đăng ký xe mới không lưu vào cơ sở dữ liệu:**
   - **Vị trí file:** [`src/CarRental.Web/wwwroot/js/carregistermode.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/carregistermode.js)
   - **Lý do lỗi:** Sự kiện submit Bước 2 (`btnSubmitReg`) chỉ gọi `window.AzuStore.addOwnerCar(...)` để ghi vào `localStorage`, không hề gửi request `POST /api/vehicles` đến máy chủ. Kết quả là xe đăng ký mới không được tạo trong bảng `vehicles` và `vehicle_listings`, không gắn `OwnerId` của user và biến mất khi làm mới trang.

---

### 2.2. Giải Pháp Khắc Phục Chi Tiết (Fix Implementation)

1. **Khắc phục mục Quản lý xe của Owner ([`become-owner.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/become-owner.js)):**
   - Xây dựng hàm bất đồng bộ `loadOwnerCars()`: Gửi request `GET /api/vehicles/my-cars` để lấy toàn bộ danh sách xe thực tế của chủ xe từ database.
   - Nâng cấp toàn diện hàm `renderOwnerCars()`:
     - Hiển thị ảnh bìa xe thực tế (`coverImageUrl`) kèm fallback nếu chưa có ảnh.
     - Hiển thị tên xe, huy hiệu biển số xe chuẩn hóa (`plateBadge`), thông số vận hành (số chỗ, hộp số, nhiên liệu, giá thuê/ngày) và địa điểm quận/thành phố.
     - Tích hợp huy hiệu trạng thái chuẩn nhận diện màu: `Đang hoạt động` (xanh lá), `Chờ duyệt` (vàng cam), `Bị từ chối` (đỏ), `Tạm ẩn` (xám).
     - Bổ sung 2 nút điều hướng trực tiếp: **"Xem bài đăng"** (trỏ tới `/find?vehicleId={id}`) và **"Lịch xe"** (chuyển sang tab `#lich-xe`).
   - Lọc trạng thái xe theo bộ lọc dropdown: `all`, `approved`, `pending`, `rejected`, `inactive` map chuẩn xác với `status` và `moderationStatus` của backend.
   - Kích hoạt gọi `loadOwnerCars()` khi tải trang, khi chuyển sang tab `#danh-sach-xe`, và khi có sự kiện `azu:auth-changed`.

2. **Khắc phục quyền sở hữu & thông tin chủ xe trong Bài đăng xe ([`Find.cshtml`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/Find.cshtml) & [`find.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/find.js)):**
   - **Trên danh sách bài đăng (`/find`):** Bổ sung `ownerId` và `ownerName` vào dataset từng card (`createCarCardFromApi`). Tự động kiểm tra nếu `currentUserId === car.ownerId`, gắn ngay huy hiệu **"Xe của bạn"** trên góc ảnh xe.
   - **Trong popup chi tiết bài đăng (`#carDetailModal`):**
     - Đổi avatar tĩnh thành avatar động hiển thị ký tự viết hoa đầu tiên của tên chủ xe (`popupOwnerAvatarText`).
     - Render đúng tên chủ xe thực tế (`popupOwnerName`), đánh giá thực tế và tổng số chuyến hoàn tất (`popupOwnerRating`).
     - Render đúng mô tả xe (`popupCarDescription`) và địa điểm nhận xe (`bookHostLocation`, `popupCarSpecificLoc`).
     - **Cơ chế Ownership:** Nếu `isMyCar == true`:
       - Hiển thị huy hiệu `Xe của bạn` (`#popupOwnerSelfBadge`).
       - Ẩn nút "CHỌN THUÊ", thay thế bằng nút **"Quản lý xe của bạn"** (`#btnOwnerManageCar`), dẫn thẳng về `/become-owner#danh-sach-xe-content`.
   - **Tự động mở bài đăng từ quản lý xe:** Bổ sung logic lắng nghe `searchParams.get('vehicleId')` khi vào trang `/find`, tự động kích hoạt popup chi tiết đúng bài đăng xe mà chủ xe vừa bấm xem.

3. **Khắc phục quy trình đăng ký xe mới ([`carregistermode.js`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/carregistermode.js)):**
   - Bổ sung kiểm tra đăng nhập trước khi cho phép gửi hồ sơ (`window.AzuStore.isLoggedIn()`).
   - Chuyển đổi toàn bộ dữ liệu form sang DTO `CreateVehicleRequest` và gửi `POST /api/vehicles` bằng `fetch()` bất đồng bộ.
   - Tự động bổ sung vai trò `Owner` vào `sessionStorage` sau khi đăng ký thành công để mở khóa ngay toàn bộ menu Quản lý xe.
   - Điền thông tin tóm tắt hồ sơ thực tế và chuyển sang Bước 3 hiển thị trạng thái `Chờ duyệt (Pending)`.

---

### 2.3. Kết Quả Xác Minh Thực Tế (Verification)

- **Biên dịch Solution:** `dotnet build PBL3\CarRentalMarketplace.slnx` -> **0 Warning(s), 0 Error(s)**.
- **Xác thực API & Dữ liệu:**
  - Tài khoản `owner1` (Phạm Quốc Dũng): `GET /api/vehicles/my-cars` trả về **6 xe** (Mazda CX-5 vừa đăng ký, Toyota Vios 2023, Mitsubishi Xpander, Toyota Corolla Cross, Hyundai Accent, Toyota Vios 2022).
  - Tài khoản `owner2` (Hoàng Thị Em): `GET /api/vehicles/my-cars` trả về **5 xe** (Mazda CX-30, Honda City, VinFast VF e34, VinFast VF 8, Mazda CX-5).
- **Giao diện bài đăng & quyền sở hữu:**
  - Không còn bất kỳ thông tin tĩnh nào của "Chủ xe Linh".
  - Thẻ xe và popup bài đăng hiển thị đúng chủ xe thực tế.
  - Khi chủ xe xem bài đăng xe của mình, hệ thống hiển thị huy hiệu `Xe của bạn` và nút `Quản lý xe của bạn`, không cho phép tự đặt xe.

---

## 3. Lộ Trình Triển Khai Kế Tiếp (Roadmap & Next Steps)

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
[6. Owner Vehicle Synchronization & Ownership Display] (Hoàn tất 100% - Session 7)
       │
       ▼
[7. Admin Approvals: Owner Profiles & Vehicle Listings] ◄─── (ƯU TIÊN TIẾP THEO)
       │
       ▼
[8. Admin Financial Settlement, Fees & Disputes]
```
