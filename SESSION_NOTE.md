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

## 3. Chi Tiết Phiên Làm Việc (Session 10: Dọn Dẹp UI Thừa Admin, Kích Hoạt Dropdown & Chuẩn Hóa Xuất CSV)

Phiên làm việc này tập trung dọn dẹp các thành phần giao diện không có chức năng (Dead UI / Mock UI) trên cổng Quản trị Admin và chuẩn hóa vị trí các nút xuất báo cáo CSV:

### 3.1. Kích hoạt & Chuẩn hóa Topbar Quản trị (Task 2 - Mục 1)
1. **Dropdown Tài khoản Quản trị (`.profile` & `.profile-chevron`):**
   - Bổ sung menu thả xuống tương tác khi click vào avatar/chevron.
   - Cung cấp 2 chức năng nghiệp vụ thật: **Đổi mật khẩu** (mở modal đổi mật khẩu) và **Đăng xuất** (mở modal xác nhận đăng xuất an toàn).
   - Tự động đóng dropdown khi click ra ngoài.
2. **Khay Thông báo Tác vụ Cần xử lý (`#notificationBtn` & `#notifyDot`):**
   - Thay thế cơ chế cũ (click chuông nhảy về Overview) bằng **Khay thông báo dropdown thông minh**.
   - Phân loại và hiển thị số lượng tác vụ tồn đọng: Số hồ sơ chủ xe chờ duyệt CCCD, Số tin đăng xe chờ duyệt kiểm định, Số khiếu nại tranh chấp cần phán quyết Escrow.
   - Click vào từng mục tác vụ sẽ tự động điều hướng sang tab tương ứng với bộ lọc chính xác (`Pending`, `Open`).
   - Chấm đỏ `#notifyDot` hiển thị/ẩn động theo số lượng tác vụ thực tế từ cơ sở dữ liệu.
3. **Thanh Breadcrumb Điều hướng Bấm được (Clickable Breadcrumb):**
   - Biến thành phần "Quản trị" thành liên kết điều hướng bấm được (`data-go="overview"`), cho phép người dùng click để quay trở về màn hình Tổng quan từ bất kỳ tab nào.

### 3.2. Loại bỏ Tab "Cài đặt" rỗng (Task 2 - Mục 2)
1. Gỡ bỏ nút `Cài đặt` khỏi Sidebar điều hướng vì bên trong không có cấu hình nào cần thiết lập (các cấu hình phí, cọc đã nằm ở tab *Phí & hoa hồng*).
2. Di dời nút **"Xóa nhật ký"** (`#clearLogsBtn`) sang panel tiêu đề của tab **Nhật ký** (`renderLogs`), đúng ngữ cảnh sử dụng.
3. Chuyển hướng `settings.html` tự động về `index.html#overview`.

### 3.3. Tinh gọn Dashboard Tổng quan (Task 2 - Mục 3)
1. Xóa bỏ panel text lý thuyết "Quy tắc vận hành & đối soát" đang chiếm 50% diện tích màn hình.
2. Mở rộng bảng "Giao dịch hoàn tất gần đây" ra 100% chiều ngang, giúp bảng đối soát hiển thị thoáng đãng, dễ theo dõi.
3. Loại bỏ dòng text thừa `<small>Cập nhật trực tiếp từ hệ thống</small>`.

### 3.4. Chuẩn hóa Nút Xuất CSV (Task 3)
1. Gỡ bỏ nút **"Xuất CSV"** ở các trang không có bảng dữ liệu danh mục:
   - Trang **Tổng quan** (`overview`)
   - Trang **Phí & hoa hồng** (`fees`)
   - Trang **Nhật ký** (`logs`)
2. Giữ lại nút Xuất CSV ở đúng 5 tab danh sách thực thể có bảng đối soát phục vụ kế toán & kiểm toán: **Chủ xe**, **Tin đăng xe**, **Tranh chấp & khiếu nại**, **Người dùng**, **Doanh thu**.

---

## 4. Nhật Ký Phiên Làm Việc #11 (2026-11-21) - Khắc Phục 7 Lỗ Hổng Vận Hành & Chuyển Đổi Ký Quỹ Trực Tuyến 100% Escrow

### 4.1. Bối cảnh & Mục tiêu
- **Chuyển đổi 100% Online Escrow**: Thay vì cơ chế cũ (đặt cọc 25% trực tuyến + 75% tiền mặt trả khi nhận xe), hệ thống chuyển đổi sang mô hình **100% Ký quỹ trực tuyến qua Sàn AZU Car**.
  - Giải quyết triệt để vấn đề "giao dịch chui" né phí hoa hồng sàn.
  - Loại bỏ rủi ro khách mang số tiền mặt lớn (15 - 20 triệu VNĐ) khi đi nhận xe.
  - Đảm bảo thực thi bảo chứng tài chính khi xảy ra tranh chấp, phụ phí phát sinh, phạt vi phạm hoặc hủy chuyến sát giờ.
  - Tiền cọc xe máy/hiện vật (hoặc 15 triệu thế chấp tài sản) vẫn được bàn giao trực tiếp tại thời điểm nhận xe.
- **Xử lý toàn diện 7 lỗ hổng hệ thống (Flaws 1 - 7)** được phát hiện trong quy trình thuê xe, phê duyệt và thanh toán.

