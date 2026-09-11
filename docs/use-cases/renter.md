---
title: "PBL — Đặc tả chức năng người thuê"
project: PBL3
category: documents
type: specification
status: working
updated: 2026-09-09
tags: [project/pbl, type/specification]
---
# PBL — Đặc tả chức năng người thuê

Chức năng dành cho người thuê xe. Các thao tác với đơn thuê yêu cầu đăng nhập đúng tài khoản tham gia đơn. Người dùng không được thuê xe của chính mình.

Quy tắc chung: [PBL - Shared Rental Rules](../requirements/shared-rental-rules.md). Chi tiết chưa được xác định: [PBL - Review Guide](../requirements/open-decisions.md).

## UC-R-01 — Xem danh sách xe

**Actor:** `Renter`.

**Preconditions:** Có thể truy cập danh sách xe.

**Main Flow:**

1. Người thuê mở danh sách xe.
2. Hệ thống hiển thị tin đang được phép đăng, giá thuê và địa điểm nhận xe.
3. Người thuê xem chi tiết xe. Nếu đã chọn thời gian thuê, kết quả phải xét lịch xe trong thời gian đó.

**Alternative / Exception Flows:** Không có xe phù hợp thì hiển thị thông báo. Lỗi tải dữ liệu phải được báo riêng; không diễn đạt thành “không có xe”. Quyền xem khi chưa đăng nhập chưa được xác định.

**Postconditions:** Hiển thị thông tin xe, chưa tạo đơn.

## UC-R-02 — Tìm kiếm và lọc xe

**Actor:** `Renter`.

**Preconditions:** Đang xem danh sách xe.

**Main Flow:**

1. Nhập địa điểm, khoảng giá hoặc loại xe; chọn thời gian thuê nếu cần.
2. Hệ thống kiểm tra tiêu chí và lọc kết quả.
3. Người thuê xem, đổi hoặc bỏ tiêu chí lọc.

**Alternative / Exception Flows:** Tiêu chí không hợp lệ thì yêu cầu sửa; không có kết quả thì cho đổi điều kiện tìm kiếm.

**Postconditions:** Danh sách xe được lọc theo nhu cầu.

## UC-R-03 — Tạo đơn thuê

**Actor:** `Renter`.

**Preconditions:** Đã đăng nhập; xe được phép đặt và không thuộc người thuê.

**Main Flow:**

1. Chọn xe, thời điểm nhận và trả.
2. Hệ thống kiểm tra ngày, giá và lịch trống qua UC-S-01; hiển thị tiền thuê và tiền cọc.
3. Người thuê kiểm tra thông tin và thực hiện đặt cọc trực tuyến mô phỏng theo UC-R-05.
4. Khi cọc thành công, hệ thống kiểm tra lại và đồng thời tạo đơn Pending, ghi nhận cọc, giữ lịch xe.
5. Hiển thị mã đơn, trạng thái chờ duyệt và hạn phản hồi của chủ xe trong khoảng 15–30 phút.

**Alternative / Exception Flows:** Ngày hoặc lịch không hợp lệ thì chọn lại. Mô phỏng cọc thất bại thì không xác nhận đã tạo đơn chờ duyệt giữ lịch. Nếu giá hoặc lịch thay đổi trước khi lưu, hiển thị lại thông tin và kết quả thực tế.

**Postconditions:** Đơn Pending đã đặt cọc và giữ lịch. Chủ xe nhận được yêu cầu trong danh sách chờ duyệt.

## UC-R-04 — Hủy đơn chờ duyệt

**Actor:** `Renter`.

**Preconditions:** Đơn thuộc người thuê và vẫn Pending.

**Main Flow:**

1. Mở đơn cần hủy.
2. Hệ thống hiển thị trạng thái và cách xử lý cọc theo chính sách được bổ sung.
3. Người thuê xác nhận hủy.
4. Hệ thống kiểm tra lại trạng thái, lưu Cancelled và giải phóng lịch theo luồng hủy đã thống nhất.

**Alternative / Exception Flows:** Bỏ xác nhận thì giữ nguyên đơn. Nếu chủ xe đã duyệt hoặc đơn hết hạn, hiển thị trạng thái mới. Cách xử lý cọc chưa chốt nên luồng này chưa đủ điều kiện nghiệm thu toàn bộ; không mặc định hoàn cọc hoặc mất cọc.

