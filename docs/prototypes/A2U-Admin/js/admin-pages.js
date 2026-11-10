const adminPage = document.getElementById("admin-page");
const pageKey = adminPage.dataset.page;
const status = (label, tone = "blue") => `<span class="admin-status admin-status--${tone}">${label}</span>`;
const chevron = `<svg class="chevron-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>`;
const metric = (label, value, note, icon = "◷", tone = "") => `
  <article class="card admin-metric ${tone ? `admin-metric--${tone}` : ""}">
    <div><span>${label}</span><b aria-hidden="true">${icon}</b></div>
    <strong>${value}</strong>
  </article>`;
const titleBlock = (title, action = "Xuất") => `
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
  <select aria-label="Trạng thái"><option value="">Trạng thái</option><option value="pending">Chờ xử lý</option><option value="active">Hoạt động</option><option value="review">Rà soát</option><option value="done">Hoàn tất</option></select></div>`;
const pageFooter = `<footer class="footer"><span>© 2026 AZU Car</span></footer>`;
const pageTop = (title, action) => titleBlock(title, action);

const pages = {
  owners: () => `
    ${pageTop("Chủ xe", "Xuất")}
    <div class="admin-profile card">
      <div class="profile-main"><div class="profile-avatar">LH</div><div><h2>Lê Hoàng Nam</h2><p>CH-0128</p><div class="profile-tags">${status("Hoạt động", "green")}${status("Chờ duyệt: 1", "amber")}</div></div></div>
      <div class="profile-actions"><button class="button button--danger" type="button" data-action>Khóa</button></div>
      <div class="profile-metrics">${metric("Xe", "03", "2 hoạt động")}${metric("Chuyến", "128", "4,9/5")}${metric("Doanh thu", "18,45 tr đ", "Sau phí")}</div>
    </div>
    <section class="card admin-panel">${sectionHead("Giấy tờ")}
      <div class="doc-list"><div><span>▤</span><p><b>CCCD</b></p>${status("Đã xác minh", "green")}<a href="#">›</a></div><div><span>▤</span><p><b>GPLX B2</b></p>${status("Hợp lệ", "green")}<a href="#">›</a></div><div><span>▤</span><p><b>Đăng ký xe</b></p>${status("Đã xác minh", "green")}<a href="#">›</a></div><div><span>▤</span><p><b>Bảo hiểm Vios</b></p>${status("Chờ duyệt", "amber")}<a href="#">›</a></div></div>
    </section>
    <section class="card admin-panel">${sectionHead("Xe", "3 · 2 đang cho thuê")}
      ${table(["XE", "GIÁ/NGÀY", "CHUYẾN", "TRẠNG THÁI", ""], [
        {cells:[rowMain("Toyota Veloz Cross 2024","51H-298.30 · Trắng"),"850.000 đ","62",status("Hoạt động","green"),'<a href="#">Xem →</a>']},
        {cells:[rowMain("Mazda CX-5 2023","51K-562.18 · Xám"),"950.000 đ","48",status("Hoạt động","green"),'<a href="#">Xem →</a>']},
        {cells:[rowMain("Toyota Vios 2022","51H-882.69 · Bạc"),"600.000 đ","18",status("Tạm ẩn","neutral"),'<a href="#">Kiểm tra →</a>']},
      ])}
    </section>
    <section class="card admin-panel">${sectionHead("Đối soát", "T10/2026")}<div class="totals-row"><div><small>Đã chi</small><b>6.000.000 đ</b></div><div><small>Chờ chi</small><b class="blue-text">6.450.000 đ</b></div><div><small>Đang giữ</small><b>0 đ</b></div></div></section>${pageFooter}`,

  listings: () => `
    ${pageTop("Tin đăng", "Xuất")}
    <div class="admin-metrics admin-metrics--4">${metric("Chờ xử lý","24","+6 hôm qua","⌁")}${metric("Quá 24 giờ","04","Ưu tiên xử lý","◷","red")}${metric("Đã duyệt hôm nay","18","+12% hôm qua","✓","green")}${metric("Đã ẩn hôm nay","03","Vi phạm","⊘")}</div>
    <section class="card admin-panel">${sectionHead("Tin chờ xử lý (24)")}
      ${searchTools("Tên xe, mã tin đăng...")}
      <div class="admin-tabs"><button class="is-active" data-tab="all">Tất cả (24)</button><button data-tab="pending">Chờ duyệt (16)</button><button data-tab="review">Bổ sung (3)</button><button data-tab="reported">Vi phạm (5)</button></div>
      ${table(["TIN ĐĂNG", "CHỦ XE", "LÝ DO", "GỬI LÚC", "TRẠNG THÁI", ""],[
        {status:"pending",cells:[rowMain("Toyota Vios 2022","TD-0848 · 51H-882.69"),rowMain("Lê Hoàng Nam","CH-0128"),"Thiếu bảo hiểm","22/10 · 08:42<small>26 giờ</small>",status("Chờ duyệt","amber"),'<a href="#">Xem →</a>']},
        {status:"pending",cells:[rowMain("Mitsubishi Xpander 2023","TD-0851 · 51K-562.18"),rowMain("Nguyễn Thị Thu Hà","CH-0192"),"Tin mới","22/10 · 09:20<small>25 giờ</small>",status("Chờ duyệt","amber"),'<a href="#">Xem →</a>']},
        {status:"review",cells:[rowMain("Hyundai Accent 2024","TD-0860 · 43A-108.22"),rowMain("Vũ Đức Thành","CH-0821"),"Ảnh mờ","22/10 · 07:55<small>27 giờ</small>",status("Bổ sung","blue"),'<a href="#">Xem →</a>']},
        {status:"reported",cells:[rowMain("Kia Seltos 2025","TD-0865 · 51H-220.18"),rowMain("Phạm Quốc Bảo","CH-0448"),"Giá sai","21/10 · 16:40<small>2 ngày</small>",status("Vi phạm","red"),'<a href="#">Xem →</a>']},
        {status:"pending",cells:[rowMain("Ford Territory 2024","TD-0868 · 92A-012.68"),rowMain("Đặng Hoài An","CH-0618"),"Đổi giá","21/10 · 15:10<small>2 ngày</small>",status("Chờ duyệt","amber"),'<a href="#">Xem →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>1–5 / 24 tin</span><span>‹　1　2　3　4　›</span></div>
    </section>
    <div class="admin-columns admin-columns--review">
      <section class="card admin-panel listing-preview">${sectionHead("Toyota Vios · TD-0848")}<div class="car-preview"><div class="car-placeholder">🚙</div><div><b>51H-882.69</b><strong>600.000 đ <small>/ ngày</small></strong></div></div><div class="profile-tags">${status("Tạm ẩn","neutral")}${status("Thiếu giấy tờ","amber")}</div></section>
      <section class="card admin-panel">${sectionHead("Đối chiếu")}<div class="doc-list"><div><span>▤</span><p><b>Đăng ký xe & đăng kiểm</b><small>Biển số khớp</small></p>${status("Đã đối chiếu","green")}</div><div><span>▤</span><p><b>Ảnh & thông tin xe</b><small>Đủ góc chụp</small></p>${status("Đạt yêu cầu","green")}</div><div><span>▤</span><p><b>Bảo hiểm TNDS</b><small>Thiếu bản mới</small></p>${status("Chờ kiểm tra","amber")}</div></div><textarea class="admin-textarea" placeholder="Lý do bổ sung..."></textarea><div class="panel-actions"><button class="button button--light" type="button" data-action>Từ chối</button><button class="button button--light" type="button" data-action>Yêu cầu bổ sung</button><button class="button button--primary" type="button" data-action>✓ Duyệt</button></div></section>
    </div>${pageFooter}`,

  disputes: () => `
    ${pageTop("Tranh chấp", "Xuất")}
    <div class="admin-metrics admin-metrics--4">${metric("Đang mở","07","Xử lý hôm nay","▣","blue")}${metric("Ưu tiên cao","02","Trong 7 ngày","⚑","red")}${metric("Quá hạn","01","Phản hồi ngay","◷","amber")}${metric("Đã xử lý tháng này","32","+8% tháng trước","✓","green")}</div>
    <section class="card admin-panel">${sectionHead("Vụ việc (7)")}
      ${searchTools("Mã vụ việc, người liên quan...")}
      <div class="admin-tabs"><button class="is-active" data-tab="all">Đang mở (7)</button><button data-tab="pending">Ưu tiên cao (2)</button><button data-tab="review">Chờ phản hồi (3)</button><button data-tab="done">Đã xử lý (32)</button></div>
      ${table(["VỤ VIỆC", "NGƯỜI LIÊN QUAN", "MỨC ĐỘ", "HẠN", "TRẠNG THÁI", ""],[
        {status:"pending",cells:[rowMain("Không thống nhất phí trầy xước","TC-2846 · 22/10/2026"),rowMain("Nguyễn Phương Linh","Người thuê · Toyota Vios"),status("Cao","red"),"22/10 · 11:00<small>Còn 25 phút</small>",status("Đang xử lý","blue"),'<a href="#">Xử lý →</a>']},
        {status:"pending",cells:[rowMain("Chưa hoàn tiền đặt cọc","TC-2842 · 22/10/2026"),rowMain("Lê Thành Tùng","Người thuê · Ford"),status("Cao","red"),"22/10 · 09:00<small>Quá hạn 10 phút</small>",status("Chờ phản hồi","amber"),'<a href="#">Xử lý →</a>']},
        {status:"review",cells:[rowMain("Xe giao không đúng mô tả","TC-2838 · 21/10/2026"),rowMain("Đỗ Minh Châu","Người thuê · Hyundai Accent"),status("Trung bình","amber"),"22/10 · 15:30<small>Còn 4 giờ</small>",status("Chờ phản hồi","amber"),'<a href="#">Xử lý →</a>']},
        {status:"review",cells:[rowMain("Phụ phí trả xe muộn","TC-2830 · 21/10/2026"),rowMain("Trần Hoàng Phúc","Chủ xe · Toyota Innova"),status("Trung bình","amber"),"23/10 · 09:00<small>Còn 1 ngày</small>",status("Đang xử lý","blue"),'<a href="#">Xử lý →</a>']},
        {status:"done",cells:[rowMain("Phản ánh thái độ giao xe","TC-2826 · 21/10/2026"),rowMain("Vũ Thảo Nguyên","Người thuê · Honda City"),status("Thấp","neutral"),"23/10 · 10:00<small>Còn 1 ngày</small>",status("Mới tiếp nhận","red"),'<a href="#">Phân công →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>1–5 / 7 vụ việc</span><span>‹　1　2　›</span></div>
    </section>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("TC-2846 · Phí trầy xước", "Toyota Vios · Chuyến #10286")}<div class="profile-tags">${status("Mức độ cao","red")}${status("Đang xử lý","blue")}</div><p class="case-description">Tranh phí 2.500.000 đ do xước cản sau.</p><div class="totals-row"><div><small>Bồi thường</small><b>2.500.000 đ</b></div><div><small>Chuyến đi</small><b>#10286</b></div></div>${sectionHead("Tài liệu (3)") }<div class="doc-list"><div><span>▧</span><p><b>Ảnh nhận xe · 6</b><small>09:15 · 21/10</small></p><a href="#">Xem →</a></div><div><span>▧</span><p><b>Ảnh bàn giao · 4</b><small>08:20 · 22/10</small></p><a href="#">Xem →</a></div></div></section>
      <section class="card admin-panel">${sectionHead("Theo dõi xử lý", "Phụ trách: Minh Anh")}<ul class="timeline"><li><b>Đã yêu cầu chủ xe bổ sung ảnh gốc</b><small>09:42 hôm nay</small></li><li><b>Chủ xe gửi bằng chứng sửa chữa</b><small>08:20 hôm nay</small></li><li><b>Minh Anh tiếp nhận vụ việc</b><small>Hôm qua · 16:10</small></li></ul><label class="field-label">Phản hồi đến hai bên</label><textarea class="admin-textarea" placeholder="Nhập nội dung phản hồi..."></textarea><div class="panel-actions"><button class="button button--light" type="button" data-action>Ghi chú nội bộ</button><button class="button button--light" type="button" data-action>Giải quyết vụ</button><button class="button button--primary" type="button" data-action>Gửi phản hồi</button></div></section>
    </div>${pageFooter}`,

  users: () => `
    ${pageTop("Người dùng", "Xuất")}
    <div class="admin-metrics admin-metrics--4">${metric("Tài khoản","12.480","+8,2% tháng này","♧")}${metric("Đang hoạt động","12.164","97,5% tổng số","✓","green")}${metric("Chủ xe","1.118","+6,4% tháng này","♙")}${metric("Đã khóa","18","3 kháng nghị","⊘","red")}</div>
    <section class="card admin-panel">${sectionHead("Tài khoản")}
      ${searchTools("Tên, email, số điện thoại...")}
      <div class="admin-tabs"><button class="is-active" data-tab="all">Tất cả (12.480)</button><button data-tab="active">Hoạt động (12.164)</button><button data-tab="review">Hạn chế (298)</button><button data-tab="pending">Đã khóa (18)</button></div>
      ${table(["NGƯỜI DÙNG", "VAI TRÒ", "XÁC MINH", "TRẠNG THÁI", "HOẠT ĐỘNG GẦN NHẤT", "THAO TÁC"],[
        {status:"active",cells:[rowMain("Lê Hoàng Nam","CH-0128 · nam.lh@gmail.com · 0903 ••• 789"),"Chủ xe",status("Đã xác minh","green"),status("Đang hoạt động","green"),"22/10 · 08:42<small>iPhone · TP. HCM</small>",'<a href="#">Xem hồ sơ →</a>']},
        {status:"active",cells:[rowMain("Nguyễn Phương Mai","ND-0922 · mai.np@gmail.com · 0912 ••• 256"),"Người thuê",status("Đã xác minh","green"),status("Đang hoạt động","green"),"22/10 · 09:12<small>Web · TP. HCM</small>",'<a href="#">Quản lý →</a>']},
        {status:"active",cells:[rowMain("Trần Ngọc Thu Hà","CH-0192 · ha.tn@gmail.com · 0988 ••• 110"),"Chủ xe",status("Đã xác minh","green"),status("Đang hoạt động","green"),"22/10 · 08:20<small>Android · TP. HCM</small>",'<a href="#">Xem hồ sơ →</a>']},
        {status:"review",cells:[rowMain("Bùi Văn Hưng","ND-0644 · hung.bv@gmail.com · 0904 ••• 651"),"Người thuê",status("Đã xác minh","green"),status("Hạn chế","amber"),"21/10 · 21:08<small>Web · Hà Nội</small>",'<a href="#">Rà soát →</a>']},
        {status:"pending",cells:[rowMain("Tăng Minh Linh","ND-0126 · linh.tm@gmail.com · 0932 ••• 112"),"Người thuê",status("Chờ xác minh","amber"),status("Tạm khóa","red"),"20/10 · 18:35<small>iPhone · TP. HCM</small>",'<a href="#">Mở hồ sơ →</a>']},
        {status:"review",cells:[rowMain("Phạm Đức Long","CH-0339 · long.pd@gmail.com · 0918 ••• 006"),"Chủ xe",status("Chờ xác minh","amber"),status("Hạn chế","amber"),"22/10 · 07:46<small>Web · Đà Nẵng</small>",'<a href="#">Xác minh →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>1–6 / 12.480 tài khoản</span><span>‹　1　2　3　…　2.080　›</span></div>
    </section>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Tài khoản", "CH-0128 · Chủ xe")}<div class="user-summary"><span class="profile-avatar">LH</span><div><b>Lê Hoàng Nam</b><p>${status("Hoạt động","green")} ${status("Đã xác minh","green")}</p></div></div><div class="info-grid"><div><small>Điện thoại</small><b>0903 456 789</b></div><div><small>Email</small><b>nam.lh@gmail.com</b></div><div><small>Tham gia</small><b>15/06/2025</b></div><div><small>Hoạt động</small><b>128 chuyến · 4,9 ★</b></div></div><div class="panel-actions"><button class="button button--light" type="button" data-action>Đặt lại mật khẩu</button><button class="button button--danger" type="button" data-action>Khóa</button></div></section>
      <section class="card admin-panel">${sectionHead("Cần rà soát", "2 tài khoản")}<div class="review-item"><span>♙</span><div><b>Trần Ngọc Linh · ND-0826</b><small>Chờ xác minh danh tính</small></div><a href="#">Rà soát →</a></div><div class="review-item"><span>♙</span><div><b>Lê Hữu Bật · ND-0418</b><small>Kháng nghị hạn chế</small></div><a href="#">Rà soát →</a></div>${sectionHead("Hoạt động gần đây","")}<ul class="timeline timeline--compact"><li><b>Hạn chế Bùi Văn Hưng</b><small>Quốc Huy · 09:05</small></li><li><b>Xác minh Nguyễn Thu Hà</b><small>Minh Anh · 08:40</small></li></ul></section>
    </div>${pageFooter}`,

  fees: () => `
    ${pageTop("Phí & hoa hồng", "Xuất")}
    <div class="admin-metrics admin-metrics--3">${metric("Phí mặc định","10%","Chuyến hoàn tất","％")}${metric("Quy tắc ưu đãi","03","Đang áp dụng","▤")}${metric("Chủ xe ưu đãi","48","Đối tác","♙")}</div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Phí mặc định", "Chuyến hoàn tất")}<div class="fee-settings"><div class="setting-line"><div><b>Trạng thái</b><small>Quy tắc hiện tại</small></div>${status("Đang áp dụng","green")}</div><div class="form-grid"><label>Hoa hồng (%)<input type="number" value="10"></label><label>Ngày hiệu lực<input type="date" value="2026-10-01"></label><label class="form-grid__wide">Ghi chú<textarea>Áp dụng cho cá nhân, không gồm đối tác doanh nghiệp.</textarea></label></div><div class="panel-actions"><button class="button button--primary" type="button" data-action>✓ Lưu</button></div></div></section>
      <section class="card admin-panel">${sectionHead("Phân chia doanh thu", "A6208 · Toyota Vios · 1 ngày")}<div class="fee-breakdown"><div><span>Giá thuê</span><b>2.400.000 đ</b></div><div><span>Ưu đãi</span><b>-150.000 đ</b></div><div class="fee-breakdown__line"><span>Giá tính phí</span><b>2.250.000 đ</b></div><div><span>Phí nền tảng · 10%</span><b>-225.000 đ</b></div><div class="fee-breakdown__total"><span>Chủ xe nhận</span><strong>2.025.000 đ</strong></div></div></section>
    </div>
    <section class="card admin-panel">${sectionHead("Quy tắc", "", '<a href="#" class="text-link">+ Thêm</a>')}
      ${table(["ĐỐI TƯỢNG", "PHÍ", "THỜI GIAN", "ƯU TIÊN", "TRẠNG THÁI", ""],[
        {cells:[rowMain("Đối tác doanh nghiệp","5+ xe đăng ký"),"8%","01/10 – 31/12/2026","Theo nhóm",status("Đang hiệu lực","green"),'<a href="#">Chi tiết →</a>']},
        {cells:[rowMain("Chủ xe mới · 10 chuyến đầu","3 chuyến đầu giảm phí"),"5%","01/10 – 30/11/2026","Theo nhóm",status("Đang hiệu lực","green"),'<a href="#">Chi tiết →</a>']},
        {cells:[rowMain("CH-0128 · Lê Hoàng Nam","Ưu đãi đối tác thân thiết"),"7%","25/10 – 26/11/2026","Chủ xe",status("Sắp áp dụng","amber"),'<a href="#">Chi tiết →</a>']},
      ])}<div class="table-caption">Cá nhân không thuộc nhóm ưu đãi áp dụng mức phí mặc định 10%.</div>
    </section>
    <section class="card admin-panel">${sectionHead("Lịch sử", "Điều chỉnh gần đây")} ${table(["THỜI GIAN", "NGƯỜI THỰC HIỆN", "THAY ĐỔI", "LÝ DO", "HIỆU LỰC"],[{cells:["22/10/2026 · 09:42","Minh Anh","CH-0128: 10% → 7%","Ưu đãi đối tác","25/10/2026"]},{cells:["01/10/2026 · 08:30","Minh Anh","Phí mặc định: 12% → 10%","Q4/2026","01/10/2026"]},{cells:["30/09/2026 · 16:15","Quốc Huy","Tạo quy tắc doanh nghiệp","Đăng xe mới","01/10/2026"]}])}</section>${pageFooter}`,

  revenue: () => `
    ${pageTop("Doanh thu", "Xuất")}
    <div class="admin-toolbar"><div class="admin-tabs"><button>7 ngày</button><button class="is-active">Tháng này</button><button>Quý này</button></div><button class="button button--light" type="button">▦ 01/10/2026 – 31/10/2026</button><button class="button button--light" type="button">⌖ Khu vực</button></div>
    <div class="admin-metrics admin-metrics--4">${metric("Giao dịch","1,25 tỷ đ","+16,5% tháng trước","▣")}${metric("Doanh thu","118 triệu đ","+12,8% tháng trước","⌁","blue")}${metric("Chuyến hoàn tất","600","+7,2% tháng trước","↗","green")}${metric("Phí / GMV","9,6%","Ổn định","％")}</div>
    <div class="admin-columns admin-columns--chart">
      <section class="card admin-panel">${sectionHead("Doanh thu theo tuần", "Triệu đồng", `<a href="#" class="text-link">Theo tuần ${chevron}</a>`)}<div class="legend"><span></span>10/2026</div><div class="bar-chart"><div class="bar-chart__labels"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div><div class="bar-chart__plot"><div class="bar-set"><b>24</b><i style="--height:60%"></i><small>06/10</small></div><div class="bar-set"><b>29</b><i style="--height:72%"></i><small>13/10</small></div><div class="bar-set"><b>31</b><i style="--height:78%"></i><small>20/10</small></div><div class="bar-set"><b>36</b><i style="--height:90%"></i><small>27/10</small></div></div></div></section>
      <section class="card admin-panel">${sectionHead("Cơ cấu theo khu vực", "Tổng giá trị giao dịch")}<div class="donut-wrap"><div class="donut-chart"><div><b>1,25 tỷ</b><small>GMV</small></div></div><ul><li><span></span>TP. Hồ Chí Minh <b>66% · 825 tr</b></li><li><span></span>Hà Nội <b>24% · 300 tr</b></li><li><span></span>Đà Nẵng <b>10% · 125 tr</b></li></ul></div></section>
    </div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Doanh thu thuần", "Phân bổ tháng này")}<div class="fee-breakdown"><div><span>Phí nền tảng</span><b>120.000.000 đ</b></div><div><span>Phí giao dịch</span><b>-2.000.000 đ</b></div><div><span>Hoàn phí</span><b>0 đ</b></div><div class="fee-breakdown__total"><span>Thực thu</span><strong>118.000.000 đ</strong></div></div></section>
      <section class="card admin-panel">${sectionHead("Đối soát chủ xe", "22/10/2026")}<div class="totals-row"><div><small>Đã nhận</small><b>920 triệu đ</b></div><div><small>Chờ trả</small><b class="blue-text">210 triệu đ</b></div></div><p class="settlement-note">✓ Đã đối chiếu · Không sai lệch.</p></section>
    </div>
    <section class="card admin-panel">${sectionHead("Theo kỳ")} ${table(["KỲ", "CHUYẾN", "GMV", "PHÍ", "HOÀN", "THỰC THU"],[{cells:["01–07/10","159","250 tr","24 tr","0,5 tr","23,5 tr"]},{cells:["08–14/10","164","310 tr","29 tr","0,2 tr","28,8 tr"]},{cells:["15–21/10","156","325 tr","31 tr","0,7 tr","30,3 tr"]},{cells:["22–31/10","121","365 tr","36 tr","0,9 tr","35,1 tr"]},{cells:[rowMain("T10/2026","",""),"600","1.250 tr","120 tr","2,3 tr","117,7 tr"]}])}</section>
    ${pageFooter}`,

  logs: () => `
    ${pageTop("Nhật ký", "Xuất")}
    <div class="admin-metrics admin-metrics--3">${metric("Hôm nay","128","Mọi vai trò","⌁")}${metric("Thành công","124","96,8%","✓","green")}${metric("Thất bại","04","3 đăng nhập · 1 cập nhật","!","red")}</div>
    <section class="card admin-panel">${sectionHead("Hoạt động", "Mới nhất")}
      ${searchTools("Nhân viên, mã sự kiện...")}
      <div class="admin-tabs"><button class="is-active">Tất cả</button><button>Quản trị</button><button>Người dùng</button><button>Bảo mật</button><button>Hệ thống</button></div>
      <div class="admin-toolbar admin-toolbar--simple"><button class="button button--light" type="button">Nhân viên ${chevron}</button><button class="button button--light" type="button">Chức năng ${chevron}</button><button class="button button--light" type="button">Kết quả ${chevron}</button><button class="button button--light" type="button">▦ 22/10/2026</button></div>
      ${table(["THỜI GIAN / MÃ", "NGƯỜI THỰC HIỆN", "HOẠT ĐỘNG", "ĐỐI TƯỢNG", "KẾT QUẢ", "CHI TIẾT"],[
        {status:"active",cells:[rowMain("09:42:18","NK-2210-0128"),rowMain("Minh Anh","Quản trị viên"),rowMain("Tạo quy tắc phí","10% → 7% · 25/10"),"Chủ xe CH-0128",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("09:35:06","NK-2210-0127"),rowMain("Quốc Huy","Tài chính"),rowMain("Xuất báo cáo doanh thu","Tháng 10/2026 · CSV"),"BC-2026-09",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("09:28:41","NK-2210-0126"),rowMain("Thu Hà","Kiểm duyệt"),rowMain("Duyệt giấy tờ xe","Căn cước công dân"),"Chủ xe CH-0114",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"review",cells:[rowMain("09:11:22","NK-2210-0125"),rowMain("Ngọc Linh","CSKH"),rowMain("Thay đổi cài đặt phí","Thiếu quyền xác nhận"),"Phí nền tảng",status("Bị từ chối","red"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("09:12:03","NK-2210-0124"),rowMain("Minh Anh","Quản trị viên"),rowMain("Cập nhật hồ sơ chủ xe","Ghi chú quản trị"),"Chủ xe CH-0128",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"active",cells:[rowMain("08:56:39","NK-2210-0123"),rowMain("Thu Hà","Kiểm duyệt"),rowMain("Duyệt tin đăng","Toyota Vios 2022"),"Xe XE-0248",status("Thành công","green"),'<a href="#">Xem →</a>']},
        {status:"review",cells:[rowMain("08:42:11","NK-2210-0122"),rowMain("Hệ thống","Tự động"),rowMain("Đăng nhập thất bại","Sai mật khẩu 5 lần"),"Tài khoản ND-0116",status("Thất bại","red"),'<a href="#">Xem →</a>']},
      ])}
      <div class="table-caption table-caption--between"><span>1–7 / 128 hoạt động</span><span>‹　1　2　3　…　›</span></div>
    </section>
    <section class="card admin-panel">${sectionHead("Sự kiện · NK-2210-0128", "Tạo quy tắc phí · CH-0128")}<div class="event-meta"><div><small>NGƯỜI THỰC HIỆN</small><b>Minh Anh · Admin</b></div><div><small>THỜI ĐIỂM</small><b>22/10/2026 · 09:42:18</b></div><div><small>IP</small><b>113.161.72.***</b></div><div><small>KẾT QUẢ</small>${status("Thành công","green")}</div></div><div class="event-diff"><div><b>Trước</b><p>Phí nền tảng <strong>10%</strong></p><p>Phạm vi <strong>Tất cả chủ xe</strong></p></div><div><b>Sau</b><p>Phí nền tảng <strong>7%</strong></p><p>Phạm vi <strong>CH-0128</strong></p></div></div><p class="compact-note">Lý do: Ưu đãi đối tác tháng 10.</p></section>${pageFooter}`,

  settings: () => `
    ${pageTop("Cài đặt", "Lưu")}
    <div class="admin-metrics admin-metrics--3">${metric("Quản trị viên","12","10 hoạt động","♙")}${metric("Nhóm quyền","04","Đã cấu hình","▤")}${metric("MFA","100%","Bắt buộc","▣","green")}</div>
    <div class="admin-columns admin-columns--half">
      <section class="card admin-panel">${sectionHead("Nhóm quyền", "")}<div class="role-list"><button class="role-item is-active"><span>♙</span><span><b>Quản trị viên</b><small>3 thành viên · Toàn quyền</small></span><i>›</i></button><button class="role-item"><span>▤</span><span><b>Kiểm duyệt</b><small>4 thành viên · Tin đăng, hồ sơ</small></span><i>›</i></button><button class="role-item"><span>₫</span><span><b>Tài chính</b><small>2 thành viên · Đối soát, báo cáo</small></span><i>›</i></button><button class="role-item"><span>◉</span><span><b>CSKH</b><small>3 thành viên · Hỗ trợ, khiếu nại</small></span><i>›</i></button></div><button class="button button--light" type="button" data-action>+ Tạo nhóm</button></section>
      <section class="card admin-panel">${sectionHead("Quyền truy cập", "Quản trị viên")}<div class="permission-list"><div><span><b>Hồ sơ & tài khoản</b><small>Xem, xác minh, khóa</small></span><input type="checkbox" checked aria-label="Quyền hồ sơ"></div><div><span><b>Tin đăng & tranh chấp</b><small>Duyệt, xử lý khiếu nại</small></span><input type="checkbox" checked aria-label="Quyền tin đăng"></div><div><span><b>Phí & doanh thu</b><small>Sửa quy tắc, xuất báo cáo</small></span><input type="checkbox" checked aria-label="Quyền doanh thu"></div><div><span><b>Cài đặt</b><small>Quản lý tài khoản, quyền</small></span><input type="checkbox" checked aria-label="Quyền cài đặt"></div></div><div class="panel-actions"><button class="button button--primary" type="button" data-action>Lưu quyền</button></div></section>
    </div>
    <section class="card admin-panel">${sectionHead("Tài khoản quản trị", "12 thành viên", '<a href="#" class="text-link">+ Thêm thành viên</a>')} ${table(["THÀNH VIÊN", "VAI TRÒ", "ĐĂNG NHẬP GẦN NHẤT", "BẢO MẬT", "TRẠNG THÁI", "THAO TÁC"],[{cells:[rowMain("Minh Anh","minhanh@a2ucar.vn"),"Quản trị viên","Hôm nay · 09:42",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>']},{cells:[rowMain("Quốc Huy","quochuy@a2ucar.vn"),"Tài chính","Hôm nay · 09:35",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>']},{cells:[rowMain("Thu Hà","thuha@a2ucar.vn"),"Kiểm duyệt","Hôm nay · 09:28",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>']},{cells:[rowMain("Ngọc Linh","ngoclinh@a2ucar.vn"),"CSKH","Hôm qua · 17:20",status("MFA bật","green"),status("Hoạt động","green"),'<a href="#">Chỉnh sửa →</a>'] }])}</section>
    <section class="card admin-panel">${sectionHead("Bảo mật", "")}<div class="security-settings"><label><span><b>Xác thực đa yếu tố</b><small>Bắt buộc khi đăng nhập</small></span><input type="checkbox" checked></label><label><span><b>Tự khóa phiên</b><small>Sau 30 phút không hoạt động</small></span><input type="checkbox" checked></label><label><span><b>Cảnh báo đăng nhập lạ</b><small>Khi có thiết bị mới</small></span><input type="checkbox" checked></label></div></section>${pageFooter}`,
};

adminPage.innerHTML = (pages[pageKey] || pages.owners)();
document.title = `${document.querySelector(".admin-title h1").textContent} | AZU Car`;

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
