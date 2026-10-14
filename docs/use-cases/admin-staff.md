---
title: "PBL — Đặc tả chức năng quản trị"
project: PBL3
category: documents
type: specification
version: "1.0"
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/specification]
aliases:
  - "Admin Staff Use Cases"
---

# PBL — Đặc tả chức năng quản trị

`Staff` và `Admin` kế thừa `Base User`. `Staff` quản lý tài khoản `Renter`, `Owner` và tin đăng trong phạm vi được cấp quyền. `Admin` có toàn bộ chức năng quản trị của `Staff`, đồng thời có thêm quyền quản lý cấu hình hệ thống, xem báo cáo toàn nền tảng và quản lý các tài khoản `Staff` hoặc `Admin` khác.

Quy tắc chung: [Quy tắc thuê xe](../requirements/shared-rental-rules.md).

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
| UC-AS-09 | Khóa hoặc mở khóa tài khoản người dùng | Có                            | Có    |
| UC-AS-10 | Xử lý báo cáo đánh giá        | Có                                   | Có    |
| UC-AS-11 | Tạm dừng quyền chủ xe         | Có                                   | Có    |

Các quyết định xử lý do `Staff` thực hiện không được tác động đến tài khoản thuộc `Staff` hoặc `Admin`. Do hai nhóm người dùng này cùng sử dụng Identity Role `Admin`, hệ thống phải kiểm tra `Permission` và loại tài khoản mục tiêu, thay vì chỉ dựa trên tên role.

## UC-AS-01 — Duyệt hồ sơ chủ xe

**Actor:** `Staff`, `Admin`

**Objective:** Cho phép nhân sự có thẩm quyền xét duyệt hồ sơ đăng ký quyền `Owner`.

**Description:** Người xử lý kiểm tra hồ sơ và xe đầu tiên, ghi quyết định; hệ thống cấp quyền `Owner` khi hồ sơ được chấp thuận.

**Preconditions:** Hồ sơ đăng ký làm chủ xe theo UC-U-07 đang chờ xét duyệt.

**Main Flow:**

1. Mở hồ sơ, xem ảnh CCCD và tối thiểu một xe đầu tiên cùng giấy đăng ký xe, bảo hiểm, thời hạn bảo hiểm đã gửi.
2. Kiểm tra hồ sơ có đủ thông tin, ảnh và xe chính chủ theo yêu cầu hay không.
3. Chọn chấp thuận hoặc từ chối; hệ thống lưu kết quả. Nếu chấp thuận, hệ thống bổ sung quyền `Owner` cho tài khoản và giữ quyền `Renter` hiện có.

**Alternative / Exception Flows:** Hồ sơ thiếu thông tin, CCCD hoặc xe và giấy tờ bắt buộc thì từ chối kèm lý do; không cấp quyền `Owner`. Người đăng ký được bổ sung hồ sơ và gửi lại để xét duyệt. Hồ sơ đã được xử lý thì không ghi đè quyết định cũ.

**Postconditions:** Lưu kết quả và lý do từ chối nếu có. Việc duyệt hồ sơ không xác minh tính xác thực của CCCD, giấy tờ xe hoặc danh tính ngoài hệ thống; xe đầu tiên chỉ hiển thị sau khi tin được duyệt.

## UC-AS-02 — Kiểm duyệt bài đăng

**Actor:** `Staff`, `Admin`

**Objective:** Đảm bảo chỉ các tin xe đáp ứng yêu cầu mới được hiển thị công khai.

**Description:** Người xử lý xem thông tin và giấy tờ của xe, kiểm tra điều kiện rồi ghi quyết định chấp thuận hoặc từ chối tin.

**Preconditions:** Có tin xe mới hoặc thay đổi thông tin định danh xe cần xem xét.

**Main Flow:**

1. Mở tin, xem thông tin xe, biển số, ảnh, giấy đăng ký xe và bảo hiểm đã cung cấp.
2. Kiểm tra tin đủ thông tin và giấy tờ bắt buộc, bảo hiểm còn hạn, biển số chưa trùng và chủ xe còn quyền hoạt động.
3. Lưu kết quả chấp thuận hoặc từ chối; chỉ tin được chấp thuận mới hiển thị.
4. Nếu tin đang hiển thị có vi phạm cần gỡ, thực hiện UC-AS-08.

