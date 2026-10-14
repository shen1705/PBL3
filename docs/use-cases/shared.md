---
title: "PBL — Đặc tả chức năng dùng chung"
project: PBL3
category: documents
type: specification
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/specification]
---

# PBL — Đặc tả chức năng dùng chung

Các chức năng nghiệp vụ dưới đây được dùng chung giữa người thuê và chủ xe.

Quy tắc chung: [Quy tắc thuê xe](../requirements/shared-rental-rules.md).
## UC-S-01 — Kiểm tra lịch xe

**Type:** Internal / Included Use Case
**Called by:**
- UC-R-03 Tạo đơn thuê
- UC-R-05 Đặt cọc mô phỏng

**Objective:** Xác định xe có đáp ứng điều kiện và còn lịch trong khoảng thời gian thuê hay không.

**Description:** Hệ thống đối chiếu trạng thái tin, bảo hiểm, quyền chủ xe và các khoảng lịch đang khóa, rồi trả kết quả cho use case gọi.

**Preconditions:** Có xe và khoảng thời gian thuê hợp lệ.

**Main Flow:**

1. Xác định xe từ tin đăng, kiểm tra tin đã duyệt, bảo hiểm còn hạn, quyền chủ xe và các khoảng `vehicle_unavailability` của xe.
2. Đối chiếu khoảng thời gian với các booking cùng xe ở trạng thái `Pending`, `Accepted`, `Ongoing`. `DepositHold`/`AwaitingDeposit` không khóa lịch và nhiều hold có thể giao nhau.
3. Trả kết quả còn lịch hoặc không còn lịch, kèm lý do cho chức năng đang gọi.

**Alternative / Exception Flows:** Không lấy được dữ liệu thì báo không thể kiểm tra; không mặc định còn lịch.

**Postconditions:** Trả kết quả kiểm tra theo xe. Booking `Pending` được tạo sau khi cọc thành công sẽ khóa lịch; `Accepted`, `Ongoing` tiếp tục khóa, còn `Rejected`, `Expired`, `Cancelled` không khóa và `Completed` không ảnh hưởng lịch tương lai.

## UC-S-02 — Đánh giá bên còn lại

**Actor:** `Renter`, `Owner`.

**Objective:** Cho phép mỗi bên đánh giá bên còn lại sau khi chuyến thuê hoàn tất.

**Description:** Người dùng gửi số sao và nội dung đánh giá; hệ thống kiểm tra, lưu và công khai theo điều kiện thời gian quy định.

**Preconditions:** Đơn Completed; người gửi tham gia đơn và chưa gửi đánh giá cho đơn đó.

**Main Flow:**

1. Hệ thống xác định bên còn lại của đơn.
2. Người gửi chọn số sao từ 1 đến 5 và nhập nội dung.
3. Hệ thống kiểm tra, lưu một đánh giá của người gửi cho đơn.
4. Công khai khi cả hai bên đã gửi hoặc đã qua 7 ngày từ lúc Completed, tùy điều kiện nào đến trước.

**Alternative / Exception Flows:** Chưa hoàn tất đơn, đã gửi đánh giá hoặc số sao không hợp lệ thì từ chối và giải thích. Chưa đến lúc công khai thì giữ đánh giá ở trạng thái chưa hiển thị công khai.

**Postconditions:** Đánh giá hợp lệ được lưu và hiển thị đúng thời điểm. Người gửi không được sửa hoặc xóa đánh giá đã gửi; người dùng có thể báo cáo theo UC-S-04.

## UC-S-03 — Gửi khiếu nại

**Actor:** `Renter`, `Owner`.

**Objective:** Cho phép bên tham gia chuyến thuê gửi khiếu nại về vấn đề phát sinh.

**Description:** Người dùng mô tả vụ việc và có thể đính kèm ảnh; hệ thống kiểm tra, tiếp nhận và chuyển yêu cầu vào quy trình xử lý.

**Preconditions:** Người gửi tham gia đơn thuê liên quan.

**Main Flow:**

1. Chọn yêu cầu thuê và nhập mô tả vấn đề, gồm trường hợp không giao xe, không xác nhận bàn giao hoặc bất đồng khi trả xe.
2. Có thể đính kèm ảnh minh họa; ảnh không bắt buộc.
3. Hệ thống kiểm tra quyền và nội dung mô tả.
4. Lưu yêu cầu ở trạng thái chờ xử lý (pending), trả mã yêu cầu để theo dõi.
5. Yêu cầu được đưa vào danh sách xử lý tại UC-AS-04.

**Alternative / Exception Flows:** Thiếu mô tả thì yêu cầu bổ sung. Nếu có ảnh nhưng tệp không hợp lệ hoặc không lưu được thì báo lỗi, không báo tiếp nhận thành công.

**Postconditions:** Chỉ tiếp nhận khiếu nại; không tự kết luận vi phạm hoặc khóa xe, tiền, tài khoản. Khiếu nại được theo dõi riêng với trạng thái yêu cầu thuê, không được chỉnh sửa sau khi gửi và không có thời hạn gửi. `Staff`/`Admin` xử lý tại UC-AS-04 bằng `None`, `CancelOwnerFault` hoặc `ForceComplete`. `CancelOwnerFault` chỉ áp dụng khi booking `Accepted`, đã đến `start_date` và xác định Owner không giao xe; `ForceComplete` chỉ áp dụng cho booking `Ongoing` đã thực tế kết thúc nhưng thiếu xác nhận `Return`. Khiếu nại sau `Completed` chỉ dùng `None`.

## UC-S-04 — Báo cáo đánh giá

**Actor:** `Renter`, `Owner`.

**Objective:** Cho phép người dùng báo cáo một đánh giá có dấu hiệu vi phạm.

**Description:** Người dùng cung cấp căn cứ báo cáo; hệ thống kiểm tra, lưu vụ việc và chuyển đến bộ phận có thẩm quyền xử lý.

**Preconditions:** Có đánh giá cần báo cáo; người gửi đã đăng nhập.

**Main Flow:**

1. Người dùng chọn đánh giá và nhập thông tin, căn cứ báo cáo.
2. Hệ thống kiểm tra nội dung, lưu báo cáo và đưa vào danh sách xử lý tại UC-AS-10.
3. Hiển thị mã hoặc trạng thái để người gửi theo dõi.

**Alternative / Exception Flows:** Thiếu thông tin cần thiết hoặc lỗi lưu thì không báo đã gửi thành công. Báo cáo lặp không tạo nhiều vụ việc trùng.

**Postconditions:** Báo cáo được tiếp nhận; đánh giá không tự bị ẩn hoặc xóa.

## Điều kiện truy cập và lỗi chung

Trước khi lưu, kiểm tra lại tài khoản, quyền và trạng thái dữ liệu. Nếu dữ liệu đã đổi thì hiển thị trạng thái mới; nếu mất phản hồi thì kiểm tra kết quả đã lưu trước khi thử lại. Không tạo trùng đơn, cọc, xác nhận hoặc đánh giá.

Đánh giá và khiếu nại được triển khai sau khi luồng thuê xe chính ổn định; các quy tắc đã chốt ở trên vẫn là điều kiện cần đáp ứng.
