---
title: "PBL — ERD"
project: PBL3
category: documents
type: design
status: accepted
updated: 2026-10-01
tags: [project/pbl, type/design, diagram/erd]
---

# PBL — Entity Relationship Diagram
## Quy tắc dữ liệu chính

- Giá thuê tính theo ngày: `rental_days = max(1, ceil((end_date - start_date) / 24 giờ))` và `price_locked_total = rental_days × price_per_day`.
- Hai khoảng được xem là trùng lịch nếu `new_start < existing_end` và `new_end > existing_start`; các khoảng chỉ tiếp giáp thời điểm nhận/trả không bị xem là trùng.
- `deposit_holds` lưu khoảng thuê, giá và cọc phía máy chủ nhưng không khóa lịch xe. Hold không có cột thời hạn; trạng thái là `AwaitingDeposit`, `Converted`, `Cancelled`. Nhiều hold ở trạng thái `AwaitingDeposit` có thể giao nhau cho cùng xe.
- Cọc thành công mới tạo `bookings.Pending`. Các trạng thái khóa lịch là `Pending`, `Accepted`, `Ongoing`; `Rejected`, `Expired`, `Cancelled` không khóa lịch và `Completed` không ảnh hưởng lịch tương lai.
- `deposit_holds` liên kết với tin đăng; `bookings.vehicle_id` sao chép từ tin đăng để mọi truy vấn khả dụng và thao tác khóa được thực hiện trực tiếp theo xe, không chỉ theo `listing_id`.
- Khi chuyển hold, hệ thống khóa hold và dữ liệu theo xe, kiểm tra quyền sở hữu, trạng thái `AwaitingDeposit`, `vehicle_unavailability` và booking khóa lịch, rồi ghi charge, booking, payment và hold `Converted` trong cùng một transaction. Số tiền lấy từ hold phía máy chủ; lỗi thì rollback, không xóa hold và giữ lịch sử qua `bookings.source_hold_id`.
- `handover_confirmations` không có thời hạn tự hết hiệu lực. Xác nhận của một bên được giữ đến khi bên còn lại xác nhận hoặc booking không còn ở trạng thái cho phép chuyển tiếp; không xóa hoặc đặt lại do thời gian chờ.
- Người dùng và phân quyền được trình bày bằng tên logic dễ đọc. `user_id` và các khóa ngoại liên quan dùng kiểu `varchar(255)` để tương thích với cơ chế đăng nhập của ứng dụng.
- `owner_profiles.approval_status` lưu kết quả duyệt hồ sơ; `access_status` lưu riêng trạng thái quyền Owner để việc tạm dừng không làm mất kết quả duyệt.
- Hoa hồng mặc định là 5%. Khi Admin sửa cấu hình, giá trị mới có hiệu lực ngay và được dùng khi ghi nhận doanh thu; không quản lý lịch áp dụng trong tương lai.
- Ngân hàng giả lập có một tài khoản `PlatformEscrow` được tạo sẵn, không gắn với người dùng, để nhận, giữ, hoàn và chuyển cọc.
- Ngân hàng giả lập không lưu giá trị tiền trong tài khoản và không hỗ trợ bổ sung tiền. Mỗi người dùng có một tài khoản giả lập; hệ thống không kiểm tra khả năng chi trả.
- Khi booking `Completed`, cọc được chuyển cho Owner sau khi trừ hoa hồng và đặt `Transferred`. Khi Renter hủy booking `Accepted`, cọc được chuyển theo cùng công thức và đặt `Forfeited`.
- `reference_code` dùng đúng mẫu `DEPOSIT-{holdId}`, `REFUND-{bookingId}`, `SETTLE-{bookingId}`, `FORFEIT-{bookingId}`, `PENALTY-{bookingId}`.
- Không lưu dữ liệu ảnh cho bàn giao. Khoản tiền thuê còn lại được tính bằng `price_locked_total - deposit_amount` khi hiển thị, không lưu trong payment.
- Các field thời gian được giữ trong ERD đều lưu theo UTC; giao diện chuyển sang múi giờ địa phương khi hiển thị.
- CCCD, GPLX và giấy tờ xe chỉ được nhập, lưu và duyệt thủ công trong phạm vi học tập; hệ thống không xác minh pháp lý hoặc dùng bộ tiêu chí thẩm định phức tạp.
- Khiếu nại có mô tả bắt buộc và ảnh tùy chọn. Nội dung đã gửi không được chỉnh sửa và không có thời hạn gửi.
- `CancelOwnerFault` và `ForceComplete` là hành động xử lý trong `disputes.resolution_action`; không có use case, trạng thái booking, bảng hoặc background job no-show riêng.
- Khóa tài khoản tạo `account_sanction`; mở khóa ghi `lifted_at`, `lifted_by`, không xóa lịch sử. Service bảo đảm mỗi tài khoản chỉ có một sanction còn hiệu lực.
- Tin bị gỡ chuyển `vehicle_listings.moderation_status` sang `Hidden`, không nhận hold mới, không xóa dữ liệu và không thay đổi booking đã tạo.
- Không có chức năng xóa tài khoản trong phạm vi v1.

