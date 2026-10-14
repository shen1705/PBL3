---
title: "PBL — Đặc tả chức năng chủ xe"
project: PBL3
category: documents
type: specification
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/specification]
---

# PBL — Đặc tả chức năng chủ xe

`Owner` quản lý xe và các yêu cầu cho thuê thuộc tài khoản của mình. Người dùng đăng ký làm chủ xe theo UC-U-07 tại [đặc tả chức năng người dùng](base-user.md) với tối thiểu một xe; quyền `Owner` chỉ được bổ sung sau khi hồ sơ được chấp thuận. Tài khoản giữ quyền `Renter`; quyền chủ xe có thể bị tạm dừng mà không tự khóa quyền thuê xe.

Quy tắc chung: [Quy tắc thuê xe](../requirements/shared-rental-rules.md).

## UC-O-01 — Quản lý xe

**Actor:** `Owner`.

**Objective:** Cho phép chủ xe quản lý thông tin, trạng thái đăng và lịch nhận thuê của các xe thuộc mình.

**Description:** Chủ xe thêm hoặc cập nhật xe; hệ thống kiểm tra dữ liệu, quyền sở hữu và xác định trạng thái xét duyệt phù hợp.

**Preconditions:** Đã có quyền chủ xe còn hiệu lực; xe cần sửa thuộc tài khoản đang đăng nhập.

**Main Flow:**

1. Mở danh sách xe của mình, gồm cả xe chưa được đăng công khai hoặc đang cho thuê.
2. Thêm xe chính chủ với thông tin, ảnh, giá, địa điểm, giấy đăng ký xe, bảo hiểm và ngày hết hạn; biển số phải duy nhất.
3. Hệ thống kiểm tra dữ liệu, quyền sở hữu theo hồ sơ đã cung cấp và ghi nhận tin chờ xét duyệt. Xe chỉ hiển thị sau khi được chấp thuận.
4. Chủ xe có thể mở xe đã có để sửa thông tin, giá hoặc lịch không nhận thuê.

**Alternative / Exception Flows:** Thiếu giấy đăng ký xe, bảo hiểm, biển số đã tồn tại hoặc bảo hiểm hết hạn thì không công khai tin. Sửa thông tin định danh xe phải chờ duyệt lại; sửa giá hoặc địa điểm không cần duyệt lại. Chủ xe bị tạm dừng quyền thì xe ngừng hiển thị. Không xóa lịch sử yêu cầu thuê theo thao tác sửa tin.

**Postconditions:** Xe hoặc tin được cập nhật đúng trạng thái duyệt. Sửa giá chỉ áp dụng cho yêu cầu mới; yêu cầu `Accepted` giữ giá đã xác nhận.

## UC-O-02 — Duyệt yêu cầu thuê xe

**Actor:** `Owner`.

**Objective:** Cho phép chủ xe chấp thuận hoặc từ chối yêu cầu thuê xe trong thời hạn phản hồi.

**Description:** Chủ xe xem booking đang chờ và chấp thuận hoặc từ chối booking `Pending` hiện tại. Booking đã khóa lịch từ khi cọc thành công.

**Preconditions:** Yêu cầu `Pending` của xe thuộc chủ xe còn quyền hoạt động, đã đặt cọc và chưa hết hạn duyệt 1 ngày (24 giờ) tính từ lúc cọc thành công.

**Main Flow:**

1. Mở danh sách booking `Pending` đang chờ duyệt và chọn một booking.
2. Xem thông tin công khai, đánh giá của người thuê, thời gian, giá và khoản cọc đã ghi nhận; không xem giấy tờ hoặc thông tin cá nhân không được phép.
3. Chọn chấp thuận; hệ thống kiểm tra booking còn `Pending`, chưa quá `response_deadline`, người thao tác sở hữu xe và quyền `Owner` còn `Active`.
4. Lưu `Accepted`, `accepted_at`, `responded_at`; booking tiếp tục giữ khoảng lịch đã khóa từ khi được tạo ở trạng thái `Pending`.

**Alternative / Exception Flows:** Chủ xe từ chối thì booking chuyển `Rejected`, ghi `responded_at` và `reject_reason` nếu có, hoàn cọc và giải phóng lịch. Hết 24 giờ không phản hồi thì chuyển `Expired`, hoàn cọc và giải phóng lịch. Nếu booking đã hủy, hết hạn hoặc quyền `Owner` bị tạm dừng thì không chấp thuận hoặc từ chối theo dữ liệu cũ.

**Postconditions:** Booking được chuyển sang `Accepted` và tiếp tục khóa lịch, hoặc chuyển sang `Rejected` và giải phóng lịch. Không tự động xử lý booking khác.

## UC-O-03 — Giao xe đầu chuyến

**Process Reference:** Dùng cùng quy trình `UC-R-06` tại [đặc tả chức năng người thuê](renter.md).

`Owner` xác nhận giao xe trên hệ thống; cùng xác nhận nhận xe của `Renter`, hệ thống ghi thời điểm và chuyển yêu cầu sang `Ongoing`. Nếu mới một bên xác nhận, xác nhận đó được giữ nguyên cho đến khi bên còn lại xác nhận hoặc booking không còn ở trạng thái hợp lệ; không xóa hoặc đặt lại do thời gian chờ. Không bắt buộc ảnh.

## UC-O-04 — Nhận lại xe cuối chuyến

**Process Reference:** Dùng cùng quy trình `UC-R-07` tại [đặc tả chức năng người thuê](renter.md).