### 4.2. Chi tiết các hạng mục đã hoàn thành

1. **Khắc phục Flaw 1 (Điều kiện duyệt Chủ xe trước khi đăng xe)**:
   - Trong `VehicleService.CreateVehicleAsync`: Bổ sung kiểm tra bắt buộc `OwnerProfile` phải tồn tại và có `ApprovalStatus == OwnerApprovalStatuses.Approved`. Người dùng chưa xác minh CCCD sẽ bị chặn đăng tải xe lên sàn.
2. **Khắc phục Flaw 2 (Lead Time & Deadline phản hồi động)**:
   - Bổ sung `BusinessRules.MinLeadTimeHours = 2`: Chặn đặt xe sát giờ (phải đặt trước tối thiểu 2 giờ để chủ xe kịp chuẩn bị).
   - Thiết lập hạn phản hồi động cho Chủ xe: `ResponseDeadline = Min(now + 24h, StartDate - 1h)`. Nếu đơn đặt cận ngày, chủ xe phải phản hồi chậm nhất 1 tiếng trước giờ nhận xe (hoặc tối thiểu 30 phút).
3. **Khắc phục Flaw 3 (Buffer Time giữa các chuyến liên tiếp)**:
   - Bổ sung `BusinessRules.TurnaroundBufferHours = 2`: Trong `VehicleAvailabilityService.CheckAsync`, áp dụng khoảng đệm 2 giờ trước và sau mỗi đơn thuê đã khóa lịch để chủ xe có thời gian nhận xe, kiểm tra, vệ sinh và bàn giao cho khách kế tiếp.
4. **Khắc phục Flaw 4 (Chuẩn hóa trạng thái Ký quỹ & Tự động quyết toán)**:
   - Khi hoàn tất chuyến đi (`ConfirmReturnAsync`) hoặc Admin cưỡng chế hoàn tất (`ForceComplete`), trạng thái tiền cọc được cập nhật chính xác thành `DepositStatuses.Transferred`.
   - Hệ thống tự động trích 5% hoa hồng sàn và chuyển 95% giá trị hợp đồng từ tài khoản ký quỹ `ESCROW-0001` sang tài khoản ngân hàng ảo của Chủ xe via `MockBankTransaction`.
5. **Khắc phục Flaw 5 (Tự động hoàn cọc 100% khi từ chối hoặc hết hạn)**:
   - Khi chủ xe từ chối (`RejectBookingAsync`) hoặc đơn hết hạn (`AutoExpireBookingsAsync`), hệ thống cập nhật `Payment.DepositStatus = DepositStatuses.Refunded` và tự động tạo giao dịch hoàn tiền 100% từ `ESCROW-0001` về tài khoản Renter.
6. **Khắc phục Flaw 6 (Khóa lịch xe linh hoạt theo giờ)**:
   - Trong `VehicleService.AddUnavailabilityAsync`, hỗ trợ khóa lịch chi tiết theo giờ thay vì ép buộc cả ngày (00:00:00 - 23:59:59) nếu người dùng chọn khung giờ cụ thể.
7. **Khắc phục Flaw 7 (Bảo vệ phí giao xe cho Chủ xe khi khách hủy sát giờ)**:
   - Trong `BookingService.CancelBookingAsync`, khi khách thuê hủy chuyến đã duyệt sát giờ nhận xe, toàn bộ phí giao xe (Delivery Fee) được bảo lưu và giải ngân cho Chủ xe để bù đắp chi phí di chuyển thực tế.

### 4.3. Đồng bộ giao diện người dùng (UI/UX)
- **`Find.cshtml` & `find.js`**:
  - Tóm tắt chi phí hiển thị rõ ràng: `Thanh toán Ký quỹ Trực tuyến (100%)` và `Tiền thuê phải trả khi nhận xe: 0đ (Đã thanh toán đủ)`.
  - Cập nhật Điều 2 Hợp đồng điện tử và Modal thanh toán mô phỏng VietQR theo tỷ lệ 100%.
- **`trip-handover-modal.js`**:
  - Gỡ bỏ dropdown chọn trả tiền mặt 75% khi nhận xe; thay thế bằng badge xác nhận "Đã thanh toán 100% trực tuyến qua Ký quỹ Sàn AZU Car".
  - Cập nhật modal hủy chuyến và chế tài tài chính rõ ràng.
- **`admin/app.js` & `AdminFeeDtos.cs`**:
  - Mở rộng khoảng cho phép thiết lập tỷ lệ ký quỹ lên tối đa 100% (`[Range(0.05, 1.00)]`).
- **`account.js` & `mytrips.js` & `dispute-modal.js`**:
  - Đồng bộ text hiển thị thông tin tiền ký quỹ 100% trên lịch sử chuyến đi của khách thuê và chủ xe.

---

## 5. Nhật Ký Phiên Làm Việc #12 (2026-11-21) - Cải Tiến Đổi Mật Khẩu Admin, Dropdown Người Dùng & Hệ Thống Thông Báo Chuyến Đi (Renter & Owner)