## DBML

```dbml
TableGroup IAM {
  users
  roles
  user_roles
  user_claims
  account_sanction
  driver_licenses
}

TableGroup Vehicle {
  owner_profiles
  vehicles
  vehicle_documents
  vehicle_listings
  listing_images
  vehicle_unavailability
}

TableGroup Rental {
  deposit_holds
  bookings
  handover_confirmations
  disputes
  reviews
}

TableGroup PaymentSimulation {
  payments
  mock_bank_accounts
  mock_bank_transactions
  system_settings
}

Table users {
  user_id varchar(255) [pk]
  username varchar(50) [unique]
  password_hash varchar(255)
  full_name varchar(100)
  gender bool
  email varchar(255) [unique]
  phone_number varchar(20) [unique, note: 'Số điện thoại đã chuẩn hóa']
}

Table roles {
  role_id varchar(255) [pk]
  role_name varchar(20) [unique]
}

Table user_roles {
  user_id varchar(255) [ref: > users.user_id]
  role_id varchar(255) [ref: > roles.role_id]

  indexes {
    (user_id, role_id) [pk]
  }
}

Table user_claims {
  claim_id int [pk, increment]
  user_id varchar(255) [ref: > users.user_id]
  claim_type varchar(100)
  claim_value varchar(100)
}

Table account_sanction {
  sanction_id int [pk, increment]
  user_id varchar(255) [ref: > users.user_id]
  sanction_type varchar(20) [note: 'Suspend7d / Suspend30d / Ban']
  reason varchar(255)
  issued_by varchar(255) [ref: > users.user_id]
  issued_at datetime
  expires_at datetime [null]
  lifted_by varchar(255) [ref: > users.user_id, null]
  lifted_at datetime [null, note: 'Hiệu lực suy ra từ expires_at và lifted_at']
}

Table driver_licenses {
  user_id varchar(255) [pk, ref: - users.user_id]
  license_number varchar(255) [unique]
  license_class varchar(10) [note: 'Hạng GPLX']
  expiry_date date
  image_front varchar(255)
}

Table owner_profiles {
  owner_profile_id int [pk, increment]
  user_id varchar(255) [ref: > users.user_id, unique]
  cccd_image_front varchar(255)
  cccd_image_back varchar(255)
  cccd_number varchar(255) [unique]
  approval_status varchar(20) [note: 'Pending / Approved / Rejected']
  access_status varchar(20) [note: 'Inactive / Active / Suspended']
  reject_reason varchar(255) [null]
  submitted_at datetime
  reviewed_by varchar(255) [ref: > users.user_id, null]
  reviewed_at datetime [null]
}

Table vehicles {
  vehicle_id int [pk, increment]
  owner_id varchar(255) [ref: > users.user_id]
  license_plate varchar(20) [unique]
  brand varchar(50)
  model varchar(50)
  year int
  seats int
  transmission varchar(20)
  fuel_type varchar(20)
  status varchar(20) [note: 'PendingApproval / Approved / Rejected / Removed']
}

Table vehicle_documents {
  document_id int [pk, increment]
  vehicle_id int [ref: - vehicles.vehicle_id, unique]
  registration_cert_image varchar(255)
  insurance_image varchar(255)
  insurance_expiry_date date
  inspection_cert_image varchar(255)
  inspection_expiry_date date
}

Table vehicle_listings {
  listing_id int [pk, increment]
  vehicle_id int [ref: > vehicles.vehicle_id]
  price_per_day decimal(12,2)
  location varchar(255)
  city varchar(50)
  district varchar(50)
  latitude decimal(9,6) [null]
  longitude decimal(9,6) [null]
  description text
  moderation_status varchar(20) [note: 'PendingApproval / Public / Hidden']
  created_at datetime
  moderated_by varchar(255) [ref: > users.user_id, null]
  moderated_at datetime [null]
  moderation_note varchar(255) [null]
}

Table listing_images {
  image_id int [pk, increment]
  listing_id int [ref: > vehicle_listings.listing_id]
  image_path varchar(255)
  sort_order int
  is_cover bool
}

Table vehicle_unavailability {
  unavailability_id int [pk, increment]
  vehicle_id int [ref: > vehicles.vehicle_id]
  start_date datetime
  end_date datetime
  reason varchar(255) [null]
}

Table deposit_holds {
  hold_id int [pk, increment]
  renter_id varchar(255) [ref: > users.user_id]
  listing_id int [ref: > vehicle_listings.listing_id]
  start_date datetime
  end_date datetime
  rental_days int [note: 'Tối thiểu 1 ngày; phần ngày lẻ làm tròn lên']
  price_locked_total decimal(12,2)
  deposit_amount decimal(12,2) [note: '= 25% price_locked_total']
  status varchar(20) [note: 'AwaitingDeposit / Converted / Cancelled']
  created_at datetime
}

Table bookings {
  booking_id int [pk, increment]
  renter_id varchar(255) [ref: > users.user_id]
  listing_id int [ref: > vehicle_listings.listing_id]
  vehicle_id int [ref: > vehicles.vehicle_id, note: 'Sao chép từ tin đăng; kiểm tra lịch và khóa theo xe']
  source_hold_id int [ref: - deposit_holds.hold_id, unique]
  start_date datetime
  end_date datetime
  rental_days int [note: 'Tối thiểu 1 ngày; phần ngày lẻ làm tròn lên']
  status varchar(20) [note: 'Pending / Accepted / Rejected / Expired / Ongoing / Completed / Cancelled']
  price_locked_total decimal(12,2)
  deposit_amount decimal(12,2) [note: '= 25% price_locked_total']
  created_at datetime [note: 'Thời điểm cọc thành công']
  response_deadline datetime [note: 'created_at + 24 giờ']
  accepted_at datetime [null]
  responded_at datetime [null]
  reject_reason varchar(255) [null]
  completed_at datetime [null]
  cancelled_at datetime [null]
  cancelled_by varchar(255) [ref: > users.user_id, null, note: 'ID người hủy: Renter / Owner / Staff / Admin']
  cancel_reason varchar(255) [null]

  indexes {
    (vehicle_id, status, start_date, end_date)
    (status, response_deadline)
  }
}

Table handover_confirmations {
  confirmation_id int [pk, increment]
  booking_id int [ref: > bookings.booking_id]
  type varchar(20) [note: 'Pickup / Return']
  confirmed_by varchar(255) [ref: > users.user_id]
  confirmed_at datetime

  indexes {
    (booking_id, type, confirmed_by) [unique]
  }
}

Table payments {
  payment_id int [pk, increment]
  booking_id int [ref: - bookings.booking_id, unique]
  deposit_status varchar(20) [note: 'Held / Refunded / Transferred / Forfeited']
  penalty_amount decimal(12,2) [null]
  commission_rate decimal(5,4) [note: 'Tỷ lệ dùng khi ghi nhận doanh thu; mặc định 0.05']
  commission_amount decimal(12,2) [null]
  revenue_recorded_at datetime [null, note: 'Thời điểm cọc được chuyển cho Owner (Completed hoặc Forfeited)']
}

Table mock_bank_accounts {
  account_id int [pk, increment]
  user_id varchar(255) [ref: > users.user_id, null, unique]
  account_type varchar(20) [note: 'User / PlatformEscrow']
  account_number varchar(30) [unique]
  status varchar(20) [note: 'Active / Locked']
  created_at datetime
}

Table mock_bank_transactions {
  transaction_id int [pk, increment]
  reference_code varchar(100) [unique, note: 'DEPOSIT-{holdId} / REFUND-{bookingId} / SETTLE-{bookingId} / FORFEIT-{bookingId} / PENALTY-{bookingId}']
  payment_id int [ref: > payments.payment_id, null]
  from_account_id int [ref: > mock_bank_accounts.account_id]
  to_account_id int [ref: > mock_bank_accounts.account_id]
  transaction_type varchar(30) [note: 'Deposit / Refund / Transfer / Penalty']
  amount decimal(12,2)
  status varchar(20) [note: 'Pending / Succeeded / Failed; Penalty chờ Owner thanh toán ở Pending']
  created_at datetime
}

Table system_settings {
  setting_key varchar(50) [pk]
  setting_value varchar(255) [note: 'commission_rate mặc định = 0.05']
  updated_by varchar(255) [ref: > users.user_id, null]
  updated_at datetime
}

Table disputes {
  dispute_id int [pk, increment]
  booking_id int [ref: > bookings.booking_id]
  raised_by varchar(255) [ref: > users.user_id]
  description text [note: 'Không được chỉnh sửa sau khi gửi']
  evidence_image varchar(255) [null, note: 'Ảnh tùy chọn']
  status varchar(20) [note: 'Open / Resolved']
  created_at datetime
  resolved_by varchar(255) [ref: > users.user_id, null]
  resolved_at datetime [null]
  resolution_action varchar(30) [null, note: 'None / CancelOwnerFault / ForceComplete']
  resolution_notes varchar(255) [null]
}

Table reviews {
  review_id int [pk, increment]
  booking_id int [ref: > bookings.booking_id]
  reviewer_id varchar(255) [ref: > users.user_id]
  reviewee_id varchar(255) [ref: > users.user_id]
  rating int [note: '1-5']
  comment text
  created_at datetime
  is_public bool

  indexes {
    (booking_id, reviewer_id) [unique]
  }
}
```
