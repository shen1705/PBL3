if (!window.AzuStore.isLoggedIn()) {
    window.AzuStore.requireLogin('become-owner.html');
}

const filterTrigger = document.querySelector('.filter-trigger');
const filterMenu = document.querySelector('.filter-menu');
const filterLabel = document.getElementById('filter-label');
const profileName = document.getElementById('profile-name');
const profileAvatar = document.getElementById('profile-avatar');
const profileLink = document.getElementById('owner-account-link');
const emptyState = document.getElementById('empty-state');
const vehicleList = document.getElementById('owner-vehicle-list');
const displayName = sessionStorage.getItem('azuCarDisplayName');
let currentFilter = 'all';

if (profileName && profileAvatar && profileLink) {
    if (displayName) {
        profileName.textContent = displayName;
        profileAvatar.textContent = Array.from(displayName)[0].toLocaleUpperCase('vi');
        profileLink.href = '/account';
        profileLink.setAttribute('aria-label', `Tài khoản ${displayName}`);
    } else {
        profileName.textContent = 'Đăng nhập';
        profileAvatar.textContent = '?';
        profileLink.href = '/';
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('azuCarReturnTo');
            sessionStorage.setItem('azuCarPromptLogin', '1');
            window.location.href = '/';
        });
    }
}

const tripSidebarName = document.getElementById('trip-sidebar-name');
if (tripSidebarName) {
    const userGreetingName = displayName || sessionStorage.getItem('azuCarAccountName');
    if (userGreetingName) {
        tripSidebarName.textContent = userGreetingName;
        tripSidebarName.style.display = 'block';
    }
}

const statusLabels = {
    pending: 'Chờ duyệt',
    approved: 'Đang hoạt động',
    rejected: 'Bị từ chối',
    inactive: 'Dừng hoạt động'
};

function renderOwnerCars() {
    const cars = window.AzuStore.getOwnerCars();
    const visibleCars = currentFilter === 'all'
        ? cars
        : cars.filter(car => car.status === currentFilter);

    if (!vehicleList) return;
    vehicleList.replaceChildren();
    
    // Nếu tổng kho xe rỗng hoàn toàn -> hiện emptyState, ẩn danh sách
    if (!cars.length) {
        if (emptyState) emptyState.hidden = false;
        vehicleList.hidden = true;
        return;
    }

    if (emptyState) emptyState.hidden = true;
    vehicleList.hidden = false;

    // Nếu có xe nhưng lọc theo trạng thái mà không có kết quả khớp
    if (!visibleCars.length) {
        const message = document.createElement('p');
        message.className = 'owner-filter-empty';
        message.textContent = 'Không có xe trong mục này.';
        vehicleList.append(message);
        return;
    }

    visibleCars.forEach(car => {
        const card = document.createElement('article');
        card.className = 'owner-vehicle-card';

        const thumb = document.createElement('div');
        thumb.className = 'owner-vehicle-thumb';
        thumb.innerHTML = '<i class="fa-solid fa-car-side"></i>';

        const info = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = car.name;
        const owner = document.createElement('p');
        owner.textContent = `${car.ownerName || displayName || 'Chủ xe'} • ${car.phone || ''}`;
        const status = document.createElement('span');
        status.className = `status-chip status-${car.status}`;
        status.textContent = statusLabels[car.status] || car.status;
        info.append(title, owner, status);

        card.append(thumb, info);
        vehicleList.append(card);
    });
}

// Xử lý mở/đóng menu lọc
filterTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = filterTrigger.getAttribute('aria-expanded') === 'true';
    filterTrigger.setAttribute('aria-expanded', String(!isOpen));
    if (filterMenu) filterMenu.hidden = isOpen;
});

// Đóng menu lọc khi click ra ngoài
document.addEventListener('click', (event) => {
    if (!filterTrigger?.contains(event.target) && !filterMenu?.contains(event.target)) {
        if (filterMenu && !filterMenu.hidden) {
            filterMenu.hidden = true;
            filterTrigger?.setAttribute('aria-expanded', 'false');
        }
    }
});

filterMenu?.addEventListener('click', event => {
    const option = event.target.closest('[data-filter]');
    if (!option || !filterLabel) return;

    currentFilter = option.dataset.filter;
    filterLabel.textContent = option.textContent.trim();
    filterTrigger.setAttribute('aria-expanded', 'false');
    filterMenu.hidden = true;
    renderOwnerCars();
});

// Xử lý chuyển tab loại xe
document.querySelectorAll('.vehicle-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.vehicle-tab').forEach(item => {
            const isActive = item === tab;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', String(isActive));
        });
        renderOwnerCars();
    });
});

