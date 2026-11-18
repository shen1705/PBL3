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

## 3. Danh mục 30 kịch bản đơn thuê xe kiểm thử toàn diện (`bookings`)

Phân bổ đều đặn **10 đơn/tháng** qua 3 tháng trọng điểm: **Tháng 11/2026** (kèm đơn quá khứ & đang diễn ra), **Tháng 12/2026** (mùa cao điểm cuối năm), và **Tháng 01/2027** (Tết Dương lịch & cận Tết Nguyên Đán).

### 3.1. Bảng 10 đơn thuê Tháng 11/2026 (Mốc thời gian hiện tại: 18/11/2026)

| Mã đơn | Xe & Thành phố | Khách thuê | Thời gian | Trạng thái | Chi phí & Cọc (25%) | Bàn giao (Handovers) | Đánh giá & Tranh chấp | Mục đích kiểm thử tính năng |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **BK-NOV-01** | V1 (Vios, HN) | `renter1` | 01/11 - 04/11<br>(4 ngày) | `Completed` | Gốc: 2.800k · Giao: 100k · BH: 200k<br>**Tổng: 3.100.000 đ**<br>Cọc: 775.000 đ | Đủ 4 biên bản (Pickup + Return)<br>Odo: 18.200 $\rightarrow$ 18.650 km | 2 Đánh giá 5★ công khai (`IsPublic = true`) | Quyết toán doanh thu chuẩn (95% chủ xe, 5% sàn AZU) |
| **BK-NOV-02** | V3 (CX-5, HN) | `renter2` | 05/11 - 08/11<br>(4 ngày) | `Completed` | Gốc: 4.400k · BH: 200k<br>**Tổng: 4.600.000 đ**<br>Cọc: 1.150.000 đ | Đủ 4 biên bản<br>Odo: 12.100 $\rightarrow$ 12.480 km | **Đánh giá mù đôi (Double-Blind):** Khách đã review 5★ (`IsPublic = false`), Chủ xe **chưa** review | Kiểm thử cơ chế ẩn đánh giá chờ cả 2 bên cùng hoàn tất |
| **BK-NOV-03** | V7 (Cross, ĐN) | `renter3` | 03/11 - 06/11<br>(4 ngày) | `Completed` | Gốc: 3.800k · BH: 200k<br>**Tổng: 4.000.000 đ**<br>Cọc: 1.000.000 đ | Đủ 4 biên bản<br>Odo: 15.300 $\rightarrow$ 15.820 km | 2 Đánh giá 5★ công khai | Quyết toán doanh thu chuyến xe tại Đà Nẵng |
| **BK-NOV-04** | V9 (e34, ĐN) | `renter1` | 08/11 - 11/11<br>(4 ngày) | `Completed` | Gốc: 3.000k · Giao: 100k · BH: 200k<br>**Tổng: 3.300.000 đ**<br>Cọc: 825.000 đ | Đủ 4 biên bản<br>Mức pin: 100% $\rightarrow$ 90% | 2 Đánh giá 5★ công khai | Kiểm thử quy trình thuê xe điện VinFast |
| **BK-NOV-05** | V13 (Vios, HCM) | `renter2` | 10/11 - 13/11<br>(4 ngày) | `Completed` | Gốc: 2.600k · BH: 200k<br>**Tổng: 2.800.000 đ**<br>Cọc: 700.000 đ | Đủ 4 biên bản<br>Odo: 21.400 $\rightarrow$ 21.860 km | **Tranh chấp đã giải quyết (`ForceComplete`):** Cọ quẹt cản dưới, Admin hoàn cọc 100% cho khách | Kiểm thử Admin làm trọng tài phán quyết hoàn tất đơn |
| **BK-NOV-06** | V14 (CX-30, HCM) | `renter4` | 02/11 - 05/11<br>(4 ngày) | `Completed` | Gốc: 3.400k · BH: 200k<br>**Tổng: 3.600.000 đ**<br>Cọc: 900.000 đ | Đủ 4 biên bản<br>Odo: 10.500 $\rightarrow$ 10.920 km | 2 Đánh giá 5★ công khai | Kiểm thử lịch sử chuyến của renter4 trước án phạt |
| **BK-NOV-07** | V8 (Xpander, ĐN) | `renter2` | 17/11 - 20/11<br>(4 ngày) | `Ongoing` | Gốc: 3.400k · BH: 200k<br>**Tổng: 3.600.000 đ**<br>Cọc: 900.000 đ (Held) | Đã nhận xe hôm qua (17/11)<br>Odo nhận: 24.150 km | Đang lưu thông bình thường | Kiểm thử chuyến xe đang diễn ra & xác nhận trả xe |
| **BK-NOV-08** | V11 (Santa Fe, ĐN) | `renter3` | 16/11 - 19/11<br>(4 ngày) | `Ongoing` | Gốc: 5.600k · Giao: 100k · BH: 200k<br>**Tổng: 5.900.000 đ**<br>Cọc: 1.475.000 đ (Held) | Đã nhận xe (16/11)<br>Odo nhận: 38.500 km | **Khiếu nại ĐANG MỞ (`Open Dispute`):** Hỏng điều hòa, nổi đèn Check Engine | Kiểm thử Staff/Admin xử lý tranh chấp sự cố kỹ thuật |
| **BK-NOV-09** | V10 (City, ĐN) | `renter1` | 21/11 - 24/11<br>(4 ngày) | `Accepted` | Gốc: 2.600k · BH: 200k<br>**Tổng: 2.800.000 đ**<br>Cọc: 700.000 đ (Held) | Chưa bàn giao | Chờ đến ngày nhận xe | Kiểm thử chuyến sắp tới đã duyệt (Ready for pickup) |
| **BK-NOV-10** | V2 (Accent, HN) | `renter3` | 24/11 - 27/11<br>(4 ngày) | `Pending` | Gốc: 2.400k · BH: 200k<br>**Tổng: 2.600.000 đ**<br>Cọc: 650.000 đ (Held) | Chưa bàn giao | Chờ chủ xe phản hồi | Kiểm thử chủ xe duyệt/từ chối đơn mới đặt |

