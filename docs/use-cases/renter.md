---
title: "PBL — Đặc tả chức năng người thuê"
project: PBL3
category: documents
type: specification
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/specification]
---
# PBL — Đặc tả chức năng người thuê

`Renter` kế thừa `Base User` và thực hiện các chức năng thuê xe. `Visitor` và `Base User` đều được xem, tìm kiếm xe; trước khi tạo yêu cầu thuê, `Renter` phải có số GPLX, hạng, ngày hết hạn còn hiệu lực và ảnh trong hồ sơ. Các thao tác với yêu cầu thuê đòi hỏi đăng nhập đúng tài khoản tham gia. Người dùng không được thuê xe của chính mình.

Quy tắc chung: [Quy tắc thuê xe](../requirements/shared-rental-rules.md).

## UC-R-01 — Xem danh sách xe

**Actor:** `Visitor`, `Base User`.

**Objective:** Cho phép người dùng xem các xe đang đủ điều kiện cho thuê trên hệ thống.

**Description:** Hệ thống hiển thị danh sách và thông tin chi tiết của các tin xe hợp lệ, có xét thời gian thuê khi được cung cấp.

**Preconditions:** Không yêu cầu đăng nhập.

**Main Flow:**

1. Người dùng mở danh sách xe.
2. Hệ thống hiển thị tin đã duyệt, còn bảo hiểm hiệu lực, giá thuê và địa điểm nhận xe.
3. Người dùng xem chi tiết xe. Nếu đã chọn thời gian thuê, kết quả phải xét lịch xe trong thời gian đó.

**Alternative / Exception Flows:** Không có xe phù hợp thì hiển thị thông báo. Lỗi tải dữ liệu phải được báo riêng; không diễn đạt thành “không có xe”.

**Postconditions:** Hiển thị thông tin xe, chưa tạo đơn.

## UC-R-02 — Tìm kiếm và lọc xe

**Actor:** `Visitor`, `Base User`.

**Objective:** Giúp người dùng tìm xe phù hợp với nhu cầu thuê.

**Description:** Người dùng cung cấp các tiêu chí tìm kiếm; hệ thống kiểm tra và trả về danh sách xe phù hợp để tiếp tục lựa chọn.

**Preconditions:** Đang xem danh sách xe.

**Main Flow:**

1. Nhập địa điểm, khoảng giá hoặc loại xe; chọn thời gian thuê nếu cần.
2. Hệ thống kiểm tra tiêu chí và lọc kết quả.
3. Người thuê xem, đổi hoặc bỏ tiêu chí lọc.

**Alternative / Exception Flows:** Tiêu chí không hợp lệ thì yêu cầu sửa; không có kết quả thì cho đổi điều kiện tìm kiếm.

**Postconditions:** Danh sách xe được lọc theo nhu cầu.

## UC-R-03 — Tạo đơn thuê

**Actor:** `Renter`.

**Objective:** Cho phép người thuê tạo yêu cầu thuê một xe đủ điều kiện trong khoảng thời gian xác định.

**Description:** Người thuê chọn xe và thời gian; hệ thống kiểm tra điều kiện, tính chi phí, ghi nhận cọc mô phỏng và tạo yêu cầu `Pending`.

**Preconditions:** Đã đăng nhập, GPLX trong hồ sơ có đủ thông tin, ảnh và còn hiệu lực đến hết ngày trả xe theo UC-R-09; xe đã duyệt, còn bảo hiểm hiệu lực, chủ xe không bị tạm dừng quyền và xe không thuộc người thuê.

**Main Flow:**