document.querySelectorAll('.register-trigger').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'carregistermode.html';
    });
});

renderOwnerCars();

// Xử lý chuyển đổi nội dung khi click vào các mục sidebar
const sideLinks = document.querySelectorAll('.side-link');
const contentSections = document.querySelectorAll('.content-section');

function switchSection(targetId) {
    if (!targetId) return;
    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;

    // Map common aliases
    let resolvedId = cleanId;
    if (cleanId === 'cam-nang') resolvedId = 'cam-nang-content';
    if (cleanId === 'lich-xe') resolvedId = 'lich-xe-content';
    if (cleanId === 'danh-sach-xe') resolvedId = 'danh-sach-xe-content';
    if (cleanId === 'hop-dong') resolvedId = 'hop-dong-content';
    if (cleanId === 'bao-mat') resolvedId = 'bao-mat-content';

    let sectionEl = document.getElementById(resolvedId);
    if (!sectionEl && !resolvedId.endsWith('-content')) {
        sectionEl = document.getElementById(`${resolvedId}-content`);
    }

    if (!sectionEl) return;

    // Cập nhật trạng thái active trên sidebar
    sideLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').replace('#', '');
        const isMatch = href === cleanId || 
                        href === resolvedId || 
                        `${href}-content` === resolvedId ||
                        href === resolvedId.replace('-content', '');
        link.classList.toggle('active', isMatch);
    });

    // Ẩn/hiện các phần nội dung
    contentSections.forEach(section => {
        section.hidden = (section !== sectionEl);
    });
}

sideLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const targetHref = this.getAttribute('href');
        if (!targetHref?.startsWith('#')) return;
        e.preventDefault();
        switchSection(targetHref);
        window.history.replaceState(null, '', targetHref);
    });
});

// Nút quay lại từ các mục
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('btn-back-home')) {
            window.location.href = 'index.html';
        } else {
            switchSection('danh-sach-xe-content');
            window.history.replaceState(null, '', '#danh-sach-xe-content');
        }
    });
});

// Xử lý mở/đóng modal chi tiết của Cẩm nang
const processModal = document.getElementById('processModal');
const decreeModal = document.getElementById('decreeModal');
const openProcessBtn = document.getElementById('open-process-modal');
const openDecreeBtn = document.getElementById('open-decree-modal');

openProcessBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (processModal) processModal.hidden = false;
});

openDecreeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (decreeModal) decreeModal.hidden = false;
});

document.querySelectorAll('.dialog-backdrop').forEach(modal => {
    modal.querySelector('.dialog-close')?.addEventListener('click', () => {
        modal.hidden = true;
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.hidden = true;
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.dialog-backdrop').forEach(modal => {
            modal.hidden = true;
        });
    }
});