### 5.1. Bối cảnh & Yêu cầu của Người dùng
1. **Đổi mật khẩu Admin**: Yêu cầu nhập đủ 3 trường: Mật khẩu cũ, Mật khẩu mới và Xác nhận mật khẩu mới.
2. **Dropdown Header cho Người dùng**: Xây dựng menu dropdown cho user tương tự Admin, bao gồm:
   - Hồ sơ cá nhân (`/account`)
   - Lịch sử chuyến đi (`/account#trips`)
   - Xe đã lưu (`/account#favorites`)
   - Đổi mật khẩu (Modal nhập mật khẩu cũ + mới + xác nhận)
   - Đăng xuất (Modal xác nhận đăng xuất)
   - **Loại bỏ nút Đăng xuất ở thanh điều hướng bên trái (side panel)** của trang tài khoản (`Account.cshtml`, `BecomeOwner.cshtml`, `MyTrips.cshtml`).
3. **Hệ thống Thông báo (Notification Center) cho Người dùng**:
   - Bổ sung service & database lưu trữ thông báo thực tế.
   - Phân biệt rõ ràng ngữ cảnh thông báo giữa **Khách thuê (Renter)** và **Chủ xe (Owner)** trong suốt vòng đời chuyến đi.
   - Giao diện thiết kế theo **pattern hiện đại, chuyên nghiệp, phi-AI (non-AI pattern)**: màu sắc chức năng tinh tế, icon trực quan, huy hiệu đếm chưa đọc, dấu chấm unread, relative time tiếng Việt ("Vừa xong", "15 phút trước",...).

### 5.2. Các hạng mục kỹ thuật đã triển khai

1. **Đổi mật khẩu Admin (`admin/app.js`)**:
   - Khi click "Đổi mật khẩu" tại profile dropdown của Admin: hiển thị modal gồm 3 ô mật khẩu: *Mật khẩu hiện tại*, *Mật khẩu mới* (tối thiểu 6 ký tự), *Xác nhận mật khẩu mới*.
   - Kiểm tra ràng buộc hợp lệ và gọi API `POST /api/auth/change-password`.
   - Ghi nhận Audit Log hệ thống và hiển thị toast thông báo.

2. **Dữ liệu & Backend Services cho Thông báo**:
   - **Entity**: [Notification.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/Entities/Notification.cs) (Id, UserId, Title, Message, Type, ReferenceId, ActionUrl, IsRead, CreatedAt).
   - **DbContext & Migration**: Bổ sung `DbSet<Notification> Notifications` vào [ApplicationDbContext.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Data/ApplicationDbContext.cs); tạo migration `20261121095825_AddNotificationsTable` và áp dụng thành công vào MySQL.
   - **Service**: [INotificationService.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Notifications/INotificationService.cs) & [NotificationService.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Notifications/NotificationService.cs) hỗ trợ lấy danh sách, đếm chưa đọc, đánh dấu đã đọc từng tin hoặc tất cả, format thời gian relative tiếng Việt.
   - **API Controller**: [NotificationController.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Controllers/NotificationController.cs) với các endpoint `/api/notifications`, `/unread-count`, `/{id}/read`, `/read-all`.
   - **Tích hợp vào Vòng đời Chuyến xe (`BookingService.cs` & `AdminDisputeService.cs`)**:
     - *Đặt xe mới*: Renter nhận thông báo ký quỹ thành công; Owner nhận thông báo yêu cầu thuê kèm hạn phản hồi.
     - *Duyệt/Từ chối*: Renter nhận thông báo chủ xe phê duyệt (hoặc từ chối kèm lý do + thông báo hoàn cọc).
     - *Hủy chuyến*: Phía còn lại nhận lý do hủy đơn và chế tài tài chính tương ứng.
     - *Bàn giao nhận xe (Pickup)*: Bên xác nhận kích hoạt thông báo cho bên đối tác tiếp tục hành trình.
     - *Hoàn tất chuyến & Quyết toán (Return)*: Owner nhận thông báo quyết toán doanh thu (sau trừ 5% hoa hồng); Renter nhận thông báo cảm ơn và nhắc đánh giá trải nghiệm.
     - *Hết hạn duyệt*: Renter nhận thông báo đơn tự động hết hạn và hoàn tiền 100%.
     - *Tranh chấp*: Cả 2 bên nhận phán quyết chính thức từ Admin.

3. **Giao diện Header, Dropdown & Panel người dùng**:
   - **`_Layout.cshtml`**: Tích hợp Action Center gồm Nút chuông thông báo (`#userNotificationBtn`), Khay thông báo (`#userNotifyDropdown`), Nút kích hoạt Profile (`#userProfileTrigger`) kèm avatar chữ cái đầu, tên người dùng, chevron và Menu xổ xuống (`#userProfileDropdown`).
   - **`_Modals.cshtml`**: Bổ sung Modal đổi mật khẩu người dùng (`#userChangePwdModal`) có nút ẩn/hiện mật khẩu và Modal xác nhận đăng xuất (`#userLogoutConfirmModal`).
   - **Side Panels**: Gỡ bỏ nút đăng xuất (`#trip-logout`) tại thanh điều hướng bên trái của `Account.cshtml`, `BecomeOwner.cshtml` và `MyTrips.cshtml`.
   - **CSS (`index.css`)**: Tùy biến kiểu dáng thanh lịch, shadow mềm mại, huy hiệu đỏ tinh gọn, các màu biểu tượng sự kiện phân loại rõ ràng (xanh lá: duyệt/bàn giao/hoàn tất; xanh dương: đơn mới; vàng cam: cảnh báo/hạn chót; đỏ: hủy/từ chối).
   - **JS (`user-nav.js`)**: Điều khiển mở/đóng dropdown mượt mà, tự động đóng khi click ra ngoài hoặc bấm `Escape`, tự động cập nhật số lượng thông báo chưa đọc định kỳ 30 giây, đánh dấu đã đọc khi click chuyển hướng và xử lý form đổi mật khẩu.

