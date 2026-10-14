---
title: "PBL — Đặc tả chức năng người dùng"
project: PBL3
category: documents
type: specification
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/specification]
---

# PBL — Đặc tả chức năng người dùng

`Visitor` là **Actor** chưa đăng nhập, thực hiện đăng ký, đăng nhập và các chức năng công khai như xem, tìm kiếm xe. `Base User` là Actor đã xác thực, dùng các chức năng tài khoản chung; `Renter`, `Owner`, `Staff` và `Admin` kế thừa `Base User`. `Admin` có toàn bộ chức năng quản trị của `Staff` cùng các quyền bổ sung. `Visitor` và `Base User` là Actor phân tích, không phải vai trò lưu trong cơ sở dữ liệu. Một tài khoản có thể đồng thời có quyền `Renter` và `Owner`.

## UC-U-01 — Đăng ký tài khoản

**Actor:** `Visitor`.

**Objective:** Cho phép khách truy cập tạo tài khoản để sử dụng các chức năng dành cho người dùng đã xác thực.

**Description:** Khách truy cập cung cấp thông tin đăng ký; hệ thống kiểm tra, tạo tài khoản và cấp quyền `Renter` ban đầu.

**Preconditions:** Chưa đăng nhập và chưa có tài khoản dùng để đăng nhập.

**Main Flow:**

1. Khách truy cập mở chức năng đăng ký, cung cấp email, số điện thoại và thông tin tài khoản theo yêu cầu.
2. Hệ thống chuẩn hóa số điện thoại, kiểm tra dữ liệu cùng tính duy nhất của tên đăng nhập, email và số điện thoại rồi tạo tài khoản ban đầu.
3. Hệ thống cấp quyền `Renter` cho tài khoản mới và thông báo kết quả.

**Alternative / Exception Flows:** Thông tin thiếu, không hợp lệ hoặc tên đăng nhập, email hay số điện thoại đã được sử dụng thì yêu cầu sửa; lỗi lưu thì không báo đăng ký thành công. Không yêu cầu xác minh email trong phạm vi đồ án; tài khoản `Staff`/`Admin` không tạo qua luồng này.

**Postconditions:** Tài khoản được tạo với quyền `Renter`, chưa có quyền `Owner`; hệ thống tạo một tài khoản ngân hàng giả lập cho tài khoản mới.

## UC-U-02 — Đăng nhập

**Actor:** `Visitor`.

**Objective:** Xác thực người dùng và cho phép truy cập hệ thống theo các quyền của tài khoản.

**Description:** Khách truy cập cung cấp thông tin đăng nhập; hệ thống kiểm tra tài khoản, thiết lập phiên và áp dụng quyền hiện có.

**Preconditions:** Chưa đăng nhập và đã có tài khoản.

**Main Flow:**

1. Khách truy cập nhập email hoặc số điện thoại cùng mật khẩu.
2. Nếu thông tin đăng nhập là số điện thoại, hệ thống chuẩn hóa số trước khi tra cứu; sau đó kiểm tra mật khẩu và trạng thái tài khoản.
3. Nếu hợp lệ, hệ thống cho phép truy cập các chức năng theo quyền hiện có.

**Alternative / Exception Flows:** Thông tin không đúng hoặc tài khoản không được phép đăng nhập thì từ chối và thông báo phù hợp.

**Postconditions:** Phiên đăng nhập được thiết lập; người dùng tham gia hệ thống với `Base User` và các quyền hiện có của tài khoản.

## UC-U-03 — Đăng xuất

**Actor:** `Base User`.

**Objective:** Kết thúc an toàn phiên làm việc hiện tại của người dùng.

**Description:** Người dùng yêu cầu đăng xuất; hệ thống vô hiệu hóa phiên và đưa tài khoản về trạng thái chưa đăng nhập.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Người dùng chọn đăng xuất.
2. Hệ thống kết thúc phiên đăng nhập và đưa người dùng về màn hình phù hợp.

**Alternative / Exception Flows:** Nếu phiên đã hết hiệu lực, hệ thống đưa người dùng về trạng thái chưa đăng nhập.

**Postconditions:** Phiên đăng nhập hiện tại không còn hiệu lực.

## UC-U-04 — Xem thông tin cá nhân

**Actor:** `Base User`.

**Objective:** Cho phép người dùng xem thông tin cá nhân và hồ sơ liên quan của chính mình.