### 3.2. Bảng 10 đơn thuê Tháng 12/2026 (Mùa Giáng Sinh & Cao điểm cuối năm)

| Mã đơn | Xe & Thành phố | Khách thuê | Thời gian | Trạng thái | Chi phí & Cọc (25%) | Bàn giao (Handovers) | Ghi chú & Nghiệp vụ kiểm thử |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **BK-DEC-01** | V1 (Vios, HN) | `renter2` | 06/12 - 09/12 (4 ngày) | `Accepted` | Tổng: 3.000.000 đ · Cọc: 750.000 đ | Chưa bàn giao | Tránh lịch bảo dưỡng xe V1 từ 02/12 - 04/12 |
| **BK-DEC-02** | V4 (VF 8, HN) | `renter3` | 10/12 - 13/12 (4 ngày) | `Accepted` | Tổng: 5.500.000 đ · Cọc: 1.375.000 đ | Chưa bàn giao | Giao xe tận nơi, xe điện hạng sang |
| **BK-DEC-03** | V6 (Morning, HN) | `renter1` | 04/12 - 07/12 (4 ngày) | `Accepted` | Tổng: 2.000.000 đ · Cọc: 500.000 đ | Chưa bàn giao | Xe đô thị tiết kiệm 450k/ngày |
| **BK-DEC-04** | V7 (Cross, ĐN) | `renter2` | 12/12 - 16/12 (5 ngày) | `Accepted` | Tổng: 5.000.000 đ · Cọc: 1.250.000 đ | Chưa bàn giao | Du lịch miền Trung dịp cuối năm |
| **BK-DEC-05** | V9 (e34, ĐN) | `renter3` | 18/12 - 21/12 (4 ngày) | `Accepted` | Tổng: 3.200.000 đ · Cọc: 800.000 đ | Chưa bàn giao | Đặt xe điện VinFast tại Đà Nẵng |
| **BK-DEC-06** | V12 (Carnival, ĐN) | `renter1` | 24/12 - 27/12 (4 ngày) | `Accepted` | Tổng: 6.700.000 đ · Cọc: 1.675.000 đ | Chưa bàn giao | Thuê xe 7 chỗ hạng VIP dịp Giáng Sinh Noel |
| **BK-DEC-07** | V14 (CX-30, HCM) | `renter2` | 15/12 - 18/12 (4 ngày) | `Accepted` | Tổng: 3.600.000 đ · Cọc: 900.000 đ | Chưa bàn giao | Thuê xe phục vụ công việc tại TP. HCM |
| **BK-DEC-08** | V15 (CR-V, HCM) | `renter3` | 20/12 - 23/12 (4 ngày) | `Pending` | Tổng: 5.100.000 đ · Cọc: 1.275.000 đ | Chưa bàn giao | Đơn mới tạo tháng 12 chờ chủ xe duyệt |
| **BK-DEC-09** | V5 (Transit, HN) | `renter1` | 15/12 - 18/12 (4 ngày) | `Cancelled` | Tổng: 6.200.000 đ · Cọc: 1.550.000 đ | Đã hủy | **Khách tự hủy trước ngày đi**, hoàn cọc 100% |
| **BK-DEC-10** | V2 (Accent, HN) | `renter2` | 08/12 - 11/12 (4 ngày) | `Rejected` | Tổng: 2.600.000 đ · Cọc: 650.000 đ | Đã từ chối | **Chủ xe từ chối** do xe bận việc cuối năm |