---

## 6. Lộ Trình Triển Khai Kế Tiếp (Roadmap & Next Steps)

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
[8. Redundant UI Cleanups & CSV Export Audit] (Hoàn tất 100% - Session 10)
       │
       ▼
[9. 7 Operational Flaws Fix & 100% Online Escrow Transition] (Hoàn tất 100% - Session 11)
       │
       ▼
[10. User Dropdown, Notification Center & Admin Password Flow] (Hoàn tất 100% - Session 12)
       │
       ▼
[11. Misue Logout Modal Integration & Header Dropdown Hookup] (Hoàn tất 100% - Session 13)
       │
       ▼
[12. Payment Cards, Full Human License Moderation & AI Text Purge] (Hoàn tất 100% - Session 14)
       │
       ▼
[13. GPLX Gate Fix, Password Redirect, Payment Card Assets & CSV/Handover Purge] (Hoàn tất 100% - Session 15) ◄─── (VỪA HOÀN THÀNH)
       │
       ▼
[14. Inspect Deferred Find.cshtml Links (Task 2 - Mục 4) / Favorite Vehicles]
```

---

## 7. Chi Tiết Session 13: Tích Hợp Popup Đăng Xuất Chuẩn Của Misue

### Bối cảnh & Vấn đề:
* Nút "Đăng xuất" trong Header Dropdown (`#btnUserHeaderLogout`) chưa hoạt động đúng do cơ chế mở modal trước đó thiếu class `active` và chưa kết nối tới popup đăng xuất chuẩn của nhóm do Misue thiết kế.
* Trước đó popup của Misue (`#logout-modal` với class `.register-dialog`, viền bo góc, nút đen `#212529`) bị đặt cục bộ tại `Account.cshtml`, `BecomeOwner.cshtml`, và `MyTrips.cshtml`, không xuất hiện ở các trang khác như Trang chủ (`/`), Tìm xe (`/find`), v.v.

### Các thay đổi kỹ thuật:
1. **Global hóa Popup Misue vào `_Modals.cshtml`:**
   * Di dời markup popup `#logout-modal` (`.dialog-backdrop` + `.register-dialog` + `#close-modal-btn` + `#confirm-logout-btn`) vào [src/CarRental.Web/Views/Shared/_Modals.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Shared/_Modals.cshtml).
   * Xóa bỏ các khối markup trùng lặp tại [Account.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/Account.cshtml), [BecomeOwner.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/BecomeOwner.cshtml), và [MyTrips.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/MyTrips.cshtml).
2. **Đồng bộ CSS toàn cục trong `index.css`:**
   * Bổ sung styles chuẩn của Misue (`.dialog-backdrop`, `.register-dialog`, `.dialog-close`, animation `dialogPopIn`, v.v.) vào [src/CarRental.Web/wwwroot/css/index.css](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/css/index.css) để popup hiển thị đồng nhất 100% trên mọi trang.
3. **Nối sự kiện tương tác trong `user-nav.js`:**
   * Bắt sự kiện click `#btnUserHeaderLogout` mở `#logout-modal` (`logoutModal.hidden = false`).
   * Hỗ trợ đóng popup qua nút `X` (`#close-modal-btn`), click ra ngoài nền backdrop, hoặc phím `Escape`.
   * Gắn xử lý đăng xuất an toàn qua `window.AzuStore.logout()` (gọi API xóa session, xóa local state và điều hướng mượt mà).
   * Khắc phục hàm `openUserModal`/`closeUserModal` hỗ trợ thêm class `.active` cho các popup khác như Đổi mật khẩu.
4. **Phòng tránh trùng lặp sự kiện (Event Debouncing):**
   * Đặt cờ `dataset.bound = 'true'` trên `#confirm-logout-btn` trong `user-nav.js`, [account.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/account.js), [mytrips.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/mytrips.js), và [become-owner.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/become-owner.js).

---

## 8. Chi Tiết Session 14: Thẻ Thanh Toán Hồ Sơ, Rà Soát Phê Duyệt GPLX & Tẩy Sạch Văn Mẫu AI

### Bối cảnh & Yêu cầu:
1. **Thẻ thanh toán (100% Ký quỹ/Thanh toán trực tuyến):** Bổ sung mục Thẻ thanh toán trong trang Hồ sơ cá nhân (`/account#cards`) khớp với mockup (trạng thái trống có hình vẽ minh họa điện thoại + thẻ + huy hiệu link xanh lá và câu "Bạn chưa có thẻ nào", nút "Thêm thẻ (+)", danh sách thẻ liên kết, xóa thẻ, đặt mặc định, kèm modal thêm thẻ).
2. **Loại bỏ tính năng duyệt tự động GPLX (Full Human Moderation):** Bỏ triệt để nút "Quét & Duyệt tự động GPLX" và toàn bộ logic backend tự động; quy trình duyệt giấy phép lái xe phải do nhân sự quản trị kiểm duyệt thủ công 100%.
3. **Lược bỏ huy hiệu bảo mật và nút đăng xuất thừa:** Gỡ bỏ mục "Bảo mật tài khoản" kèm icon khiên tại trang Đổi mật khẩu; gỡ bỏ nút đăng xuất trong sidebar panel của Admin.
4. **Chuẩn hóa thuật ngữ & Xóa văn mẫu AI:** Thay thế toàn bộ từ tiếng Anh "Escrow" bằng "ký quỹ / tiền cọc / tài khoản bảo chứng"; xóa bỏ các câu văn mẫu AI rập khuôn như *"Đã ghi nhận trong CSDL"*, *"Hệ Thống Quản Trị Vận Hành"*, *"● HỆ THỐNG TRỰC TUYẾN"*.
5. **Khắc phục lỗi treo tải trang Tìm xe (`/find`):** Khắc phục lỗi ReferenceError JavaScript và lỗi khởi động Migration khiến server gián đoạn.

