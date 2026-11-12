# Bảng Dữ Liệu Mẫu Hệ Thống (Seed Data Reference)

Tất cả dữ liệu mẫu được khởi tạo tự động trong môi trường Development thông qua [`DbInitializer.SeedAsync`](file:///C:/Users/admin/documents/pbl3/pbl3/src/CarRental.Data/DbInitializer.cs).  
- **Mật khẩu mặc định:** **`Test@12345`** áp dụng cho tất cả tài khoản trong hệ thống.
- **Phương thức đăng nhập:** Có thể sử dụng **Username**, **Email** hoặc **Số điện thoại**.
- **Cơ chế chặn tài khoản vi phạm:** Tài khoản `renter4` đang chịu án phạt (`Suspend7d`), hệ thống sẽ từ chối đăng nhập và hiển thị lý do cụ thể kèm thời hạn án phạt.
- **Quy tắc chuẩn hóa bóc tách giá tiền (Pricing Engine):**
  - $\text{Số ngày thuê (RentalDays)} = (\text{EndDate.Date} - \text{StartDate.Date}).\text{Days} + 1$ (tính đủ ngày nhận và ngày trả xe).
  - $\text{Tiền thuê gốc (RentalSubtotal)} = \text{Giá thuê/ngày (PricePerDay)} \times \text{RentalDays}$.
  - $\text{Phí bảo hiểm chuyến đi (InsuranceFee)} = 50.000\,\text{đ} \times \text{RentalDays}$.
  - $\text{Phí giao xe tận nơi (DeliveryFee)} = 100.000\,\text{đ}$ (nếu chọn phương thức `delivery`) hoặc $0\,\text{đ}$ (tự nhận xe tại địa chỉ chủ xe).
  - $\text{Tổng giá trị hợp đồng (PriceLockedTotal)} = \text{RentalSubtotal} + \text{InsuranceFee} + \text{DeliveryFee}$.
  - $\text{Tiền đặt cọc giữ chỗ (DepositAmount)} = 30\% \times \text{PriceLockedTotal}$ (`BusinessRules.DepositRate = 0.30m`).
  - $\text{Phí hoa hồng dịch vụ sàn (CommissionAmount)} = 10\% \times \text{PriceLockedTotal}$ (`BusinessRules.DefaultCommissionRate = 0.10m`).
  - $\text{Thu nhập ròng chủ xe (NetEarnings)} = \text{PriceLockedTotal} - \text{CommissionAmount}$.

---

## 1. Danh sách tài khoản người dùng (`users`, `roles`, `claims`)

| Username | Họ và tên | Số điện thoại | Email | Vai trò (`Roles`) | Giấy tờ / Trạng thái đặc biệt | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `renter1` | Nguyễn Văn An | `0900000001` | `renter1@carrental.test` | Renter | GPLX Hạng B2 Đã duyệt | Khách thuê thường, có đơn hoàn tất, đơn đang thuê, đơn đã hủy |
| `renter2` | Trần Thị Bình | `0900000002` | `renter2@carrental.test` | Renter | GPLX Hạng B2 Đã duyệt | Khách thuê có đơn chờ duyệt gấp (1h), đơn đang đi, đơn được hoàn cọc do chủ xe vi phạm |
| `renter3` | Lê Minh Cường | `0900000003` | `renter3@carrental.test` | Renter | GPLX Hạng B2 Đã duyệt | Khách thuê có đơn Ongoing gặp sự cố hỏng điều hòa (`Open Dispute`), đơn quá hạn |
| `renter4` | Đỗ Thị Mai | `0900000011` | `renter4@carrental.test` | Renter | GPLX Hạng B2 · **Bị phạt (Suspend7d)** | Kiểm thử chặn truy cập tài khoản vi phạm bị tạm khóa 7 ngày |
| `owner1` | Phạm Quốc Dũng | `0900000004` | `owner1@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe Hà Nội & Đà Nẵng (V1, V2, V7, V8, V13). Doanh thu 3 chuyến hoàn tất (9.800.000 đ) |
| `owner2` | Hoàng Thị Em | `0900000005` | `owner2@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe điện & Crossover (V3, V4, V9, V10, V14). Doanh thu 3 chuyến hoàn tất (10.450.000 đ) |
| `owner3` | Võ Văn Phúc | `0900000006` | `owner3@carrental.test` | Renter, Owner | CCCD Đã duyệt · Tài khoản Active | Chủ xe du lịch 7 - 16 chỗ (V5, V6, V11, V12, V15). Có đơn xe V11 gặp sự cố khiếu nại mở |
| `owner4` | Lê Hoàng Duy | `0900000012` | `owner4@carrental.test` | Renter, Owner | CCCD **Chờ duyệt (Pending)** · Inactive | Kiểm thử quy trình Staff/Admin xét duyệt chủ xe mới |
| `staff1` | Đặng Thu Hà | `0900000007` | `staff1@carrental.test` | Staff, Admin | Nhân viên vận hành (Staff) | Kiểm thử duyệt hồ sơ, xử lý khiếu nại (`ForceComplete`), duyệt tin xe |
| `staff2` | Bùi Văn Khoa | `0900000008` | `staff2@carrental.test` | Staff | Nhân viên hỗ trợ (Staff) | Kiểm thử nghiệp vụ đối soát tài chính |
| `admin1` | Quản trị Một | `0900000009` | `admin1@carrental.test` | Admin | Quyền: `CanManageSystemConfig`, `CanManageAdminAccounts` | Quản trị viên cấp cao, xử lý án phạt chủ xe vi phạm (`CancelOwnerFault`) |
| `admin2` | Quản trị Hai | `0900000010` | `admin2@carrental.test` | Admin | Quyền: `CanManageSystemConfig`, `CanManageAdminAccounts` | Quản trị viên dự phòng |

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

| Đơn | Xe & Thành phố | Khách thuê | Thời gian | Trạng thái | Bóc tách chi phí & Tiền cọc (30%) | Bàn giao (Handovers) | Đánh giá / Tranh chấp & Chế tài | Nghiệp vụ kiểm thử |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **BK01** | V1 (Vios, HN) | `renter1` | -12 đến -9<br>(4 ngày) | `Completed` | Gốc: 2.800.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 3.000.000 đ**<br>Cọc: 900.000 đ | Đủ 4 biên bản (Pickup + Return)<br>Odo: 18.200 $\rightarrow$ 18.650 km | 2 Đánh giá 5★ công khai (`IsPublic = true`) | Luồng hoàn tất chuẩn, quyết toán doanh thu chủ xe 1 |
| **BK02** | V3 (CX-5, HN) | `renter2` | -4 đến -2<br>(3 ngày) | `Completed` | Gốc: 3.300.000 đ<br>Giao xe: 100.000 đ · BH: 150.000 đ<br>**Tổng: 3.550.000 đ**<br>Cọc: 1.065.000 đ | Đủ 4 biên bản (giao tận nơi)<br>Odo: 12.100 $\rightarrow$ 12.480 km | Khách đã đánh giá 5★ (`IsPublic = false`). Chủ xe **chưa** đánh giá | **Đánh giá mù (Double-Blind)**: Test nút đánh giá chủ xe & hiển thị sau khi cả 2 đánh giá |
| **BK03** | V7 (Cross, ĐN) | `renter3` | -15 đến -12<br>(4 ngày) | `Completed` | Gốc: 3.800.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 4.000.000 đ**<br>Cọc: 1.200.000 đ | Đủ 4 biên bản (Pickup + Return)<br>Odo: 15.300 $\rightarrow$ 15.820 km | 2 Đánh giá 5★ công khai | Quyết toán doanh thu chuyến xe tại Đà Nẵng |
| **BK04** | V9 (e34, ĐN) | `renter1` | -8 đến -5<br>(4 ngày) | `Completed` | Gốc: 3.000.000 đ<br>Giao xe: 100.000 đ · BH: 200.000 đ<br>**Tổng: 3.300.000 đ**<br>Cọc: 990.000 đ | Đủ 4 biên bản (giao tận nơi)<br>Odo: 9.200 $\rightarrow$ 9.650 km | 2 Đánh giá 5★ công khai | Xe điện VinFast, quyết toán doanh thu chủ xe 2 |
| **BK05** | V8 (Xpander, ĐN) | `renter2` | -1 đến +2<br>(4 ngày) | `Ongoing` | Gốc: 3.400.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 3.600.000 đ**<br>Cọc: 1.080.000 đ (Held) | Đã nhận xe hôm qua<br>Odo nhận: 24.150 km | Đang lưu thông bình thường | Kiểm thử chuyến đi đang diễn ra & xác nhận trả xe |
| **BK06** | V11 (Santa Fe, ĐN) | `renter3` | -2 đến +1<br>(4 ngày) | `Ongoing` | Gốc: 5.600.000 đ<br>Giao xe: 100.000 đ · BH: 200.000 đ<br>**Tổng: 5.900.000 đ**<br>Cọc: 1.770.000 đ (Held) | Đã nhận xe<br>Odo nhận: 38.500 km | **Khiếu nại ĐANG MỞ (`Open Dispute`)**: Hỏng điều hòa giữa trưa 38°C, nổi đèn Check Engine | Kiểm thử Staff/Admin xử lý tranh chấp sự cố kỹ thuật trong chuyến đi |
| **BK07** | V13 (Vios, HCM) | `renter1` | -7 đến -4<br>(4 ngày) | `Completed` | Gốc: 2.600.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 2.800.000 đ**<br>Cọc: 840.000 đ | Đủ 4 biên bản (Pickup + Return)<br>Odo: 21.400 $\rightarrow$ 21.860 km | **Khiếu nại ĐÃ GIẢI QUYẾT (`ForceComplete`)**: Đối chiếu ảnh cấn trừ xước cản cũ | Phán quyết Staff can thiệp hoàn cọc đầy đủ cho khách thuê |
| **BK08** | V2 (Accent, HN) | `renter2` | -3 đến -1<br>(3 ngày) | `Cancelled` | Gốc: 1.800.000 đ<br>Giao xe: 0 đ · BH: 150.000 đ<br>**Tổng: 1.950.000 đ**<br>Cọc: 585.000 đ | Chưa bàn giao | **Khiếu nại ĐÃ GIẢI QUYẾT (`CancelOwnerFault`)**: Phạt chủ xe **195.000 đ** (10%), hoàn cọc 100% | Phán quyết Admin xử phạt chủ xe bùng hẹn, kiểm thử khấu trừ phạt `PENALTY-8` |
| **BK09** | V14 (CX-30, HCM) | `renter1` | +4 đến +7<br>(4 ngày) | `Pending` | Gốc: 3.400.000 đ<br>Giao xe: 100.000 đ · BH: 200.000 đ<br>**Tổng: 3.700.000 đ**<br>Cọc: 1.110.000 đ | Chưa bàn giao | Đơn mới gửi, còn **10 tiếng** phản hồi | Kiểm thử chủ xe duyệt / từ chối đơn đặt xe mới |
| **BK10** | V10 (City, ĐN) | `renter2` | +2 đến +4<br>(3 ngày) | `Pending` | Gốc: 1.950.000 đ<br>Giao xe: 0 đ · BH: 150.000 đ<br>**Tổng: 2.100.000 đ**<br>Cọc: 630.000 đ | Chưa bàn giao | **Khẩn cấp: Chỉ còn 1 tiếng** trước khi hết hạn duyệt | Kiểm thử cảnh báo deadline duyệt đơn gấp cho chủ xe |
| **BK11** | V1 (Vios, HN) | `renter3` | +2 đến +5<br>(4 ngày) | `Accepted` | Gốc: 2.800.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 3.000.000 đ**<br>Cọc: 900.000 đ (Held) | Chưa đến hạn nhận xe | Chủ xe đã duyệt, tiền cọc đang được giữ an toàn (`Held`) | Kiểm thử quy trình chuẩn bị nhận xe & nút bàn giao xe |
| **BK12** | V4 (VF 8, HN) | `renter1` | +6 đến +9<br>(4 ngày) | `Cancelled` | Gốc: 5.200.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 5.400.000 đ**<br>Cọc: 1.620.000 đ | Đã hủy bởi khách | Khách dời lịch, tiền cọc đã hoàn trả (`REFUND-12`) | Kiểm thử hiển thị lịch sử hủy đơn từ phía khách thuê |
| **BK13** | V5 (Transit, HN) | `renter2` | +8 đến +11<br>(4 ngày) | `Rejected` | Gốc: 6.000.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 6.200.000 đ**<br>Cọc: 1.860.000 đ | Bị từ chối | Lý do: "Xe đã xếp lịch đưa đón đoàn du lịch ký hợp đồng dài hạn" | Kiểm thử hiển thị phản hồi từ chối của chủ xe |
| **BK14** | V15 (CR-V, HCM) | `renter3` | +5 đến +8<br>(4 ngày) | `Expired` | Gốc: 4.800.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 5.000.000 đ**<br>Cọc: 1.500.000 đ | Hết hạn duyệt | Quá 12 tiếng chủ xe không phản hồi, ký quỹ tự động giải tỏa | Kiểm thử xử lý đơn quá hạn phê duyệt |
| **BK15** | V14 (CX-30, HCM) | `renter4` | -20 đến -17<br>(4 ngày) | `Completed` | Gốc: 3.400.000 đ<br>Giao xe: 0 đ · BH: 200.000 đ<br>**Tổng: 3.600.000 đ**<br>Cọc: 1.080.000 đ | Đủ 4 biên bản (Pickup + Return)<br>Odo: 10.500 $\rightarrow$ 10.920 km | 2 Đánh giá 5★ công khai | Doanh thu hoàn tất tại TP. Hồ Chí Minh cho chủ xe 2 |

---

## 4. Chi tiết Bảng Tài chính & Ký Quỹ Giao dịch Giả Lập (`payments`, `mock_bank_transactions`)

Hệ thống mô phỏng dòng tiền ký quỹ qua Ngân hàng mô phỏng:
- **Tài khoản Ký quỹ Sàn:** `ESCROW-0001`
- **Tài khoản Khách thuê:** `MOCK-RENTER1`, `MOCK-RENTER2`, `MOCK-RENTER3`, `MOCK-RENTER4`
- **Tài khoản Chủ xe:** `MOCK-OWNER1`, `MOCK-OWNER2`, `MOCK-OWNER3`, `MOCK-OWNER4`

| Đơn | Loại giao dịch | Mã tham chiếu | Tài khoản Nguồn $\rightarrow$ Đích | Số tiền (VNĐ) | Trạng thái | Diễn giải |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **BK01** | `Deposit` | `DEPOSIT-1` | `MOCK-RENTER1` $\rightarrow$ `ESCROW-0001` | 900.000 đ | `Succeeded` | Khách thanh toán cọc khi tạo đơn |
| | `Transfer` | `SETTLE-1` | `ESCROW-0001` $\rightarrow$ `MOCK-OWNER1` | 2.700.000 đ | `Succeeded` | Sàn quyết toán doanh thu ròng (đã trừ 10% hoa hồng) |
| | `Refund` | `REFUND-1` | `ESCROW-0001` $\rightarrow$ `MOCK-RENTER1` | 900.000 đ | `Succeeded` | Hoàn cọc 100% cho khách sau khi trả xe |
| **BK02** | `Deposit` | `DEPOSIT-2` | `MOCK-RENTER2` $\rightarrow$ `ESCROW-0001` | 1.065.000 đ | `Succeeded` | Cọc 30% chuyến CX-5 |
| | `Transfer` | `SETTLE-2` | `ESCROW-0001` $\rightarrow$ `MOCK-OWNER2` | 3.195.000 đ | `Succeeded` | Quyết toán doanh thu ròng (3.550.000 - 355.000 hoa hồng) |
| | `Refund` | `REFUND-2` | `ESCROW-0001` $\rightarrow$ `MOCK-RENTER2` | 1.065.000 đ | `Succeeded` | Hoàn cọc cho khách |
| **BK06** | `Deposit` | `DEPOSIT-6` | `MOCK-RENTER3` $\rightarrow$ `ESCROW-0001` | 1.770.000 đ | `Succeeded` | Tiền cọc đang được giữ an toàn tại tài khoản Escrow trong khi có tranh chấp mở |
| **BK08** | `Deposit` | `DEPOSIT-8` | `MOCK-RENTER2` $\rightarrow$ `ESCROW-0001` | 585.000 đ | `Succeeded` | Tiền cọc ban đầu của khách |
| | `Refund` | `REFUND-8` | `ESCROW-0001` $\rightarrow$ `MOCK-RENTER2` | 585.000 đ | `Succeeded` | Admin phán quyết hoàn tiền cọc 100% cho khách |
| | `Penalty` | `PENALTY-8` | `MOCK-OWNER1` $\rightarrow$ `ESCROW-0001` | 195.000 đ | `Succeeded` | Khấu trừ tiền phạt vi phạm hợp đồng (10%) từ chủ xe |
| **BK12** | `Deposit` | `DEPOSIT-12` | `MOCK-RENTER1` $\rightarrow$ `ESCROW-0001` | 1.620.000 đ | `Succeeded` | Tiền cọc ban đầu |
| | `Refund` | `REFUND-12` | `ESCROW-0001` $\rightarrow$ `MOCK-RENTER1` | 1.620.000 đ | `Succeeded` | Khách chủ động hủy đơn trước ngày đi, hoàn cọc đầy đủ |

---

## 5. Lịch khóa xe thủ công của Chủ xe (`vehicle_unavailabilities`)

| Mã xe | Biển số | Chủ sở hữu | Thời gian khóa | Lý do khóa xe | Mục đích kiểm thử giao diện Lịch xe |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **V1** | `30A-123.45` | `owner1` | +14 đến +16 ngày | Bảo dưỡng định kỳ 40.000km và thay dầu máy | Kiểm thử ô ngày bị khóa trên Lịch xe (`#lich-xe-content`) và danh sách dải ngày đã khóa |
| **V3** | `30F-345.67` | `owner2` | +12 đến +15 ngày | Chủ xe đi công tác ngoại tỉnh | Kiểm thử tính năng chủ xe tự mở khóa ngày ("Mở khóa") |
| **V5** | `29A-567.89` | `owner3` | +18 đến +22 ngày | Đăng kiểm và bảo trì hệ thống lái | Kiểm thử chặn đặt xe trùng lịch bận trên trang `/find` |

---

## 6. Thống kê Doanh thu Chủ xe (`#doanh-thu-content`)

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

---

## 7. Hướng dẫn Kịch bản Kiểm Thử Nhanh (Walkthrough Matrix)

1. **Kiểm thử Đăng nhập & Popup Topmost:**
   - Chưa đăng nhập, truy cập `/find` $\rightarrow$ chọn xe bất kỳ $\rightarrow$ bấm "CHỌN THUÊ" $\rightarrow$ Popup đăng nhập `#loginModal` hiển thị đè lên trên cùng (`z-index: 100200`).
   - Đăng nhập `renter1` / `Test@12345` $\rightarrow$ Popup tự đóng và quy trình chọn thuê tiếp tục trơn tru.

2. **Kiểm thử Quản lý Lịch xe & Mở khóa (Option 2):**
   - Đăng nhập `owner1` $\rightarrow$ truy cập `/owner` $\rightarrow$ chọn tab **"Lịch xe"**.
   - Chọn xe **Toyota Vios (30A-123.45)** $\rightarrow$ thấy dải ngày bảo dưỡng từ ngày +14 đến +16 trong mục *"Khoảng ngày đã chủ động khóa"*. Bấm nút **"Mở khóa"** $\rightarrow$ gọi API xóa thành công và lịch cập nhật lại ngay.

3. **Kiểm thử Doanh thu Chủ xe:**
   - Tại `/owner` của `owner1` $\rightarrow$ chọn tab **"Doanh thu"** $\rightarrow$ xác nhận tổng doanh thu hiển thị **9.800.000 đ**, thực nhận **8.820.000 đ**, 3 chuyến hoàn tất. Bấm vào mã đơn chuyến đi $\rightarrow$ chuyển hướng tới trang chi tiết `/booking/{id}`.

4. **Kiểm thử Đánh giá Mù (Double-Blind Review):**
   - Đăng nhập `owner2` $\rightarrow$ truy cập `/owner` $\rightarrow$ tab **"Chuyến của tôi"** (mục Đã hoàn thành).
   - Đơn **BK02** (Mazda CX-5 với `renter2`) có nút **"Đánh giá khách thuê"**. Bấm vào để gửi đánh giá $\rightarrow$ sau khi gửi, đánh giá của cả khách và chủ xe cùng được công khai (`IsPublic = true`).

5. **Kiểm thử Giải quyết Khiếu nại Admin:**
   - Đăng nhập `staff1` $\rightarrow$ truy cập `/admin/disputes.html` $\rightarrow$ xem khiếu nại đang mở của đơn **BK06** (hỏng điều hòa xe Santa Fe V11) kèm ảnh bằng chứng `/seed/dispute-evidence-1.jpg`.
   - Xem khiếu nại đã giải quyết của **BK07** (`ForceComplete`) và **BK08** (`CancelOwnerFault` phạt chủ xe 195.000 đ).