1. Chọn xe, thời điểm nhận và trả.
2. Hệ thống kiểm tra ngày, giá và khả dụng qua UC-S-01. Số ngày thuê bằng `max(1, ceil((thời điểm trả - thời điểm nhận) / 24 giờ))`; hệ thống hiển thị tổng tiền và tiền cọc bằng 25% giá trị chuyến.
3. Hệ thống tạo `DepositHold` ở trạng thái `AwaitingDeposit` để lưu khoảng thuê, tổng giá và số tiền cọc phía máy chủ. Người thuê kiểm tra thông tin và thực hiện đặt cọc qua tài khoản ngân hàng giả lập theo UC-R-05; hold không khóa lịch, không có thời hạn tự hết hiệu lực và có thể giao với hold của người thuê khác.
4. Khi người thuê xác nhận cọc, hệ thống khóa hold và dữ liệu theo xe; kiểm tra hold thuộc người thuê hiện tại, đang `AwaitingDeposit`, `start_date` còn ở tương lai, tin `Public`, xe `Approved`, bảo hiểm còn hạn, Owner `Active`, giá tin không đổi, GPLX còn hiệu lực đến hết `end_date`, người thuê không có `account_sanction` còn hiệu lực và xe không giao lịch. Nếu hợp lệ, hệ thống ghi cọc, tạo yêu cầu `Pending`, dữ liệu thanh toán và chuyển hold sang `Converted` trong cùng một transaction; yêu cầu `Pending` khóa lịch ngay và bắt đầu hạn chủ xe phản hồi 1 ngày (24 giờ).
5. Hiển thị mã đơn, trạng thái chờ duyệt và hạn phản hồi của chủ xe trong 1 ngày (24 giờ).

**Alternative / Exception Flows:** GPLX thiếu thông tin, ảnh hoặc không còn hiệu lực đến hết ngày trả thì yêu cầu cập nhật trước khi tạo yêu cầu. Ngày hoặc xe không còn khả dụng thì chọn lại. Người thuê có thể chủ động bỏ hold để chuyển sang `Cancelled`. Nếu một điều kiện không còn hợp lệ tại lúc cọc, hệ thống rollback, chuyển hold sang `Cancelled`, không ghi cọc và không tạo yêu cầu `Pending`; xung đột lịch trả `409`. Mô phỏng cọc thất bại hoặc bất kỳ bước nào trong transaction lỗi cũng rollback toàn bộ, chuyển hold sang `Cancelled`, không để lại booking hoặc payment tạo dở; hold không bị xóa.

**Postconditions:** Yêu cầu `Pending` đã đặt cọc và khóa lịch xe; hold nguồn còn được giữ ở trạng thái `Converted`, chủ xe nhận được yêu cầu trong danh sách chờ duyệt.

## UC-R-04 — Hủy yêu cầu thuê

**Actor:** `Renter`.

**Objective:** Cho phép người thuê hủy yêu cầu thuê chưa bắt đầu và xử lý khoản cọc theo chính sách.

**Description:** Người thuê chọn đơn cần hủy; hệ thống xác nhận trạng thái, cập nhật đơn, xử lý cọc và giải phóng lịch khi cần.

**Preconditions:** Yêu cầu thuộc người thuê, đang `Pending` hoặc `Accepted`, chuyến chưa bắt đầu.

**Main Flow:**

1. Mở đơn cần hủy.
2. Hệ thống hiển thị trạng thái và cách xử lý cọc: `Pending` được hoàn toàn bộ; `Accepted` thì mất cọc và cọc được chuyển cho Owner sau khi trừ hoa hồng.
3. Người thuê xác nhận hủy.
4. Hệ thống kiểm tra lại trạng thái, lưu `Cancelled`, giải phóng lịch; với `Pending` thì hoàn cọc, với `Accepted` thì chuyển `deposit_amount - commission_amount` cho Owner, giữ hoa hồng, đặt `deposit_status = Forfeited` và ghi `revenue_recorded_at`.

**Alternative / Exception Flows:** Bỏ xác nhận thì giữ nguyên yêu cầu. Nếu trạng thái đã đổi thì hiển thị chính sách tương ứng trước khi hủy. Yêu cầu đã `Ongoing` không được hủy; người thuê có thể gửi khiếu nại.

**Postconditions:** Yêu cầu được hủy khi đủ điều kiện; cọc được hoàn hoặc chuyển cho Owner sau trừ hoa hồng với trạng thái `Forfeited`; lịch do booking `Pending` hoặc `Accepted` giữ được giải phóng.

## UC-R-05 — Đặt cọc mô phỏng

**Actor:** `Renter`.

