---
title: "PBL — Quy tắc thuê xe"
project: PBL3
category: documents
type: specification
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/specification]
---

# PBL — Quy tắc thuê xe

Đây là các quy tắc nghiệp vụ đã chốt cho phạm vi chức năng v1 của hệ thống web trung gian cho thuê ô tô PBL3. Các đặc tả chức năng sử dụng chung nội dung này.

## 1. Người sử dụng

- **Khách truy cập** (`Visitor`): người chưa đăng nhập, thực hiện đăng ký, đăng nhập và các chức năng công khai.
- **Người dùng cơ sở** (`Base User`): người dùng đã xác thực, thực hiện các chức năng tài khoản chung sau đăng nhập và đăng ký làm chủ xe.
- **Người thuê** (`Renter`): tạo và quản lý yêu cầu thuê. Tài khoản đăng ký công khai được cấp quyền này ngay khi tạo.
- **Chủ xe** (`Owner`): đăng xe, quyết định yêu cầu thuê và bàn giao xe sau khi hồ sơ được chấp thuận; tài khoản vẫn giữ quyền `Renter`.
- **Nhân viên** (`Staff`): xét duyệt hồ sơ, xe và xử lý người dùng, tin đăng, khiếu nại trong phạm vi được cấp.
- **Quản trị viên** (`Admin`): có toàn bộ chức năng quản trị của `Staff`, đồng thời quản lý tài khoản vận hành và cấu hình toàn nền tảng.

`Renter`, `Owner`, `Staff` và `Admin` kế thừa `Base User`. `Admin` có toàn bộ chức năng quản trị của `Staff`. `Visitor` và `Base User` chỉ là tác nhân phân tích, không phải vai trò lưu trong cơ sở dữ liệu. Một tài khoản có thể đồng thời có quyền `Renter` và `Owner`. Tài khoản `Staff`/`Admin` được cấp riêng, không tạo bằng đăng ký công khai. Trong ASP.NET Core Identity, hệ thống chỉ dùng các vai trò `Renter`, `Owner` và `Admin`; hai nhóm vận hành cùng dùng vai trò `Admin` và được phân biệt bằng quyền chi tiết; xem [ghi chú kỹ thuật](../architecture/technical-notes.md).

## 2. Hồ sơ và tin đăng

`Visitor` và `Base User` được xem, tìm kiếm xe. Trước khi `Renter` tạo yêu cầu thuê, hồ sơ người dùng phải có số GPLX, hạng, ngày hết hạn và ảnh đã lưu; GPLX phải còn hiệu lực đến hết ngày trả xe của khoảng thuê. Điều kiện này được kiểm tra khi tạo hold và khi cọc. Hệ thống kiểm tra thông tin đã cung cấp và thời hạn, không xác minh tính xác thực của GPLX.

`Base User` đăng ký làm chủ xe bằng hồ sơ có ảnh CCCD và tối thiểu một xe kèm giấy đăng ký xe, thông tin bảo hiểm và thời hạn bảo hiểm. `Staff`/`Admin` duyệt thủ công rồi chấp thuận hoặc từ chối kèm lý do. Trong phạm vi học tập, hệ thống chỉ kiểm tra các trường và ảnh bắt buộc, không xây bộ tiêu chí thẩm định và không xác minh giấy tờ hoặc danh tính với nguồn bên ngoài.

Chủ xe được thêm xe sau khi có quyền `Owner`. Xe phải có giấy đăng ký xe và bảo hiểm còn hạn, biển số không trùng xe khác, và chỉ hiển thị sau khi tin được xét duyệt. Sửa thông tin định danh của xe cần duyệt lại; sửa giá hoặc địa điểm không cần duyệt lại và không đổi giá của yêu cầu đã được chấp thuận. Bảo hiểm hết hạn làm xe ngừng hiển thị và không nhận yêu cầu mới cho đến khi giấy tờ được cập nhật, duyệt lại.

## 3. Yêu cầu thuê và giữ lịch