**Alternative / Exception Flows:** Thiếu giấy đăng ký xe, bảo hiểm hết hạn hoặc biển số trùng thì từ chối và nêu lý do. Sửa thông tin định danh xe cần duyệt lại; sửa giá hoặc địa điểm không cần duyệt lại. Bảo hiểm hết hạn sau khi tin được đăng thì xe ngừng hiển thị cho đến khi cập nhật và được duyệt lại.

**Postconditions:** Lưu kết quả kiểm duyệt; không tự khóa chủ xe và không xác minh giấy tờ với nguồn bên ngoài.

## UC-AS-03 — Quản lý người thuê và chủ xe

**Actor:** `Staff`, `Admin`

**Objective:** Cho phép nhân sự có thẩm quyền quản lý tài khoản người thuê và chủ xe trong phạm vi được giao.

**Description:** Người xử lý tra cứu tài khoản, xem thông tin cần thiết và thực hiện các thao tác quản lý hợp lệ theo quyền.

**Preconditions:** Tài khoản mục tiêu là Renter hoặc Owner.

**Main Flow:**

1. Mở danh sách tài khoản người dùng.
2. Chọn tài khoản để xem thông tin cá nhân và giấy tờ trong phạm vi nhiệm vụ, không công khai cho người dùng khác.
3. Nếu có vi phạm cần khóa hoặc mở khóa, thực hiện UC-AS-09. Người xử lý không sửa trực tiếp thông tin cá nhân; người dùng tự cập nhật qua UC-U-05.
4. Hiển thị kết quả cập nhật.

**Alternative / Exception Flows:** Staff chọn tài khoản `Staff` hoặc `Admin` thì từ chối thao tác. Dữ liệu cá nhân không được sửa qua chức năng quản trị này.

**Postconditions:** Chỉ hiển thị thông tin cần thiết và chuyển sang chức năng xử lý được phép; không sửa dữ liệu cá nhân hoặc tài khoản `Staff`/`Admin`.

## UC-AS-04 — Xử lý khiếu nại

**Actor:** `Staff` trong phạm vi người dùng và tin đăng; `Admin`.

**Objective:** Cho phép nhân sự có thẩm quyền xem xét và ghi nhận kết quả xử lý khiếu nại.

**Description:** Người xử lý đánh giá thông tin vụ việc, áp dụng biện pháp trong thẩm quyền hoặc chuyển cấp, rồi lưu trạng thái xử lý.

**Preconditions:** Có dispute `Open` với mô tả đã được tiếp nhận; ảnh minh họa có thể có hoặc không.

**Main Flow:**

1. Mở khiếu nại chờ xử lý, xem yêu cầu thuê, mô tả và ảnh đính kèm nếu có.
2. Xem xét thông tin đã gửi.
3. Chọn kết quả `None`, `CancelOwnerFault` hoặc `ForceComplete` và nhập nội dung xử lý. `CancelOwnerFault` chỉ áp dụng khi booking `Accepted`, đã đến `start_date` và xác định Owner không giao xe. `ForceComplete` chỉ áp dụng khi booking `Ongoing`, chuyến đã thực tế kết thúc nhưng thiếu xác nhận `Return`.
4. Hệ thống khóa dispute, booking và dữ liệu thanh toán, rồi kiểm tra lại điều kiện của kết quả đã chọn.
5. Với `None`, hệ thống chỉ lưu ghi chú. Với `CancelOwnerFault`, trong cùng transaction hệ thống chuyển booking sang `Cancelled`, ghi `cancelled_at`, `cancelled_by` là ID người xử lý, `cancel_reason` bắt buộc, giải phóng lịch, hoàn cọc bằng `REFUND-{bookingId}` và tạo khoản phạt 40% bằng `PENALTY-{bookingId}` ở trạng thái `Pending`. Với `ForceComplete`, trong cùng transaction hệ thống chuyển booking sang `Completed` và settlement theo quy tắc hoàn tất.
6. Hệ thống chuyển dispute sang `Resolved`, lưu `resolution_action`, người xử lý, thời điểm và nội dung kết quả.

