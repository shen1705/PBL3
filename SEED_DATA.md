# Bảng Dữ Liệu Mẫu Hệ Thống (Seed Data Reference)

Tất cả dữ liệu mẫu được khởi tạo tự động trong môi trường Development thông qua [`DbInitializer.SeedAsync`](file:///C:/Users/admin/documents/PBL3/PBL3/src/CarRental.Data/DbInitializer.cs).  
Mật khẩu mặc định cho tất cả tài khoản thử nghiệm: **`Test@12345`**

---

## 1. Danh sách tài khoản người dùng (`users`, `roles`, `claims`)

| Username | Họ và tên | Email | Vai trò (`Roles`) | Giấy tờ / Trạng thái đặc biệt | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `renter1` | Nguyễn Văn An | `renter1@carrental.test` | Renter | GPLX Hạng B2 | Khách thuê thường, có đơn đã hoàn thành và đơn đang thuê |
| `renter2` | Trần Thị Bình | `renter2@carrental.test` | Renter | GPLX Hạng B2 | Khách thuê thường, có đơn chờ duyệt |
| `renter3` | Lê Minh Cường | `renter3@carrental.test` | Renter | GPLX Hạng B2 | Khách thuê đã có đánh giá và khiếu nại đã giải quyết |
| `renter4` | Đỗ Thị Mai | `renter4@carrental.test` | Renter | GPLX Hạng B2 · **Bị phạt (Suspend7d)** | Kiểm thử chặn truy cập tài khoản vi phạm bị tạm khóa |
| `owner1` | Phạm Quốc Dũng | `owner1@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe cá nhân tại Hà Nội & Đà Nẵng |
| `owner2` | Hoàng Thị Em | `owner2@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe điện & xe crossover |
| `owner3` | Võ Văn Phúc | `owner3@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe du lịch 7 - 16 chỗ |
| `owner4` | Lê Hoàng Duy | `owner4@carrental.test` | Renter, Owner | CCCD **Chờ duyệt (Pending)** · Inactive | Kiểm thử quy trình Staff/Admin xét duyệt chủ xe |
| `staff1` | Đặng Thu Hà | `staff1@carrental.test` | Admin | Nhân viên vận hành (Staff) | Kiểm thử duyệt hồ sơ, xử lý tranh chấp, duyệt tin xe |
| `staff2` | Bùi Văn Khoa | `staff2@carrental.test` | Admin | Nhân viên hỗ trợ (Staff) | Kiểm thử nghiệp vụ đối soát |
| `admin1` | Quản trị Một | `admin1@carrental.test` | Admin | Quyền: `CanManageSystemConfig`, `CanManageAdminAccounts` | Quản trị viên cấp cao |
| `admin2` | Quản trị Hai | `admin2@carrental.test` | Admin | Quyền: `CanManageSystemConfig`, `CanManageAdminAccounts` | Quản trị viên cấp cao |

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

---

## 3. Danh sách đơn thuê xe (`bookings`)

| Đơn số | Xe | Khách thuê | Thời gian tương đối | Trạng thái | Tiền cọc (25%) | Bàn giao (Handover) | Đánh giá / Tranh chấp |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| 1 | V1 (Toyota Vios) | `renter1` | +3 đến +6 ngày | `Accepted` | 525.000 đ | Chưa đến hạn | — |
| 2 | V1 (Toyota Vios) | `renter2` | +10 đến +12 ngày | `Pending` | 350.000 đ | Chưa duyệt | — |
| 3 | V1 (Toyota Vios) | `renter3` | -10 đến -7 ngày | `Completed` | 525.000 đ | Đủ 2 chiều (Pickup + Return) | 2 Đánh giá 5★ |
| 4 | V2 (Hyundai Accent) | `renter1` | +3 đến +6 ngày | `Cancelled` | 450.000 đ | Đã hủy bởi khách | 1 Tranh chấp `Open` |
| 5 | V2 (Hyundai Accent) | `renter2` | -5 đến -3 ngày | `Expired` | 300.000 đ | Hết hạn duyệt | — |
| 6 | V2 (Hyundai Accent) | `renter3` | +12 đến +14 ngày | `Rejected` | 300.000 đ | Chủ xe từ chối | — |
| 7 | V3 (Mazda CX-5) | `renter1` | -1 đến +2 ngày | `Ongoing` | 825.000 đ | Đã nhận xe (Pickup) | Đang trên đường |
| 8 | V3 (Mazda CX-5) | `renter2` | +2 đến +4 ngày | `Accepted` | 550.000 đ | Chưa đến hạn | Nối đuôi đơn V3 |
| 9 | V5 (Ford Transit) | `renter3` | +7 đến +9 ngày | `Accepted` | 750.000 đ | Chưa đến hạn | — |
| 10 | V7 (Corolla Cross Đà Nẵng) | `renter1` | -15 đến -12 ngày | `Completed` | 712.500 đ | Đủ 2 chiều (Pickup + Return) | 2 Đánh giá 5★ |
| 11 | V8 (Xpander Đà Nẵng) | `renter2` | +1 đến +5 ngày | `Accepted` | 850.000 đ | Chưa đến hạn | — |
| 12 | V9 (VF e34 Đà Nẵng) | `renter3` | -4 đến -1 ngày | `Completed` | 562.500 đ | Đủ 2 chiều (Pickup + Return) | 1 Tranh chấp `Resolved` |

---

## 4. Bàn giao, Thanh toán, Đánh giá & Khiếu nại mẫu

| Nghiệp vụ | Bảng liên quan | Chi tiết dữ liệu mẫu |
| :--- | :--- | :--- |
| **Bàn giao xe** | `handover_confirmations` | Xác nhận nhận xe (Pickup) và trả xe (Return) kèm timestamp cho các đơn `Completed` và `Ongoing`. |
| **Thanh toán & Ký quỹ** | `payments`, `mock_bank_transactions` | Tài khoản Escrow `ESCROW-0001`, đối soát chi trả chủ xe sau khi khấu trừ 5% hoa hồng (`SETTLE-...`), đặt cọc (`DEPOSIT-...`), và hoàn cọc (`REFUND-...`). |
| **Đánh giá 2 chiều** | `reviews` | Đánh giá 5 sao từ khách thuê về chất lượng xe và từ chủ xe về ý thức giữ gìn xe sau khi hoàn tất chuyến. |
| **Khiếu nại tranh chấp** | `disputes` | • 1 khiếu nại đang mở (`Open`) do chủ xe trễ hẹn giao xe.<br>• 1 khiếu nại đã giải quyết (`Resolved`) do Staff xác minh ảnh cấn trừ cọc không hợp lệ (`ForceComplete`). |
| **Xử phạt vi phạm** | `account_sanction` | `renter4` bị khóa tạm thời 7 ngày do vi phạm quy định nền tảng. |
| **Khóa lịch chủ xe** | `vehicle_unavailability` | Chủ xe V5 khóa lịch từ ngày +15 đến +20 để bảo dưỡng định kỳ. |
