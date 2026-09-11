---
title: "PBL — Đặc tả chức năng chủ xe"
project: PBL3
category: documents
type: specification
status: working
updated: 2026-09-09
tags: [project/pbl, type/specification]
---

# PBL — Đặc tả chức năng chủ xe

`Owner` quản lý xe và các đơn cho thuê thuộc tài khoản của mình. Role `Owner` được bổ sung trên tài khoản đã có role `Renter`; khi thuê xe của người khác, người dùng vẫn tham gia quy trình với vai trò `Renter`.

Quy tắc chung: [PBL - Shared Rental Rules](../requirements/shared-rental-rules.md). Chi tiết chưa được xác định: [PBL - Review Guide](../requirements/open-decisions.md).

## UC-O-01 — Quản lý xe

**Actor:** `Owner`.

**Preconditions:** Đã có quyền chủ xe; xe cần sửa thuộc tài khoản đang đăng nhập.

**Main Flow:**

1. Mở danh sách xe của mình, gồm cả xe chưa được đăng công khai hoặc đang cho thuê.
2. Thêm xe với thông tin, giá, địa điểm và ảnh theo danh mục đăng xe.
3. Hệ thống kiểm tra dữ liệu, quyền sở hữu và ghi nhận tin để xét duyệt.
4. Chủ xe có thể mở xe đã có để sửa thông tin, giá hoặc lịch không nhận thuê.

**Alternative / Exception Flows:** Thiếu dữ liệu thì yêu cầu bổ sung. Cách ẩn, xóa tin và duyệt lại khi sửa cần được bổ sung; không xóa lịch sử đơn thuê theo thao tác sửa tin.

**Postconditions:** Xe hoặc tin được cập nhật. Sửa giá chỉ áp dụng cho đơn mới; đơn Approved giữ giá đã xác nhận. Danh mục tối thiểu 3 ảnh, khoảng 5 MB mỗi ảnh vẫn là đề xuất của nguồn.

## UC-O-02 — Duyệt yêu cầu thuê xe

**Actor:** `Owner`.

**Preconditions:** Đơn Pending của xe thuộc chủ xe, đã đặt cọc và chưa hết thời hạn duyệt.

**Main Flow:**

1. Mở danh sách đơn chờ duyệt và chọn một đơn.
2. Xem người thuê, thời gian, giá và khoản cọc đã ghi nhận.
3. Chọn duyệt; hệ thống kiểm tra lại trạng thái, hạn phản hồi, quyền sở hữu và lịch qua UC-S-01.
4. Lưu Approved, duy trì lịch đã giữ và hiển thị kết quả cho hai bên.

**Alternative / Exception Flows:** Chủ xe có thể từ chối; cách ghi trạng thái và xử lý cọc còn cần bổ sung. Hết thời hạn 15–30 phút mà chưa phản hồi thì chuyển Expired và giải phóng lịch. Nếu người thuê đã hủy hoặc trạng thái đổi, không duyệt theo dữ liệu cũ.

**Postconditions:** Đơn được duyệt chỉ khi còn hợp lệ. Lịch đã được giữ từ Pending, không đợi chủ xe duyệt mới giữ.

## UC-O-03 — Giao xe đầu chuyến

**Process Reference:** Dùng cùng quy trình `UC-R-06` tại [Renter-Use-Case-Specification](renter.md).

`Owner` bàn giao xe và cung cấp hồ sơ ảnh có ghi nhận thời điểm. Nếu phần tiền thuê còn lại được thanh toán bằng tiền mặt, `Owner` là bên xác nhận đã nhận khoản tiền này.

## UC-O-04 — Nhận lại xe cuối chuyến

**Process Reference:** Dùng cùng quy trình `UC-R-07` tại [Renter-Use-Case-Specification](renter.md).

`Owner` kiểm tra tình trạng xe và xác nhận đã nhận lại xe. Hệ thống chỉ chuyển đơn thuê sang `Returned` khi cả `Owner` và `Renter` đã xác nhận việc bàn giao, đồng thời hồ sơ ảnh bắt buộc đã được cung cấp đầy đủ. Nếu còn vấn đề phát sinh hoặc có khiếu nại đang mở, đơn thuê chưa được chuyển sang `Completed`.

## UC-O-05 — Xem lịch sử cho thuê

**Actor:** `Owner`.

**Preconditions:** Đã đăng nhập với quyền chủ xe.

**Main Flow:**

1. Mở danh sách đơn liên quan đến xe của mình.
2. Chọn đơn để xem người thuê, thời gian, giá và hồ sơ bàn giao được phép truy cập.
3. Theo dõi đơn đang có hoặc xem lại đơn đã kết thúc.

**Alternative / Exception Flows:** Chưa có đơn thì hiển thị danh sách trống; không cho xem đơn của chủ xe khác.

**Postconditions:** Hiển thị lịch sử cho thuê, tách với lịch sử đi thuê của cùng tài khoản.

## UC-O-06 — Xem doanh thu

**Actor:** `Owner`.

**Preconditions:** Đã đăng nhập với quyền chủ xe.

**Main Flow:**

1. Mở phần doanh thu của mình.
2. Hệ thống tổng hợp các đơn Completed của xe thuộc chủ xe.
3. Hiển thị tổng tiền thuê, hoa hồng và doanh thu còn lại sau hoa hồng, kèm thời gian được tổng hợp.

**Alternative / Exception Flows:** Không có đơn hoàn tất thì hiển thị 0. Không lấy đủ dữ liệu thì báo không thể tính thay vì hiển thị tổng thiếu.

**Postconditions:** Chỉ xem doanh thu. Không có ví, số dư có thể rút hoặc nút yêu cầu rút tiền.

## Đánh giá và khiếu nại

Chủ xe dùng UC-S-02 và UC-S-03 tại [Shared-Use-Case-Specification](shared.md).

