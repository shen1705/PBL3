# AZU Car Admin v4.3 — Sidebar gọn, bỏ biểu đồ doanh thu

## Cách chạy
Giải nén file ZIP, mở thư mục `AZU-Car-Admin-v4.3-Sidebar-Clean`, mở `index.html` bằng Chrome hoặc Live Server. Không cần npm hoặc backend để xem thử.

## Đã chỉnh so với v4.2
- Đưa **Đăng xuất** ngay dưới **Cài đặt** trong thanh bên; bổ sung nhãn gọn “Bản xem trước – Dữ liệu lưu trên thiết bị” để phần này bớt trống.
- Bỏ hoàn toàn biểu đồ và chú giải ở mục **Doanh thu**. Giữ thống kê KPI, bảng đối soát đơn và xuất CSV.
- Giữ nguyên bố cục, màu sắc, kích thước và các trang khác theo v4.2.

## Lưu ý nghiệp vụ
- Dữ liệu demo lưu bằng localStorage trong trình duyệt, không phải số liệu kinh doanh thật.
- Hoa hồng chỉ tính thử trên đơn hoàn tất đủ điều kiện, không tính đơn tranh chấp.
- Chưa kết nối ASP.NET Core, MySQL, xác thực hoặc phân quyền server.
- Không sửa đổi nhánh `main` hay `develop` trên GitHub.