### Phân tích sự cố kỹ thuật (Post-Mortem):
- **Nguyên nhân làm crash server backend:** Trong quá trình bổ sung `PaymentCard`, hàm `SeedPaymentCardsAsync` được gọi trước khi chạy lệnh tạo bảng MySQL (`dotnet ef database update`). MySQL trả lỗi `Table 'carrental.payment_cards' doesn't exist`, làm server web sập cổng 5051.
- **Nguyên nhân trang `/find` bị treo vĩnh viễn (Phát hiện chính xác):** Trong [find.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/find.js) (dòng 2583) tồn tại một khối mã trùng lặp khai báo lại `const dOvertime = document.getElementById('extraFeeOvertimeDesc')` cùng phạm vi với dòng 2571. Điều này gây ra lỗi cú pháp chết người `SyntaxError: Identifier 'dOvertime' has already been declared`, khiến trình duyệt từ chối thực thi toàn bộ file `find.js`. Do đó hàm nạp xe `loadVehiclesFromApi()` không thể chạy và khối HTML ban đầu `.loading-cars` (*"Đang kết nối cơ sở dữ liệu và tải danh sách xe..."*) không bao giờ bị xóa.
- **Hiện tượng bảng Admin rỗng:** Tài khoản đang đăng nhập là khách thuê thường (`renter1`), gọi API admin bị trả 403 Forbidden. Khối `.catch()` phía client tự gán số cứng ảo trên thẻ metric trong khi bảng nhận `[]`.
- **Khắc phục:** Đã xóa bỏ đoạn mã trùng lặp trong `find.js`, xác minh cú pháp `VALID SYNTAX` qua Edge CDP, kiểm tra thực tế trên trình duyệt thấy `carCardsCount: 17`, `loadingExists: false`. Đã chạy migration cập nhật bảng `payment_cards`, sửa cơ chế hiển thị lỗi khi thiếu quyền trên Admin và khôi phục hoạt động ổn định 100%.

### Các thay đổi kỹ thuật chi tiết:
1. **Hạ tầng Dữ liệu & Dịch vụ Thẻ thanh toán:**
   - **Entity**: [PaymentCard.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/Entities/PaymentCard.cs) lưu trữ `CardNumberMasked`, `CardBrand`, `ExpiryMonth`, `ExpiryYear`, `BankName`, `IsDefault`, v.v.
   - **DTOs**: [PaymentCardDto.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/PaymentCards/PaymentCardDto.cs) và [AddPaymentCardRequest.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/PaymentCards/AddPaymentCardRequest.cs).
   - **Service & Controller**: [IPaymentCardService.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/PaymentCards/IPaymentCardService.cs), [PaymentCardService.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/PaymentCards/PaymentCardService.cs), và [PaymentCardsController.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Controllers/PaymentCardsController.cs).
   - **EF Migration**: Áp dụng migration `20261121103131_AddPaymentCardsTable` vào MySQL và nạp dữ liệu mẫu ban đầu cho `renter1`.
2. **Giao diện & Tương tác Thẻ thanh toán:**
   - **`Account.cshtml`**: Thêm panel `#payment-card-panel` với minh họa SVG rực rỡ khớp ảnh mockup, nút "Thêm thẻ (+)" và container danh sách thẻ liên kết.
   - **`_Modals.cshtml`**: Bổ sung modal `#addPaymentCardModal` với tự động nhận diện thương hiệu thẻ (Visa, Mastercard, JCB, Napas) và định dạng tự động số thẻ, hạn MM/YY.
   - **`account.js` & `mytrips.css`**: Điều khiển hiển thị danh sách thẻ, gọi API thêm mới, xóa và đặt làm thẻ mặc định.
   - **`_Layout.cshtml`**: Bổ sung mục "Thẻ thanh toán" (`/account#cards`) vào Header Profile Dropdown.
3. **Loại bỏ Tự động duyệt GPLX (Full Human Moderation):**
   - Xóa bỏ nút `#btnBatchAutoVerifyLicenses` và modal kết quả quét trong [admin/app.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/admin/app.js).
   - Gỡ bỏ hoàn toàn action `AutoVerifyDriverLicense` và `BatchAutoVerifyLicenses` trong [AdminUsersController.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Controllers/AdminUsersController.cs), [IAdminUserService.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Admin/IAdminUserService.cs) và [AdminUserService.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Services/Admin/AdminUserService.cs).