**Description:** Hệ thống truy xuất và hiển thị thông tin tài khoản cùng các phần hồ sơ mà người dùng được phép xem.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Người dùng mở thông tin cá nhân.
2. Hệ thống hiển thị thông tin của chính tài khoản đó và các phần hồ sơ được phép xem, gồm GPLX hoặc hồ sơ chủ xe nếu tài khoản có dữ liệu tương ứng.

**Alternative / Exception Flows:** Không lấy được dữ liệu thì báo lỗi; không hiển thị hồ sơ của tài khoản khác.

**Postconditions:** Chỉ hiển thị thông tin, không thay đổi tài khoản.

## UC-U-05 — Cập nhật thông tin cá nhân

**Actor:** `Base User`.

**Objective:** Cho phép người dùng cập nhật các thông tin cá nhân được phép thay đổi.

**Description:** Người dùng chỉnh sửa hồ sơ; hệ thống kiểm tra dữ liệu và lưu các thay đổi hợp lệ cho đúng tài khoản.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Người dùng mở thông tin cá nhân và sửa các trường được phép cập nhật.
2. Hệ thống kiểm tra dữ liệu và quyền đối với tài khoản; nếu thay đổi số điện thoại thì chuẩn hóa và kiểm tra số chưa được tài khoản khác sử dụng.
3. Hệ thống lưu thay đổi hợp lệ và hiển thị thông tin mới.

**Alternative / Exception Flows:** Dữ liệu không hợp lệ thì yêu cầu sửa; lỗi lưu thì giữ thông tin cũ và báo lỗi. Chức năng này không tự cấp hoặc thay đổi vai trò; không có bước xác minh lại thông tin cá nhân trong phạm vi mô phỏng.

**Postconditions:** Chỉ thông tin cá nhân được phép sửa của chính tài khoản được cập nhật.

## UC-U-06 — Đổi mật khẩu

**Actor:** `Base User`.

**Objective:** Cho phép người dùng thay đổi mật khẩu đăng nhập của tài khoản.

**Description:** Hệ thống xác minh mật khẩu hiện tại, kiểm tra mật khẩu mới và cập nhật khi các điều kiện được đáp ứng.

**Preconditions:** Đã đăng nhập.

**Main Flow:**

1. Người dùng mở chức năng đổi mật khẩu và cung cấp thông tin cần thiết.
2. Hệ thống kiểm tra tài khoản, mật khẩu hiện tại và mật khẩu mới theo quy tắc áp dụng.
3. Hệ thống lưu mật khẩu mới và thông báo kết quả.

**Alternative / Exception Flows:** Thông tin không đúng hoặc mật khẩu mới không đáp ứng yêu cầu thì từ chối; lỗi lưu thì không báo đổi thành công.

**Postconditions:** Mật khẩu mới có hiệu lực sau khi cập nhật thành công.

## UC-U-07 — Đăng ký làm chủ xe

**Actor:** `Base User`.

**Objective:** Cho phép người dùng gửi hồ sơ đăng ký quyền `Owner` để được xét duyệt.

**Description:** Người dùng cung cấp hồ sơ cá nhân và thông tin xe đầu tiên; hệ thống kiểm tra tính đầy đủ và lưu hồ sơ chờ duyệt.

**Preconditions:** Đã đăng nhập và chưa có quyền `Owner`.

**Main Flow:**

1. Người dùng mở chức năng đăng ký làm chủ xe.
2. Cung cấp thông tin hồ sơ, ảnh CCCD và tối thiểu một xe chính chủ kèm giấy đăng ký xe, thông tin bảo hiểm và thời hạn bảo hiểm.
3. Hệ thống kiểm tra đã cung cấp đủ thông tin, ảnh và xe theo yêu cầu, rồi lưu hồ sơ ở trạng thái chờ duyệt.
4. Hệ thống thông báo hồ sơ sẽ được xử lý theo UC-AS-01 tại [đặc tả chức năng quản trị](admin-staff.md).

**Alternative / Exception Flows:** Thiếu thông tin, ảnh CCCD hoặc xe và giấy tờ bắt buộc thì yêu cầu bổ sung. Hồ sơ bị từ chối phải hiển thị lý do và cho phép bổ sung, gửi lại để xét duyệt. Hồ sơ đang chờ duyệt không tạo thêm hồ sơ trùng; lỗi lưu thì không báo đã gửi thành công.

**Postconditions:** Hồ sơ chờ duyệt được lưu cùng ảnh CCCD và xe đầu tiên đã cung cấp. Người đăng ký chưa có quyền `Owner` cho đến khi hồ sơ được chấp thuận; xe chỉ hiển thị sau khi tin được duyệt.
