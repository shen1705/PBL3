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

---

## 2. Chi Tiết Phiên Làm Việc (Session 8: Tái Cấu Trúc Giao Diện Theo Chuẩn HCI & Thiết Kế Thẻ Xe Mioto-Style)

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
