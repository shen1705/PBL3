---
title: "PBL — Đặc tả chức năng dùng chung"
project: PBL3
category: documents
type: specification
status: working
updated: 2026-09-09
tags: [project/pbl, type/specification]
---

# PBL — Đặc tả chức năng dùng chung

Các chức năng dưới đây được dùng chung giữa người thuê và chủ xe. Mỗi chức năng có một mã và một quy trình để hai bên triển khai thống nhất.

Quy tắc chung: [PBL - Shared Rental Rules](../requirements/shared-rental-rules.md). Chi tiết chưa được xác định: [PBL - Review Guide](../requirements/open-decisions.md).

## UC-S-01 — Kiểm tra lịch xe

**Actor:** System (được gọi từ quy trình tạo đơn hoặc duyệt đơn).

**Preconditions:** Có xe và khoảng thời gian thuê hợp lệ.

**Main Flow:**

1. Kiểm tra tin đăng, lịch chủ xe không nhận thuê và các khoảng đã được đơn thuê giữ.
2. Đối chiếu khoảng thời gian yêu cầu với lịch hiện hành. Khi duyệt, loại trừ khoảng giữ của chính đơn đang xét.
3. Trả kết quả còn lịch hoặc không còn lịch, kèm lý do cho chức năng đang gọi.

**Alternative / Exception Flows:** Không lấy được dữ liệu thì báo không thể kiểm tra; không mặc định còn lịch.

**Postconditions:** Trả kết quả kiểm tra. Việc tạo đơn và giữ lịch được thực hiện nhất quán ở UC-R-03; Pending đã đặt cọc cũng giữ lịch.

## UC-S-02 — Đánh giá bên còn lại

**Actor:** `Renter`, `Owner`.

**Preconditions:** Đơn Completed; người gửi tham gia đơn và chưa gửi đánh giá cho đơn đó.

**Main Flow:**

1. Hệ thống xác định bên còn lại của đơn.
2. Người gửi chọn số sao từ 1 đến 5 và nhập nội dung.
3. Hệ thống kiểm tra, lưu một đánh giá của người gửi cho đơn.
4. Công khai khi cả hai bên đã gửi hoặc đã qua 7 ngày từ lúc Completed, tùy điều kiện nào đến trước.

**Alternative / Exception Flows:** Chưa hoàn tất đơn, đã gửi đánh giá hoặc số sao không hợp lệ thì từ chối và giải thích. Chưa đến lúc công khai thì giữ đánh giá ở trạng thái chưa hiển thị công khai.

**Postconditions:** Đánh giá hợp lệ được lưu và hiển thị đúng thời điểm. Cách sửa, xóa và tổng hợp điểm còn cần bổ sung.

## UC-S-03 — Gửi khiếu nại

**Actor:** `Renter`, `Owner`.

**Preconditions:** Người gửi tham gia đơn thuê liên quan.

**Main Flow:**

1. Chọn đơn và mô tả vấn đề.
2. Cung cấp bằng chứng, chẳng hạn ảnh hoặc mô tả cụ thể có thể đối chiếu.
3. Hệ thống kiểm tra quyền, thông tin và bằng chứng bắt buộc.
4. Lưu yêu cầu ở trạng thái chờ xử lý (pending), trả mã yêu cầu để theo dõi.
5. Yêu cầu được đưa vào danh sách xử lý tại UC-AS-04.

**Alternative / Exception Flows:** Thiếu bằng chứng thì từ chối ngay khi gửi và yêu cầu bổ sung. Tệp không hợp lệ hoặc không lưu được thì báo lỗi, không báo tiếp nhận thành công.

**Postconditions:** Chỉ tiếp nhận khiếu nại; không tự kết luận vi phạm hoặc khóa xe, tiền, tài khoản. Khiếu nại đang mở ngăn đơn Returned chuyển Completed.

## Điều kiện truy cập và lỗi chung

Trước khi lưu, kiểm tra lại tài khoản, quyền và trạng thái dữ liệu. Nếu dữ liệu đã đổi thì hiển thị trạng thái mới; nếu mất phản hồi thì kiểm tra kết quả đã lưu trước khi thử lại. Không tạo trùng đơn, cọc, xác nhận hoặc đánh giá.

Đánh giá và khiếu nại được triển khai sau khi luồng thuê xe chính ổn định; các quy tắc đã chốt ở trên vẫn là điều kiện cần đáp ứng.