4. **Vệ sinh giao diện & Gỡ bỏ văn AI:**
   - Gỡ bỏ `.password-security-badge` khỏi `Account.cshtml`.
   - Gỡ bỏ nút đăng xuất trong sidebar của Admin (`admin/js/layout.js`).
   - Gỡ bỏ badge `● HỆ THỐNG TRỰC TUYẾN` và chân trang thừa `<footer>` trong `admin/index.html`.
   - Thay thế toàn bộ từ "Escrow" thành thuật ngữ tiếng Việt chuẩn trong `Find.cshtml`, `admin/app.js`, `dispute-modal.js`, và `mytrips.js`.
   - Sửa lỗi `vehicleImagePlaceholder` và bộ đếm giả lập 403 trong `find.js` và `admin/app.js`.
   - Thay đổi các câu văn rập khuôn *"Đã ghi nhận trong CSDL"* thành *"Tất cả vụ khiếu nại"*, *"Tình hình hoạt động thực tế trên sàn AZU Car từ cơ sở dữ liệu"* thành *"Tình hình hoạt động trên sàn AZU Car"*.

### Kết quả kiểm thử tự động (Verification):
- `dotnet build`: Succeeded (0 Warning, 0 Error).
- API `GET /api/vehicles?pageSize=100`: Trả về 17 xe hợp lệ, thời gian phản hồi tức thì.
- API `GET /api/payment-cards`: Trả về 2 thẻ đã seed của `renter1`, kiểm thử thêm thẻ mới, đặt mặc định và xóa thẻ đều thành công 100%.
- Git Commits: `0e8178f` (Code), `504e1be` (Docs). Đã push lên nhánh `develop`.

---

## 9. Chi Tiết Session 15: Sửa Mâu Thuẫn GPLX Thuê Xe, Điều Hướng Đổi Mật Khẩu, Khắc Phục Icon/Ảnh Thẻ & Lược Bỏ CSV/Bàn Giao Xe

### Bối cảnh & Yêu cầu:
1. **Khắc phục mâu thuẫn xác minh GPLX khi thuê xe:** Khách thuê đã được cấp quyền / xác minh GPLX trong CSDL (ví dụ `renter1`) khi bấm "CHỌN THUÊ" trên `/find` lại bị chặn với thông báo chưa xác thực GPLX.
2. **Menu Header Dropdown "Đổi mật khẩu":** Thay vì mở popup modal, phải chuyển hướng trực tiếp người dùng đến trang đổi mật khẩu: `/account#password`.
3. **Cập nhật hình ảnh thẻ thanh toán rỗng:** Thay thế khối SVG tự vẽ tại `#payment-card-empty` bằng ảnh PNG chuẩn do người dùng cung cấp (`/images/payment-card-empty.png`).
4. **Sửa icon nút "Thêm thẻ":** Khắc phục icon bị lỗi ký tự ô vuông có dấu X (`[X]`) do sử dụng class Pro `fa-regular fa-circle-plus` sang `fa-solid fa-plus` chuẩn FontAwesome Free.
5. **Loại bỏ nút "Biên bản bàn giao xe":** Gỡ bỏ nút "Mở biên bản bàn giao xe" (chủ xe) / "Mở biên bản nhận xe" (khách thuê) khi đơn ở trạng thái Accepted trên trang `MyTrips` và `Account`.
6. **Loại bỏ toàn bộ tính năng & dịch vụ Xuất CSV:** Gỡ bỏ toàn bộ nút "Xuất CSV" và các hàm xử lý CSV khỏi giao diện Admin (`admin/app.js` và `AZU-Car-Admin-v4.7/app.js`).

### Các thay đổi kỹ thuật chi tiết:
1. **Đồng bộ trạng thái Giấy phép lái xe (GPLX):**
   - **Backend DTOs**: Thêm thuộc tính tính toán `public bool IsDriverLicenseVerified => Claims != null && Claims.Contains(AppClaimTypes.DriverLicenseVerified);` vào [UserProfileDto.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Auth/UserProfileDto.cs) và [AuthUserDto.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Auth/AuthUserDto.cs).
   - **Store Session**: Cập nhật [azu-store.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/azu-store.js) hàm `checkAuth()`, `login()`, `register()` và `saveUserData()` để tự động lưu cờ `azuCarLicenseVerified` và mảng `azuCarClaims` vào `sessionStorage`. Cập nhật `getUser()` trả về `isDriverLicenseVerified` và `claims`.
   - **GPLX Gate tại Tìm xe**: Trong [find.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/find.js) (dòng 2358 và 3185), kiểm tra toàn diện `user.isDriverLicenseVerified || sessionStorage.getItem('azuCarLicenseVerified') === 'true' || user.claims.includes('DriverLicenseVerified') || user.hasDriverLicense === true`, đảm bảo tài khoản đã xác thực có thể chuyển sang bước đặt xe ngay lập tức.
   - **Đồng bộ trang Account**: Cập nhật [account.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/account.js) khi lưu GPLX hoặc gọi `syncUserProfile()` thì tự động cập nhật `azuCarLicenseVerified`.
2. **Điều hướng Đổi mật khẩu từ Header Dropdown:**
   - Trong [_Layout.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Shared/_Layout.cshtml), đổi thẻ `<button id="btnOpenUserChangePwd">` thành `<a href="/account#password" class="user-dropdown-item" role="menuitem">`.
   - Trong [user-nav.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/user-nav.js), thêm sự kiện tự động đóng dropdown khi click vào bất kỳ thẻ link `<a>` nào bên trong `#userProfileDropdown`.