**Alternative / Exception Flows:** Nếu vụ việc vượt thẩm quyền của `Staff`, hệ thống chuyển để `Admin` xem xét. Khi chưa đủ căn cứ, dispute tiếp tục `Open`. Khiếu nại sau `Completed` chỉ được xử lý bằng `None`. Trạng thái booking không phù hợp, chưa đến `start_date`, dữ liệu đã đổi hoặc một bước dòng tiền thất bại thì rollback và không resolve dispute. Gửi lại thao tác không tạo hoàn cọc, settlement hoặc khoản phạt trùng. Việc bồi thường, bảo hiểm hoặc phân xử thực tế không do hệ thống thực hiện.

**Postconditions:** Dispute `Resolved` với `resolution_action` đã chọn. `None` không đổi booking hoặc dòng tiền; `CancelOwnerFault` tạo booking `Cancelled`, cọc `Refunded` và khoản phạt `Pending`; `ForceComplete` tạo booking `Completed` cùng settlement. Owner thanh toán khoản phạt qua UC-O-08.

## UC-AS-05 — Xem báo cáo toàn nền tảng

**Actor:** `Admin`.

**Objective:** Cung cấp cho quản trị viên số liệu tổng hợp về hoạt động kinh doanh toàn nền tảng.

**Description:** Hệ thống tổng hợp các chuyến đã hoàn tất và hiển thị tiền thuê, hoa hồng cùng phần doanh thu của chủ xe theo thời gian.

**Preconditions:** Có quyền Admin.

**Main Flow:**

1. Mở báo cáo doanh thu.
2. Hệ thống tổng hợp các đơn Completed trong khoảng thời gian được xem.
3. Hiển thị tổng tiền thuê, hoa hồng nền tảng và phần thuộc các chủ xe (Owner).

**Alternative / Exception Flows:** Không có dữ liệu thì hiển thị 0; lỗi tổng hợp thì báo lỗi. Staff không được truy cập báo cáo toàn nền tảng theo giới hạn quyền hiện tại.

**Postconditions:** Chỉ hiển thị số liệu. Báo cáo nâng cao là phần mở rộng; giao dịch trả tiền mô phỏng cho chủ xe được theo dõi riêng.

## UC-AS-06 — Cấu hình hoa hồng

**Actor:** `Admin`.

**Objective:** Cho phép quản trị viên thiết lập tỷ lệ hoa hồng áp dụng cho hệ thống.

**Description:** Quản trị viên nhập tỷ lệ mới; hệ thống kiểm tra, lưu và áp dụng cho các giao dịch phát sinh sau đó.

**Preconditions:** Có quyền quản lý cấu hình.

**Main Flow:**

1. Xem tỷ lệ hoa hồng hiện tại; giá trị mặc định là 5%.
2. Nhập giá trị mới trong khoảng `[0; 0,25]`.
3. Hệ thống kiểm tra giá trị và lưu thay đổi; tỷ lệ mới có hiệu lực ngay.

**Alternative / Exception Flows:** Staff truy cập thì từ chối. Giá trị ngoài `[0; 0,25]` hoặc không hợp lệ thì không lưu; thay đổi không tự tính lại doanh thu đã ghi nhận.

**Postconditions:** Lưu một giá trị cấu hình hoa hồng trong `[0; 0,25]` có hiệu lực ngay; không lập lịch áp dụng trong tương lai và không mở rộng thành hệ thống cấu hình phức tạp.

## UC-AS-07 — Quản lý tài khoản Staff/Admin

**Actor:** `Admin`.

**Objective:** Cho phép quản trị viên quản lý vòng đời và quyền của các tài khoản vận hành hệ thống.

**Description:** Quản trị viên chọn tài khoản `Staff` hoặc `Admin`, thực hiện thao tác được phép; hệ thống kiểm tra quyền và lưu thay đổi.