1. Người thuê chọn xe, khoảng thời gian và xem giá. Giá tính theo ngày với công thức `số ngày = max(1, ceil((thời điểm trả - thời điểm nhận) / 24 giờ))`; phần ngày lẻ làm tròn lên và tối thiểu tính một ngày.
2. Hệ thống tạo `DepositHold` ở trạng thái `AwaitingDeposit` để lưu xe, khoảng thời gian, tổng giá và số tiền cọc do phía máy chủ tính. `DepositHold` không khóa lịch, không có thời hạn tự hết hiệu lực; nhiều người thuê có thể có các hold giao nhau cho cùng một xe. Hold chuyển `Cancelled` khi người thuê chủ động bỏ hoặc không còn hợp lệ lúc cọc.
3. Khi người thuê xác nhận cọc, hệ thống khóa hold và dữ liệu theo xe. Hệ thống kiểm tra hold thuộc `Renter` hiện tại và đang `AwaitingDeposit`; `start_date` còn ở tương lai; tin `Public`; xe `Approved`; bảo hiểm còn hạn; `Owner` còn `Active`; giá tin không đổi so với hold; GPLX còn hiệu lực đến hết `end_date`; `Renter` không có `account_sanction` còn hiệu lực; xe không giao với `vehicle_unavailability` hoặc booking `Pending`, `Accepted`, `Ongoing`. Số tiền cọc lấy từ hold phía máy chủ, không nhận từ client.
4. Nếu các điều kiện hợp lệ, hệ thống ghi giao dịch cọc, tạo booking `Pending`, tạo dữ liệu thanh toán và chuyển hold sang `Converted` trong cùng một transaction. Nếu điều kiện không hợp lệ, xung đột lịch, giao dịch mô phỏng thất bại hoặc một bước bị lỗi thì rollback, chuyển hold sang `Cancelled` và trả lỗi phù hợp; xung đột lịch trả `409`. Hold không bị xóa và không tồn tại booking `Pending` tạo dở.
5. Booking `Pending` được tạo sau khi cọc thành công, bắt đầu thời hạn phản hồi **1 ngày (24 giờ)** của chủ xe và khóa lịch ngay từ thời điểm đó. Các trạng thái khóa lịch là `Pending`, `Accepted`, `Ongoing`; `Rejected`, `Expired`, `Cancelled` không khóa lịch và `Completed` không ảnh hưởng lịch tương lai.
6. Chủ xe chỉ chấp thuận hoặc từ chối booking `Pending` hiện tại. Chấp thuận chuyển booking sang `Accepted` và tiếp tục giữ lịch; từ chối chuyển sang `Rejected`, hoàn cọc và giải phóng lịch. Quyết định không tác động booking khác.
7. Nếu hết 24 giờ mà chủ xe chưa phản hồi, booking chuyển `Expired`, được hoàn cọc và giải phóng lịch.

Khả dụng phải được kiểm tra theo xe, không chỉ theo tin đăng. Một khoảng thời gian không còn trống nếu giao với `vehicle_unavailability` hoặc booking cùng xe ở trạng thái `Pending`, `Accepted`, `Ongoing`, theo điều kiện `new_start < existing_end` và `new_end > existing_start`. Việc khóa dữ liệu theo xe, kiểm tra lại khả dụng, ghi cọc, tạo booking/payment và chuyển hold sang `Converted` phải được thực hiện nguyên tử để hai hold giao nhau không cùng tạo booking khóa lịch.

## 4. Hủy, hoàn cọc và khoản phạt

- Người thuê hủy khi yêu cầu còn `Pending`: hủy và hoàn toàn bộ cọc mô phỏng.
- Người thuê hủy sau khi `Accepted` nhưng trước khi bắt đầu chuyến: hủy, giải phóng lịch và mất khoản cọc. Cọc được chuyển cho `Owner` sau khi trừ hoa hồng; trạng thái cọc là `Forfeited`.
- Chủ xe tự hủy sau khi `Accepted`: hoàn cọc và thanh toán khoản phạt mô phỏng bằng **40% giá trị chuyến** từ `Owner` sang `Renter` trong cùng một transaction. Nếu thanh toán phạt thất bại thì rollback và booking giữ `Accepted`.
- Chủ xe không giao xe: `Renter` gửi khiếu nại; `Staff`/`Admin` xử lý bằng `CancelOwnerFault` khi booking đang `Accepted`, đã đến `start_date` và xác định lỗi `Owner`. Hệ thống hủy booking, hoàn cọc, giải phóng lịch và tạo giao dịch phạt 40% ở trạng thái `Pending`. `Owner` thanh toán khoản phạt qua tài khoản ngân hàng giả lập; khoản phạt chưa thanh toán có thể là căn cứ tạm dừng quyền `Owner`.
- Yêu cầu bị chủ xe từ chối, hết hạn hoặc bị hủy do chủ xe bị tạm dừng quyền: hoàn toàn bộ cọc mô phỏng.
- Sau khi chuyến bắt đầu (`Ongoing`), hai bên không hủy yêu cầu; vấn đề phát sinh được gửi khiếu nại.

Renter hoặc Owner tự hủy, và Owner từ chối booking, không bắt buộc nhập lý do. Khi `Staff`/`Admin` xử lý `CancelOwnerFault`, nội dung xử lý và `cancel_reason` là bắt buộc. Khiếu nại phải có mô tả; ảnh là tùy chọn. Hệ thống không thu khoản phạt hoặc thực hiện hoàn tiền thật.