3. **Thay thế hình ảnh Thẻ thanh toán rỗng & Sửa icon Thêm thẻ:**
   - Trong [Account.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/Account.cshtml), thay khối SVG 25 dòng bằng thẻ `<img src="~/images/payment-card-empty.png" alt="Chưa có thẻ nào" class="payment-empty-img" style="max-width: 190px; height: auto;" asp-append-version="true">`.
   - Đổi icon nút `#btn-open-add-card` từ `fa-regular fa-circle-plus` sang `fa-solid fa-plus`, hiển thị dấu cộng sắc nét và đồng bộ với toàn hệ thống.
4. **Loại bỏ nút Biên bản bàn giao xe khi đơn đã duyệt:**
   - Trong [mytrips.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/mytrips.js) tại trạng thái `Accepted`, gỡ bỏ nút `data-trip-detail-action="handover"`, cập nhật mô tả rõ ràng: *"Đơn thuê đã được duyệt thành công. Vui lòng liên hệ chủ xe để nhận xe theo lịch hẹn."*, chỉ giữ lại nút "Hủy đơn" khi đủ điều kiện.
   - Trong [account.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/js/account.js), gỡ bỏ nút `pickupBtn` ("Bàn giao / Nhận xe") tại `trip.status === 'Accepted'`.
