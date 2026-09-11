---
title: "PBL — Đặc tả chức năng quản trị"
project: PBL3
category: documents
type: specification
version: "0.4"
status: working
updated: 2026-09-09
tags: [project/pbl, type/specification]
aliases:
  - "Admin Staff Use Cases"
---

# PBL — Đặc tả chức năng quản trị

`Staff` quản lý tài khoản `Renter`, `Owner` và tin đăng trong phạm vi được cấp quyền. `Admin` kế thừa toàn bộ quyền của `Staff`, đồng thời có thêm quyền quản lý cấu hình hệ thống, xem báo cáo toàn nền tảng và quản lý các tài khoản `Staff` hoặc `Admin` khác.

Quy tắc chung: [PBL - Shared Rental Rules](../requirements/shared-rental-rules.md). Chi tiết chưa được xác định: [PBL - Review Guide](../requirements/open-decisions.md).

## Quyền thực hiện

| Mã       | Chức năng                     | Staff                                | Admin |
| -------- | ----------------------------- | ------------------------------------ | ----- |
| UC-AS-01 | Duyệt hồ sơ chủ xe            | Có, trong quản lý chủ xe             | Có    |
| UC-AS-02 | Kiểm duyệt tin đăng           | Có                                   | Có    |
| UC-AS-03 | Quản lý người thuê và chủ xe  | Có                                   | Có    |
| UC-AS-04 | Xử lý khiếu nại               | Trong phạm vi người dùng và tin đăng | Có    |
| UC-AS-05 | Xem báo cáo toàn nền tảng     | Không                                | Có    |
| UC-AS-06 | Cấu hình hoa hồng             | Không                                | Có    |
| UC-AS-07 | Quản lý tài khoản Admin/Staff | Không                                | Có    |
| UC-AS-08 | Gỡ tin vi phạm                | Có                                   | Có    |
| UC-AS-09 | Khóa tài khoản người dùng     | Có                                   | Có    |

Các quyết định xử lý do `Staff` thực hiện không được tác động đến tài khoản thuộc `Staff` hoặc `Admin`. Do hai nhóm người dùng này cùng sử dụng Identity Role `Admin`, hệ thống phải kiểm tra `Permission` và loại tài khoản mục tiêu, thay vì chỉ dựa trên tên role.

## UC-AS-01 — Duyệt hồ sơ chủ xe

**Actor:** `Staff`, `Admin`

**Preconditions:** Hồ sơ đăng ký chủ xe đang chờ xét duyệt.

**Main Flow:**

1. Mở hồ sơ và xem thông tin, tài liệu đã gửi.
2. Đối chiếu với tiêu chí xét duyệt hồ sơ của dự án.
3. Chọn duyệt; hệ thống lưu kết quả và bổ sung Owner cho tài khoản, giữ Renter hiện có.

**Alternative / Exception Flows:** Có thể từ chối trong cùng quy trình; khi từ chối không cấp quyền Owner. Danh mục giấy tờ, tiêu chí, lý do từ chối và nộp lại còn cần bổ sung. Hồ sơ đã được xử lý thì không ghi đè quyết định cũ.

**Postconditions:** Lưu kết quả xét duyệt. Đây là xét duyệt hồ sơ mô phỏng, không xác minh pháp lý thực tế.

## UC-AS-02 — Kiểm duyệt bài đăng

**Actor:** `Staff`, `Admin`

**Preconditions:** Có bài đăng cần xem xét.

**Main Flow:**

1. Mở tin, xem thông tin xe, chủ xe và ảnh.
2. Kiểm tra theo tiêu chí đăng tin.
3. Lưu kết quả duyệt hoặc từ chối theo tình trạng tin.
4. Nếu tin đang hiển thị có vi phạm cần gỡ, thực hiện UC-AS-08.

**Alternative / Exception Flows:** Chưa đủ thông tin thì chưa kết luận. Thời điểm duyệt và trường hợp sửa tin cần duyệt lại còn được bổ sung.

**Postconditions:** Lưu kết quả kiểm duyệt; không tự khóa chủ xe.

## UC-AS-03 — Quản lý người thuê và chủ xe

**Actor:** `Staff`, `Admin`

**Preconditions:** Tài khoản mục tiêu là Renter hoặc Owner.

**Main Flow:**

1. Mở danh sách tài khoản người dùng.
2. Chọn tài khoản để xem thông tin trong phạm vi quyền.
3. Nếu có vi phạm cần khóa, thực hiện UC-AS-09; các thao tác khác phải thuộc danh mục được cho phép.
4. Hiển thị kết quả cập nhật.

**Alternative / Exception Flows:** Nhân viên chọn tài khoản Admin thì từ chối thao tác. Cơ chế mở khóa và các trường được sửa chưa được xác định đầy đủ.

**Postconditions:** Chỉ thay đổi tài khoản người dùng hợp lệ, không thay đổi tài khoản Staff hoặc Admin qua chức năng này.

## UC-AS-04 — Xử lý khiếu nại

**Actor:** `Staff` trong phạm vi người dùng và tin đăng; `Admin`.

**Preconditions:** Có yêu cầu đã được tiếp nhận kèm bằng chứng.

**Main Flow:**

1. Mở yêu cầu chờ xử lý, xem đơn, mô tả và bằng chứng được phép truy cập.
2. Xem xét thông tin; yêu cầu bổ sung nếu chưa đủ căn cứ.
3. Ghi nhận kết quả trong thẩm quyền. Nếu cần gỡ tin hoặc khóa người dùng, thực hiện chức năng tương ứng riêng.
4. Lưu kết quả và trạng thái xử lý. Khi vụ việc kết thúc, hệ thống kiểm tra lại điều kiện hoàn tất của đơn đã trả xe.