// ==============================================
// Xử lý xem tài liệu & chính sách (Hợp đồng, Chứng từ, Chính sách bảo mật)
// ==============================================
const DOC_TEMPLATES = {
    rentalContract: {
        title: 'HỢP ĐỒNG CHO THUÊ XE TỰ LÁI',
        subtitle: 'Mẫu số 01/HĐ-AZU • Xác thực điện tử VNeID Mức 2',
        badge: 'Hợp đồng mẫu',
        content: `
            <div class="contract-info-grid">
                <div class="info-block">
                    <h4>BÊN CHO THUÊ (BÊN A)</h4>
                    <p><strong>Chủ xe:</strong> Ai đó (Chủ xe AZU Car)</p>
                    <p><strong>Số điện thoại:</strong> 0905 123 456</p>
                    <p><strong>Định danh:</strong> CCCD gắn chip (VNeID Cấp 2)</p>
                </div>
                <div class="info-block">
                    <h4>BÊN THUÊ XE (BÊN B)</h4>
                    <p><strong>Khách thuê:</strong> Nguyễn Hoàng Nam</p>
                    <p><strong>Số điện thoại:</strong> 0912 345 678</p>
                    <p><strong>GPLX:</strong> Hạng B2 • Số: 790182******</p>
                </div>
            </div>

            <div class="info-block">
                <h4>THÔNG TIN PHƯƠNG TIỆN CHO THUÊ</h4>
                <p><strong>Phương tiện:</strong> VinFast VF8 Plus (Biển số: 43A-888.99)</p>
                <p><strong>Thời gian thuê:</strong> 24/10/2026 08:00 - 26/10/2026 20:00 (2 ngày)</p>
                <p><strong>Đơn giá thuê:</strong> 1.600.000 đ/ngày • <strong>Tổng:</strong> <span style="color: #2563eb; font-weight: 700;">3.200.000 đ</span></p>
                <p><strong>Tiền cọc đảm bảo:</strong> 15.000.000 đ (Được giữ an toàn qua AZU Car)</p>
            </div>

            <div class="contract-terms-box">
                <p><strong>Điều khoản cam kết:</strong> Bên B cam kết điều khiển phương tiện đúng luật giao thông, chịu hoàn toàn trách nhiệm đối với các lỗi vi phạm và phạt nguội phát sinh trong thời gian thuê. Bên A cam kết xe đầy đủ đăng kiểm, bảo hiểm bắt buộc và thiết bị giám sát hành trình hoạt động ổn định.</p>
            </div>

            <div class="contract-signature-row">
                <div class="sig-box">
                    <h5>CHỮ KÝ ĐIỆN TỬ BÊN A</h5>
                    <div class="sig-badge">
                        <i class="fa-solid fa-signature"></i> ĐÃ KÝ ĐIỆN TỬ (VNeID)
                    </div>
                </div>
                <div class="sig-box">
                    <h5>CHỮ KÝ ĐIỆN TỬ BÊN B</h5>
                    <div class="sig-badge">
                        <i class="fa-solid fa-signature"></i> ĐÃ KÝ ĐIỆN TỬ (VNeID)
                    </div>
                </div>
            </div>
        `
    },
    handoverContract: {
        title: 'BIÊN BẢN BÀN GIAO XE & HIỆN TRẠNG',
        subtitle: 'Mẫu số 02/BBBG-AZU • Kèm hình ảnh hiện trạng 4 góc xe',
        badge: 'Biên bản mẫu',
        content: `
            <div class="contract-info-grid">
                <div class="info-block">
                    <h4>THÔNG TIN PHƯƠNG TIỆN</h4>
                    <p><strong>Xe:</strong> VinFast VF8 Plus (43A-888.99)</p>
                    <p><strong>Chỉ số ODO:</strong> 14.250 km</p>
                    <p><strong>Mức năng lượng:</strong> Pin 95%</p>
                </div>
                <div class="info-block">
                    <h4>GIẤY TỜ BÀN GIAO KÈM THEO</h4>
                    <p>• Bản sao công chứng Đăng ký xe</p>
                    <p>• Giấy chứng nhận Đăng kiểm (Hạn 2028)</p>
                    <p>• Giấy chứng nhận Bảo hiểm bắt buộc TNDS</p>
                </div>
            </div>

            <div class="info-block">
                <h4>HIỆN TRẠNG NGOẠI THẤT & PHỤ KIỆN</h4>
                <p><strong>Ngoại thất:</strong> Thân vỏ nguyên vẹn, chụp ảnh 4 góc xe đã lưu trên hệ thống.</p>
                <p><strong>Nội thất & Tiện ích:</strong> Ghế da sạch sẽ, màn hình trung tâm hoạt động tốt, bộ sạc di động theo xe đầy đủ, lốp dự phòng và bộ cứu hộ đạt chuẩn.</p>
            </div>

            <div class="contract-terms-box">
                <p><strong>Xác nhận bàn giao:</strong> Hai bên đã cùng kiểm tra thực tế tình trạng phương tiện, đồng ý ký tên xác nhận hiện trạng xe tại thời điểm giao dịch và cam kết hoàn trả đúng nguyên trạng khi kết thúc thời gian thuê.</p>
            </div>

            <div class="contract-signature-row">
                <div class="sig-box">
                    <h5>ĐẠI DIỆN BÀN GIAO (BÊN A)</h5>
                    <div class="sig-badge">
                        <i class="fa-solid fa-check"></i> ĐÃ XÁC NHẬN GIAO XE
                    </div>
                </div>
                <div class="sig-box">
                    <h5>ĐẠI DIỆN NHẬN XE (BÊN B)</h5>
                    <div class="sig-badge">
                        <i class="fa-solid fa-check"></i> ĐÃ NHẬN XE & GIẤY TỜ
                    </div>
                </div>
            </div>
        `
    },
    policyDecree: {
        title: 'CHÍNH SÁCH BẢO MẬT THEO NGHỊ ĐỊNH 13/2023/NĐ-CP',
        subtitle: 'Quy chuẩn bảo vệ dữ liệu cá nhân & phương tiện của Chủ xe AZU Car',
        badge: 'Quy định pháp luật',
        content: `
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>1. Nguyên tắc tuân thủ pháp luật:</strong> AZU Car cam kết thực hiện đầy đủ các biện pháp kỹ thuật và pháp lý nhằm bảo vệ dữ liệu cá nhân của Chủ xe theo đúng tinh thần Nghị định số 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>2. Phạm vi dữ liệu được bảo vệ:</strong> Bao gồm họ tên, số điện thoại, CCCD gắn chip, giấy chứng nhận đăng ký xe, đăng kiểm, tài khoản ngân hàng và toàn bộ lịch sử giao dịch cho thuê xe trên nền tảng.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>3. Biện pháp kỹ thuật an toàn:</strong> Toàn bộ dữ liệu được mã hóa đa tầng bằng thuật toán chuẩn ngân hàng AES-256 khi lưu trữ và truyền qua giao thức HTTPS/TLS 1.3. Hệ thống có tường lửa chống tấn công mạng và tự động sao lưu định kỳ.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>4. Cam kết không chia sẻ thương mại:</strong> AZU Car tuyệt đối không bán, cho thuê hoặc chia sẻ dữ liệu của Chủ xe cho bất kỳ bên tiếp thị quảng cáo nào khi chưa có sự đồng ý rõ ràng bằng văn bản điện tử.</p>
            </div>
        `
    },
    policyGps: {
        title: 'CHÍNH SÁCH QUẢN LÝ THIẾT BỊ ĐỊNH VỊ GPS & GIÁM SÁT HÀNH TRÌNH',
        subtitle: 'Quy chuẩn bảo vệ tài sản và tôn trọng quyền riêng tư của Chủ xe',
        badge: 'Quy chế an toàn',
        content: `
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>1. Mục đích giám sát:</strong> Dữ liệu GPS được sử dụng nhằm mục đích bảo vệ tài sản của Chủ xe, hỗ trợ cứu hộ khẩn cấp và giải quyết các sự cố va chạm hoặc vi phạm giao thông phát sinh trong chuyến đi.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>2. Giới hạn thời gian theo dõi:</strong> Hệ thống chỉ ghi nhận dữ liệu định vị và lộ trình khi chuyến thuê xe đang có hiệu lực. Ngoài khoảng thời gian cho thuê, hệ thống tự động ngừng ghi nhận vị trí nhằm bảo đảm quyền riêng tư cá nhân của Chủ xe.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>3. Cảnh báo thông minh:</strong> Tự động cảnh báo ngay cho Chủ xe khi xe di chuyển quá tốc độ tối đa cho phép, có dấu hiệu đi qua biên giới hoặc thiết bị GPS bị ngắt nguồn đột ngột.</p>
            </div>
        `
    },
    policyDataCollection: {
        title: 'QUY ĐỊNH THU THẬP VÀ XỬ LÝ DỮ LIỆU CÁ NHÂN',
        subtitle: 'Minh bạch quy trình tiếp nhận và quản lý thông tin Chủ xe',
        badge: 'Điều khoản chi tiết',
        content: `
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>1. Mục đích thu thập:</strong> Phục vụ thẩm định điều kiện xe cho thuê, khởi tạo hợp đồng điện tử tự động và kết nối khách thuê an toàn.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>2. Thời hạn lưu trữ:</strong> Dữ liệu hồ sơ phương tiện và chứng từ điện tử được lưu trữ tối thiểu 03 năm theo quy định về lưu trữ dữ liệu điện tử tại Việt Nam.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>3. Cơ chế bảo vệ:</strong> Áp dụng cơ chế phân quyền truy cập nghiêm ngặt. Chỉ nhân sự phụ trách nghiệp vụ thẩm định được cấp quyền xem xét hồ sơ của Chủ xe.</p>
            </div>
        `
    },
    policyContractSecurity: {
        title: 'QUY CHẾ BẢO MẬT HỢP ĐỒNG & THÔNG TIN TÀI KHOẢN',
        subtitle: 'Đảm bảo an toàn tuyệt đối cho mọi giao dịch tài chính',
        badge: 'Bảo mật tài chính',
        content: `
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>1. Ký số bảo mật:</strong> Hợp đồng điện tử và biên bản bàn giao được ký bằng định danh điện tử VNeID Mức 2, có giá trị pháp lý tương đương văn bản công chứng.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>2. Bảo mật tài khoản thanh toán:</strong> Mọi khoản thanh toán tiền thuê xe và đối soát được thực hiện qua cổng thanh toán bảo mật liên kết ngân hàng. Thông tin tài khoản được mã hóa và không bao giờ lộ ra bên ngoài.</p>
            </div>
        `
    },
    policyDataRights: {
        title: 'QUYỀN KIỂM SOÁT VÀ YÊU CẦU XÓA THÔNG TIN CỦA CHỦ XE',
        subtitle: 'Quyền của Chủ thể dữ liệu theo Điều 9 Nghị định 13/2023/NĐ-CP',
        badge: 'Quyền chủ xe',
        content: `
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>1. Quyền tra cứu:</strong> Chủ xe có quyền tra cứu toàn bộ lịch sử truy cập dữ liệu, xuất bản sao chứng từ và xem lại tất cả các chuyến đi đã thực hiện.</p>
            </div>
            <div class="contract-terms-box" style="margin-bottom: 12px;">
                <p><strong>2. Quyền yêu cầu xóa thông tin:</strong> Khi Chủ xe ngừng kinh doanh cho thuê xe trên AZU Car, Chủ xe có quyền yêu cầu hệ thống gỡ bỏ toàn bộ ảnh chụp giấy tờ và dữ liệu cá nhân theo quy định.</p>
            </div>
        `
    }
};