5. **Loại bỏ toàn bộ Xuất CSV:**
   - Trong [admin/app.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/admin/app.js) và [AZU-Car-Admin-v4.7/app.js](file:///C:/Users/admin/documents/PBL3/PBL3/src/AZU-Car-Admin-v4.7/app.js): Chuyển `const exportBtn = (kind) => '';`, gỡ bỏ bộ bắt sự kiện `data-export` tải file CSV.

### Kết quả kiểm thử tự động (Verification):
- `dotnet build`: Succeeded (0 Warning, 0 Error) trong 15.45 giây.
- Web Application khởi động thành công và phục vụ tại `http://localhost:5051`.

---

## 10. Chi Tiết Session 16: Tinh Gọn Hợp Đồng, Xóa Bỏ Hoàn Toàn Mục Thanh Toán Khi Nhận Xe & Tẩy Sạch Icon/Emoji AI Rườm Rà

### Bối cảnh & Yêu cầu:
1. **Gỡ bỏ text ép buộc & Nút hợp đồng thừa:**
   - Xóa bỏ dòng chữ nhắc nhở máy móc: *"↳ Nhấp để mở hợp đồng & bấm Xác nhận bên trong (Không thể tích chọn trực tiếp)"*.
   - Cho phép người dùng tích chọn trực tiếp vào checkbox Hợp đồng thuê xe điện tử một cách tự nhiên.
   - Gỡ bỏ nút bấm thừa `[Xem hợp đồng thuê xe]` ở góc phải thẻ Hợp đồng, chỉ giữ lại liên kết chữ *"Hợp đồng thuê xe điện tử"* để người dùng bấm xem chi tiết khi có nhu cầu.
2. **Loại bỏ triệt để mục "Thanh toán khi nhận xe":**
   - Xóa bỏ tùy chọn phương thức thanh toán tiền mặt khi nhận xe trong Modal đặt xe (`Find.cshtml`).
   - Xóa bỏ dòng `Tiền thuê phải trả khi nhận xe: 0 đ (Đã thanh toán đủ)` trong bảng tóm tắt chi phí đặt xe (`find.js` / `Find.cshtml`) và trong chi tiết chuyến đi (`mytrips.js`), khẳng định trọn vẹn mô hình 100% Ký quỹ Sàn Trực tuyến.
   - Cập nhật kịch bản Chatbot (`GeminiChatbotService.cs`, `chatbot.js`, `support.js`) xóa bỏ hoàn toàn tàn dư cọc 25% - trả sau 75%.
3. **Thanh lọc toàn bộ Icon / Emoji rườm rà (AI text/emoji purge):**
   - Gỡ bỏ các biểu tượng không cần thiết: icon khiên tại tiêu đề thế chấp (`<i class="fa-solid fa-shield-halved"></i>`), icon bắt tay / bàn tay (`<i class="fa-solid fa-hand-holding-hand"></i>`), icon thông tin/check trong badge thế chấp, icon sấm sét (`<i class="fa-solid fa-bolt"></i>`), icon gậy phép ma thuật (`<i class="fa-solid fa-wand-magic-sparkles"></i>`).
   - Xóa bỏ loạt icon đặt đầu mỗi câu trong phần mô tả xe (`popupCarDescription`) vốn mang phong cách AI listicle.
   - Xóa bỏ các emoji trang trí thừa (`🎉`, `💰`, `❌`) trong các thông báo alert và giao diện.

### Kết quả kiểm thử tự động (Verification):
- `dotnet build`: Succeeded (0 Warning, 0 Error).
- Giao diện Modal đặt xe tinh gọn, chuẩn mực, chuyên nghiệp, không còn các chi tiết gượng ép.
- Web Application đang phục vụ ổn định tại `http://localhost:5051`.

---

## 11. Chi Tiết Session 17: Xóa Bỏ Triệt Để Thanh Toán Trực Tiếp, Tối Ưu Hover Bài Đăng Mượt Mà & Thiết Kế Lại Nút Tim Nền Xanh Viền Trắng

### Bối cảnh & Yêu cầu:
1. **Xóa bỏ hoàn toàn thanh toán trực tiếp / tiền mặt khi nhận xe:**
   - Loại bỏ triệt để toàn bộ tàn dư mã nguồn, giao diện, và DTO liên quan đến "thanh toán tại chỗ", "tiền mặt khi nhận xe", hoặc "thanh toán phần còn lại".
   - Trong Modal bàn giao xe (`trip-handover-modal.js`), xóa bỏ dòng `Tiền thuê còn lại thanh toán tại chỗ: ...`, thay bằng thông báo xác nhận: *"Đã ký quỹ 100% qua sàn AZU Car"*; gán cứng phương thức thanh toán là `online_escrow_100pct`.
   - Trong giao diện chi tiết chuyến đi (`mytrips.js`), xóa bỏ hoàn toàn dropdown `<select name="remainingPaymentMethod">` (Tiền mặt / Chuyển khoản) và text hiển thị phương thức tiền mặt trong lịch sử bàn giao; tự động gửi `remainingPaymentMethod: 'online_escrow_100pct'`.
   - Trong [ConfirmHandoverRequest.cs](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Models/DTOs/Bookings/ConfirmHandoverRequest.cs), đổi giá trị mặc định của `RemainingPaymentMethod` từ `"cash"` thành `"online_escrow"`.
   - Trong trang Đăng ký xe của chủ xe (`carregistermode.js`), thay thế các văn bản về thế chấp tiền mặt bằng quy định ký quỹ trực tuyến 100% qua sàn AZU Car.
   - Trong [Find.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/Find.cshtml), chỉnh sửa thẻ "Quy định tài sản thế chấp" thành "Quy định ký quỹ trực tuyến", xóa bỏ dòng hướng dẫn *"Bạn sẽ giao tài sản thế chấp (nếu có) trực tiếp cho chủ xe..."*, khẳng định rõ: *"Toàn bộ tiền thuê và tiền ký quỹ được bảo chứng trực tuyến 100% qua sàn AZU Car; không giao nhận tiền mặt tại chỗ."*.
2. **Khắc phục triệt để lỗi ô vuông [X] ở nút "Thêm thẻ" (Payment Cards):**
   - Trong [Account.cshtml](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/Views/Home/Account.cshtml), thay thế icon FontAwesome sang SVG inline `+` (`viewBox="0 0 24 24"`), đảm bảo sắc nét tuyệt đối và không bao giờ bị lỗi missing font glyph `🗙` trên bất kỳ trình duyệt nào.
3. **Tối ưu hiệu ứng hover bài đăng xe (.car-card) cực kỳ mượt mà:**
   - Trong [find.css](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/css/find.css), thay thế hiệu ứng chuyển động nhanh 0.2s bị giật bằng bộ thông số mượt mà phong cách ứng dụng cao cấp:
     - `transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)`
     - `will-change: transform, box-shadow`
     - `transform: translateY(-6px)` kết hợp độ sâu bóng đổ mềm mại đa tầng: `box-shadow: 0 16px 32px -4px rgba(24, 40, 31, 0.14), 0 6px 12px -2px rgba(24, 40, 31, 0.05)`
     - Thêm hiệu ứng phóng to nhẹ nhàng cho hình ảnh xe: `.car-card:hover .car-img-wrapper img { transform: scale(1.035); }` với `transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)`.
4. **Đổi lại nút icon tim yêu thích: Nền xanh viền tim trắng (phía trong vẫn xanh):**
   - Trong [find.css](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Web/wwwroot/css/find.css) tại `.btn-card-favorite`:
     - Nền nút: Màu xanh lá thương hiệu chuẩn sàn (`background: #00a550`).
     - Viền tim: Màu trắng (`color: #ffffff;` với icon outline `fa-regular fa-heart`).
     - Phía trong lòng trái tim: Vẫn hiển thị màu xanh đồng nhất với nền nút (ruột rỗng nhìn xuyên qua nền xanh).
     - Rê chuột vào bài đăng: Nút tim hiện rõ với độ mờ 1 và scale 1.06 mượt mà.
     - Rê chuột trực tiếp vào nút tim: Đổi nhẹ sang `#008f45`, scale 1.18 êm ái, bóng đổ tỏa sáng xanh tinh tế.

### Kết quả kiểm thử tự động (Verification):
- `dotnet build --no-incremental`: Succeeded (0 Warning, 0 Error).
- Giao diện nút yêu thích trên bài đăng xe được tinh chỉnh đúng chuẩn:
  - Mặc định ẩn (`opacity: 0; pointer-events: none;`), chỉ khi rê chuột vào bài đăng xe mới hiện lên mượt mà.
  - Khi chưa tim: Giữ nguyên 100% bản cũ (nền tối mờ kính `rgba(15, 23, 42, 0.42)`, viền trắng mỏng, icon tim outline trắng).
  - Khi đã tim (`.is-active`): Nền nút và ruột tim là màu **xanh nhạt tươi sáng** (`#10b981`), nét viền trái tim màu **trắng tinh** (`color: #ffffff;` với `<i class="fa-regular fa-heart"></i>`).
- Web Application đang phục vụ tại `http://localhost:5051`.