**Postconditions:** Đơn được hủy khi đủ điều kiện; kết quả cọc phải phản ánh chính sách được bổ sung.

## UC-R-05 — Đặt cọc mô phỏng

**Actor:** `Renter`.

**Preconditions:** Đã chọn xe, thời gian và kiểm tra số tiền cọc trong quá trình tạo đơn.

**Main Flow:**

1. Hệ thống hiển thị số tiền cọc và thông báo đây là mô phỏng.
2. Người thuê xác nhận đặt cọc trực tuyến.
3. Hệ thống mô phỏng kết quả thành công hoặc thất bại.
4. Nếu thành công, ghi nhận khoản cọc cùng việc tạo đơn và giữ lịch tại UC-R-03; hiển thị kết quả.

**Alternative / Exception Flows:** Hủy thao tác hoặc mô phỏng thất bại thì không ghi đã trả cọc. Gửi lại yêu cầu không được tạo khoản cọc trùng.

**Postconditions:** Khoản cọc được ghi nhận riêng với trạng thái đơn. Không có lựa chọn cọc tiền mặt; tiền thuê còn lại xem quy tắc chung.

## UC-R-06 — Xác nhận nhận xe đầu chuyến

**Actor:** `Renter`, `Owner`.

**Preconditions:** Đơn Approved, đã ghi nhận cọc và đủ điều kiện bàn giao.

**Main Flow:**

1. Hai bên mở thông tin đơn và kiểm tra xe.
2. Tải ảnh xác nhận bàn giao; hệ thống lưu thời điểm và người thực hiện.
3. Nếu phần tiền còn lại trả bằng tiền mặt, chủ xe xác nhận đã nhận tiền; hệ thống mới ghi khoản đó là Paid.
4. Ghi nhận việc giao, nhận xe; khi đủ điều kiện đầu chuyến thì chuyển đơn sang InRental.

**Alternative / Exception Flows:** Thiếu ảnh thì chưa hoàn tất bàn giao. Có bất đồng thì ghi nhận vấn đề để xử lý. Số bên bắt buộc xác nhận đầu chuyến và cách ghi nhận chuyển khoản chưa được chốt; không suy ra từ quy tắc trả xe.

**Postconditions:** Lưu hồ sơ giao xe có ảnh, thời điểm và xác nhận. Không dùng OTP/QR.

## UC-R-07 — Xác nhận trả xe

**Actor:** `Renter`, `Owner`.

**Preconditions:** Đơn InRental và người thao tác là một trong hai bên của đơn.

**Main Flow:**

1. Người thuê xác nhận đã trả xe; chủ xe kiểm tra và xác nhận đã nhận lại. Hệ thống lưu riêng xác nhận của mỗi bên.
2. Ghi nhận ảnh trả xe và thời điểm; cả hai bên có thể theo dõi tiến độ xác nhận.
3. Khi có đủ hai xác nhận và hồ sơ ảnh bắt buộc, chuyển đơn sang Returned.
4. Kiểm tra vấn đề phát sinh và khiếu nại đang mở. Nếu không còn vấn đề thì chuyển Completed, ghi nhận doanh thu và mở quyền đánh giá.

**Alternative / Exception Flows:** Mới một bên xác nhận thì giữ InRental và lưu tiến độ. Đủ xác nhận trả xe nhưng còn vấn đề thì giữ Returned. Không cho một bên tự hoàn tất đơn.

**Postconditions:** Đơn Returned hoặc Completed theo điều kiện thực tế; xác nhận lặp không tạo lần trả xe mới.

## UC-R-08 — Xem lịch sử thuê xe

**Actor:** `Renter`.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Mở danh sách đơn của mình.
2. Chọn đơn để xem xe, thời gian, giá, thanh toán và hồ sơ bàn giao được phép truy cập.
3. Theo dõi trạng thái hiện tại hoặc xem lại đơn đã kết thúc.

**Alternative / Exception Flows:** Chưa có đơn thì hiển thị danh sách trống. Mã đơn của người khác không cho phép truy cập.

**Postconditions:** Chỉ xem dữ liệu, không đổi trạng thái đơn. Danh sách đơn đang có phải truy cập được để tiếp tục các thao tác thuê xe.

## Đánh giá và khiếu nại

Người thuê dùng UC-S-02 và UC-S-03 tại [Shared-Use-Case-Specification](shared.md).