**Preconditions:** Có quyền quản lý Staff và Admin khác.

**Main Flow:**

1. Mở danh sách tài khoản Admin và Staff.
2. Chọn tài khoản và thao tác tạo, cấp quyền, tạm dừng hoặc quản lý theo danh mục được phép.
3. Hệ thống kiểm tra quyền Admin và bảo đảm sau thao tác vẫn còn ít nhất một Admin hoạt động có `CanManageAdminAccounts`, rồi lưu thay đổi.

**Alternative / Exception Flows:** Staff không được thực hiện, kể cả tự gửi yêu cầu trực tiếp. Hệ thống từ chối thao tác tạm dừng hoặc thu hồi quyền của Admin hoạt động cuối cùng có `CanManageAdminAccounts`. Tạm dừng tài khoản vận hành phải ghi lý do và thời hạn.

**Postconditions:** Thay đổi tài khoản Admin/Staff đúng quyền. Tài khoản Admin đầu tiên được khởi tạo sẵn.

## UC-AS-08 — Gỡ tin vi phạm

**Actor:** `Staff`, `Admin`.

**Objective:** Cho phép nhân sự có thẩm quyền ngừng hiển thị tin xe vi phạm.

**Description:** Người xử lý xem căn cứ, ghi lý do và xác nhận; hệ thống gỡ tin khỏi khu vực công khai và lưu kết quả.

**Preconditions:** Tin đang hiển thị và có căn cứ vi phạm.

**Main Flow:**

1. Xem tin và căn cứ vi phạm.
2. Ghi lý do, xác nhận gỡ tin.
3. Hệ thống kiểm tra quyền và trạng thái, chuyển `vehicle_listings.moderation_status` sang `Hidden`, chặn hold mới; lưu người xử lý và kết quả. Listing, ảnh, lịch sử và booking đã tạo được giữ nguyên.

**Alternative / Exception Flows:** Bỏ xác nhận thì không gỡ. Muốn hiển thị lại, Owner sửa thông tin và tin phải được Staff/Admin duyệt lại theo UC-AS-02. Booking đã tạo không bị hủy hoặc thay đổi.

**Postconditions:** Tin ở trạng thái `Hidden`, không nhận hold mới; dữ liệu và booking đã tạo được giữ nguyên. Không tự khóa tài khoản chủ xe.

## UC-AS-09 — Khóa hoặc mở khóa tài khoản người dùng

**Actor:** `Staff`, `Admin`.

**Objective:** Cho phép nhân sự có thẩm quyền khóa tài khoản người dùng vi phạm hoặc kết thúc sớm sanction còn hiệu lực.

**Description:** Người xử lý tạo sanction theo mức vi phạm hoặc mở khóa bằng cách ghi nhận người và thời điểm kết thúc hiệu lực; lịch sử sanction được giữ nguyên.

**Preconditions:** Tài khoản mục tiêu là `Renter` hoặc `Owner`; thao tác khóa có căn cứ vi phạm, thao tác mở khóa có sanction còn hiệu lực.

**Main Flow:**

1. Xem tài khoản và nội dung vi phạm.
2. Chọn khóa hoặc mở khóa tài khoản và ghi lý do.
3. Nếu khóa, chọn mức vi phạm: nhẹ khóa 7 ngày, trung bình khóa 30 ngày, nặng khóa vĩnh viễn. Hệ thống kiểm tra tài khoản chưa có sanction còn hiệu lực rồi tạo `account_sanction` với thời hạn và người xử lý.
4. Nếu mở khóa, hệ thống kiểm tra sanction còn hiệu lực rồi ghi `lifted_at`, `lifted_by`; không xóa bản ghi sanction.
5. Hệ thống lưu kết quả sau khi kiểm tra quyền và trạng thái hiện tại.

**Alternative / Exception Flows:** Staff không được khóa hoặc mở khóa `Staff` hoặc `Admin`. Tài khoản đã có sanction còn hiệu lực khi khóa, không có sanction còn hiệu lực khi mở khóa hoặc đã đổi trạng thái thì từ chối sau khi kiểm tra lại. Thao tác lặp không tạo thay đổi trùng. Tạm dừng riêng quyền `Owner` thực hiện theo UC-AS-11; chuyến `Ongoing` không tự hủy.