### 3.3. Bảng 10 đơn thuê Tháng 01/2027 (Du xuân Tết Dương lịch & Chuẩn bị Tết Nguyên Đán)

| Mã đơn | Xe & Thành phố | Khách thuê | Thời gian | Trạng thái | Chi phí & Cọc (25%) | Bàn giao (Handovers) | Ghi chú & Nghiệp vụ kiểm thử |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **BK-JAN-01** | V1 (Vios, HN) | `renter1` | 01/01 - 04/01 (4 ngày) | `Accepted` | Tổng: 3.100.000 đ · Cọc: 775.000 đ | Chưa bàn giao | Thuê xe du xuân Tết Dương Lịch 2027 |
| **BK-JAN-02** | V3 (CX-5, HN) | `renter3` | 02/01 - 05/01 (4 ngày) | `Accepted` | Tổng: 4.600.000 đ · Cọc: 1.150.000 đ | Chưa bàn giao | Chuyến du lịch đầu năm tại Hà Nội |
| **BK-JAN-03** | V5 (Transit, HN) | `renter2` | 08/01 - 12/01 (5 ngày) | `Accepted` | Tổng: 7.750.000 đ · Cọc: 1.937.500 đ | Chưa bàn giao | Xe 16 chỗ phục vụ đoàn công tác đầu năm |
| **BK-JAN-04** | V8 (Xpander, ĐN) | `renter1` | 05/01 - 09/01 (5 ngày) | `Accepted` | Tổng: 4.500.000 đ · Cọc: 1.125.000 đ | Chưa bàn giao | Xe 7 chỗ gia đình du lịch Đà Nẵng |
| **BK-JAN-05** | V10 (City, ĐN) | `renter3` | 10/01 - 13/01 (4 ngày) | `Accepted` | Tổng: 2.800.000 đ · Cọc: 700.000 đ | Chưa bàn giao | Thuê xe tự lái nội thành |
| **BK-JAN-06** | V11 (Santa Fe, ĐN) | `renter2` | 15/01 - 19/01 (5 ngày) | `Accepted` | Tổng: 7.350.000 đ · Cọc: 1.837.500 đ | Chưa bàn giao | Xe SUV máy dầu giao tận nơi |
| **BK-JAN-07** | V13 (Vios, HCM) | `renter1` | 08/01 - 11/01 (4 ngày) | `Accepted` | Tổng: 2.800.000 đ · Cọc: 700.000 đ | Chưa bàn giao | Thuê xe tại TP. Hồ Chí Minh |
| **BK-JAN-08** | V14 (CX-30, HCM) | `renter3` | 12/01 - 15/01 (4 ngày) | `Accepted` | Tổng: 3.600.000 đ · Cọc: 900.000 đ | Chưa bàn giao | Chuyến đi công tác đầu năm |
| **BK-JAN-09** | V15 (CR-V, HCM) | `renter2` | 20/01 - 24/01 (5 ngày) | `Pending` | Tổng: 6.250.000 đ · Cọc: 1.562.500 đ | Chưa bàn giao | Đặt xe đi lễ chùa và chúc Tết đầu năm |
| **BK-JAN-10** | V4 (VF 8, HN) | `renter1` | 18/01 - 21/01 (4 ngày) | `Cancelled` | Tổng: 5.400.000 đ · Cọc: 1.350.000 đ | Đã hủy | **Kiểm thử phạt 8% do lỗi chủ xe (`CancelOwnerFault`):** Chủ xe hủy đơn đã duyệt $\rightarrow$ Hoàn 100% cọc (1.350k) cho khách, phạt 8% (432k) trừ tài khoản chủ xe |

---

