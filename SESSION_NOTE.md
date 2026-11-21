# Báo Cáo Phiên Làm Việc (Session Note) & Kế Hoạch Tiếp Theo

> **Dự án:** Car Rental Marketplace (.NET 10 - Kiến trúc 3 tầng: Web / Services / Data / Models)  
> **Thư mục dự án:** `C:/Users/admin/documents/PBL3/PBL3`  
> **Tài liệu đặc tả liên quan:** [PFIEV-PBL-DuAnCNPM.pdf](file:///C:/Users/admin/documents/PBL3/PFIEV-PBL-DuAnCNPM.pdf)  
> **Nhánh Git hiện tại:** `develop`  
> **Thời gian cập nhật:** 21/11/2026 (Phiên làm việc 8)  

---

## 1. Tóm Tắt Các Phiên Trước
- **Session 1 (Auth Services):** Hệ thống xác thực ASP.NET Core Identity, DTOs, kiểm tra chế tài vi phạm `AccountSanctions`, Cookie Auth, sửa seed data số điện thoại duy nhất. Nhánh `feature/auth-services` đã merge vào `develop`.
- **Session 2 (Vehicle Catalog & Search):** Tầng backend danh mục xe MySQL, `VehicleService`, `VehiclesController`, bộ lọc nâng cao trên `/find`, panel kép `/become-owner`, tái cấu trúc route `/account`. Nhánh `feature/account-and-vehicles` đã merge vào `develop`.
- **Session 3 (Booking & Rental Management Service):** Phân hệ đặt xe cốt lõi, tính cọc 25%, kiểm soát lịch trống, giữ cọc `DepositHold`, duyệt/từ chối/hủy chuyến. Nhánh `feature/booking-service` đã merge vào `develop`.
- **Session 4 (UI & Auth Field Separation):** Đồng bộ nút tìm xe (`.nav-find-car-btn`) theo màu Hero Banner (`#212529`); phân tách độc lập `UserName` (chỉ dùng đăng nhập) và `FullName` (hiển thị toàn hệ thống). Nhánh `feature/register-fullname-and-ui` đã merge vào `develop`.
- **Session 5 (End-to-End Car Rental Lifecycle):** Hoàn tất vòng đời thuê xe: `Accepted` -> `Ongoing` (Nhận xe / Pickup Handover) -> `Completed` (Trả xe / Return Handover, thanh toán 75% còn lại, trích 5% hoa hồng sàn AZU Car và ghi nhận 95% thu nhập ròng cho chủ xe, chuyển cọc `DepositHold`). Đánh giá 2 chiều (1 - 5 sao), báo cáo doanh thu chủ xe. Nhánh `feature/car-rental-lifecycle`.
- **Session 6 (Admin & Staff Account Management):** Quản lý tài khoản người dùng (`/admin/users.html`), chế tài vi phạm (`Suspend7d`, `Suspend30d`, `Ban`), mở khóa, phân quyền vai trò. Đồng bộ số liệu thực tế từ Database vào Dashboard Quản trị và điều hướng trực tiếp Admin/Staff khi đăng nhập. Nhánh `feature/admin-account-management`.
- **Session 7 (Owner Vehicle Synchronization & Ownership Display):** Sửa lỗi danh sách xe của chủ xe (`/api/vehicles/my-cars`), gắn huy hiệu `Xe của bạn` và phân quyền quản lý xe khi xem bài đăng của chính mình, hoàn thiện quy trình đăng ký xe mới gửi `POST /api/vehicles`.
- **Session 8 (HCI Refactoring & Mioto-Style UI/UX Enhancements):** Tinh giản bộ lọc `/find`, chuyển đổi đăng ký xe thành In-Page Wizard, đồng bộ vai trò "Lịch sử thuê", tái thiết kế thẻ xe Mioto-style, hover tim trắng-xanh, làm sạch giao diện Admin và bổ sung hồ sơ pháp lý (cà vẹt, đăng kiểm, bảo hiểm) trong modal duyệt xe. Commit `9a7deb4`.

---

## 2. Chi Tiết Phiên Làm Việc (Session 9: Đồng Bộ 100% Dữ Liệu Bài Đăng & Xử Lý Triệt Để 4 Flaws Quy Trình)

Phiên làm việc này giải quyết các khiếm khuyết hệ thống về việc thiếu đồng bộ thông tin và bất đối xứng quy trình trong toàn bộ vòng đời thuê xe (Đăng ký $\rightarrow$ Duyệt $\rightarrow$ Đặt cọc $\rightarrow$ Bàn giao $\rightarrow$ Trả xe & Hủy chuyến):

### 2.1. Đồng bộ 100% Thông tin Đăng ký xe $\rightarrow$ Admin $\rightarrow$ Chi tiết bài đăng (`/find`)
1. **Mở rộng Wizard đăng ký xe (`CarRegisterMode.cshtml`, `carregistermode.js`, `carregistermode.css`):**
   - Bổ sung **Bước 3: Thiết lập Chính sách, Phụ phí & Tiện nghi** trước khi gửi hồ sơ:
     - **Tài sản thế chấp:** Miễn thế chấp / Xe máy kèm cà vẹt gốc hoặc Tiền mặt 15 triệu / Tiền mặt ký quỹ / Tùy chỉnh quy định riêng.
     - **Biểu phụ phí phát sinh:** Giới hạn quãng đường (km/ngày), Phí vượt giới hạn (đ/km), Phí quá giờ (đ/h), Phí vệ sinh xe bẩn (đ), Phí khử mùi hôi (đ).
     - **Tiện nghi xe:** Checkbox Bản đồ, Bluetooth, Camera lùi, Cam hành trình, Cảm biến va chạm, GPS, Ghế trẻ em, Khe cắm USB, Túi khí an toàn, Cửa sổ trời...
     - **Điều khoản riêng:** Textarea các quy định bắt buộc (Không hút thuốc, giữ vệ sinh, không chở hàng cấm...).
   - Đóng gói dữ liệu cấu hình vào metadata mô tả xe (`VehicleListing.Description`) và lưu trữ đồng bộ client-side.
2. **Nâng cấp Modal kiểm duyệt tin đăng Admin (`admin/app.js`):**
   - Modal `showDetail('listing', id)` giải mã đầy đủ khối metadata chính sách để Quản trị viên duyệt: Hiển thị rõ ràng Chính sách thế chấp, Bảng phụ phí đã thiết lập, Tiện nghi xe trang bị và Điều khoản riêng của chủ xe.
3. **Đồng bộ hóa Modal xem chi tiết xe (`find.js`):**
   - Hàm `loadCustomListingAttributes(vehicleId)` phân tích metadata từ bài đăng xe thực tế để hiển thị đúng biểu phí, điều khoản, thế chấp và danh mục tiện nghi của chiếc xe đó thay vì hiển thị dữ liệu mẫu mặc định.

### 2.2. Giải quyết triệt để 4 Systemic Flaws theo yêu cầu người dùng
1. **Flaw 1 (Bàn giao xe - Handover Confirmation):**
   - Xây dựng mô-đun độc lập `trip-handover-modal.js` và nhúng toàn cục qua `_Layout.cshtml`.
   - Thay thế hoàn toàn các hộp thoại `confirm()` sơ sài bằng Modal ký biên bản bàn giao điện tử chuyên nghiệp:
     - **Nhận xe (Pickup):** Nhập số Odometer khởi điểm, Mức nhiên liệu/Pin (100%, 7/8, 3/4...), Phương thức thanh toán 75% còn lại (tiền mặt / chuyển khoản), Ghi chú trầy xước/hiện trạng và Checkbox cam kết đồng kiểm.
     - **Trả xe (Return):** Nhập số Odometer kết thúc, Mức nhiên liệu/Pin lúc trả, Nhập bảng phụ phí phát sinh (quá km, trễ giờ, rửa xe, khử mùi), Ghi chú nghiệm thu và Checkbox cam kết hoàn tất.
   - Tích hợp đồng bộ trên `account.js`, `mytrips.js` và `become-owner.js`.
2. **Flaw 2 (Booking Wizard - Collateral Acknowledgment):**
   - Thêm thẻ cảnh báo nổi bật **Quy định tài sản thế chấp khi nhận xe** (`.booking-collateral-alert-card`) ngay trong form đặt xe trên `Find.cshtml` / `find.js`.
   - Hiển thị rõ ràng hình thức thế chấp của chiếc xe (Miễn thế chấp hoặc Xe máy/15 triệu tiền mặt) cùng hướng dẫn nhận lại tài sản khi trả xe, giải quyết triệt để bất ngờ/tranh chấp khi nhận xe.
3. **Flaw 3 (Driver License Guard Before Deposit):**
   - Thắt chặt kiểm tra tính hợp lệ và trạng thái duyệt của GPLX (`isDriverLicenseVerified` / `Approved`): Nếu chưa tải lên hoặc chưa được xác thực, hệ thống chặn mở mô phỏng thanh toán cọc 25% và hiển thị modal cảnh báo `gplxRequiredModal` dẫn đường trực tiếp về trang cập nhật GPLX.
4. **Flaw 4 (Cảnh báo phạt hủy chuyến 8% & Cơ chế chấp thuận Hợp đồng):**
   - **Cơ chế Checkbox Hợp đồng:** Checkbox `#checkAgreeContract` không cho phép tích chọn trực tiếp (`pointer-events: none`). Nhấp vào ô hoặc nhãn sẽ tự động mở Modal Hợp đồng thuê xe điện tử (`sampleContractModal`). Nút xác nhận "Tôi đồng ý & Ký kết" nằm bên trong modal; khi người dùng xác nhận trong modal thì checkbox mới được đánh dấu hợp lệ.
   - **Modal Cảnh báo Hủy chuyến (`openCancelBookingModal`):**
     - Đơn chờ duyệt: Thông báo hoàn cọc 100%.
     - Khách hủy đơn đã duyệt: Cảnh báo mất toàn bộ 25% tiền cọc bồi thường chi phí giữ lịch.
     - Chủ xe hủy đơn đã duyệt: Cảnh báo hoàn cọc 100% cho khách và **bị phạt 8% giá trị đơn thuê** theo quy chế sàn.
     - Lựa chọn lý do hủy có cấu trúc và nút xác nhận có màu cảnh báo nguy cơ tài chính.

---

## 3. Tổng Quan Lại Các Phiên Cũ (Session 8)

Phiên làm việc này tập trung tối ưu hóa trải nghiệm người dùng (UX) và giao diện người - máy (HCI) dựa trên tài liệu môn học (`DinhHuongGiaoDien.pdf` và cuốn *Designing Interfaces* của Jenifer Tidwell), đồng thời hoàn thiện thiết kế thẻ bài đăng xe tham chiếu chuẩn từ nền tảng Mioto.

### 2.1. Các Hạng Mục Đã Triển Khai

1. **Tối ưu hóa bộ lọc tìm kiếm trên trang `/find` (HCI: Mental Model & Simplicity):**
   - Loại bỏ lựa chọn trùng lặp về "Số chỗ ngồi" khỏi modal bộ lọc nâng cao (chỉ giữ lại ở thanh pill chọn nhanh).
   - Xóa bỏ tùy chọn "Đặt xe nhanh" (`#pillBtnInstant`, `#filterFeatureInstant`) do nghiệp vụ hệ thống PBL3 yêu cầu 100% đơn đặt phải qua chủ xe duyệt (quy tắc duyệt trong 24h), tránh gây hiểu lầm cho người dùng.
   - Loại bỏ nút quay lại (`.btn-back`) thừa trên thanh sub-header của `/find` để tối ưu không gian hiển thị bộ lọc địa điểm và thời gian.

2. **Chuyển đổi đăng ký xe thành In-Page Wizard (HCI: Sequence Map & Low Navigation Cost):**
   - Chuyển giao diện đăng ký xe trên `CarRegisterMode.cshtml` từ modal popup cố định thành giao diện Wizard tuần tự (4 bước) hiển thị trực tiếp trong dòng trang (`.wizard-inpage-mode`).
   - Cập nhật các nút kêu gọi hành động (CTA) trên trang `BecomeOwner.cshtml` liên kết thẳng tới `/carregistermode?start=true` để tự động mở ngay bước 1 của Wizard.

3. **Chuẩn hóa vai trò người dùng (HCI: Role Separation & Consistency):**
   - Đổi tên toàn bộ các mục "Chuyến của tôi" thành **"Lịch sử thuê"** trên Header Layout, Sidebar Tài khoản (`Account.cshtml`), Sidebar Chủ xe (`BecomeOwner.cshtml`), Tiêu đề và nút quay lại trên trang `MyTrips.cshtml` / `mytrips.js`.
   - Giúp phân biệt rõ ràng giữa Người thuê (Renter - Lịch sử thuê) và Chủ xe (Owner - Quản lý chuyến).

4. **Tái thiết kế thẻ xe (Car Card) theo chuẩn tham chiếu Mioto (Visual Hierarchy & Affordance):**
   - **Nút Yêu thích trên ảnh (`.btn-card-favorite`):** Nút tròn mờ ở góc trên bên phải ảnh xe với hiệu ứng hover đổi màu trắng-đỏ, phóng to nhẹ, tích hợp cơ chế toggle lưu vào `localStorage` (`azuCarFavorites`) và ngăn chặn `stopPropagation()` không làm mở popup chi tiết xe.
   - **Dòng Small Text về Năng lượng:** Hiển thị rõ `<i class="fa-solid fa-charging-station"></i> Điện` (xanh lá đặc trưng) cho xe điện (VinFast VF3, VF5, VF9...) và `<i class="fa-solid fa-gas-pump"></i> Xăng / Dầu` cho xe động cơ đốt trong.
   - **Dòng Small Text về Vị trí:** Hiển thị `<i class="fa-solid fa-location-dot"></i> Quận/Huyện, Tỉnh/TP` tinh gọn, màu sắc hài hòa.
   - **Khu vực Đánh giá & Số chuyến chuẩn Mioto:** 
     - Trái: `<i class="fa-solid fa-star star-gold"></i> 5.0` · `<i class="fa-solid fa-suitcase-rolling trip-bag-icon"></i> 52 chuyến` (icon vali xanh lá `#10b981`). Xe chưa có đánh giá hiển thị tinh gọn `Chưa có đánh giá` (hoặc số chuyến nếu đã có chuyến), ngăn chặn tràn dòng đẩy giá xe.
     - Phải: Giá thuê nổi bật màu xanh lá `#08a85e` (`650K/ngày`), cố định `flex-shrink: 0`.
   - **Tối giản Badge tiện ích:** Bỏ các icon rườm rà ở nhãn `Miễn thế chấp` và `Giao xe tận nơi` (cả trên thẻ xe lẫn modal chi tiết) giúp giao diện thoáng gọn chuẩn phong cách hiện đại.
   - **Đồng bộ Modal chi tiết xe:** Khôi phục hiển thị địa điểm `#popupCarLoc` trên dòng metadata của modal xem xe.

---

### 2.2. Kết Quả Xác Minh Thực Tế (Verification)

- **Frontend & CSS:** Các file `Find.cshtml`, `find.js`, `find.css`, `carregistermode.js`, `carregistermode.css` hoạt động đồng bộ, giao diện responsive mượt mà trên desktop và mobile.
- **Git Commit & Push:**
  - Commit `570a168`: *refactor(ui-hci): streamline find filters, simplify car card metadata, convert car registration to in-page wizard, and rename trips to rental history*
  - Commit `29d4cf3`: *feat(ui-hci): add mioto-style small specs for fuel and location, mioto rating-trips layout, and car favorite toggle*
  - Commit `8f1e2f0`: *fix(ui): prevent price overflow on unrated car cards and remove badge icons for deposit/delivery*
  - Commit `9a7deb4`: *feat(ui-admin): hover heart with white-green style, remove redundant admin notes, and enrich listing approval with legal documents*
  - Đã đẩy lên nhánh `develop` trên GitHub repository (`origin/develop`).

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
[5. Admin & Staff Account Management] (Hoàn tất 100%)
       │
       ▼
[6. Owner Vehicle Synchronization & Ownership Display] (Hoàn tất 100%)
       │
       ▼
[7. HCI Refactoring & Mioto-Style UI/UX Enhancements] (Hoàn tất 100% - Session 8)
       │
       ▼
[8. Favorites Management Page & Vehicle Like System] ◄─── (TIẾP THEO)
       │
       ▼
[9. Admin Approvals: Owner Profiles & Vehicle Listings]
       │
       ▼
[10. Admin Financial Settlement, Fees & Disputes]
```
