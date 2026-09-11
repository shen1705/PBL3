---
title: "PBL — Quy tắc thuê xe"
project: PBL3
category: documents
type: specification
status: working
updated: 2026-09-09
tags: [project/pbl, type/specification]
---

# PBL — Quy tắc thuê xe

Đây là các quy tắc nghiệp vụ đã chốt cho hệ thống web trung gian cho thuê ô tô PBL3. Các đặc tả chức năng dùng chung quy tắc tại đây.

## 1. Người sử dụng

- **Người thuê** (`Renter`): tìm xe và đặt thuê.
- **Chủ xe** (`Owner`): đăng xe, duyệt đơn và bàn giao xe. Quyền chủ xe được bổ sung vào tài khoản người thuê sau khi được duyệt đơn đăng kí.
- **Nhân viên** (`Staff`): quản lý người thuê, chủ xe và tin đăng; không được thay đổi tài khoản nhân viên hoặc quản trị viên.
- **Quản trị viên** (`Admin`): có toàn quyền quản trị, gồm quản lý nhân viên, quản trị viên khác và cấu hình hoa hồng.

**Staff** và **Admin** dùng chung vai trò `Admin` trong ASP.NET Core Identity; quyền chi tiết được phân biệt bằng claims. Chi tiết kỹ thuật ở [PBL design notes](../architecture/technical-notes.md).

## 2. Quy trình thuê xe

1. Người thuê chọn xe và thời gian thuê. Hệ thống kiểm tra lịch, hiển thị giá và số tiền cọc.
2. Người thuê đặt cọc trực tuyến qua mô phỏng. Khi cọc thành công, đơn chuyển sang **Chờ duyệt** (`Pending`) và giữ lịch xe.
3. Chủ xe có **1-2 ngày** để duyệt hoặc từ chối. Nếu duyệt, đơn chuyển sang **Đã duyệt** (`Approved`). Nếu hết thời hạn mà chưa phản hồi, đơn chuyển sang **Hết hạn** (`Expired`) và lịch được giải phóng. 
4. Hai bên thực hiện bàn giao đầu chuyến, có ảnh và thời điểm xác nhận. Khi hoàn tất bàn giao, đơn chuyển sang **Đang thuê** (`InRental`).
5. Khi kết thúc chuyến, **cả người thuê và chủ xe phải xác nhận trả xe**. Nếu mới một bên xác nhận, hệ thống lưu tiến độ và giữ trạng thái `InRental`. Khi đủ hai xác nhận, đơn chuyển sang **Đã trả xe** (`Returned`).
6. Đơn chỉ chuyển sang **Hoàn tất** (`Completed`) sau khi đã trả xe và không còn vấn đề phát sinh, gồm khiếu nại đang mở. Đây là thời điểm ghi nhận doanh thu và cho phép đánh giá.

Chuỗi trạng thái chính: `Pending → Approved → InRental → Returned → Completed`. Đơn bị hủy dùng `Cancelled`; đơn hết thời gian chờ duyệt dùng `Expired`. Trạng thái thanh toán `Paid` được lưu riêng, không phải một bước trong chuỗi trạng thái đơn thuê.

Chủ xe có quyền từ chối đơn. Cách lưu trạng thái cho trường hợp này và cách xử lý cọc khi từ chối, hủy hoặc hết hạn được tập trung tại [PBL - Review Guide](open-decisions.md).
## 3. Giữ lịch và giá thuê

- Đơn `Pending` đã đặt cọc giữ lịch ngay. Hệ thống kiểm tra lại lịch khi tạo đơn và khi duyệt; không cho hai đơn cùng xe, trùng thời gian được duyệt song song.
- Khi hết hạn chờ duyệt, giải phóng lịch. Việc hủy hoặc từ chối phải thống nhất với cách xử lý cọc trước khi hoàn thiện luồng này.
- Chủ xe sửa giá tin đăng không làm đổi giá của đơn `Approved`. Đơn đã duyệt giữ giá tại thời điểm xác nhận; giá mới chỉ áp dụng cho đơn mới tạo sau khi sửa.

## 4. Đặt cọc và tiền thuê còn lại

Chỉ mô phỏng **đặt cọc**; không tích hợp cổng thanh toán thật ở bất kỳ giai đoạn nào. Toàn bộ khoản cọc phải được đặt trực tuyến qua mô phỏng. “100% trực tuyến” nói về cách đặt cọc, không có nghĩa tiền cọc bằng toàn bộ tiền thuê.