## 5. Cọc, thanh toán và doanh thu

Hệ thống ngân hàng giả lập gồm `mock_bank_accounts` và các giao dịch mô phỏng để nhận, tạm giữ, hoàn cọc, chuyển cọc và thanh toán khoản phạt. Mỗi tài khoản người dùng có một tài khoản ngân hàng giả lập; `PlatformEscrow` được tạo sẵn. Tài khoản không lưu giá trị tiền và không hỗ trợ bổ sung tiền; hệ thống không kiểm tra khả năng chi trả. Giao dịch mô phỏng có thể thất bại hoặc bị hủy thao tác. Không kết nối ngân hàng hoặc thực hiện chuyển tiền thật.

Phần tiền thuê còn lại bằng `price_locked_total - deposit_amount` chỉ được hiển thị để tham khảo. `Renter` và `Owner` tự xử lý khoản này ngoài hệ thống; hệ thống không theo dõi trạng thái hoặc giao dịch của khoản tiền còn lại.

Khi booking chuyển `Completed`, hệ thống lấy tỷ lệ hoa hồng hiện tại từ `system_settings`, tính hoa hồng trên `price_locked_total` và tự động chuyển `deposit_amount - commission_amount` từ `PlatformEscrow` cho `Owner` trong cùng transaction. Hoa hồng được giữ lại tại `PlatformEscrow`; trạng thái cọc chuyển `Transferred` và ghi `revenue_recorded_at`. Với cọc bị mất do `Renter` hủy booking `Accepted`, hệ thống áp dụng cùng công thức, chuyển trạng thái cọc sang `Forfeited` và ghi nhận doanh thu. Chủ xe xem tổng tiền thuê, hoa hồng, phần nhận qua hệ thống và phần còn lại thu trực tiếp để tham khảo; dòng `Forfeited` được hiển thị riêng. Tỷ lệ hoa hồng mặc định là **5%**, nằm trong `[0; 0,25]`, có hiệu lực ngay khi lưu và không tính lại doanh thu đã ghi nhận. Giá trị tiền lưu với hai chữ số thập phân.

## 6. Giao và trả xe

Ở đầu chuyến, cả chủ xe và người thuê xác nhận giao, nhận xe trên hệ thống. Hệ thống lưu người và thời điểm xác nhận của từng bên; mới một bên xác nhận thì tiếp tục chờ, đủ hai xác nhận thì yêu cầu chuyển `Ongoing`. Xác nhận đầu tiên được giữ nguyên, không bị xóa hoặc đặt lại do thời gian chờ; xác nhận chỉ không còn được dùng để chuyển trạng thái khi booking đã chuyển sang trạng thái không còn hợp lệ. Không bắt buộc ảnh. Số công-tơ-mét và nhiên liệu do hai bên tự thỏa thuận, hệ thống không theo dõi.

Khi trả xe, hai bên xác nhận riêng; mới một bên xác nhận thì tiếp tục chờ, đủ hai xác nhận thì yêu cầu chuyển `Completed` mà không phụ thuộc trạng thái khiếu nại. Xác nhận đã lưu không hết hạn và không bị xóa hoặc đặt lại do thời gian chờ. Nếu một bên không xác nhận hoặc có bất đồng, bên còn lại có thể gửi khiếu nại để `Staff`/`Admin` xử lý theo mục 7. Khiếu nại được theo dõi riêng và không tự đổi trạng thái yêu cầu thuê. Hệ thống không dùng OTP/QR, không xác minh hiện trạng xe hoặc giải quyết bồi thường thực tế.

## 7. Đánh giá, báo cáo và khiếu nại

Mỗi bên được đánh giá bên còn lại một lần cho mỗi yêu cầu `Completed`. Đánh giá không được sửa hoặc xóa bởi người gửi. Đánh giá được công khai khi cả hai bên đã gửi hoặc sau 7 ngày từ lúc hoàn tất, tùy điều kiện nào đến trước. Người dùng có thể báo cáo đánh giá kèm thông tin để `Staff`/`Admin` xem xét.

Người thuê hoặc chủ xe có thể gửi khiếu nại liên quan đến yêu cầu thuê. Nội dung phải có mô tả; người gửi có thể đính kèm ảnh nhưng không bắt buộc. Khiếu nại không được chỉnh sửa sau khi gửi và không có thời hạn gửi. Yêu cầu hợp lệ được lưu ở trạng thái chờ xử lý. Gửi khiếu nại không tự khóa xe, tài khoản hay khoản tiền, cũng không tự kết luận vi phạm hoặc đổi trạng thái booking.