**Alternative / Exception Flows:** Nếu yêu cầu vượt quá thẩm quyền của `Staff`, hệ thống chuyển vụ việc để `Admin` xem xét. Khi chưa đủ căn cứ, vụ việc tiếp tục ở trạng thái chờ xử lý và không được tự động đóng. Bộ trạng thái và tiêu chí kết thúc vẫn cần được bổ sung.

**Postconditions:** Kết quả xử lý được lưu; gửi hoặc xử lý khiếu nại không mặc định khóa tiền, xe hay tài khoản.

## UC-AS-05 — Xem báo cáo toàn nền tảng

**Actor:** `Admin`.

**Preconditions:** Có quyền Admin.

**Main Flow:**

1. Mở báo cáo doanh thu.
2. Hệ thống tổng hợp các đơn Completed trong khoảng thời gian được xem.
3. Hiển thị tổng tiền thuê, hoa hồng nền tảng và phần thuộc các chủ xe (Owner).

**Alternative / Exception Flows:** Không có dữ liệu thì hiển thị 0; lỗi tổng hợp thì báo lỗi. Staff không được truy cập báo cáo toàn nền tảng theo giới hạn quyền hiện tại.

**Postconditions:** Chỉ hiển thị số liệu. Báo cáo nâng cao là phần mở rộng; không có báo cáo ví hoặc rút tiền.

## UC-AS-06 — Cấu hình hoa hồng

**Actor:** `Admin`.

**Preconditions:** Có quyền quản lý cấu hình.

**Main Flow:**

1. Xem tỷ lệ hoa hồng hiện tại.
2. Nhập giá trị mới.
3. Hệ thống kiểm tra giá trị theo quy định cấu hình và lưu thay đổi hợp lệ.

**Alternative / Exception Flows:** Staff truy cập thì từ chối. Giá trị, giới hạn và thời điểm có hiệu lực cần được bổ sung; không tự tính lại doanh thu cũ chỉ vì cấu hình đổi.

**Postconditions:** Lưu một giá trị cấu hình hoa hồng; không mở rộng thành hệ thống cấu hình phức tạp.

## UC-AS-07 — Quản lý tài khoản Staff/Admin

**Actor:** `Admin`.

**Preconditions:** Có quyền quản lý Staff và Admin khác.

**Main Flow:**

1. Mở danh sách tài khoản Admin và Staff.
2. Chọn tài khoản và thao tác trong danh mục quản lý được xác định.
3. Hệ thống kiểm tra quyền Admin, dữ liệu và lưu thay đổi.

**Alternative / Exception Flows:** Staff không được thực hiện, kể cả tự gửi yêu cầu trực tiếp. Danh mục tạo, sửa, cấp quyền, khóa và bảo vệ Admin cuối cùng cần bổ sung trước khi hoàn thiện chức năng.

**Postconditions:** Thay đổi tài khoản Admin/Staff đúng quyền. Tài khoản Admin đầu tiên được khởi tạo sẵn.

## UC-AS-08 — Gỡ tin vi phạm

**Actor:** `Staff`, `Admin`.

**Preconditions:** Tin đang hiển thị và có căn cứ vi phạm.

**Main Flow:**

1. Xem tin và căn cứ vi phạm.
2. Ghi lý do, xác nhận gỡ tin.
3. Hệ thống kiểm tra quyền và trạng thái, ngừng hiển thị tin; lưu người xử lý và kết quả.

**Alternative / Exception Flows:** Bỏ xác nhận thì không gỡ. Cách lưu trữ tin và ảnh hưởng đến đơn đang có cần bổ sung; không tự hủy đơn hoặc xóa lịch sử.

**Postconditions:** Tin vi phạm bị gỡ. Không tự khóa tài khoản chủ xe.

## UC-AS-09 — Khóa tài khoản người dùng

**Actor:** `Staff`, `Admin`.

**Preconditions:** Tài khoản mục tiêu là người thuê hoặc chủ xe và có căn cứ vi phạm.

**Main Flow:**

1. Xem tài khoản và nội dung vi phạm.
2. Chọn mức vi phạm, ghi lý do: nhẹ khóa 7 ngày, trung bình khóa 30 ngày, nặng khóa vĩnh viễn.
3. Xác nhận; hệ thống kiểm tra quyền, lưu thời hạn, Actor và kết quả.

**Alternative / Exception Flows:** Staff không được khóa Staff hoặc Admin. Tài khoản đã đổi trạng thái thì kiểm tra lại trước khi lưu. Hiệu lực lên phiên đang hoạt động và đơn hiện có cần được bổ sung.

**Postconditions:** Khóa tài khoản theo mức vi phạm. Không tự gỡ mọi tin hoặc hủy mọi đơn của tài khoản.

## Lỗi và quy tắc chung

Yêu cầu đăng nhập, đúng quyền và kiểm tra lại trạng thái trước khi lưu. Không có quyền thì từ chối; lỗi lưu thì không báo thành công. Khi dữ liệu được người khác thay đổi, tải lại kết quả trước khi tiếp tục.

Gỡ tin và khóa tài khoản được giữ thành hai chức năng riêng. Việc từ chối hồ sơ là một kết quả trong chức năng xét duyệt, không cần tách thêm chức năng chỉ để tăng số lượng trên sơ đồ.
