# Bảng Dữ Liệu Mẫu Hệ Thống (Seed Data Reference)

Tất cả dữ liệu mẫu được khởi tạo tự động trong môi trường Development thông qua [`DbInitializer.SeedAsync`](file:///C:/Users/admin/documents/pbl3/pbl3/src/CarRental.Data/DbInitializer.cs).  
- **Mật khẩu mặc định:** **`Test@12345`** áp dụng cho tất cả tài khoản.
- **Phương thức đăng nhập:** Có thể sử dụng **Username**, **Email** hoặc **Số điện thoại**.
- **Cơ chế chặn vi phạm:** Tài khoản `renter4` đang chịu án phạt (`Suspend7d`), hệ thống sẽ từ chối đăng nhập và trả về lý do cụ thể kèm hạn phạt.
- **Quy tắc tính giá chuẩn hóa:**
  - `RentalDays = (EndDate.Date - StartDate.Date).Days + 1` (tính đủ ngày nhận và ngày trả xe).
  - `RentalSubtotal = PricePerDay * RentalDays`.
  - `InsuranceFee = 50.000đ * RentalDays`.
  - `DeliveryFee = 100.000đ` (nếu chọn giao xe tận nơi) hoặc `0đ` (tự nhận xe).
  - `PriceLockedTotal = RentalSubtotal + InsuranceFee + DeliveryFee`.
  - `DepositAmount = 30% * PriceLockedTotal` (`BusinessRules.DepositRate = 0.30m`).
  - `CommissionAmount = 10% * PriceLockedTotal` (`BusinessRules.DefaultCommissionRate = 0.10m`).

---

## 1. Danh sách tài khoản người dùng (`users`, `roles`, `claims`)

| Username | Họ và tên | Số điện thoại | Email | Vai trò (`Roles`) | Giấy tờ / Trạng thái đặc biệt | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `renter1` | Nguyễn Văn An | `0900000001` | `renter1@carrental.test` | Renter | GPLX Hạng B2 | Khách thuê thường, có đơn hoàn tất, đơn đang thuê, đơn đã hủy |
| `renter2` | Trần Thị Bình | `0900000002` | `renter2@carrental.test` | Renter | GPLX Hạng B2 | Khách thuê có đơn chờ duyệt gấp (1h), đơn đang đi, đơn bị phạt chủ xe |
| `renter3` | Lê Minh Cường | `0900000003` | `renter3@carrental.test` | Renter | GPLX Hạng B2 | Khách thuê có đơn Ongoing gặp sự cố điều hòa (`Open Dispute`), đơn quá hạn |
| `renter4` | Đỗ Thị Mai | `0900000011` | `renter4@carrental.test` | Renter | GPLX Hạng B2 · **Bị phạt (Suspend7d)** | Kiểm thử chặn truy cập tài khoản vi phạm bị tạm khóa |
| `owner1` | Phạm Quốc Dũng | `0900000004` | `owner1@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe Hà Nội & Đà Nẵng (V1, V2, V7, V8, V13). Doanh thu 3 chuyến hoàn tất |
| `owner2` | Hoàng Thị Em | `0900000005` | `owner2@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe điện & Crossover (V3, V4, V9, V10, V14). Doanh thu 3 chuyến hoàn tất |
| `owner3` | Võ Văn Phúc | `0900000006` | `owner3@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe du lịch 7 - 16 chỗ (V5, V6, V11, V12, V15). Có đơn khiếu nại mở |
| `owner4` | Lê Hoàng Duy | `0900000012` | `owner4@carrental.test` | Renter, Owner | CCCD **Chờ duyệt (Pending)** · Inactive | Kiểm thử quy trình Staff/Admin xét duyệt chủ xe |
| `staff1` | Đặng Thu Hà | `0900000007` | `staff1@carrental.test` | Staff, Admin | Nhân viên vận hành (Staff) | Kiểm thử duyệt hồ sơ, xử lý khiếu nại (`ForceComplete`), duyệt tin xe |
| `staff2` | Bùi Văn Khoa | `0900000008` | `staff2@carrental.test` | Staff | Nhân viên hỗ trợ (Staff) | Kiểm thử nghiệp vụ đối soát |
| `admin1` | Quản trị Một | `0900000009` | `admin1@carrental.test` | Admin | Quyền: `CanManageSystemConfig`, `CanManageAdminAccounts` | Quản trị viên cấp cao, xử lý án phạt chủ xe (`CancelOwnerFault`) |
| `admin2` | Quản trị Hai | `0900000010` | `admin2@carrental.test` | Admin | Quyền: `CanManageSystemConfig`, `CanManageAdminAccounts` | Quản trị viên cấp cao |

---

## 2. Danh sách xe & tin đăng (`vehicles`, `vehicle_listings`)

| Mã xe | Biển số | Chủ sở hữu | Hãng & Dòng xe | Năm / Chỗ | Hộp số / Nhiên liệu | Giá thuê / ngày | Thành phố | Quận/Huyện | Tọa độ (Lat, Lng) | Trạng thái duyệt |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **V1** | `30A-123.45` | `owner1` | Toyota Vios | 2022 / 5 | Tự động / Xăng | 700.000 đ | Hà Nội | Cầu Giấy | 21.0333, 105.7944 | Public (Đã duyệt) |
| **V2** | `30E-234.56` | `owner1` | Hyundai Accent | 2021 / 5 | Số sàn / Xăng | 600.000 đ | Hà Nội | Ba Đình | 21.0341, 105.8239 | Public (Đã duyệt) |
| **V3** | `30F-345.67` | `owner2` | Mazda CX-5 | 2023 / 5 | Tự động / Xăng | 1.100.000 đ | Hà Nội | Hai Bà Trưng | 21.0069, 105.8524 | Public (Đã duyệt) |
| **V4** | `30G-456.78` | `owner2` | VinFast VF 8 | 2023 / 5 | Tự động / Điện | 1.300.000 đ | Hà Nội | Nam Từ Liêm | 21.0175, 105.7840 | Public (Đã duyệt) |
| **V5** | `29A-567.89` | `owner3` | Ford Transit | 2020 / 16 | Số sàn / Dầu | 1.500.000 đ | Hà Nội | Long Biên | 21.0362, 105.8920 | Public (Đã duyệt) |
| **V6** | `29B-678.90` | `owner3` | Kia Morning | 2019 / 4 | Số sàn / Xăng | 450.000 đ | Hà Nội | Đống Đa | 21.0180, 105.8270 | **Hidden** (Tạm ẩn) |
| **V7** | `43A-111.22` | `owner1` | Toyota Corolla Cross | 2023 / 5 | Tự động / Xăng | 950.000 đ | TP. Đà Nẵng | Hải Châu | 16.0544, 108.2022 | Public (Đã duyệt) |
| **V8** | `43A-222.33` | `owner1` | Mitsubishi Xpander | 2023 / 7 | Tự động / Xăng | 850.000 đ | TP. Đà Nẵng | Liên Chiểu | 16.0712, 108.1518 | Public (Đã duyệt) |
| **V9** | `43B-333.44` | `owner2` | VinFast VF e34 | 2023 / 5 | Tự động / Điện | 750.000 đ | TP. Đà Nẵng | Sơn Trà | 16.0601, 108.2394 | Public (Đã duyệt) |
| **V10** | `43C-444.55` | `owner2` | Honda City | 2022 / 5 | Tự động / Xăng | 650.000 đ | TP. Đà Nẵng | Thanh Khê | 16.0620, 108.1830 | Public (Đã duyệt) |
| **V11** | `43D-555.66` | `owner3` | Hyundai Santa Fe | 2023 / 7 | Tự động / Dầu | 1.400.000 đ | TP. Đà Nẵng | Cẩm Lệ | 16.0180, 108.2160 | Public (Đã duyệt) |
| **V12** | `43E-666.77` | `owner3` | Kia Carnival | 2024 / 7 | Tự động / Dầu | 1.600.000 đ | TP. Đà Nẵng | Ngũ Hành Sơn | 16.0290, 108.2520 | Public (Đã duyệt) |
| **V13** | `51F-777.88` | `owner1` | Toyota Vios | 2023 / 5 | Tự động / Xăng | 650.000 đ | TP. Hồ Chí Minh | Quận 1 | 10.7769, 106.7009 | Public (Đã duyệt) |
| **V14** | `51G-888.99` | `owner2` | Mazda CX-30 | 2023 / 5 | Tự động / Xăng | 850.000 đ | TP. Hồ Chí Minh | Bình Thạnh | 10.8031, 106.6944 | Public (Đã duyệt) |
| **V15** | `51H-999.00` | `owner3` | Honda CR-V | 2023 / 7 | Tự động / Xăng | 1.200.000 đ | TP. Hồ Chí Minh | Quận 7 | 10.7327, 106.7188 | Public (Đã duyệt) |
| **V16** | `43A-999.88` | `owner4` | VinFast VF 5 Plus | 2024 / 5 | Tự động / Điện | 550.000 đ | TP. Đà Nẵng | Hải Châu | 16.0600, 108.2100 | **PendingApproval** (Chờ duyệt) |
| **V17** | `30H-999.11` | `owner1` | Hyundai Tucson | 2024 / 5 | Tự động / Xăng | 1.000.000 đ | Hà Nội | Cầu Giấy | 21.0333, 105.7944 | **PendingApproval** (Chờ duyệt) |
| **V18** | `51K-888.22` | `owner2` | Ford Everest | 2024 / 7 | Tự động / Dầu | 1.500.000 đ | TP. Hồ Chí Minh | Quận 2 | 10.7850, 106.7450 | **PendingApproval** (Chờ duyệt) |
| **V19** | `43F-777.33` | `owner3` | Mazda CX-8 | 2024 / 7 | Tự động / Xăng | 1.300.000 đ | TP. Đà Nẵng | Sơn Trà | 16.0601, 108.2394 | Public (Đã duyệt) |

---

## 3. Danh sách 15 kịch bản đơn thuê xe kiểm thử toàn diện (`bookings`)

| Đơn | Xe | Khách thuê | Thời gian | Trạng thái | Tổng tiền / Cọc | Giao / Nhận xe (Handovers) | Đánh giá / Tranh chấp & Chế tài | Nghiệp vụ kiểm thử |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- | :--- | :--- |
| **BK01** | V1 (Vios, HN) | `renter1` | -12 đến -9 (4 ngày) | `Completed` | 3.000.000 đ<br>Cọc: 900.000 đ | Đủ 4 biên bản (Pickup + Return) | 2 Đánh giá 5★ công khai (`IsPublic = true`) | Luồng hoàn tất chuẩn, quyết toán doanh thu chủ xe 1 |
| **BK02** | V3 (CX-5, HN) | `renter2` | -4 đến -2 (3 ngày) | `Completed` | 3.550.000 đ<br>Cọc: 1.065.000 đ | Đủ 4 biên bản (giao tận nơi) | Khách đã đánh giá 5★ (`IsPublic = false`). Chủ xe **chưa** đánh giá | **Đánh giá mù (Double-Blind)**: Test nút đánh giá chủ xe & hiển thị sau khi cả 2 đánh giá |
| **BK03** | V7 (Cross, ĐN) | `renter3` | -15 đến -12 (4 ngày) | `Completed` | 4.000.000 đ<br>Cọc: 1.200.000 đ | Đủ 4 biên bản (Pickup + Return) | 2 Đánh giá 5★ công khai | Quyết toán doanh thu chuyến xe tại Đà Nẵng |
| **BK04** | V9 (e34, ĐN) | `renter1` | -8 đến -5 (4 ngày) | `Completed` | 3.300.000 đ<br>Cọc: 990.000 đ | Đủ 4 biên bản (giao tận nơi) | 2 Đánh giá 5★ công khai | Xe điện VinFast, quyết toán doanh thu chủ xe 2 |
| **BK05** | V8 (Xpander, ĐN) | `renter2` | -1 đến +2 (4 ngày) | `Ongoing` | 3.600.000 đ<br>Cọc: 1.080.000 đ | Đã nhận xe hôm qua (Odo: 24.150 km) | Đang lưu thông bình thường | Kiểm thử chuyến đi đang diễn ra & xác nhận trả xe |
| **BK06** | V11 (Santa Fe, ĐN) | `renter3` | -2 đến +1 (4 ngày) | `Ongoing` | 5.900.000 đ<br>Cọc: 1.770.000 đ | Đã nhận xe (Odo: 38.500 km) | **Khiếu nại ĐANG MỞ (`Open Dispute`)**: Hỏng điều hòa, nổi đèn Check Engine | Kiểm thử Staff/Admin xử lý tranh chấp sự cố kỹ thuật trong chuyến đi |
| **BK07** | V13 (Vios, HCM) | `renter1` | -7 đến -4 (4 ngày) | `Completed` | 2.800.000 đ<br>Cọc: 840.000 đ | Đủ 4 biên bản (Pickup + Return) | **Khiếu nại ĐÃ GIẢI QUYẾT (`ForceComplete`)**: Đối chiếu ảnh cấn trừ xước cản cũ | Phán quyết Staff can thiệp hoàn cọc đầy đủ cho khách thuê |
| **BK08** | V2 (Accent, HN) | `renter2` | -3 đến -1 (3 ngày) | `Cancelled` | 1.950.000 đ<br>Cọc: 585.000 đ | Chưa bàn giao | **Khiếu nại ĐÃ GIẢI QUYẾT (`CancelOwnerFault`)**: Phạt chủ xe **195.000 đ** (10%), hoàn cọc 100% | Phán quyết Admin xử phạt chủ xe bùng hẹn, kiểm thử khấu trừ phạt `PENALTY-...` |
| **BK09** | V14 (CX-30, HCM) | `renter1` | +4 đến +7 (4 ngày) | `Pending` | 3.700.000 đ<br>Cọc: 1.110.000 đ | Chưa bàn giao | Đơn mới gửi, còn **10 tiếng** phản hồi | Kiểm thử chủ xe duyệt / từ chối đơn đặt xe mới |
| **BK10** | V10 (City, ĐN) | `renter2` | +2 đến +4 (3 ngày) | `Pending` | 2.100.000 đ<br>Cọc: 630.000 đ | Chưa bàn giao | **Khẩn cấp: Chỉ còn 1 tiếng** trước khi hết hạn duyệt | Kiểm thử cảnh báo deadline duyệt đơn gấp cho chủ xe |
| **BK11** | V1 (Vios, HN) | `renter3` | +2 đến +5 (4 ngày) | `Accepted` | 3.000.000 đ<br>Cọc: 900.000 đ | Chưa đến hạn nhận xe | Chủ xe đã duyệt, tiền cọc đang được giữ an toàn (`Held`) | Kiểm thử quy trình chuẩn bị nhận xe & nút bàn giao xe |
| **BK12** | V4 (VF 8, HN) | `renter1` | +6 đến +9 (4 ngày) | `Cancelled` | 5.400.000 đ<br>Cọc: 1.620.000 đ | Đã hủy bởi khách | Khách dời lịch, tiền cọc đã hoàn trả (`REFUND-...`) | Kiểm thử hiển thị lịch sử hủy đơn từ phía khách thuê |
| **BK13** | V5 (Transit, HN) | `renter2` | +8 đến +11 (4 ngày) | `Rejected` | 6.200.000 đ<br>Cọc: 1.860.000 đ | Bị từ chối | Lý do: "Xe đã xếp lịch đưa đón đoàn du lịch ký hợp đồng dài hạn" | Kiểm thử hiển thị phản hồi từ chối của chủ xe |
| **BK14** | V15 (CR-V, HCM) | `renter3` | +5 đến +8 (4 ngày) | `Expired` | 5.000.000 đ<br>Cọc: 1.500.000 đ | Hết hạn duyệt | Quá 12 tiếng chủ xe không phản hồi, ký quỹ tự động giải tỏa | Kiểm thử xử lý đơn quá hạn phê duyệt |
| **BK15** | V14 (CX-30, HCM) | `renter4` | -20 đến -17 (4 ngày) | `Completed` | 3.600.000 đ<br>Cọc: 1.080.000 đ | Đủ 4 biên bản (Pickup + Return) | 2 Đánh giá 5★ công khai | Doanh thu hoàn tất tại TP. Hồ Chí Minh cho chủ xe 2 |

---

## 4. Lịch khóa xe thủ công của Chủ xe (`vehicle_unavailabilities`)

| Mã xe | Biển số | Chủ sở hữu | Thời gian khóa | Lý do khóa xe | Mục đích kiểm thử giao diện Lịch xe |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **V1** | `30A-123.45` | `owner1` | +14 đến +16 ngày | Bảo dưỡng định kỳ 40.000km và thay dầu máy | Kiểm thử ô ngày bị khóa trên Lịch xe (`#lich-xe-content`) và danh sách dải ngày đã khóa |
| **V3** | `30F-345.67` | `owner2` | +12 đến +15 ngày | Chủ xe đi công tác ngoại tỉnh | Kiểm thử tính năng chủ xe tự mở khóa ngày ("Mở khóa") |
| **V5** | `29A-567.89` | `owner3` | +18 đến +22 ngày | Đăng kiểm và bảo trì hệ thống lái | Kiểm thử chặn đặt xe trùng lịch bận trên trang `/find` |

---

## 5. Thống kê Doanh thu Chủ xe (`#doanh-thu-content`)

Sau khi dữ liệu mẫu được nạp, dashboard doanh thu của các chủ xe sẽ hiển thị chính xác các số liệu sau:
- **Chủ xe 1 (`owner1`):**
  - Tổng doanh thu (Gross): **9.800.000 đ** (BK01: 3.000.000 đ + BK03: 4.000.000 đ + BK07: 2.800.000 đ)
  - Phí dịch vụ sàn đã chi (Commission 10%): **980.000 đ**
  - Thực nhận ròng (Net Earnings): **8.820.000 đ**
  - Số chuyến hoàn tất: **3 chuyến**
- **Chủ xe 2 (`owner2`):**
  - Tổng doanh thu (Gross): **10.450.000 đ** (BK02: 3.550.000 đ + BK04: 3.300.000 đ + BK15: 3.600.000 đ)
  - Phí dịch vụ sàn đã chi (Commission 10%): **1.045.000 đ**
  - Thực nhận ròng (Net Earnings): **9.405.000 đ**
  - Số chuyến hoàn tất: **3 chuyến**
- Mỗi dòng trong bảng chuyến đi đã hoàn tất đều có liên kết trực tiếp `href="/booking/{id}"` giúp chủ xe dễ dàng xem biên bản bàn giao và sao kê tài chính chi tiết.