`Staff`/`Admin` chọn một kết quả xử lý: `None` để chỉ ghi chú; `CancelOwnerFault` khi dispute `Open`, booking `Accepted`, đã đến `start_date` và xác định `Owner` không giao xe; hoặc `ForceComplete` khi dispute `Open`, booking `Ongoing`, chuyến đã thực tế kết thúc nhưng thiếu xác nhận `Return`. `CancelOwnerFault` khóa dispute, booking và payment; trong cùng transaction chuyển booking sang `Cancelled`, ghi người, thời điểm, lý do bắt buộc, giải phóng lịch, hoàn cọc bằng `REFUND-{bookingId}`, tạo khoản phạt `PENALTY-{bookingId}` ở trạng thái `Pending` và resolve dispute. `ForceComplete` chuyển `Completed` và settlement trong cùng transaction. Lỗi thì rollback; thao tác lặp không tạo dòng tiền trùng. Khiếu nại gửi sau `Completed` chỉ dùng `None`. Xử lý tai nạn, định giá thiệt hại, bảo hiểm và phân xử pháp lý thực tế nằm ngoài phạm vi đồ án.

## 8. Tạm dừng và xử lý vi phạm

Nhân viên được xử lý tài khoản người thuê, quyền chủ xe và tin đăng trong phạm vi quyền được cấp; không được thay đổi tài khoản `Staff` hoặc `Admin`. Quản trị viên quản lý cả tài khoản vận hành. Quyết định tạm dừng hoặc khóa phải ghi lý do, người thực hiện và thời hạn.

| Mức vi phạm | Thời hạn khóa tài khoản |
| --- | --- |
| Nhẹ | 7 ngày |
| Trung bình | 30 ngày |
| Nặng | Vĩnh viễn |

Khi quyền `Owner` bị tạm dừng, mọi xe của chủ xe ngừng hiển thị và không nhận yêu cầu mới. Các yêu cầu `Pending` và `Accepted` được hệ thống hủy và hoàn cọc theo quy tắc tương ứng; chuyến `Ongoing` không tự hủy, `Staff`/`Admin` xử lý riêng nếu có vấn đề. Khoản phạt chưa thanh toán có thể là căn cứ để `Staff`/`Admin` tạm dừng quyền `Owner`; quyền bị tạm dừng không chặn `Owner` thanh toán khoản phạt mô phỏng. Gỡ một tin vi phạm không tự khóa tài khoản; xử lý đánh giá hoặc khiếu nại cũng không tự áp dụng hình phạt.

`Staff`/`Admin` chỉ xem thông tin cần thiết và không sửa trực tiếp thông tin cá nhân của người dùng. Khóa tài khoản tạo `account_sanction`; mở khóa ghi `lifted_at`, `lifted_by`, không xóa lịch sử; mỗi tài khoản chỉ có một sanction còn hiệu lực. Chỉ `Admin` quản lý tài khoản vận hành và không được tạm dừng hoặc thu hồi quyền của Admin hoạt động cuối cùng có `CanManageAdminAccounts`.

Gỡ tin vi phạm chuyển `vehicle_listings.moderation_status` sang `Hidden`, chặn hold mới, giữ listing, ảnh, lịch sử và booking đã tạo. Muốn hiển thị lại, `Owner` sửa thông tin và `Staff`/`Admin` duyệt lại tin.

## 9. Thông tin công khai và dữ liệu cá nhân

`Visitor` và `Base User` được xem tin xe của chủ xe và các đánh giá công khai. Mỗi `Base User` được xem, cập nhật thông tin của chính mình. Chỉ `Staff`/`Admin` được xem thông tin cá nhân của người khác trong phạm vi nhiệm vụ; giấy tờ và bằng chứng không hiển thị công khai.

Mật khẩu được băm bằng ASP.NET Core Identity. Số điện thoại được chuẩn hóa, kiểm tra duy nhất và không mã hóa ở cấp trường dữ liệu trong phiên bản v1; hệ thống giới hạn quyền xem, không công khai và không ghi đầy đủ số điện thoại vào log. Số giấy tờ và dữ liệu nhạy cảm khác cần được bảo vệ khi lưu và giới hạn truy cập. Chức năng xóa tài khoản nằm ngoài phạm vi v1 để giữ thiết kế đơn giản và bảo toàn liên kết lịch sử giao dịch.

## 10. Giới hạn phạm vi

Đồ án mô phỏng nền tảng kết nối chủ xe và người thuê. Không thực hiện xác minh pháp lý thực tế về người, xe hoặc giấy tờ; không xử lý bảo hiểm, thu nợ, chuyển tiền thật, định giá thiệt hại, theo dõi GPS, khóa xe thông minh hoặc phân xử tranh chấp ngoài hệ thống.