**Objective:** Ghi nhận khoản đặt cọc mô phỏng cho yêu cầu thuê xe.

**Description:** Người thuê xác nhận thanh toán qua tài khoản ngân hàng giả lập; hệ thống ghi kết quả giao dịch và phối hợp tạo yêu cầu `Pending` khi thành công.

**Preconditions:** Đã chọn xe, thời gian và kiểm tra số tiền cọc trong quá trình tạo đơn.

**Main Flow:**

1. Hệ thống hiển thị cọc bằng 25% giá trị chuyến từ `DepositHold` và thông báo đây là mô phỏng; client không gửi số tiền cọc.
2. Người thuê chọn tài khoản ngân hàng giả lập và xác nhận đặt cọc.
3. Hệ thống khóa hold và dữ liệu theo xe; kiểm tra hold thuộc người thuê hiện tại, đang `AwaitingDeposit`, `start_date` còn ở tương lai, tin `Public`, xe `Approved`, bảo hiểm còn hạn, Owner `Active`, giá tin không đổi, GPLX còn hiệu lực đến hết `end_date`, người thuê không có `account_sanction` còn hiệu lực, không giao với booking `Pending`, `Accepted`, `Ongoing` hoặc `vehicle_unavailability`.
4. Nếu xe còn trống, hệ thống dùng số tiền cọc phía máy chủ từ hold để ghi giao dịch, tạo booking `Pending` và payment, chuyển hold sang `Converted` trong cùng một transaction rồi hiển thị kết quả.

**Alternative / Exception Flows:** Hủy thao tác, mô phỏng thất bại, hold không thuộc người thuê, không còn `AwaitingDeposit` hoặc một điều kiện kiểm tra lại không hợp lệ thì rollback, chuyển hold sang `Cancelled` và từ chối trước khi ghi cọc; xung đột lịch trả `409`. Bất kỳ lỗi nào trong transaction đều rollback để không có booking `Pending` tạo dở. Gửi lại yêu cầu không được tạo khoản cọc, booking hoặc payment trùng.

**Postconditions:** Khoản cọc được ghi nhận riêng với trạng thái đơn và chỉ được mô phỏng qua tài khoản ngân hàng giả lập; tiền thuê còn lại xem quy tắc chung.

## UC-R-06 — Xác nhận nhận xe đầu chuyến

**Actor:** `Renter`, `Owner`.

**Objective:** Xác nhận việc giao và nhận xe để bắt đầu chuyến thuê.

**Description:** Hai bên xác nhận riêng việc bàn giao; khi đủ hai xác nhận, hệ thống chuyển yêu cầu sang `Ongoing`.

**Preconditions:** Yêu cầu `Accepted`, đã ghi nhận cọc và đủ điều kiện giao xe.

**Main Flow:**

1. Hai bên mở thông tin đơn và kiểm tra xe.
2. Mỗi bên xác nhận việc giao, nhận xe; hệ thống lưu người và thời điểm xác nhận riêng.
3. Khi đủ hai xác nhận, hệ thống chuyển yêu cầu sang `Ongoing`.

**Alternative / Exception Flows:** Mới một bên xác nhận thì giữ `Accepted` và giữ nguyên xác nhận đã lưu cho đến khi bên còn lại xác nhận hoặc booking chuyển sang trạng thái không còn hợp lệ; không xóa hoặc đặt lại xác nhận do thời gian chờ. Nếu một bên không giao, không xác nhận hoặc có bất đồng, bên còn lại có thể gửi khiếu nại theo UC-S-03. Khi Staff/Admin xác định Owner không giao xe và chọn `CancelOwnerFault` trong UC-AS-04, hệ thống hủy booking, hoàn cọc và tạo khoản phạt mô phỏng 40% ở trạng thái `Pending`.

**Postconditions:** Lưu xác nhận và thời điểm của từng bên; không bắt buộc ảnh, số km hoặc mức nhiên liệu. Không dùng OTP/QR.

## UC-R-07 — Xác nhận trả xe

**Actor:** `Renter`, `Owner`.

**Objective:** Xác nhận việc trả và nhận lại xe để hoàn tất chuyến thuê.