## 4. Chi tiết Bảng Tài chính & Ký Quỹ Giao dịch Giả Lập (`payments`, `mock_bank_transactions`)

Hệ thống quản trị tài chính vận hành theo cơ chế ký quỹ Escrow bảo chứng trung gian:
- **Tiền cọc bảo chứng:** 25% tổng giá trị đơn thuê xe (`PriceLockedTotal * 0.25m`).
- **Phí hoa hồng sàn AZU Car:** 5% tổng giá trị hợp đồng (`PriceLockedTotal * 0.05m`).
- **Doanh thu ròng của Chủ xe:** 95% tổng giá trị hợp đồng (`PriceLockedTotal * 0.95m`).
- **Phạt vi phạm đơn phương hủy hợp đồng:** 8% tổng giá trị hợp đồng (`PriceLockedTotal * 0.08m`).
- Mỗi đơn thuê xe đều sinh giao dịch ngân hàng giả lập tương ứng trong `mock_bank_transactions` (`Deposit`, `Transfer`, `Refund`, `Penalty`) đảm bảo tính cân đối kế toán tuyệt đối giữa các tài khoản người dùng và tài khoản sàn `ESCROW-0001`.

---

## 5. Lịch khóa xe thủ công của Chủ xe (`vehicle_unavailabilities`)

| Mã xe | Biển số | Chủ sở hữu | Thời gian khóa | Lý do khóa xe | Mục đích kiểm thử giao diện Lịch xe |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **V1** | `30A-123.45` | `owner1` | +14 đến +16 ngày | Bảo dưỡng định kỳ 40.000km và thay dầu máy | Kiểm thử ô ngày bị khóa trên Lịch xe (`#lich-xe-content`) và danh sách dải ngày đã khóa |
| **V3** | `30F-345.67` | `owner2` | +12 đến +15 ngày | Chủ xe đi công tác ngoại tỉnh | Kiểm thử tính năng chủ xe tự mở khóa ngày ("Mở khóa") |
| **V5** | `29A-567.89` | `owner3` | +18 đến +22 ngày | Đăng kiểm và bảo trì hệ thống lái | Kiểm thử chặn đặt xe trùng lịch bận trên trang `/find` |

---

## 6. Thống kê Doanh thu Chủ xe (`#doanh-thu-content`)

Sau khi dữ liệu mẫu được nạp, dashboard doanh thu của các chủ xe sẽ hiển thị chính xác các số liệu thực tế từ cơ sở dữ liệu:
- **Chủ xe 1 (`owner1` - Phạm Quốc Dũng):**
  - Tổng doanh thu (Gross): **9.900.000 đ** (`BK-NOV-01`: 3.100.000 đ + `BK-NOV-03`: 4.000.000 đ + `BK-NOV-05`: 2.800.000 đ)
  - Phí dịch vụ sàn đã chi (Commission 5%): **495.000 đ**
  - Thực nhận ròng (Net Earnings 95%): **9.405.000 đ**
  - Số chuyến hoàn tất: **3 chuyến**
- **Chủ xe 2 (`owner2` - Hoàng Thị Em):**
  - Tổng doanh thu (Gross): **11.500.000 đ** (`BK-NOV-06`: 3.600.000 đ + `BK-NOV-02`: 4.600.000 đ + `BK-NOV-04`: 3.300.000 đ)
  - Phí dịch vụ sàn đã chi (Commission 5%): **575.000 đ**
  - Thực nhận ròng (Net Earnings 95%): **10.925.000 đ**
  - Số chuyến hoàn tất: **3 chuyến**
- **Chủ xe 3 (`owner3` - Võ Văn Phúc):**
  - Đang có chuyến `Ongoing` (`BK-NOV-08`: Santa Fe 5.900.000 đ, cọc 1.475.000 đ đang giữ trong Escrow) và các chuyến sắp tới (`Accepted`/`Pending`) trong tháng 12/2026 và tháng 01/2027.
- Mỗi dòng trong bảng chuyến đi đã hoàn tất đều có liên kết trực tiếp `href="/booking/{id}"` giúp chủ xe dễ dàng xem biên bản bàn giao và sao kê tài chính chi tiết.

---

## 7. Hướng dẫn Kịch bản Kiểm Thử Nhanh (Walkthrough Matrix)