function openDocPreview(docKey) {
    const doc = DOC_TEMPLATES[docKey];
    if (!doc) return;
    const modal = document.getElementById('docPreviewModal');
    const titleEl = document.getElementById('docModalTitle');
    const subEl = document.getElementById('docModalSubtitle');
    const badgeEl = document.getElementById('docModalBadge');
    const bodyEl = document.getElementById('docModalBody');

    if (titleEl) titleEl.textContent = doc.title;
    if (subEl) subEl.textContent = doc.subtitle;
    if (badgeEl) badgeEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${doc.badge}`;
    if (bodyEl) bodyEl.innerHTML = doc.content;

    if (modal) modal.hidden = false;
}

// Bắt sự kiện click các nút trong Hợp đồng
document.getElementById('openRentalContractBtn')?.addEventListener('click', () => openDocPreview('rentalContract'));
document.getElementById('openHandoverContractBtn')?.addEventListener('click', () => openDocPreview('handoverContract'));

// Bắt sự kiện click các nút và link trong Chính sách bảo vệ dữ liệu
document.getElementById('openDataCollectionPolicyBtn')?.addEventListener('click', () => openDocPreview('policyDataCollection'));
document.getElementById('openContractSecurityPolicyBtn')?.addEventListener('click', () => openDocPreview('policyContractSecurity'));
document.getElementById('openDataRightsPolicyBtn')?.addEventListener('click', () => openDocPreview('policyDataRights'));

// Nút đóng modal
document.getElementById('closeDocModalBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('docPreviewModal');
    if (modal) modal.hidden = true;
});

// Khởi tạo tab ban đầu
if (window.location.hash) {
    switchSection(window.location.hash);
} else {
    const activeLink = document.querySelector('.side-link.active');
    if (activeLink) {
        switchSection(activeLink.getAttribute('href'));
    }
}

// Xử lý Lịch xe (Calendar)
const calendarDays = document.getElementById('calendarDays');
const calendarFrom = document.getElementById('calendarFrom');
const calendarTo = document.getElementById('calendarTo');
const calendarMonthLabel = document.getElementById('calendarMonthLabel');
let displayedMonth = new Date();

function toLocalDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar() {
    if (!calendarDays || !calendarMonthLabel) return;

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const monthStart = new Date(year, month, 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    calendarMonthLabel.textContent = new Intl.DateTimeFormat('vi-VN', {
        month: 'long',
        year: 'numeric'
    }).format(monthStart);
    calendarDays.replaceChildren();

    for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
        const date = new Date(year, month, cellIndex - firstWeekday + 1);
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.setAttribute('role', 'gridcell');
        dayCell.classList.toggle('is-adjacent', date.getMonth() !== month);

        const dayNumber = document.createElement('span');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = String(date.getDate());
        dayCell.appendChild(dayNumber);

        if (date.getMonth() === month) {
            const availability = document.createElement('span');
            availability.className = 'calendar-availability';
            availability.textContent = 'Trống';
            dayCell.appendChild(availability);
        }

        calendarDays.appendChild(dayCell);
    }
}

if (calendarFrom && calendarTo) {
    const today = new Date();
    calendarFrom.value = toLocalDateValue(today);
    calendarTo.value = toLocalDateValue(today);
    displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    [calendarFrom, calendarTo].forEach(input => {
        input.addEventListener('change', () => {
            const selectedDate = new Date(`${input.value}T00:00:00`);
            if (!Number.isNaN(selectedDate.getTime())) {
                displayedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                renderCalendar();
            }
        });
    });
}

document.getElementById('previousMonth')?.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
});

renderCalendar();

renderCalendar();