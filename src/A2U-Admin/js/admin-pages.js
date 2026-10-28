const adminPage = document.getElementById("admin-page");
const pageKey = adminPage.dataset.page;
const status = (label, tone = "blue") => `<span class="admin-status admin-status--${tone}">${label}</span>`;
const metric = (label, value, note, icon = "◷", tone = "") => `
  <article class="card admin-metric ${tone ? `admin-metric--${tone}` : ""}">
    <div><span>${label}</span><b aria-hidden="true">${icon}</b></div>
    <strong>${value}</strong><small>${note}</small>
  </article>`;
const titleBlock = (title, action = "Xuất danh sách") => `
  <div class="admin-title">
    <h1>${title}</h1>
    <button class="button button--primary admin-title__action" type="button" data-action><span class="icon" aria-hidden="true">${/lưu/i.test(action) ? "✓" : "↓"}</span>${action}</button>
  </div>`;
const table = (headers, rows, className = "") => `
  <div class="admin-table-wrap"><table class="admin-table ${className}">
    <thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(row => `<tr data-status="${row.status || ""}">${row.cells.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
const sectionHead = (title, meta = "", action = "") => `
  <div class="admin-section-head"><div><h2>${title}</h2>${meta ? `<p>${meta}</p>` : ""}</div>${action}</div>`;
const rowMain = (title, subtitle = "") => `<strong>${title}</strong>${subtitle ? `<small>${subtitle}</small>` : ""}`;
const searchTools = (placeholder = "Tìm nhanh...") => `
  <div class="admin-tools"><label class="admin-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="${placeholder}" aria-label="${placeholder}"></label>
  <select aria-label="Lọc trạng thái"><option value="">Tất cả trạng thái</option><option value="pending">Chờ xử lý</option><option value="active">Đang hoạt động</option><option value="review">Cần rà soát</option><option value="done">Đã hoàn tất</option></select>
  <button class="button button--light" type="button" data-action>☷ Bộ lọc</button></div>`;
const pageFooter = `<footer class="footer"><span>© 2026 A2U Car · Trung tâm quản trị</span><span>Hỗ trợ quản trị · 24/7</span></footer>`;
const pageTop = (title, action) => titleBlock(title, action);

const pages = {
  owners: () => `
    ${pageTop("Hồ sơ chủ xe", "Xuất hồ sơ")}
    <div class="admin-profile card">
      <div class="profile-main"><div class="profile-avatar">LH</div><div><h2>Lê Hoàng Nam <span class="verified">✓</span></h2><p>CH-0128 · Chủ xe từ 15/06/2025</p><div class="profile-tags">${status("Đang hoạt động", "green")}${status("Danh tính đã xác minh", "green")}${status("1 yêu cầu chờ duyệt", "amber")}</div></div></div>
      <div class="profile-actions"><small>Phụ trách: Minh Anh</small><button class="button button--danger" type="button" data-action>Khóa tài khoản</button></div>
      <div class="profile-metrics">${metric("Số xe", "03", "2 đang hoạt động")}${metric("Chuyến đã hoàn tất", "128", "Tỷ lệ đánh giá 4,9/5")}${metric("Đánh giá", "4,9 / 5", "Từ 96 lượt đánh giá")}${metric("Doanh thu", "18,45 tr đ", "Sau phí nền tảng")}</div>
    </div>
    <div class="admin-notice"><span>▣</span><div><strong>Bảo hiểm Toyota Vios vừa được bổ sung</strong><small>Đang chờ xác minh · Tài liệu gửi lúc 09:42</small></div><button class="button button--primary" type="button" data-action>Xem tài liệu</button></div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Thông tin cá nhân", "", '<a href="#" class="text-link">Chỉnh sửa →</a>')}
        <div class="info-grid"><div><small>Họ và tên</small><b>Lê Hoàng Nam</b></div><div><small>Ngày sinh / Giới tính</small><b>12/06/1988 · Nam</b></div><div><small>Số điện thoại</small><b>0903 456 789 <em>✓</em></b></div><div><small>Email</small><b>nam.lh@gmail.com <em>✓</em></b></div><div><small>Số CCCD</small><b>079 •••••• 128</b></div><div><small>Mã số thuế</small><b>8734 ••• 928</b></div><div class="info-grid__wide"><small>Địa chỉ liên hệ</small><b>128 Nguyễn Văn Hưởng, P. An Khánh, TP. Hồ Chí Minh</b></div></div>
      </section>
      <section class="card admin-panel">${sectionHead("Xác minh giấy tờ", "", '<a href="#" class="text-link">Lịch sử duyệt →</a>')}
        <div class="doc-list"><div><span>▤</span><p><b>Căn cước công dân</b><small>Hai mặt · Còn hiệu lực</small></p>${status("Đã xác minh", "green")}<a href="#">›</a></div><div><span>▤</span><p><b>Giấy phép lái xe · Hạng B2</b><small>Hạng B2 · Còn hạn đến 2030</small></p>${status("Hợp lệ", "green")}<a href="#">›</a></div><div><span>▤</span><p><b>Đăng ký xe</b><small>Toyota Vios · 51H-882.69</small></p>${status("Đã xác minh", "green")}<a href="#">›</a></div><div><span>▤</span><p><b>Bảo hiểm TNDS</b><small>Bổ sung lúc 09:42 hôm nay</small></p>${status("Chờ duyệt", "amber")}<a href="#">›</a></div></div>
      </section>
    </div>
    <section class="card admin-panel">${sectionHead("Xe sở hữu", "03 xe · 02 đang cho thuê")}
      ${table(["THÔNG TIN XE", "GIÁ THUÊ / NGÀY", "HOẠT ĐỘNG", "TRẠNG THÁI", "THAO TÁC"], [
        {cells:[rowMain("Toyota Veloz Cross 2024","51H-298.30 · Trắng"),"850.000 đ","62 chuyến",status("Đang hoạt động","green"),'<a href="#">Xem chi tiết →</a>']},
        {cells:[rowMain("Mazda CX-5 2023","51K-562.18 · Xám"),"950.000 đ","48 chuyến",status("Đang hoạt động","green"),'<a href="#">Xem chi tiết →</a>']},
        {cells:[rowMain("Toyota Vios 2022","51H-882.69 · Bạc"),"600.000 đ","18 chuyến",status("Tạm ẩn","neutral"),'<a href="#">Kiểm tra giấy tờ →</a>']},
      ])}
      <div class="table-caption">Hiển thị 3 xe của chủ xe</div>
    </section>
    <div class="admin-columns admin-columns--payments">
      <section class="card admin-panel">${sectionHead("Tài khoản thanh toán", "", '<a href="#" class="text-link">Chi tiết →</a>')}<div class="bank-card"><span>▦</span><div><b>Vietcombank</b><small>Chi nhánh TP. Hồ Chí Minh</small></div><strong>•••• •••• 6829</strong></div><p class="compact-note">LÊ HOÀNG NAM · Đã xác minh chủ tài khoản</p></section>
      <section class="card admin-panel">${sectionHead("Thanh toán & đối soát", "Tháng 10/2026 · Thu nhập sau phí")}<div class="totals-row"><div><small>Tổng thanh toán</small><b>12.000.000 đ</b></div><div><small>Chủ xe nhận</small><b class="blue-text">6.450.000 đ</b></div><div><small>Đang giữ</small><b>0 đ</b></div></div>
        ${table(["MÃ ĐỐI SOÁT", "THỰC NHẬN", "NGÀY CHI TRẢ", "TRẠNG THÁI"],[{cells:[rowMain("DS-1025-0128","18 chuyến · 01/10"),"6.450.000 đ","25/10/2026",status("Chờ chi trả","blue")]},{cells:[rowMain("DS-1016-0128","15 chuyến · 16/09"),"6.000.000 đ","16/10/2026",status("Đã thanh toán","green")]}])}
      </section>
    </div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Lịch sử hoạt động", "Hoạt động gần nhất")}<ul class="timeline"><li><b>Chủ xe bổ sung bảo hiểm TNDS</b><small>Hôm nay · 09:42</small></li><li><b>Tự động xác minh Toyota Vios</b><small>14/10/2026 · 10:20</small></li><li><b>Thanh toán thành công · 6.000.000 đ</b><small>16/09/2026 · 08:15</small></li></ul></section>
      <section class="card admin-panel">${sectionHead("Ghi chú quản trị", "Chỉ đội ngũ nội bộ có thể xem")}<div class="note-item"><b>Minh Anh</b><small>Đã bổ sung hợp đồng bảo hiểm xe. Xác minh trước ngày 22/10.</small></div><textarea class="admin-textarea" placeholder="Thêm ghi chú..."></textarea><div class="panel-actions"><button class="button button--primary" type="button" data-action>+ Lưu ghi chú</button></div></section>
    </div>${pageFooter}`,

  listings: () => `
    ${pageTop("Kiểm duyệt tin đăng", "Xuất danh sách")}
    <div class="admin-metrics admin-metrics--4">${metric("Tin cần xử lý","24","+6 từ hôm qua","⌁")}${metric("Chờ trên 24 giờ","04","Cần ưu tiên xử lý","◷","red")}${metric("Đã duyệt hôm nay","18","Tăng 12% so với hôm qua","✓","green")}${metric("Đã ẩn hôm nay","03","Vi phạm chính sách","⊘")}</div>
    <div class="admin-notice"><span>◷</span><div><strong>Tin chờ lâu nhất: Toyota Vios 2022</strong><small>TD-0848 · Đã chờ 26 giờ</small></div><button class="button button--primary" type="button" data-action>Kiểm tra tin đầu tiên</button></div>
    <section class="card admin-panel">${sectionHead("Tin đăng cần xử lý (24)", "Sắp xếp theo thời gian chờ")} 
      ${searchTools("Tên xe, mã tin đăng...")}
      <div class="admin-tabs"><button class="is-active" data-tab="all">Tất cả (24)</button><button data-tab="pending">Chờ duyệt (16)</button><button data-tab="review">Cần bổ sung (3)</button><button data-tab="reported">Báo cáo vi phạm (5)</button></div>
      ${table(["TIN ĐĂNG", "CHỦ XE", "NGUYÊN NHÂN", "THỜI GIAN GỬI", "TRẠNG THÁI", "THAO TÁC"],[
        {status:"pending",cells:[rowMain("Toyota Vios 2022","TD-0848 · 51H-882.69"),rowMain("Lê Hoàng Nam","CH-0128 · TP. HCM"),rowMain("Bổ sung giấy tờ","Bảo hiểm xe hết hạn"),"22/10 · 08:42<small>26 giờ trước</small>",status("Chờ duyệt","amber"),'<a href="#">Kiểm tra →</a>']},
        {status:"pending",cells:[rowMain("Mitsubishi Xpander 2023","TD-0851 · 51K-562.18"),rowMain("Nguyễn Thị Thu Hà","CH-0192 · TP. HCM"),rowMain("Tin đăng mới","Đủ giấy tờ"),"22/10 · 09:20<small>25 giờ trước</small>",status("Chờ duyệt","amber"),'<a href="#">Xem tin →</a>']},
        {status:"review",cells:[rowMain("Hyundai Accent 2024","TD-0860 · 43A-108.22"),rowMain("Vũ Đức Thành","CH-0821 · Đà Nẵng"),rowMain("Sai thông tin","Ảnh đăng ký mờ"),"22/10 · 07:55<small>27 giờ trước</small>",status("Cần bổ sung","blue"),'<a href="#">Xem tin →</a>']},
        {status:"reported",cells:[rowMain("Kia Seltos 2025","TD-0865 · 51H-220.18"),rowMain("Phạm Quốc Bảo","CH-0448 · TP. HCM"),rowMain("Báo cáo vi phạm","Giá thuê không chính xác"),"21/10 · 16:40<small>2 ngày trước</small>",status("Cần rà soát","red"),'<a href="#">Xem tin →</a>']},
        {status:"pending",cells:[rowMain("Ford Territory 2024","TD-0868 · 92A-012.68"),rowMain("Đặng Hoài An","CH-0618 · Bình Dương"),rowMain("Cập nhật nội dung","Chỉnh sửa giá thuê"),"21/10 · 15:10<small>2 ngày trước</small>",status("Chờ duyệt","amber"),'<a href="#">Xem tin →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>Hiển thị 1–5 trong 24 tin cần xử lý</span><span>‹　1　2　3　4　›</span></div>
    </section>
    <div class="admin-columns admin-columns--review">
      <section class="card admin-panel listing-preview">${sectionHead("Tin đang rà soát", "TD-0848 · Phụ trách: Minh Anh")}<div class="car-preview"><div class="car-placeholder">🚙</div><div><b>Toyota Vios 2022</b><small>51H-882.69 · Tự động · 5 chỗ</small><strong>600.000 đ <small>/ ngày</small></strong></div></div><div class="profile-tags">${status("Tạm ẩn","neutral")}${status("Bổ sung giấy tờ","amber")}</div><p class="compact-note">Bảo hiểm hết hạn ngày 20/10. Hồ sơ đăng ký xe hợp lệ.</p><a class="text-link" href="#">Xem hồ sơ chủ xe →</a></section>
      <section class="card admin-panel">${sectionHead("Đối chiếu giấy tờ", "Xác nhận thông tin trước khi duyệt")}<div class="doc-list"><div><span>▤</span><p><b>Đăng ký xe & đăng kiểm</b><small>Biển số khớp với tin đăng</small></p>${status("Đã đối chiếu","green")}</div><div><span>▤</span><p><b>Hình ảnh & thông tin xe</b><small>Ảnh thực tế, đủ góc chụp</small></p>${status("Đạt yêu cầu","green")}</div><div><span>▤</span><p><b>Bảo hiểm TNDS</b><small>Thiếu bản mới</small></p>${status("Chờ kiểm tra","amber")}</div></div><textarea class="admin-textarea" placeholder="Lý do yêu cầu bổ sung..."></textarea><div class="panel-actions"><button class="button button--light" type="button" data-action>Từ chối</button><button class="button button--light" type="button" data-action>Yêu cầu bổ sung</button><button class="button button--primary" type="button" data-action>✓ Duyệt tin</button></div></section>
    </div>${pageFooter}`,

  disputes: () => `
    ${pageTop("Tranh chấp & khiếu nại", "Xuất báo cáo")}
    <div class="admin-metrics admin-metrics--4">${metric("Vụ việc đang mở","07","Cần xử lý hôm nay","▣","blue")}${metric("Mức độ ưu tiên cao","02","Trong 7 ngày gần nhất","⚑","red")}${metric("Quá hạn phản hồi","01","Cần phản hồi ngay","◷","amber")}${metric("Đã giải quyết tháng này","32","Tăng 8% so với tháng trước","✓","green")}</div>
    <div class="admin-notice"><span>⚑</span><div><strong>Có 1 vụ việc phản hồi trễ</strong><small>TC-2846 · Toyota Vios · Hạn phản hồi còn 25 phút</small></div><button class="button button--primary" type="button" data-action>Xem vụ ưu tiên</button></div>
    <section class="card admin-panel">${sectionHead("Vụ việc đang mở (7)", "Ưu tiên mức độ cao và thời hạn gần nhất")}
      ${searchTools("Mã vụ việc, khách hàng, nội dung...")}
      <div class="admin-tabs"><button class="is-active" data-tab="all">Đang mở (7)</button><button data-tab="pending">Mức cao (2)</button><button data-tab="review">Chờ phản hồi (3)</button><button data-tab="done">Đã giải quyết (32)</button></div>
      ${table(["VỤ VIỆC", "NGƯỜI LIÊN QUAN", "MỨC ĐỘ", "PHỤ TRÁCH", "HẠN PHẢN HỒI", "TRẠNG THÁI", "THAO TÁC"],[
        {status:"pending",cells:[rowMain("Không thống nhất phí trầy xước","TC-2846 · 22/10/2026"),rowMain("Nguyễn Phương Linh","Người thuê · Toyota Vios"),status("Cao","red"),"Minh Anh","22/10 · 11:00<small>Còn 25 phút</small>",status("Đang xử lý","blue"),'<a href="#">Xử lý →</a>']},
        {status:"pending",cells:[rowMain("Chưa hoàn tiền đặt cọc","TC-2842 · 22/10/2026"),rowMain("Lê Thành Tùng","Người thuê · Ford"),status("Cao","red"),"Quốc Huy","22/10 · 09:00<small>Quá hạn 10 phút</small>",status("Chờ phản hồi","amber"),'<a href="#">Xử lý →</a>']},
        {status:"review",cells:[rowMain("Xe giao không đúng mô tả","TC-2838 · 21/10/2026"),rowMain("Đỗ Minh Châu","Người thuê · Hyundai Accent"),status("Trung bình","amber"),"Thu Trang","22/10 · 15:30<small>Còn 4 giờ</small>",status("Chờ phản hồi","amber"),'<a href="#">Xử lý →</a>']},
        {status:"review",cells:[rowMain("Phụ phí trả xe muộn","TC-2830 · 21/10/2026"),rowMain("Trần Hoàng Phúc","Chủ xe · Toyota Innova"),status("Trung bình","amber"),"Minh Anh","23/10 · 09:00<small>Còn 1 ngày</small>",status("Đang xử lý","blue"),'<a href="#">Xử lý →</a>']},
        {status:"done",cells:[rowMain("Phản ánh thái độ giao xe","TC-2826 · 21/10/2026"),rowMain("Vũ Thảo Nguyên","Người thuê · Honda City"),status("Thấp","neutral"),"Quốc Huy","23/10 · 10:00<small>Còn 1 ngày</small>",status("Mới tiếp nhận","red"),'<a href="#">Phân công →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>Hiển thị 1–5 trong 7 vụ việc đang mở</span><span>‹　1　2　›</span></div>
    </section>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("TC-2846 · Phí trầy xước", "Toyota Vios · Chuyến #10286")}<div class="profile-tags">${status("Mức độ cao","red")}${status("Đang xử lý","blue")}</div><p class="case-description">Người thuê không đồng ý khoản phí 2.500.000 đ cho vết xước cản sau. Chủ xe đã gửi ảnh đối chiếu trước và sau chuyến đi.</p><div class="totals-row"><div><small>Yêu cầu bồi thường</small><b>2.500.000 đ</b></div><div><small>Chuyến đi</small><b>#10286</b></div></div>${sectionHead("Tài liệu đối chiếu (3)") }<div class="doc-list"><div><span>▧</span><p><b>Ảnh nhận xe · 6 ảnh</b><small>Gửi lúc 09:15 · 21/10</small></p><a href="#">Xem →</a></div><div><span>▧</span><p><b>Ảnh bàn giao · 4 ảnh</b><small>Gửi lúc 08:20 · 22/10</small></p><a href="#">Xem →</a></div></div></section>
      <section class="card admin-panel">${sectionHead("Theo dõi xử lý", "Phụ trách: Minh Anh")}<ul class="timeline"><li><b>Đã yêu cầu chủ xe bổ sung ảnh gốc</b><small>09:42 hôm nay</small></li><li><b>Chủ xe gửi bằng chứng sửa chữa</b><small>08:20 hôm nay</small></li><li><b>Minh Anh tiếp nhận vụ việc</b><small>Hôm qua · 16:10</small></li></ul><label class="field-label">Phản hồi đến hai bên</label><textarea class="admin-textarea" placeholder="Nhập nội dung phản hồi..."></textarea><div class="panel-actions"><button class="button button--light" type="button" data-action>Ghi chú nội bộ</button><button class="button button--light" type="button" data-action>Giải quyết vụ</button><button class="button button--primary" type="button" data-action>Gửi phản hồi</button></div></section>
    </div>${pageFooter}`,

  users: () => `
    ${pageTop("Tài khoản người dùng", "Xuất danh sách")}
    <div class="admin-metrics admin-metrics--4">${metric("Tổng tài khoản","12.480","+8,2% tháng này","♧")}${metric("Đang hoạt động","12.164","97,5% tài khoản","✓","green")}${metric("Chủ xe","1.118","+6,4% tháng này","♙")}${metric("Tài khoản bị khóa","18","3 yêu cầu kháng nghị","⊘","red")}</div>
    <div class="admin-notice"><span>▤</span><div><strong>2 yêu cầu kháng nghị cần xem</strong><small>Tài khoản bị hạn chế · Cập nhật hôm nay</small></div><button class="button button--primary" type="button" data-action>Rà soát yêu cầu</button></div>
    <section class="card admin-panel">${sectionHead("Người dùng trên nền tảng", "12.480 tài khoản")}
      ${searchTools("Tên, email, số điện thoại...")}
      <div class="admin-tabs"><button class="is-active" data-tab="all">Tất cả (12.480)</button><button data-tab="active">Đang hoạt động (12.164)</button><button data-tab="review">Hạn chế (298)</button><button data-tab="pending">Tạm khóa (18)</button></div>
      ${table(["NGƯỜI DÙNG", "VAI TRÒ", "XÁC MINH", "TRẠNG THÁI", "HOẠT ĐỘNG GẦN NHẤT", "THAO TÁC"],[
        {status:"active",cells:[rowMain("Lê Hoàng Nam","CH-0128 · nam.lh@gmail.com · 0903 ••• 789"),"Chủ xe",status("Đã xác minh","green"),status("Đang hoạt động","green"),"22/10 · 08:42<small>iPhone · TP. HCM</small>",'<a href="#">Xem hồ sơ →</a>']},
        {status:"active",cells:[rowMain("Nguyễn Phương Mai","ND-0922 · mai.np@gmail.com · 0912 ••• 256"),"Người thuê",status("Đã xác minh","green"),status("Đang hoạt động","green"),"22/10 · 09:12<small>Web · TP. HCM</small>",'<a href="#">Quản lý →</a>']},
        {status:"active",cells:[rowMain("Trần Ngọc Thu Hà","CH-0192 · ha.tn@gmail.com · 0988 ••• 110"),"Chủ xe",status("Đã xác minh","green"),status("Đang hoạt động","green"),"22/10 · 08:20<small>Android · TP. HCM</small>",'<a href="#">Xem hồ sơ →</a>']},
        {status:"review",cells:[rowMain("Bùi Văn Hưng","ND-0644 · hung.bv@gmail.com · 0904 ••• 651"),"Người thuê",status("Đã xác minh","green"),status("Hạn chế","amber"),"21/10 · 21:08<small>Web · Hà Nội</small>",'<a href="#">Rà soát →</a>']},
        {status:"pending",cells:[rowMain("Tăng Minh Linh","ND-0126 · linh.tm@gmail.com · 0932 ••• 112"),"Người thuê",status("Chờ xác minh","amber"),status("Tạm khóa","red"),"20/10 · 18:35<small>iPhone · TP. HCM</small>",'<a href="#">Mở hồ sơ →</a>']},
        {status:"review",cells:[rowMain("Phạm Đức Long","CH-0339 · long.pd@gmail.com · 0918 ••• 006"),"Chủ xe",status("Chờ xác minh","amber"),status("Hạn chế","amber"),"22/10 · 07:46<small>Web · Đà Nẵng</small>",'<a href="#">Xác minh →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>Hiển thị 1–6 trong 12.480 tài khoản</span><span>‹　1　2　3　…　2.080　›</span></div>
    </section>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Tài khoản đang xem", "CH-0128 · Chủ xe")}<div class="user-summary"><span class="profile-avatar">LH</span><div><b>Lê Hoàng Nam</b><p>${status("Đang hoạt động","green")} ${status("Đã xác minh","green")}</p></div></div><div class="info-grid"><div><small>Số điện thoại</small><b>0903 456 789</b></div><div><small>Email</small><b>nam.lh@gmail.com</b></div><div><small>Tham gia</small><b>15/06/2025</b></div><div><small>Hoạt động</small><b>128 chuyến · 4,9 ★</b></div></div><div class="panel-actions"><button class="button button--light" type="button" data-action>Đặt lại mật khẩu</button><button class="button button--danger" type="button" data-action>Khóa tài khoản</button></div></section>
      <section class="card admin-panel">${sectionHead("Yêu cầu cần rà soát", "2 tài khoản cần chú ý")}<div class="review-item"><span>♙</span><div><b>Trần Ngọc Linh · ND-0826</b><small>Đã gửi yêu cầu xác minh danh tính</small></div><a href="#">Rà soát →</a></div><div class="review-item"><span>♙</span><div><b>Lê Hữu Bật · ND-0418</b><small>Kháng nghị hạn chế tài khoản</small></div><a href="#">Rà soát →</a></div>${sectionHead("Hoạt động quản lý gần đây","")}<ul class="timeline timeline--compact"><li><b>Đã hạn chế tài khoản Bùi Văn Hưng</b><small>Quốc Huy · 09:05</small></li><li><b>Đã xác minh Nguyễn Thu Hà</b><small>Minh Anh · 08:40</small></li></ul></section>
    </div>${pageFooter}`,

  fees: () => `
    ${pageTop("Phí & hoa hồng", "Tải quy tắc phí")}
    <div class="admin-metrics admin-metrics--3">${metric("Phí nền tảng mặc định","10%","Áp dụng cho chuyến hoàn tất","％")}${metric("Quy tắc miễn phí","03","Đang hoạt động","▤")}${metric("Chủ xe ưu đãi","48","Theo chính sách đối tác","♙")}</div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Phí nền tảng mặc định", "Áp dụng cho chuyến đã hoàn tất")}<div class="fee-settings"><div class="setting-line"><div><b>Trạng thái</b><small>Quy tắc hiện tại</small></div>${status("Đang áp dụng","green")}</div><div class="form-grid"><label>Phí hoa hồng (%)<input type="number" value="10"></label><label>Ngày hiệu lực<input type="date" value="2026-10-01"></label><label class="form-grid__wide">Ghi chú<textarea>Áp dụng cho chủ xe cá nhân, không bao gồm đối tác doanh nghiệp.</textarea></label></div><div class="panel-actions"><button class="button button--primary" type="button" data-action>✓ Lưu thay đổi</button></div></div></section>
      <section class="card admin-panel">${sectionHead("Minh họa phân chia doanh thu", "Chuyến #A6208 · Toyota Vios · 1 ngày")}<div class="fee-breakdown"><div><span>Giá thuê xe</span><b>2.400.000 đ</b></div><div><span>Giảm giá do mã ưu đãi</span><b>-150.000 đ</b></div><div class="fee-breakdown__line"><span>Giá tính phí</span><b>2.250.000 đ</b></div><div><span>Phí nền tảng · 10%</span><b>-225.000 đ</b></div><div class="fee-breakdown__total"><span>Chủ xe thực nhận</span><strong>2.025.000 đ</strong></div></div></section>
    </div>
    <div class="admin-notice"><span>ⓘ</span><div><strong>Lưu ý khi cập nhật quy tắc phí</strong><small>Quy tắc mới áp dụng từ ngày hiệu lực; giao dịch đã hoàn tất không bị thay đổi.</small></div></div>
    <section class="card admin-panel">${sectionHead("Quy tắc & ngoại lệ", "3 quy tắc đang hoạt động", '<a href="#" class="text-link">+ Thêm quy tắc</a>')}
      ${table(["QUY TẮC / ĐỐI TƯỢNG", "MỨC PHÍ", "THỜI GIAN ÁP DỤNG", "ƯU TIÊN", "TRẠNG THÁI", "THAO TÁC"],[
        {cells:[rowMain("Đối tác doanh nghiệp","5+ xe đăng ký"),"8%","01/10 – 31/12/2026","Theo nhóm",status("Đang hiệu lực","green"),'<a href="#">Chi tiết →</a>']},
        {cells:[rowMain("Chủ xe mới · 10 chuyến đầu","3 chuyến đầu giảm phí"),"5%","01/10 – 30/11/2026","Theo nhóm",status("Đang hiệu lực","green"),'<a href="#">Chi tiết →</a>']},
        {cells:[rowMain("CH-0128 · Lê Hoàng Nam","Ưu đãi đối tác thân thiết"),"7%","25/10 – 26/11/2026","Chủ xe",status("Sắp áp dụng","amber"),'<a href="#">Chi tiết →</a>']},
      ])}<div class="table-caption">Cá nhân không thuộc nhóm ưu đãi áp dụng mức phí mặc định 10%.</div>
    </section>
    <section class="card admin-panel">${sectionHead("Nguyên tắc thu phí & hoàn phí", "Áp dụng thống nhất trên toàn nền tảng")}<div class="principle-grid"><div><span>✓</span><b>Chỉ tính phí khi hoàn tất</b><small>Không thu phí trên chuyến bị hủy hoặc hoàn tiền.</small></div><div><span>↻</span><b>Hoàn phí theo giao dịch</b><small>Hủy chuyến hợp lệ sẽ được hoàn phí tự động.</small></div><div><span>▣</span><b>Bảo toàn giao dịch</b><small>Thay đổi chính sách không ảnh hưởng giao dịch đã chốt.</small></div></div></section>
    <section class="card admin-panel">${sectionHead("Lịch sử thay đổi", "Lưu vết điều chỉnh chính sách")} ${table(["THỜI GIAN", "NGƯỜI THỰC HIỆN", "NỘI DUNG THAY ĐỔI", "LÝ DO", "HIỆU LỰC"],[{cells:["22/10/2026 · 09:42","Minh Anh","CH-0128: 10% → 7%","Chính sách đối tác","25/10/2026"]},{cells:["01/10/2026 · 08:30","Minh Anh","Phí mặc định: 12% → 10%","Chính sách Q4/2026","01/10/2026"]},{cells:["30/09/2026 · 16:15","Quốc Huy","Tạo quy tắc đối tác doanh nghiệp","Khuyến khích đăng xe","01/10/2026"]}])}</section>${pageFooter}`,

  revenue: () => `
    ${pageTop("Doanh thu & thống kê", "Xuất báo cáo")}
    <div class="admin-toolbar"><div class="admin-tabs"><button>7 ngày</button><button class="is-active">Tháng này</button><button>Quý này</button></div><button class="button button--light" type="button">▦ 01/10/2026 – 31/10/2026</button><button class="button button--light" type="button">⌖ Tất cả khu vực</button><button class="button button--light" type="button" data-action>☷ Bộ lọc</button></div>
    <div class="admin-metrics admin-metrics--4">${metric("Tổng giá trị giao dịch","1,25 tỷ đ","+16,5% tháng trước","▣")}${metric("Doanh thu nền tảng","118 triệu đ","+12,8% tháng trước","⌁","blue")}${metric("Chuyến hoàn tất","600","+7,2% tháng trước","↗","green")}${metric("Phí nền tảng / GMV","9,6%","Ổn định so với kỳ trước","％")}</div>
    <div class="admin-columns admin-columns--chart">
      <section class="card admin-panel">${sectionHead("Xu hướng phí nền tảng", "Doanh thu theo tuần · triệu đồng", '<a href="#" class="text-link">Theo tuần ⌄</a>')}<div class="legend"><span></span>Tháng 10/2026</div><div class="bar-chart"><div class="bar-chart__labels"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div><div class="bar-chart__plot"><div class="bar-set"><b>24</b><i style="--height:60%"></i><small>06/10</small></div><div class="bar-set"><b>29</b><i style="--height:72%"></i><small>13/10</small></div><div class="bar-set"><b>31</b><i style="--height:78%"></i><small>20/10</small></div><div class="bar-set"><b>36</b><i style="--height:90%"></i><small>27/10</small></div></div></div></section>
      <section class="card admin-panel">${sectionHead("Cơ cấu theo khu vực", "Tổng giá trị giao dịch")}<div class="donut-wrap"><div class="donut-chart"><div><b>1,25 tỷ</b><small>GMV</small></div></div><ul><li><span></span>TP. Hồ Chí Minh <b>66% · 825 tr</b></li><li><span></span>Hà Nội <b>24% · 300 tr</b></li><li><span></span>Đà Nẵng <b>10% · 125 tr</b></li></ul></div></section>
    </div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Từ phí nền tảng đến doanh thu thuần", "Chi tiết phân bổ trong tháng")}<div class="fee-breakdown"><div><span>Phí nền tảng phát sinh</span><b>120.000.000 đ</b></div><div><span>Phí giao dịch / cổng thanh toán</span><b>-2.000.000 đ</b></div><div><span>Hoàn phí và điều chỉnh</span><b>0 đ</b></div><div class="fee-breakdown__total"><span>Doanh thu thuần</span><strong>118.000.000 đ</strong></div></div></section>
      <section class="card admin-panel">${sectionHead("Đối soát chủ xe", "Cập nhật 22/10/2026")}<div class="totals-row"><div><small>Đã nhận</small><b>920 triệu đ</b></div><div><small>Chờ thanh toán</small><b class="blue-text">210 triệu đ</b></div></div><p class="settlement-note">✓ Không có sai lệch đối soát · 100% dữ liệu đã đối chiếu.</p></section>
    </div>
    <section class="card admin-panel">${sectionHead("Bảng số liệu theo kỳ", "Tổng hợp giao dịch, doanh thu và tỷ lệ")} ${table(["KỲ BÁO CÁO", "CHUYẾN", "GMV", "PHÍ NỀN TẢNG", "HOÀN PHÍ", "DOANH THU THUẦN"],[{cells:["01 – 07/10/2026","159","250 tr","24 tr","0,5 tr","23,5 tr"]},{cells:["08 – 14/10/2026","164","310 tr","29 tr","0,2 tr","28,8 tr"]},{cells:["15 – 21/10/2026","156","325 tr","31 tr","0,7 tr","30,3 tr"]},{cells:["22 – 31/10/2026","121","365 tr","36 tr","0,9 tr","35,1 tr"]},{cells:[rowMain("Tổng tháng 10/2026","",""),"600","1.250 tr","120 tr","2,3 tr","117,7 tr"]}])}</section>
    <div class="admin-notice"><span>ⓘ</span><div><strong>Báo cáo được cập nhật lúc 10:30</strong><small>Số liệu chuyến đã hoàn tất và đối soát thành công.</small></div></div>${pageFooter}`,

  logs: () => `
    ${pageTop("Nhật ký hoạt động", "Xuất nhật ký")}
    <div class="admin-notice security-notice"><span>▣</span><div><strong>Nhật ký được bảo vệ</strong><small>Dữ liệu không thể chỉnh sửa hoặc xóa sau khi ghi nhận.</small></div><span class="security-check">✓ Đang ghi nhận</span></div>
    <div class="admin-metrics admin-metrics--3">${metric("Hoạt động hôm nay","128","Toàn bộ vai trò","⌁")}${metric("Thao tác thành công","124","96,8% tổng hoạt động","✓","green")}${metric("Thao tác thất bại","04","3 lần đăng nhập · 1 cập nhật","!","red")}</div>
    <section class="card admin-panel">${sectionHead("Bản ghi hoạt động", "Mới nhất trước")}
      ${searchTools("Tìm người thực hiện, mã tham chiếu...")}
      <div class="admin-tabs"><button class="is-active">Tất cả nhật ký</button><button>Thao tác quản trị</button><button>Người dùng</button><button>Bảo mật</button><button>Lỗi hệ thống</button></div>
      <div class="admin-toolbar admin-toolbar--simple"><button class="button button--light" type="button">⌄ Tất cả nhân viên</button><button class="button button--light" type="button">⌄ Tất cả chức năng</button><button class="button button--light" type="button">⌄ Mọi kết quả</button><button class="button button--light" type="button">▦ 22/10/2026</button></div>
      ${table(["THỜI GIAN / MÃ", "NGƯỜI THỰC HIỆN", "HOẠT ĐỘNG", "ĐỐI TƯỢNG", "KẾT QUẢ", "CHI TIẾT"],[
        {status:"active",cells:[rowMain("09:42:18","NK-2210-0128"),rowMain("Minh Anh","Quản trị viên"),rowMain("Tạo quy tắc phí","10% → 7% · 25/10"),"Chủ xe CH-0128",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("09:35:06","NK-2210-0127"),rowMain("Quốc Huy","Tài chính"),rowMain("Xuất báo cáo doanh thu","Tháng 10/2026 · CSV"),"BC-2026-09",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("09:28:41","NK-2210-0126"),rowMain("Thu Hà","Kiểm duyệt"),rowMain("Duyệt giấy tờ xe","Căn cước công dân"),"Chủ xe CH-0114",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"review",cells:[rowMain("09:11:22","NK-2210-0125"),rowMain("Ngọc Linh","CSKH"),rowMain("Thay đổi cài đặt phí","Thiếu quyền xác nhận"),"Phí nền tảng",status("Bị từ chối","red"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("09:12:03","NK-2210-0124"),rowMain("Minh Anh","Quản trị viên"),rowMain("Cập nhật hồ sơ chủ xe","Ghi chú quản trị"),"Chủ xe CH-0128",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("08:56:39","NK-2210-0123"),rowMain("Thu Hà","Kiểm duyệt"),rowMain("Duyệt tin đăng","Toyota Vios 2022"),"Xe XE-0248",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"review",cells:[rowMain("08:42:11","NK-2210-0122"),rowMain("Hệ thống","Tự động"),rowMain("Đăng nhập thất bại","Sai mật khẩu 5 lần"),"Tài khoản ND-0116",status("Thất bại","red"),'<a href="#">Xem →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>Hiển thị 1–7 trong 128 hoạt động</span><span>‹　1　2　3　…　›</span></div>
    </section>
    <section class="card admin-panel">${sectionHead("Chi tiết sự kiện · NK-2210-0128", "Tạo quy tắc phí cho chủ xe CH-0128")}<div class="event-meta"><div><small>NGƯỜI THỰC HIỆN</small><b>Minh Anh · Quản trị viên</b></div><div><small>THỜI ĐIỂM</small><b>22/10/2026 · 09:42:18</b></div><div><small>ĐỊA CHỈ IP</small><b>113.161.72.***</b></div><div><small>KẾT QUẢ</small>${status("Thành công","green")}</div></div><div class="event-diff"><div><b>Trước thay đổi</b><p>Mức phí nền tảng <strong>10%</strong></p><p>Phạm vi <strong>Toàn bộ chủ xe</strong></p></div><div><b>Sau thay đổi</b><p>Mức phí nền tảng <strong>7%</strong></p><p>Phạm vi <strong>Riêng CH-0128</strong></p></div></div><p class="compact-note">Lý do: Chính sách ưu đãi đối tác thân thiết trong tháng 10.</p></section>${pageFooter}`,

  settings: () => `
    ${pageTop("Cài đặt & phân quyền", "Lưu thay đổi")}
    <div class="admin-metrics admin-metrics--3">${metric("Tài khoản quản trị","12","10 đang hoạt động","♙")}${metric("Nhóm quyền","04","Đã cấu hình","▤")}${metric("Xác thực đa yếu tố","100%","Bắt buộc với quản trị viên","▣","green")}</div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Nhóm quyền", "Chọn nhóm để xem quyền truy cập")}<div class="role-list"><button class="role-item is-active"><span>♙</span><span><b>Quản trị viên</b><small>3 thành viên · Toàn quyền</small></span><i>›</i></button><button class="role-item"><span>▤</span><span><b>Kiểm duyệt nội dung</b><small>4 thành viên · Tin đăng, hồ sơ</small></span><i>›</i></button><button class="role-item"><span>₫</span><span><b>Tài chính</b><small>2 thành viên · Đối soát, báo cáo</small></span><i>›</i></button><button class="role-item"><span>◉</span><span><b>Chăm sóc khách hàng</b><small>3 thành viên · Hỗ trợ, khiếu nại</small></span><i>›</i></button></div><button class="button button--light" type="button" data-action>+ Tạo nhóm quyền</button></section>
      <section class="card admin-panel">${sectionHead("Quyền truy cập", "Nhóm: Quản trị viên")}<div class="permission-list"><div><span><b>Hồ sơ & tài khoản</b><small>Xem, xác minh và khóa tài khoản</small></span><input type="checkbox" checked aria-label="Quyền hồ sơ"></div><div><span><b>Tin đăng & tranh chấp</b><small>Duyệt nội dung và xử lý khiếu nại</small></span><input type="checkbox" checked aria-label="Quyền tin đăng"></div><div><span><b>Phí & doanh thu</b><small>Chỉnh sửa quy tắc, xuất báo cáo</small></span><input type="checkbox" checked aria-label="Quyền doanh thu"></div><div><span><b>Cài đặt hệ thống</b><small>Quản lý tài khoản và phân quyền</small></span><input type="checkbox" checked aria-label="Quyền cài đặt"></div></div><div class="panel-actions"><button class="button button--primary" type="button" data-action>Lưu quyền</button></div></section>
    </div>
    <section class="card admin-panel">${sectionHead("Tài khoản quản trị", "12 thành viên", '<a href="#" class="text-link">+ Thêm thành viên</a>')} ${table(["THÀNH VIÊN", "VAI TRÒ", "ĐĂNG NHẬP GẦN NHẤT", "BẢO MẬT", "TRẠNG THÁI", "THAO TÁC"],[{cells:[rowMain("Minh Anh","minhanh@a2ucar.vn"),"Quản trị viên","Hôm nay · 09:42",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>']},{cells:[rowMain("Quốc Huy","quochuy@a2ucar.vn"),"Tài chính","Hôm nay · 09:35",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>']},{cells:[rowMain("Thu Hà","thuha@a2ucar.vn"),"Kiểm duyệt","Hôm nay · 09:28",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>']},{cells:[rowMain("Ngọc Linh","ngoclinh@a2ucar.vn"),"CSKH","Hôm qua · 17:20",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>'] }])}</section>
    <section class="card admin-panel">${sectionHead("Bảo mật hệ thống", "Thiết lập áp dụng cho tài khoản quản trị")}<div class="security-settings"><label><span><b>Xác thực đa yếu tố</b><small>Bắt buộc xác thực khi đăng nhập</small></span><input type="checkbox" checked></label><label><span><b>Tự khóa phiên đăng nhập</b><small>Đăng xuất sau 30 phút không hoạt động</small></span><input type="checkbox" checked></label><label><span><b>Cảnh báo đăng nhập lạ</b><small>Gửi thông báo khi có thiết bị mới</small></span><input type="checkbox" checked></label></div></section>${pageFooter}`,
};

adminPage.innerHTML = (pages[pageKey] || pages.owners)();
document.title = `${document.querySelector(".admin-title h1").textContent} | A2U Car`;

let activeTab = "all";
const searchInput = adminPage.querySelector(".admin-search input");
const statusSelect = adminPage.querySelector(".admin-tools select");
const applyTableFilters = () => {
  const query = searchInput ? searchInput.value.trim().toLocaleLowerCase("vi") : "";
  const selectedStatus = statusSelect ? statusSelect.value : "";
  adminPage.querySelectorAll(".admin-table tbody tr").forEach(row => {
    const matchesTab = activeTab === "all" || row.dataset.status === activeTab;
    const matchesSearch = !query || row.textContent.toLocaleLowerCase("vi").includes(query);
    const matchesStatus = !selectedStatus || row.dataset.status === selectedStatus;
    row.hidden = !matchesTab || !matchesSearch || !matchesStatus;
  });
};

if (searchInput) searchInput.addEventListener("input", applyTableFilters);
if (statusSelect) statusSelect.addEventListener("change", applyTableFilters);
adminPage.querySelectorAll(".admin-tabs [data-tab]").forEach(tab => {
  tab.addEventListener("click", () => {
    adminPage.querySelectorAll(".admin-tabs [data-tab]").forEach(item => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    activeTab = tab.dataset.tab;
    applyTableFilters();
  });
});