**Description:** Hai bên xác nhận riêng việc hoàn trả; khi đủ xác nhận, hệ thống hoàn tất yêu cầu và ghi nhận các kết quả liên quan.

**Preconditions:** Yêu cầu `Ongoing` và người thao tác là một trong hai bên.

**Main Flow:**

1. Người thuê xác nhận đã trả xe; chủ xe kiểm tra và xác nhận đã nhận lại. Hệ thống lưu riêng xác nhận của mỗi bên.
2. Hệ thống lưu người, thời điểm xác nhận của từng bên và hiển thị tiến độ.
3. Khi có đủ hai xác nhận, chuyển yêu cầu sang `Completed`; trong cùng transaction, lấy tỷ lệ hoa hồng hiện tại, chuyển cọc cho Owner sau khi trừ hoa hồng, cập nhật `deposit_status = Transferred`, ghi `revenue_recorded_at` và mở quyền đánh giá.

**Alternative / Exception Flows:** Mới một bên xác nhận thì giữ `Ongoing` và giữ nguyên xác nhận đã lưu; xác nhận không hết hạn, không bị xóa hoặc đặt lại do thời gian chờ. Một bên không xác nhận hoặc có bất đồng thì bên còn lại có thể gửi khiếu nại theo UC-S-03. Khiếu nại được theo dõi riêng, không tự đổi trạng thái yêu cầu.

**Postconditions:** Yêu cầu `Completed` khi đủ hai xác nhận; xác nhận lặp không tạo lần trả xe mới.

## UC-R-08 — Xem lịch sử thuê xe

**Actor:** `Renter`.

**Objective:** Cho phép người thuê theo dõi và xem lại các yêu cầu thuê của mình.

**Description:** Hệ thống liệt kê các đơn của người thuê và hiển thị thông tin, trạng thái cùng dữ liệu giao dịch được phép truy cập.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Mở danh sách đơn của mình.
2. Chọn yêu cầu để xem xe, thời gian, giá, cọc, hoàn tiền và xác nhận bàn giao được phép truy cập.
3. Theo dõi trạng thái hiện tại hoặc xem lại đơn đã kết thúc.

**Alternative / Exception Flows:** Chưa có đơn thì hiển thị danh sách trống. Mã đơn của người khác không cho phép truy cập.

**Postconditions:** Chỉ xem dữ liệu, không đổi trạng thái đơn. Danh sách đơn đang có phải truy cập được để tiếp tục các thao tác thuê xe.

## UC-R-09 — Cung cấp GPLX

**Actor:** `Renter`.

**Objective:** Cho phép người thuê cung cấp thông tin GPLX làm điều kiện tạo yêu cầu thuê xe.

**Description:** Người thuê nhập thông tin và tải ảnh GPLX; hệ thống kiểm tra, lưu hồ sơ và hiển thị tình trạng còn hiệu lực.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Người thuê mở hồ sơ cá nhân, nhập số GPLX, hạng, ngày hết hạn và tải ảnh GPLX lên.
2. Hệ thống kiểm tra thông tin, thời hạn và tệp theo yêu cầu rồi lưu vào hồ sơ.
3. Hệ thống hiển thị thông tin đã cung cấp và tình trạng còn hạn để người thuê biết điều kiện tạo yêu cầu mới. Điều kiện GPLX được đánh giá theo ngày trả của từng khoảng thuê tại UC-R-03.

**Alternative / Exception Flows:** Thiếu số, hạng, ngày hết hạn hoặc ảnh; ngày hết hạn đã qua; tệp không đáp ứng yêu cầu thì đề nghị sửa hoặc tải lại. Lỗi lưu thì giữ trạng thái trước đó và báo lỗi.

**Postconditions:** Hồ sơ người dùng lưu số, hạng, ngày hết hạn và ảnh GPLX; trạng thái đủ điều kiện tạo yêu cầu dựa vào thông tin đã cung cấp và ngày hết hạn, không thể hiện kết quả xác minh giấy tờ.

## Đánh giá và khiếu nại

Người thuê dùng UC-S-02 và UC-S-03 tại [đặc tả chức năng dùng chung](shared.md).