Tiền thuê còn lại được xử lý bằng chuyển khoản hoặc tiền mặt tùy trường hợp. Với tiền mặt, **chủ xe xác nhận đã nhận tiền khi bàn giao** thì khoản đó mới được ghi `Paid`. Người thuê không được tự xác nhận thay chủ xe. Cách ghi nhận chuyển khoản và mức cọc cụ thể chưa được xác định.

## 5. Bàn giao xe

Ảnh xác nhận và thời điểm chụp hoặc ghi nhận là yêu cầu bắt buộc ở cả lúc nhận xe đầu chuyến và trả xe cuối chuyến. Số công-tơ-mét và mức nhiên liệu là thông tin tùy chọn.

Không dùng OTP hoặc QR để xác thực bàn giao, kể cả trong phần mở rộng. Điều kiện xác nhận của từng bên ở đầu chuyến còn cần mô tả cụ thể; quy tắc hai bên bắt buộc xác nhận **trả xe** đã chốt.

## 6. Đánh giá và khiếu nại

- Mỗi bên được gửi một đánh giá cho bên còn lại sau khi đơn `Completed`.
- Đánh giá được công khai khi cả hai bên đã gửi, hoặc sau **7 ngày tính từ lúc đơn hoàn tất**, tùy điều kiện nào đến trước.
- Khiếu nại phải có bằng chứng, chẳng hạn ảnh hoặc mô tả cụ thể có thể đối chiếu. Thiếu bằng chứng thì từ chối ngay khi gửi.
- Gửi khiếu nại chỉ tạo yêu cầu **chờ xử lý** (`pending`), không tự khóa xe, khóa tiền hoặc khóa tài khoản.
- Khiếu nại và trạng thái đơn thuê được lưu riêng. Một khiếu nại đang mở ngăn đơn đã trả xe chuyển sang hoàn tất.

## 7. Doanh thu và hoa hồng

Doanh thu được ghi nhận khi đơn `Completed`. Chủ xe chỉ xem doanh thu từ xe của mình, gồm tổng tiền thuê, hoa hồng nền tảng và phần còn lại sau hoa hồng.

Hoa hồng = tổng tiền thuê được tính doanh thu × tỷ lệ hoa hồng. Doanh thu sau hoa hồng = tổng tiền thuê được tính doanh thu − hoa hồng. Tỷ lệ hoa hồng là một giá trị cấu hình do quản trị viên quản lý; giá trị cụ thể và cách áp dụng khi thay đổi cấu hình chưa được ấn định.

Không có ví, yêu cầu rút tiền hoặc luồng duyệt rút tiền, kể cả mô phỏng. Không xử lý thuế trong giá thuê, hoa hồng hay doanh thu.

## 8. Xử lý vi phạm

Nhân viên được xử lý tài khoản người thuê, chủ xe và tin đăng trong phạm vi quyền được cấp. Nhân viên không được thay đổi tài khoản nhân viên khác hoặc quản trị viên.

| Mức vi phạm | Thời hạn khóa tài khoản |
| --- | --- |
| Nhẹ | 7 ngày |
| Trung bình | 30 ngày |
| Nặng | Vĩnh viễn |

Gỡ tin vi phạm và khóa tài khoản là hai thao tác độc lập. Gỡ một tin không tự khóa chủ xe; gửi một khiếu nại không tự áp dụng các biện pháp này.

## 9. Thông tin đăng xe

Danh mục dưới đây vẫn được nguồn ghi là **đề xuất**. Các con số về ảnh chưa được chuyển thành yêu cầu đã chốt.

| Thông tin | Yêu cầu đề xuất |
| --- | --- |
| Hãng, mẫu xe, biển số, năm sản xuất | Bắt buộc; biển số dùng để kiểm tra đăng trùng xe |
| Hộp số, nhiên liệu, số chỗ | Bắt buộc; dùng cho tìm kiếm và lọc |
| Ảnh xe | Tối thiểu 3 ảnh, khoảng 5 MB mỗi ảnh |
| Giá thuê theo ngày | Bắt buộc |
| Địa điểm nhận xe và tọa độ | Bắt buộc; phục vụ bản đồ Leaflet.js và OpenStreetMap |
| Giấy đăng ký xe | Không bắt buộc, khuyến khích cung cấp để xét duyệt |
| Mô tả và điều khoản riêng | Không bắt buộc |

## 10. Bảo vệ dữ liệu

Mật khẩu được hash bằng ASP.NET Core Identity. Nếu thu thập số điện thoại, số CCCD hoặc dữ liệu nhạy cảm tương tự, phải mã hóa khi lưu và giới hạn người được truy cập; không lưu các trường này dưới dạng plain text.