1. **Kiểm thử Đăng nhập & Popup Topmost:**
   - Chưa đăng nhập, truy cập `/find` $\rightarrow$ chọn xe bất kỳ $\rightarrow$ bấm "CHỌN THUÊ" $\rightarrow$ Popup đăng nhập `#loginModal` hiển thị đè lên trên cùng (`z-index: 100200`).
   - Đăng nhập `renter1` / `Test@12345` $\rightarrow$ Popup tự đóng và quy trình chọn thuê tiếp tục trơn tru.

2. **Kiểm thử Quản lý Lịch xe & Mở khóa (Option 2):**
   - Đăng nhập `owner1` $\rightarrow$ truy cập `/owner` $\rightarrow$ chọn tab **"Lịch xe"**.
   - Chọn xe **Toyota Vios (30A-123.45)** $\rightarrow$ thấy dải ngày bảo dưỡng từ ngày 26/11 đến 28/11 trong mục *"Khoảng ngày đã chủ động khóa"*. Bấm nút **"Mở khóa"** $\rightarrow$ gọi API xóa thành công và lịch cập nhật lại ngay.

3. **Kiểm thử Doanh thu Chủ xe:**
   - Tại `/owner` của `owner1` $\rightarrow$ chọn tab **"Doanh thu"** $\rightarrow$ xác nhận tổng doanh thu hiển thị **9.900.000 đ**, hoa hồng sàn **495.000 đ**, thực nhận **9.405.000 đ**, 3 chuyến hoàn tất. Bấm vào mã đơn chuyến đi $\rightarrow$ chuyển hướng tới trang chi tiết `/booking/{id}`.

4. **Kiểm thử Đánh giá Mù (Double-Blind Review):**
   - Đăng nhập `owner2` $\rightarrow$ truy cập `/owner` $\rightarrow$ tab **"Chuyến của tôi"** (mục Đã hoàn thành).
   - Đơn **BK-NOV-02** (Mazda CX-5 với `renter2`) có nút **"Đánh giá khách thuê"**. Bấm vào để gửi đánh giá $\rightarrow$ sau khi gửi, đánh giá của cả khách và chủ xe cùng được công khai (`IsPublic = true`).

5. **Kiểm thử Giải quyết Khiếu nại Admin:**
   - Đăng nhập `staff1` $\rightarrow$ truy cập `/admin/index.html#disputes` (hoặc `/admin/disputes.html`) $\rightarrow$ xem khiếu nại đang mở của đơn **BK-NOV-08** (hỏng điều hòa xe Santa Fe V11) kèm ảnh bằng chứng `/seed/dispute-evidence-1.jpg`.
   - Xem khiếu nại đã giải quyết của **BK-NOV-05** (`ForceComplete` hoàn 100% cọc cho khách) và **BK-JAN-10** (`CancelOwnerFault` phạt chủ xe 8% tương ứng 432.000 đ).

6. **Kiểm thử Cổng Quản Trị Toàn Nền Tảng (Admin Portal Real API):**
   - Đăng nhập `admin1` / `Test@12345` $\rightarrow$ truy cập `/admin/index.html`:
     - **Tổng quan (`#overview`):** Hiển thị đúng số liệu thực tế từ database: 12 người dùng chuẩn, 30 đơn thuê, 20 xe/tin đăng, số ca tranh chấp.
     - **Người dùng (`#users`):** Danh sách 12 tài khoản chuẩn hệ thống, phân quyền, kiểm tra án phạt (`renter4` bị khóa 7 ngày), tính năng khóa/mở khóa tài khoản.
     - **Chủ xe (`#owners`):** Danh sách 4 chủ xe (`owner1`-`owner4`), xem ảnh CCCD mặt trước/sau, duyệt chủ xe mới (`owner4`).
     - **Tin đăng (`#listings`):** Danh sách 20 xe/tin đăng, duyệt tin đăng mới (`V18` Hyundai Tucson, `V19` Ford Everest đang ở trạng thái `PendingApproval`).
     - **Tranh chấp (`#disputes`):** Xem ca khiếu nại đang mở (`BK-NOV-08`) và bấm phán quyết giải quyết.
     - **Biểu phí (`#fees`):** Xem và cấu hình tỷ lệ hoa hồng sàn (mặc định 5%), tỷ lệ cọc (25%), phạt hủy đơn (8%).
     - **Doanh thu (`#revenue`):** Thống kê tổng doanh thu thực tế toàn sàn, tiền cọc đang ký quỹ trong Escrow, tổng hoa hồng sàn thu được.