**Postconditions:** Khóa tài khoản tạo sanction còn hiệu lực; mở khóa kết thúc hiệu lực bằng `lifted_at`, `lifted_by`. Không tự gỡ mọi tin hoặc hủy mọi đơn của tài khoản.

## UC-AS-10 — Xử lý báo cáo đánh giá

**Actor:** `Staff`, `Admin`.

**Objective:** Cho phép nhân sự có thẩm quyền xem xét báo cáo về đánh giá của người dùng.

**Description:** Người xử lý kiểm tra nội dung và căn cứ báo cáo, ghi kết quả hoặc chuyển cấp theo phạm vi quyền.

**Preconditions:** Có báo cáo đánh giá kèm thông tin, do người dùng gửi theo UC-S-04.

**Main Flow:**

1. Mở báo cáo, xem nội dung đánh giá và thông tin kèm theo.
2. Xem xét căn cứ và ghi nhận kết quả xử lý trong phạm vi quyền.
3. Cập nhật trạng thái báo cáo; nếu cần xử lý tài khoản thì thực hiện chức năng tương ứng riêng.

**Alternative / Exception Flows:** Thiếu thông tin thì yêu cầu bổ sung; vượt thẩm quyền Staff thì chuyển Admin. Báo cáo không tự xóa đánh giá hoặc khóa tài khoản.

**Postconditions:** Kết quả báo cáo được lưu, đánh giá không bị người gửi sửa hoặc xóa.

## UC-AS-11 — Tạm dừng quyền chủ xe

**Actor:** `Staff`, `Admin`.

**Objective:** Cho phép nhân sự có thẩm quyền tạm dừng riêng quyền kinh doanh của một chủ xe vi phạm.

**Description:** Người xử lý ghi lý do và thời hạn; hệ thống ngừng hiển thị xe, chặn yêu cầu mới và xử lý các yêu cầu chưa bắt đầu.

**Preconditions:** Tài khoản có quyền `Owner` và có căn cứ tạm dừng.

**Main Flow:**

1. Xem hồ sơ, xe, các yêu cầu thuê và khoản phạt `Pending` của chủ xe; ghi lý do, thời hạn và xác nhận tạm dừng. Khoản phạt chưa thanh toán có thể là căn cứ xử lý.
2. Hệ thống ngừng hiển thị mọi xe của chủ xe và chặn yêu cầu thuê mới.
3. Hệ thống hủy các yêu cầu `Pending` và `Accepted` của chủ xe, hoàn cọc mô phỏng; không tự hủy chuyến `Ongoing`.
4. Lưu người xử lý, thời điểm và kết quả; vụ việc liên quan chuyến đang diễn ra được xử lý riêng.

**Alternative / Exception Flows:** Nếu quyền chủ xe hoặc yêu cầu thuê đã đổi trạng thái thì kiểm tra lại trước khi lưu. Vụ việc liên quan chuyến `Ongoing` được xử lý riêng, không tự chuyển chuyến sang `Cancelled`.

**Postconditions:** Quyền chủ xe bị tạm dừng, xe ngừng hiển thị, yêu cầu chưa bắt đầu được hủy và hoàn cọc; quyền `Renter` của cùng tài khoản không tự bị khóa. Owner vẫn được dùng UC-O-08 để thanh toán khoản phạt mô phỏng.

## Lỗi và quy tắc chung

Yêu cầu đăng nhập, đúng quyền và kiểm tra lại trạng thái trước khi lưu. Không có quyền thì từ chối; lỗi lưu thì không báo thành công. Khi dữ liệu được người khác thay đổi, tải lại kết quả trước khi tiếp tục.

Gỡ tin và khóa tài khoản được giữ thành hai chức năng riêng. Việc từ chối hồ sơ là một kết quả trong chức năng xét duyệt, không cần tách thêm chức năng chỉ để tăng số lượng trên sơ đồ.