`Owner` xác nhận đã nhận lại xe. Hệ thống chuyển yêu cầu sang `Completed` khi cả `Owner` và `Renter` đã xác nhận, đồng thời ghi thời điểm của mỗi bên và tự động chuyển cọc cho Owner sau khi trừ hoa hồng. Xác nhận của bên thực hiện trước được giữ nguyên, không hết hạn hoặc bị đặt lại do thời gian chờ. Nếu một bên không xác nhận hoặc có bất đồng, bên còn lại có thể gửi khiếu nại; hệ thống không yêu cầu ảnh, số km hoặc mức nhiên liệu.

## UC-O-05 — Xem lịch sử cho thuê

**Actor:** `Owner`.

**Objective:** Cho phép chủ xe theo dõi và xem lại các yêu cầu thuê liên quan đến xe của mình.

**Description:** Hệ thống liệt kê các đơn cho thuê của chủ xe và hiển thị thông tin, trạng thái cùng dữ liệu bàn giao được phép truy cập.

**Preconditions:** Đã đăng nhập với quyền chủ xe.

**Main Flow:**

1. Mở danh sách đơn liên quan đến xe của mình.
2. Chọn yêu cầu để xem người thuê, thời gian, giá, cọc và xác nhận bàn giao được phép truy cập.
3. Theo dõi đơn đang có hoặc xem lại đơn đã kết thúc.

**Alternative / Exception Flows:** Chưa có đơn thì hiển thị danh sách trống; không cho xem đơn của chủ xe khác.

**Postconditions:** Hiển thị lịch sử cho thuê, tách với lịch sử đi thuê của cùng tài khoản.

## UC-O-06 — Xem doanh thu

**Actor:** `Owner`.

**Objective:** Cung cấp cho chủ xe số liệu doanh thu từ các chuyến thuê đã hoàn tất.

**Description:** Hệ thống tổng hợp các payment có cọc `Transferred` hoặc `Forfeited` và hiển thị các thành phần doanh thu theo thời gian.

**Preconditions:** Đã đăng nhập với quyền chủ xe.

**Main Flow:**

1. Mở phần doanh thu của mình.
2. Hệ thống tổng hợp payment của xe thuộc chủ xe có `deposit_status` là `Transferred` hoặc `Forfeited`.
3. Hiển thị tổng tiền thuê, hoa hồng, phần Owner nhận qua hệ thống bằng cọc trừ hoa hồng và phần còn lại thu trực tiếp để tham khảo. Dòng `Forfeited` được tách riêng.

**Alternative / Exception Flows:** Không có đơn hoàn tất thì hiển thị 0. Không lấy đủ dữ liệu thì báo không thể tính thay vì hiển thị tổng thiếu.

**Postconditions:** Chỉ xem doanh thu; cọc được hệ thống tự động chuyển theo trạng thái.

## UC-O-07 — Hủy yêu cầu đã chấp thuận

**Actor:** `Owner`.

**Objective:** Cho phép chủ xe hủy yêu cầu đã chấp thuận trước khi chuyến bắt đầu theo chính sách áp dụng.

**Description:** Chủ xe xác nhận hủy; hệ thống cập nhật trạng thái, giải phóng lịch, hoàn cọc và ghi nhận khoản phạt mô phỏng.

**Preconditions:** Yêu cầu `Accepted` thuộc xe của chủ xe, chuyến chưa bắt đầu.

**Main Flow:**

1. Chủ xe mở yêu cầu và xem khoản cọc sẽ hoàn cùng khoản phạt 40% giá trị chuyến.
2. Chủ xe xác nhận hủy.
3. Hệ thống kiểm tra lại trạng thái, rồi trong cùng transaction chuyển yêu cầu sang `Cancelled`, giải phóng lịch, hoàn cọc cho người thuê và thanh toán khoản phạt mô phỏng từ Owner sang Renter.

**Alternative / Exception Flows:** Hủy thao tác thì giữ nguyên yêu cầu. Yêu cầu đã `Ongoing` không được hủy; vấn đề phát sinh được xử lý qua khiếu nại. Nếu thanh toán khoản phạt mô phỏng thất bại thì rollback toàn bộ và booking giữ `Accepted`. Trường hợp Owner không giao xe được Renter gửi khiếu nại và Staff/Admin xử lý bằng `CancelOwnerFault` trong UC-AS-04.

**Postconditions:** Yêu cầu chỉ chuyển `Cancelled` khi hoàn cọc và thanh toán phạt mô phỏng đều thành công; không chuyển tiền thật.

## UC-O-08 — Thanh toán khoản phạt mô phỏng

**Actor:** `Owner`.

**Objective:** Cho phép chủ xe thanh toán khoản phạt trong môi trường mô phỏng.

**Description:** Chủ xe xem khoản phạt của booking, chọn tài khoản ngân hàng giả lập và xác nhận thanh toán mô phỏng.

**Preconditions:** Có giao dịch `Penalty` ở trạng thái `Pending` của Owner; Owner đã đăng nhập. Quyền Owner bị tạm dừng không chặn chức năng này.

**Main Flow:**

1. Chủ xe xem khoản phạt, booking liên quan và số tiền.
2. Chủ xe chọn tài khoản ngân hàng giả lập và xác nhận.
3. Hệ thống chạy thanh toán mô phỏng, chuyển giao dịch `Penalty` sang `Succeeded` và hiển thị kết quả.

**Alternative / Exception Flows:** Thanh toán mô phỏng thất bại hoặc người dùng hủy thao tác thì giữ `Pending`. Thao tác lặp không tạo giao dịch trùng. Không chuyển tiền thật.

**Postconditions:** Khoản phạt được ghi `Succeeded` khi thanh toán mô phỏng thành công; booking liên quan không đổi trạng thái.

## Đánh giá và khiếu nại

Chủ xe dùng UC-S-02 và UC-S-03 tại [đặc tả chức năng dùng chung](shared.md).
