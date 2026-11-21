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

const displayName = sessionStorage.getItem('azuCarFullName') || sessionStorage.getItem('azuCarDisplayName');

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



window.addEventListener('azu:auth-changed', (e) => {

    const u = e.detail;

    const name = (u?.fullName && u.fullName.trim()) || u?.userName;

    if (name) {

        if (profileName) profileName.textContent = name;

        if (profileAvatar) profileAvatar.textContent = Array.from(name.trim())[0].toLocaleUpperCase('vi');

        if (tripSidebarName) {

            tripSidebarName.textContent = name;

            tripSidebarName.style.display = 'block';

        }

    }

    applyRolePermissions();

});



window.addEventListener('azu:role-changed', () => {

    applyRolePermissions();

});



const statusLabels = {

    pending: 'Chờ duyệt',

    approved: 'Đang hoạt động',

    rejected: 'Bị từ chối',

    inactive: 'Dừng hoạt động'

};



let cachedOwnerCars = [];



async function loadOwnerCars() {

    try {

        const res = await fetch('/api/vehicles/my-cars');

        if (res.ok) {

            const data = await res.json();

            if (data && data.isSuccess && Array.isArray(data.data)) {

                cachedOwnerCars = data.data;

            }

        }

    } catch (e) {

        console.warn('Lỗi khi tải danh sách xe của chủ xe từ API:', e);

    }

    renderOwnerCars();

}



function renderOwnerCars() {

    const apiCars = cachedOwnerCars || [];

    const localCars = window.AzuStore?.getOwnerCars ? window.AzuStore.getOwnerCars() : [];

    // merge cars

    const cars = [...apiCars];

    localCars.forEach(lc => {

        if (!cars.some(c => (c.vehicleId && c.vehicleId === lc.id) || (c.name === lc.name && c.licensePlate === lc.plate))) {

            cars.push({

                vehicleId: lc.id,

                name: lc.name,

                licensePlate: lc.plate || '',

                brand: lc.brand || '',

                model: lc.model || '',

                seats: lc.seats || 5,

                pricePerDay: lc.price || 600000,

                location: lc.location || 'TP. Đà Nẵng',

                status: lc.status || 'pending',

                coverImageUrl: lc.coverImageUrl || '',

                isAvailable: lc.status === 'approved'

            });

        }

    });



    const visibleCars = currentFilter === 'all'

        ? cars

        : cars.filter(car => {

            const st = (car.status || '').toLowerCase();

            const mod = (car.moderationStatus || '').toLowerCase();

            if (currentFilter === 'approved') return st === 'approved' || mod === 'public';

            if (currentFilter === 'pending') return st === 'pendingapproval' || st === 'pending' || mod === 'pendingapproval';

            if (currentFilter === 'rejected') return st === 'rejected';

            if (currentFilter === 'inactive') return st === 'removed' || mod === 'hidden' || st === 'inactive';

            return true;

        });



    if (!vehicleList) return;

    vehicleList.replaceChildren();

    

    // empty state

    if (!cars.length) {

        if (emptyState) emptyState.hidden = false;

        vehicleList.hidden = true;

        return;

    }



    if (emptyState) emptyState.hidden = true;

    vehicleList.hidden = false;



    // no match

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

        card.style.display = 'flex';

        card.style.justifyContent = 'space-between';

        card.style.alignItems = 'center';

        card.style.gap = '16px';

        card.style.padding = '14px 18px';

        card.style.border = '1px solid #e2e8f0';

        card.style.borderRadius = '12px';

        card.style.background = '#fff';

        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';

        card.style.marginBottom = '12px';



        const leftGroup = document.createElement('div');

        leftGroup.style.display = 'flex';

        leftGroup.style.alignItems = 'center';

        leftGroup.style.gap = '14px';



        const thumb = document.createElement('div');

        thumb.className = 'owner-vehicle-thumb';

        thumb.style.width = '84px';

        thumb.style.height = '62px';

        thumb.style.borderRadius = '8px';

        thumb.style.overflow = 'hidden';

        thumb.style.flexShrink = '0';

        thumb.style.display = 'flex';

        thumb.style.alignItems = 'center';

        thumb.style.justifyContent = 'center';

        thumb.style.background = '#f8fafc';



        if (car.coverImageUrl) {

            thumb.innerHTML = `<img src="${car.coverImageUrl}" alt="${car.name}" style="width: 100%; height: 100%; object-fit: cover;">`;

        } else {

            thumb.innerHTML = '<i class="fa-solid fa-car-side" style="font-size: 26px; color: #94a3b8;"></i>';

        }



        const info = document.createElement('div');

        const titleWrap = document.createElement('div');

        titleWrap.style.display = 'flex';

        titleWrap.style.alignItems = 'center';

        titleWrap.style.gap = '8px';

        titleWrap.style.flexWrap = 'wrap';



        const vehId = car.vehicleId || car.id;
        const carPostUrl = vehId
            ? (window.location.pathname.includes('.html') ? `find.html?vehicleId=${vehId}` : `/find?vehicleId=${vehId}`)
            : (window.location.pathname.includes('.html') ? `find.html?keyword=${encodeURIComponent(car.model || car.name || '')}` : `/find?keyword=${encodeURIComponent(car.model || car.name || '')}`);

        const title = document.createElement('h3');
        title.style.margin = '0';
        title.style.fontSize = '15px';
        title.style.fontWeight = '700';

        const titleLink = document.createElement('a');
        titleLink.href = carPostUrl;
        titleLink.target = '_blank';
        titleLink.textContent = car.name;
        titleLink.style.cssText = 'color: #1e293b; text-decoration: none; transition: color 0.2s ease; cursor: pointer;';
        titleLink.addEventListener('mouseenter', () => { titleLink.style.color = '#2563eb'; });
        titleLink.addEventListener('mouseleave', () => { titleLink.style.color = '#1e293b'; });

        title.appendChild(titleLink);
        titleWrap.appendChild(title);



        if (car.licensePlate) {

            const plateBadge = document.createElement('span');

            plateBadge.style.cssText = 'background: #f1f5f9; color: #475569; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #cbd5e1;';

            plateBadge.textContent = car.licensePlate;

            titleWrap.appendChild(plateBadge);

        }



        const specs = document.createElement('p');

        specs.style.margin = '4px 0 2px';

        specs.style.fontSize = '13px';

        specs.style.color = '#64748b';

        const transText = car.transmission || 'Tự động';

        const fuelText = car.fuelType || 'Xăng';

        const seatsText = car.seats ? `${car.seats} chỗ` : '5 chỗ';

        specs.textContent = `${seatsText} • ${transText} • ${fuelText} • ${Number(car.pricePerDay || 0).toLocaleString('vi-VN')} đ/ngày`;



        const loc = document.createElement('p');

        loc.style.margin = '0';

        loc.style.fontSize = '12px';

        loc.style.color = '#94a3b8';

        const locText = (car.district ? car.district + ', ' : '') + (car.city || car.location || 'Toàn quốc');

        loc.innerHTML = `<i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${locText}`;



        info.append(titleWrap, specs, loc);

        leftGroup.append(thumb, info);



        const rightGroup = document.createElement('div');

        rightGroup.style.display = 'flex';

        rightGroup.style.alignItems = 'center';

        rightGroup.style.gap = '10px';

        rightGroup.style.flexWrap = 'wrap';



        const status = document.createElement('span');

        const stLower = (car.status || '').toLowerCase();

        const modLower = (car.moderationStatus || '').toLowerCase();

        let statusText = 'Đang hoạt động';

        let statusBg = '#ecfdf5';

        let statusColor = '#059669';



        if (stLower === 'pendingapproval' || stLower === 'pending' || modLower === 'pendingapproval') {

            statusText = 'Chờ duyệt';

            statusBg = '#fffbeb';

            statusColor = '#d97706';

        } else if (stLower === 'rejected') {

            statusText = 'Bị từ chối';

            statusBg = '#fef2f2';

            statusColor = '#dc2626';

        } else if (stLower === 'removed' || modLower === 'hidden') {

            statusText = 'Tạm ẩn';

            statusBg = '#f1f5f9';

            statusColor = '#64748b';

        }



        status.style.cssText = `background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;`;

        status.innerHTML = `<i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${statusText}`;



        const calBtn = document.createElement('button');
        calBtn.type = 'button';
        calBtn.className = 'small-button';
        calBtn.style.cssText = 'padding: 6px 12px; font-size: 13px; font-weight: 600; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e293b; background: #fff; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;';
        calBtn.innerHTML = '<i class="fa-solid fa-calendar-days" style="color: #ea580c;"></i> Lịch xe';
        calBtn.addEventListener('click', () => {
            switchToCarCalendar(car.vehicleId);
        });

        rightGroup.append(status, calBtn);

        card.append(leftGroup, rightGroup);

        vehicleList.append(card);

    });

}



// filter menu

filterTrigger?.addEventListener('click', (e) => {

    e.stopPropagation();

    const isOpen = filterTrigger.getAttribute('aria-expanded') === 'true';

    filterTrigger.setAttribute('aria-expanded', String(!isOpen));

    if (filterMenu) filterMenu.hidden = isOpen;

});



// close filter outside

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



// switch car tab

document.querySelectorAll('.vehicle-tab:not(.owner-trip-tab)').forEach(tab => {

    tab.addEventListener('click', () => {

        document.querySelectorAll('.vehicle-tab:not(.owner-trip-tab)').forEach(item => {

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

        window.location.href = '/carregistermode';

    });

});



renderOwnerCars();



// sidebar navigation


// owner submenu toggle
const ownerMenuToggle = document.getElementById('nav-become-owner');
const ownerSubmenu = document.getElementById('owner-submenu');

if (ownerMenuToggle && ownerSubmenu) {
    ownerMenuToggle.addEventListener('click', event => {
        event.preventDefault();
        const isExpanded = ownerMenuToggle.getAttribute('aria-expanded') === 'true';
        ownerMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
        ownerSubmenu.hidden = isExpanded;
        ownerSubmenu.style.display = isExpanded ? 'none' : 'flex';
    });
}

const sideLinks = document.querySelectorAll('.side-link');

const contentSections = document.querySelectorAll('.content-section');



function applyRolePermissions() {

    loadOwnerCars();

    const isOwner = window.AzuStore?.isOwner ? window.AzuStore.isOwner() : false;



    // update label

    const navTextEl = document.getElementById('nav-become-owner-text');

    if (navTextEl) {

        navTextEl.textContent = isOwner ? 'Quản lý xe' : 'Trở thành chủ xe';

    }



    const pageHeadingTitle = document.getElementById('page-title');

    if (pageHeadingTitle) {

        pageHeadingTitle.textContent = isOwner ? 'Quản lý cho thuê' : 'Trở thành chủ xe';

    }



    // owner links

    const ownerOnlyLinks = document.querySelectorAll('.side-link.owner-only');

    ownerOnlyLinks.forEach(link => {

        link.style.display = isOwner ? 'flex' : 'none';

    });



    // register button

    const sidebarRegisterBtn = document.getElementById('sidebarRegisterBtn');

    if (sidebarRegisterBtn) {

        sidebarRegisterBtn.style.display = isOwner ? 'none' : 'inline-flex';

    }



    // register banner

    const registerBanner = document.getElementById('renterRegisterBanner');

    if (registerBanner) {

        registerBanner.style.display = isOwner ? 'none' : 'flex';

    }



    // redirect non-owner

    const currentHash = (window.location.hash || '').replace('#', '');

    const ownerSections = ['danh-sach-xe', 'danh-sach-xe-content', 'quan-ly-chuyen', 'quan-ly-chuyen-content', 'lich-xe', 'lich-xe-content', 'doanh-thu', 'doanh-thu-content', 'hop-dong', 'hop-dong-content'];

    if (!isOwner) {

        if (!currentHash || ownerSections.includes(currentHash)) {

            switchSection('cam-nang');

            window.history.replaceState(null, '', '#cam-nang');

        }

    } else {

        if (!currentHash) {

            switchSection('danh-sach-xe-content');

            window.history.replaceState(null, '', '#danh-sach-xe-content');

        }

    }

}



function switchSection(targetId) {

    if (!targetId) return;

    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;



    // check owner role

    const isOwner = window.AzuStore?.isOwner ? window.AzuStore.isOwner() : false;

    const ownerSections = ['danh-sach-xe', 'danh-sach-xe-content', 'quan-ly-chuyen', 'quan-ly-chuyen-content', 'lich-xe', 'lich-xe-content', 'doanh-thu', 'doanh-thu-content', 'hop-dong', 'hop-dong-content'];

    if (!isOwner && ownerSections.includes(cleanId)) {

        targetId = 'cam-nang';

    }



    // route aliases

    let resolvedId = cleanId;

    if (cleanId === 'cam-nang') resolvedId = 'cam-nang-content';

    if (cleanId === 'lich-xe' || cleanId === 'lich-xe-content') {
        resolvedId = 'lich-xe-content';
        if (isOwner) populateCalendarVehicleSelect();
    }

    if (cleanId === 'danh-sach-xe') {

        resolvedId = 'danh-sach-xe-content';

        loadOwnerCars();

    }

    if (cleanId === 'quan-ly-chuyen' || cleanId === 'quan-ly-chuyen-content') {

        resolvedId = 'quan-ly-chuyen-content';

        if (isOwner) loadOwnerTrips();

    }

    if (cleanId === 'hop-dong') resolvedId = 'hop-dong-content';

    if (cleanId === 'bao-mat') resolvedId = 'bao-mat-content';

    if (cleanId === 'doanh-thu') {

        resolvedId = 'doanh-thu-content';

        if (isOwner) loadOwnerRevenue();

    }

    if (!isOwner && ownerSections.includes(cleanId)) {

        resolvedId = 'cam-nang-content';

    }



    let sectionEl = document.getElementById(resolvedId);

    if (!sectionEl && !resolvedId.endsWith('-content')) {

        sectionEl = document.getElementById(`${resolvedId}-content`);

    }



    if (!sectionEl) return;



    // active sidebar

    sideLinks.forEach(link => {

        const href = (link.getAttribute('href') || '').replace('#', '');

        const isMatch = href === cleanId || 

                        href === resolvedId || 

                        `${href}-content` === resolvedId ||

                        href === resolvedId.replace('-content', '');

        link.classList.toggle('active', isMatch);

    });



    // show section

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



// back buttons

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



// guide modal

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







// doc templates

const DOC_TEMPLATES = {

    rentalContract: {

        title: 'HỢP ĐỒNG CHO THUÊ XE TỰ LÁI',

        subtitle: 'Mẫu số 01/HĐ-AZU • Xác thực điện tử VNeID Mức 2',

        badge: 'Hợp đồng cho thuê',

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



// contract buttons

document.getElementById('openRentalContractBtn')?.addEventListener('click', () => openDocPreview('rentalContract'));

document.getElementById('openHandoverContractBtn')?.addEventListener('click', () => openDocPreview('handoverContract'));



// privacy links

document.getElementById('openDataCollectionPolicyBtn')?.addEventListener('click', () => openDocPreview('policyDataCollection'));

document.getElementById('openContractSecurityPolicyBtn')?.addEventListener('click', () => openDocPreview('policyContractSecurity'));

document.getElementById('openDataRightsPolicyBtn')?.addEventListener('click', () => openDocPreview('policyDataRights'));



// close modal

document.getElementById('closeDocModalBtn')?.addEventListener('click', () => {

    const modal = document.getElementById('docPreviewModal');

    if (modal) modal.hidden = true;

});



// init tab

if (window.location.hash) {

    switchSection(window.location.hash);

} else {

    const activeLink = document.querySelector('.side-link.active');

    if (activeLink) {

        switchSection(activeLink.getAttribute('href'));

    }

}



// calendar & vehicle schedule
const calendarDays = document.getElementById('calendarDays');
const calendarMonthLabel = document.getElementById('calendarMonthLabel');
let displayedMonth = new Date();
let currentCalendarVehicleId = null;
let currentVehicleDetail = null;

function toLocalDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function populateCalendarVehicleSelect(selectedVehicleId) {
    const sel = document.getElementById('calendarVehicleSelect');
    if (!sel) return;

    if (!cachedOwnerCars || cachedOwnerCars.length === 0) {
        await loadOwnerCars();
    }

    sel.replaceChildren();
    if (!cachedOwnerCars || cachedOwnerCars.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Bạn chưa có xe nào để quản lý lịch';
        sel.appendChild(opt);
        return;
    }

    cachedOwnerCars.forEach(car => {
        const opt = document.createElement('option');
        opt.value = car.vehicleId;
        opt.textContent = `${car.licensePlate || 'Chưa biển'} - ${car.name}`;
        if (selectedVehicleId && String(selectedVehicleId) === String(car.vehicleId)) {
            opt.selected = true;
        }
        sel.appendChild(opt);
    });

    const targetId = selectedVehicleId || sel.value || cachedOwnerCars[0].vehicleId;
    sel.value = targetId;
    await loadVehicleSchedule(targetId);
}

async function loadVehicleSchedule(vehicleId) {
    if (!vehicleId) return;
    currentCalendarVehicleId = vehicleId;

    const car = (cachedOwnerCars || []).find(c => String(c.vehicleId) === String(vehicleId));
    if (car) {
        const thumb = document.getElementById('calVehicleThumb');
        const nameEl = document.getElementById('calVehicleName');
        const plateEl = document.getElementById('calVehiclePlate');
        const priceEl = document.getElementById('calVehiclePrice');
        const statusEl = document.getElementById('calVehicleStatus');

        if (thumb) thumb.src = car.coverImageUrl || '/images/logo_transparent.png';
        if (nameEl) nameEl.textContent = car.name;
        if (plateEl) plateEl.textContent = car.licensePlate || 'Chưa có biển';
        if (priceEl) priceEl.textContent = Number(car.pricePerDay || 0).toLocaleString('vi-VN') + ' đ/ngày';
        if (statusEl) {
            statusEl.textContent = car.moderationStatus === 'Public' ? 'Đang hoạt động' : (car.status || 'Chờ duyệt');
            statusEl.style.color = car.moderationStatus === 'Public' ? '#16a34a' : '#ea580c';
        }
    }

    try {
        const resp = await fetch(`/api/vehicles/${vehicleId}`);
        if (!resp.ok) return;
        const resData = await resp.json();
        const detail = resData?.data || resData;
        currentVehicleDetail = detail;

        renderCalendar();
        renderBlockedRangesList(detail.blockedRanges || []);
    } catch(e) {
        console.warn('Lỗi khi tải lịch xe:', e);
    }
}

function renderBlockedRangesList(blockedRanges) {
    const listEl = document.getElementById('blockedRangesList');
    const countEl = document.getElementById('blockedRangesCount');
    if (!listEl) return;

    if (countEl) countEl.textContent = String(blockedRanges.length);
    listEl.replaceChildren();

    if (blockedRanges.length === 0) {
        listEl.innerHTML = '<p style="font-size: 12.5px; color: #94a3b8; margin: 0;">Chưa có khoảng lịch bận nào.</p>';
        return;
    }

    blockedRanges.forEach(b => {
        const startStr = new Date(b.startDate).toLocaleDateString('vi-VN');
        const endStr = new Date(b.endDate).toLocaleDateString('vi-VN');
        const item = document.createElement('div');
        item.style.cssText = 'background: #fff; border: 1px solid #fee2e2; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;';

        const textDiv = document.createElement('div');
        textDiv.innerHTML = `
            <div style="font-weight: 700; font-size: 13px; color: #991b1b;"><i class="fa-solid fa-lock" style="font-size: 11px;"></i> ${startStr} - ${endStr}</div>
            <div style="font-size: 12px; color: #64748b;">${b.reason || 'Chủ xe bận'}</div>
        `;

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.style.cssText = 'background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;';
        delBtn.textContent = 'Mở khóa';
        delBtn.title = 'Gỡ bỏ lịch bận này';
        delBtn.addEventListener('click', async () => {
            if (!b.id) {
                alert('Không tìm thấy mã lịch bận.');
                return;
            }
            if (!confirm(`Bạn có chắc muốn mở khóa khoảng lịch ${startStr} - ${endStr}?`)) return;
            try {
                delBtn.disabled = true;
                const delResp = await fetch(`/api/vehicles/unavailabilities/${b.id}`, { method: 'DELETE' });
                const delResData = await delResp.json();
                if (delResp.ok && delResData.isSuccess) {
                    alert('Đã mở khóa lịch thành công!');
                    await loadVehicleSchedule(currentCalendarVehicleId);
                } else {
                    alert('Lỗi: ' + (delResData?.message || 'Không thể mở khóa lịch.'));
                }
            } catch(e) {
                alert('Lỗi kết nối máy chủ.');
            } finally {
                delBtn.disabled = false;
            }
        });

        item.append(textDiv, delBtn);
        listEl.appendChild(item);
    });
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

    const blocked = currentVehicleDetail?.blockedRanges || [];
    const booked = currentVehicleDetail?.bookedRanges || [];
    const todayMid = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();

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
            const dateMid = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            const isPast = dateMid < todayMid;

            const matchedBooked = booked.find(b => {
                const bS = new Date(b.startDate);
                const bE = new Date(b.endDate);
                const sMid = new Date(bS.getFullYear(), bS.getMonth(), bS.getDate()).getTime();
                const eMid = new Date(bE.getFullYear(), bE.getMonth(), bE.getDate()).getTime();
                return dateMid >= sMid && dateMid <= eMid;
            });

            const matchedBlocked = blocked.find(b => {
                const bS = new Date(b.startDate);
                const bE = new Date(b.endDate);
                const sMid = new Date(bS.getFullYear(), bS.getMonth(), bS.getDate()).getTime();
                const eMid = new Date(bE.getFullYear(), bE.getMonth(), bE.getDate()).getTime();
                return dateMid >= sMid && dateMid <= eMid;
            });

            const availability = document.createElement('span');
            availability.className = 'calendar-availability';

            if (isPast) {
                dayCell.style.background = '#f8fafc';
                dayCell.style.color = '#94a3b8';
                availability.textContent = 'Đã qua';
                availability.style.background = '#f1f5f9';
                availability.style.color = '#94a3b8';
            } else if (matchedBooked) {
                dayCell.style.background = '#dbeafe';
                dayCell.style.color = '#1e40af';
                dayCell.style.border = '1px solid #93c5fd';
                availability.textContent = 'Có chuyến';
                availability.style.background = '#bfdbfe';
                availability.style.color = '#1e3a8a';
                dayCell.title = 'Đã có khách thuê đặt chuyến';
            } else if (matchedBlocked) {
                dayCell.style.background = '#fee2e2';
                dayCell.style.color = '#991b1b';
                dayCell.style.border = '1px solid #fca5a5';
                availability.innerHTML = '<i class="fa-solid fa-lock" style="font-size: 8px;"></i> Đã khóa';
                availability.style.background = '#fecaca';
                availability.style.color = '#7f1d1d';
                dayCell.title = `Chủ xe tự khóa: ${matchedBlocked.reason || 'Bận'}`;
            } else {
                dayCell.style.background = '#ffffff';
                dayCell.style.color = '#16a34a';
                dayCell.style.cursor = 'pointer';
                availability.textContent = 'Trống';
                availability.style.background = '#dcfce7';
                availability.style.color = '#15803d';

                dayCell.addEventListener('click', () => {
                    const dateStr = toLocalDateValue(date);
                    const startInp = document.getElementById('blockStartDate');
                    const endInp = document.getElementById('blockEndDate');
                    if (startInp) startInp.value = dateStr;
                    if (endInp) endInp.value = dateStr;
                    dayCell.style.outline = '2px solid #ea580c';
                    setTimeout(() => { dayCell.style.outline = 'none'; }, 1000);
                });
            }

            dayCell.appendChild(availability);
        }

        calendarDays.appendChild(dayCell);
    }
}

function switchToCarCalendar(vehicleId) {
    switchSection('lich-xe');
    window.history.pushState(null, '', '#lich-xe');
    populateCalendarVehicleSelect(vehicleId);
}

document.getElementById('previousMonth')?.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
});

document.getElementById('calendarVehicleSelect')?.addEventListener('change', (e) => {
    loadVehicleSchedule(e.target.value);
});

document.getElementById('quickReasonSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const input = document.getElementById('blockReasonInput');
    if (input) {
        if (val === 'custom') {
            input.value = '';
            input.focus();
        } else {
            input.value = val;
        }
    }
});

document.getElementById('btnSubmitBlockSchedule')?.addEventListener('click', async () => {
    const vehicleId = document.getElementById('calendarVehicleSelect')?.value;
    const startDate = document.getElementById('blockStartDate')?.value;
    const endDate = document.getElementById('blockEndDate')?.value;
    const reason = document.getElementById('blockReasonInput')?.value.trim();

    if (!vehicleId) {
        alert('Vui lòng chọn xe để khóa lịch.');
        return;
    }
    if (!startDate || !endDate) {
        alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
        return;
    }
    if (new Date(endDate) < new Date(startDate)) {
        alert('Ngày kết thúc không được trước ngày bắt đầu.');
        return;
    }

    const btn = document.getElementById('btnSubmitBlockSchedule');
    btn.disabled = true;
    try {
        const resp = await fetch(`/api/vehicles/${vehicleId}/unavailabilities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startDate: startDate + 'T00:00:00',
                endDate: endDate + 'T23:59:59',
                reason: reason || 'Chủ xe bận'
            })
        });
        const resData = await resp.json();
        if (resp.ok && resData.isSuccess) {
            alert('Đã khóa lịch xe thành công!');
            await loadVehicleSchedule(vehicleId);
        } else {
            alert('Lỗi: ' + (resData?.message || 'Không thể khóa lịch. Vui lòng kiểm tra lại.'));
        }
    } catch(e) {
        alert('Lỗi kết nối máy chủ.');
    } finally {
        btn.disabled = false;
    }
});



let cachedOwnerBookings = [];

let currentOwnerTripStatus = 'all';

function getOwnerTripStatusBadge(status) {
    switch (status) {
        case 'Pending':
            return { text: 'Chờ duyệt', bg: '#fef3c7', color: '#b45309' };
        case 'Accepted':
            return { text: 'Đã duyệt (Chờ giao xe)', bg: '#dcfce7', color: '#15803d' };
        case 'Ongoing':
            return { text: 'Đang trong chuyến', bg: '#dbeafe', color: '#1d4ed8' };
        case 'Completed':
            return { text: 'Hoàn tất', bg: '#f1f5f9', color: '#475569' };
        case 'Cancelled':
            return { text: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' };
        case 'Rejected':
            return { text: 'Đã từ chối', bg: '#fee2e2', color: '#b91c1c' };
        case 'Expired':
            return { text: 'Hết hạn', bg: '#f3f4f6', color: '#6b7280' };
        default:
            return { text: status, bg: '#f1f5f9', color: '#475569' };
    }
}

async function loadOwnerTrips(status = currentOwnerTripStatus) {
    currentOwnerTripStatus = status;
    const listEl = document.getElementById('owner-trips-list');
    const emptyEl = document.getElementById('owner-trips-empty');
    if (!listEl) return;

    listEl.innerHTML = '<div style="text-align: center; padding: 32px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Đang tải danh sách chuyến đi...</div>';
    listEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    try {
        const url = status && status !== 'all' 
            ? `/api/bookings/owner-requests?status=${encodeURIComponent(status)}`
            : `/api/bookings/owner-requests`;
        const resp = await fetch(url);
        if (!resp.ok) {
            listEl.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 24px;">Vui lòng đăng nhập với tài khoản chủ xe để xem các chuyến đi.</div>';
            return;
        }

        const resData = await resp.json();
        const items = resData?.data || [];
        cachedOwnerBookings = items;
        renderCalendar();
        renderOwnerTrips(items);
    } catch (e) {
        console.warn('Lỗi khi tải chuyến của chủ xe:', e);
        listEl.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 24px;">Lỗi kết nối máy chủ khi tải danh sách chuyến đi.</div>';
    }
}

function formatVnTripDate(val, includeTime = false) {
    if (!val) return '—';
    let s = String(val);
    if (s.includes('T') && !s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
        s += 'Z';
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        ...(includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' })
    });
}

function renderOwnerTrips(items) {
    const listEl = document.getElementById('owner-trips-list');
    const emptyEl = document.getElementById('owner-trips-empty');
    if (!listEl) return;

    listEl.replaceChildren();

    if (!items || items.length === 0) {
        listEl.hidden = true;
        if (emptyEl) emptyEl.hidden = false;
        return;
    }

    listEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    items.forEach(req => {
        const card = document.createElement('article');
        card.className = 'owner-trip-card';
        card.style.cssText = 'display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; transition: box-shadow 0.2s ease;';
        card.addEventListener('mouseenter', () => { card.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)'; });
        card.addEventListener('mouseleave', () => { card.style.boxShadow = 'none'; });

        const thumb = document.createElement('div');
        thumb.style.cssText = 'width: 100%; height: 130px; border-radius: 8px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center;';
        if (req.coverImageUrl) {
            thumb.innerHTML = `<img src="${req.coverImageUrl}" alt="${req.vehicleName}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            thumb.innerHTML = '<i class="fa-solid fa-car-side" style="font-size: 28px; color: #94a3b8;"></i>';
        }

        const info = document.createElement('div');
        info.style.cssText = 'display: flex; flex-direction: column; justify-content: space-between; gap: 8px;';

        const topRow = document.createElement('div');
        topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;';

        const titleWrap = document.createElement('div');
        titleWrap.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';

        const title = document.createElement('h3');
        title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 700;';

        const titleLink = document.createElement('a');
        titleLink.href = `/account?bookingId=${req.bookingId}#trips`;
        titleLink.textContent = `#${req.bookingId} - ${req.vehicleName}`;
        titleLink.title = 'Xem chi tiết đơn thuê xe';
        titleLink.style.cssText = 'color: #1e293b; text-decoration: none; transition: color 0.2s ease; cursor: pointer;';
        titleLink.addEventListener('mouseenter', () => { titleLink.style.color = '#2563eb'; });
        titleLink.addEventListener('mouseleave', () => { titleLink.style.color = '#1e293b'; });

        title.appendChild(titleLink);
        titleWrap.appendChild(title);

        if (req.licensePlate) {
            const plateBadge = document.createElement('span');
            plateBadge.style.cssText = 'background: #f1f5f9; color: #475569; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #cbd5e1;';
            plateBadge.textContent = req.licensePlate;
            titleWrap.appendChild(plateBadge);
        }

        const badge = getOwnerTripStatusBadge(req.status);
        const statusSpan = document.createElement('span');
        statusSpan.style.cssText = `background: ${badge.bg}; color: ${badge.color}; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap;`;
        statusSpan.textContent = badge.text;

        topRow.append(titleWrap, statusSpan);

        const details = document.createElement('div');
        details.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px 24px; font-size: 13.5px; color: #475569; margin: 4px 0;';

        const startStr = formatVnTripDate(req.startDate);
        const endStr = formatVnTripDate(req.endDate);

        let renterReturnAlert = '';
        if (req.status === 'Ongoing' && req.hasRenterReturnConfirmed) {
            renterReturnAlert = `<div style="grid-column: 1 / -1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 12px; font-size: 12.5px; color: #1e40af; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-bell" style="color: #2563eb; font-size: 14px;"></i>
                <span><strong>Khách thuê đã gửi bàn giao trả xe.</strong> Vui lòng kiểm tra xe thực tế (ODO, nhiên liệu, thân vỏ, phạt nguội). Nếu có sự cố, hãy bấm <strong>"Khiếu nại sự cố"</strong> để phong tỏa cọc. Nếu xe ổn thỏa, bấm <strong>"Nghiệm thu & Hoàn tất chuyến"</strong>.</span>
            </div>`;
        }

        details.innerHTML = `
            ${renterReturnAlert}
            <div>
                <p style="margin: 0 0 6px;"><i class="fa-regular fa-user" style="color: #64748b; width: 16px;"></i> Khách thuê: <strong>${req.renterName}</strong></p>
                <p style="margin: 0;"><i class="fa-solid fa-location-dot" style="color: #64748b; width: 16px;"></i> Khu vực: ${req.district ? req.district + ', ' : ''}${req.city || 'TP. Đà Nẵng'}</p>
            </div>
            <div>
                <p style="margin: 0 0 6px;"><i class="fa-regular fa-calendar-days" style="color: #64748b; width: 16px;"></i> Thời gian: <strong>${startStr} - ${endStr}</strong> (${req.rentalDays} ngày)</p>
                <p style="margin: 0;"><i class="fa-solid fa-receipt" style="color: #16a34a; width: 16px;"></i> Tổng tiền: <strong style="color: #1e293b; font-size: 14.5px;">${Number(req.priceLockedTotal || 0).toLocaleString('vi-VN')} đ</strong></p>
            </div>
        `;

        const actionsRow = document.createElement('div');
        actionsRow.style.cssText = 'display: flex; gap: 10px; align-items: center; flex-wrap: nowrap; padding-top: 10px; border-top: 1px dashed #e2e8f0;';

        if (req.status === 'Pending') {
            const acceptBtn = document.createElement('button');
            acceptBtn.type = 'button';
            acceptBtn.style.cssText = 'background: #16a34a; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            acceptBtn.innerHTML = '<i class="fa-solid fa-check"></i> Chấp nhận';
            acceptBtn.addEventListener('click', async () => {
                if (!confirm(`Bạn có chắc muốn chấp nhận đơn thuê #${req.bookingId} (${req.vehicleName}) của ${req.renterName}?`)) return;
                acceptBtn.disabled = true;
                try {
                    const r = await fetch(`/api/bookings/${req.bookingId}/respond`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accept: true })
                    });
                    const d = await r.json();
                    if (r.ok && d.isSuccess) {
                        alert('Đã chấp nhận đơn thuê thành công!');
                        loadOwnerTrips();
                        loadOwnerRevenue();
                    } else {
                        alert('Lỗi: ' + (d?.message || 'Không thể chấp nhận đơn'));
                    }
                } catch(e) {
                    alert('Lỗi kết nối máy chủ.');
                } finally {
                    acceptBtn.disabled = false;
                }
            });

            const rejectBtn = document.createElement('button');
            rejectBtn.type = 'button';
            rejectBtn.style.cssText = 'background: #fff; color: #dc2626; border: 1px solid #dc2626; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            rejectBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Từ chối';
            rejectBtn.addEventListener('click', async () => {
                const reason = prompt('Nhập lý do từ chối đơn thuê:');
                if (reason === null) return;
                rejectBtn.disabled = true;
                try {
                    const r = await fetch(`/api/bookings/${req.bookingId}/respond`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accept: false, reason: reason || 'Chủ xe bận lịch' })
                    });
                    const d = await r.json();
                    if (r.ok && d.isSuccess) {
                        alert('Đã từ chối đơn thuê. Tiền cọc giữ chỗ đã được giải phóng cho khách.');
                        loadOwnerTrips();
                        loadOwnerRevenue();
                    } else {
                        alert('Lỗi: ' + (d?.message || 'Không thể từ chối đơn'));
                    }
                } catch(e) {
                    alert('Lỗi kết nối máy chủ.');
                } finally {
                    rejectBtn.disabled = false;
                }
            });

            actionsRow.append(acceptBtn, rejectBtn);
        } else if (req.status === 'Accepted') {
            const handoverBtn = document.createElement('button');
            handoverBtn.type = 'button';
            handoverBtn.style.cssText = 'background: #16a34a; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            handoverBtn.innerHTML = '<i class="fa-solid fa-car-side"></i> Bàn giao xe cho khách';
            handoverBtn.addEventListener('click', () => {
                if (window.AzuTripModal?.openHandoverModal) {
                    window.AzuTripModal.openHandoverModal({
                        type: 'Pickup',
                        trip: req,
                        isOwner: true,
                        onSuccess: () => {
                            loadOwnerTrips();
                            loadOwnerRevenue();
                        }
                    });
                } else {
                    alert('Đang tải mô-đun bàn giao xe, vui lòng thử lại.');
                }
            });
            actionsRow.appendChild(handoverBtn);
        } else if (req.status === 'Ongoing') {
            const completeBtn = document.createElement('button');
            completeBtn.type = 'button';
            completeBtn.style.cssText = 'background: #2563eb; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            completeBtn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Nghiệm thu xe &amp; Quyết toán hoàn tất';
            completeBtn.addEventListener('click', () => {
                if (window.AzuTripModal?.openHandoverModal) {
                    window.AzuTripModal.openHandoverModal({
                        type: 'Return',
                        trip: req,
                        isOwner: true,
                        onSuccess: () => {
                            loadOwnerTrips();
                            loadOwnerRevenue();
                        }
                    });
                } else {
                    alert('Đang tải mô-đun nghiệm thu trả xe, vui lòng thử lại.');
                }
            });
            actionsRow.appendChild(completeBtn);

            if (req.hasDispute) {
                const dispBadge = document.createElement('span');
                dispBadge.style.cssText = 'font-size: 13px; color: #dc2626; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;';
                dispBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Đang khiếu nại (Chờ xử lý)';
                actionsRow.appendChild(dispBadge);
            } else {
                const disputeBtn = document.createElement('button');
                disputeBtn.type = 'button';
                disputeBtn.style.cssText = 'background: #fff; color: #dc2626; border: 1px solid #fca5a5; padding: 7px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
                disputeBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Khiếu nại sự cố';
                disputeBtn.addEventListener('click', () => {
                    if (window.AzuDisputeModal) {
                        window.AzuDisputeModal.open({
                            bookingId: req.bookingId,
                            vehicleName: req.vehicleName,
                            otherPartyName: req.renterName,
                            isOwner: true,
                            depositAmount: req.depositAmount || 0,
                            onSuccess: () => loadOwnerTrips()
                        });
                    } else {
                        alert('Đang tải mô-đun khiếu nại, vui lòng thử lại.');
                    }
                });
                actionsRow.appendChild(disputeBtn);
            }
        } else if (req.status === 'Completed') {
            if (!req.hasReviewed) {
                const reviewBtn = document.createElement('button');
                reviewBtn.type = 'button';
                reviewBtn.style.cssText = 'background: #f59e0b; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
                reviewBtn.innerHTML = '<i class="fa-solid fa-star"></i> Đánh giá khách thuê';
                reviewBtn.addEventListener('click', () => {
                    openOwnerReviewModal(req);
                });
                actionsRow.appendChild(reviewBtn);
            } else {
                const reviewedBadge = document.createElement('span');
                reviewedBadge.style.cssText = 'font-size: 12.5px; color: #16a34a; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;';
                reviewedBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã gửi đánh giá';
                actionsRow.appendChild(reviewedBadge);
            }

            if (!req.hasDispute) {
                const disputeAfterBtn = document.createElement('button');
                disputeAfterBtn.type = 'button';
                disputeAfterBtn.style.cssText = 'background: #fff; color: #dc2626; border: 1px solid #fca5a5; padding: 7px 14px; border-radius: 8px; font-weight: 600; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
                disputeAfterBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Khiếu nại sau chuyến (Phạt nguội/Sự cố)';
                disputeAfterBtn.addEventListener('click', () => {
                    if (window.AzuDisputeModal) {
                        window.AzuDisputeModal.open({
                            bookingId: req.bookingId,
                            vehicleName: req.vehicleName,
                            otherPartyName: req.renterName,
                            isOwner: true,
                            depositAmount: req.depositAmount || 0,
                            onSuccess: () => loadOwnerTrips()
                        });
                    } else {
                        alert('Đang tải mô-đun khiếu nại, vui lòng thử lại.');
                    }
                });
                actionsRow.appendChild(disputeAfterBtn);
            }
        }

        const detailLink = document.createElement('a');
        detailLink.href = `/account?bookingId=${req.bookingId}#trips`;
        detailLink.className = 'trip-detail-open';
        detailLink.style.cssText = 'color: #8f6b24; text-decoration: underline; text-underline-offset: 3px; font-size: 13px; font-weight: 600; margin-left: auto; cursor: pointer; background: transparent; border: 0;';
        detailLink.textContent = 'Xem chi tiết';
        detailLink.addEventListener('mouseenter', () => { detailLink.style.color = '#6f5018'; });
        detailLink.addEventListener('mouseleave', () => { detailLink.style.color = '#8f6b24'; });
        actionsRow.appendChild(detailLink);

        info.append(topRow, details, actionsRow);
        card.append(thumb, info);
        listEl.appendChild(card);
    });
}

async function loadOwnerBookingRequests() {
    await loadOwnerTrips();
}

document.querySelectorAll('.owner-trip-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.owner-trip-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        loadOwnerTrips(tab.dataset.tripStatus || 'all');
    });
});



async function loadOwnerRevenue() {

    const grossEl = document.getElementById('revenueGross');

    const commEl = document.getElementById('revenueCommission');

    const netEl = document.getElementById('revenueNet');

    const countEl = document.getElementById('revenueCompletedTrips');

    const tableEl = document.getElementById('revenueTripsTable');

    const bodyEl = document.getElementById('revenueTripsBody');

    const emptyMsgEl = document.getElementById('revenueEmptyMsg');



    if (!grossEl) return;



    try {

        const resp = await fetch('/api/bookings/owner-revenue');

        if (!resp.ok) return;



        const resData = await resp.json();

        if (!resData || !resData.isSuccess || !resData.data) return;



        const data = resData.data;
        const gross = data.grossRentalRevenue ?? data.grossRevenue ?? 0;
        const comm = data.totalCommissionPaid ?? data.platformCommission ?? 0;
        const net = data.netEarnings ?? 0;
        const count = data.totalCompletedTrips ?? data.completedTripsCount ?? 0;

        grossEl.textContent = Number(gross).toLocaleString('vi-VN') + ' đ';
        commEl.textContent = Number(comm).toLocaleString('vi-VN') + ' đ';
        netEl.textContent = Number(net).toLocaleString('vi-VN') + ' đ';
        countEl.textContent = String(count);

        if (Array.isArray(data.trips) && data.trips.length > 0) {
            if (emptyMsgEl) emptyMsgEl.style.display = 'none';
            if (tableEl) tableEl.style.display = 'table';
            if (bodyEl) {
                bodyEl.replaceChildren();
                data.trips.forEach(t => {
                    const tr = document.createElement('tr');
                    tr.style.cssText = 'border-bottom: 1px solid #f1f5f9; transition: background 0.15s;';
                    tr.addEventListener('mouseenter', () => tr.style.background = '#f8fafc');
                    tr.addEventListener('mouseleave', () => tr.style.background = 'transparent');
                    const startStr = new Date(t.startDate).toLocaleDateString('vi-VN');
                    const endStr = new Date(t.endDate).toLocaleDateString('vi-VN');
                    const total = t.totalAmount ?? t.priceLockedTotal ?? 0;
                    const commAmount = t.commissionAmount ?? 0;
                    const netEarning = t.netEarning ?? t.netEarnings ?? 0;

                    tr.innerHTML = `
                        <td style="padding: 10px 12px; font-weight: 600;"><a href="/booking/${t.bookingId}" class="booking-link" style="color: #2563eb; text-decoration: none; font-weight: 700;">#${t.bookingId}</a></td>
                        <td style="padding: 10px 12px; color: #334155;"><a href="/booking/${t.bookingId}" class="booking-link" style="color: #1e293b; text-decoration: none; font-weight: 600;">${t.vehicleName}</a></td>
                        <td style="padding: 10px 12px; color: #334155;">${t.renterName}</td>
                        <td style="padding: 10px 12px; color: #64748b;">${startStr} - ${endStr} (${t.rentalDays} ngày)</td>
                        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">${Number(total).toLocaleString('vi-VN')} đ</td>
                        <td style="padding: 10px 12px; text-align: right; color: #dc2626;">-${Number(commAmount).toLocaleString('vi-VN')} đ</td>
                        <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #16a34a;">+${Number(netEarning).toLocaleString('vi-VN')} đ</td>
                    `;
                    bodyEl.appendChild(tr);
                });
            }
        } else {

            if (emptyMsgEl) emptyMsgEl.style.display = 'block';

            if (tableEl) tableEl.style.display = 'none';

        }

    } catch (e) {

        console.warn('Lỗi khi tải dữ liệu doanh thu của chủ xe:', e);

    }

}



// owner review modal
let ownerReviewModal = null;
let activeOwnerReviewReq = null;

function ensureOwnerReviewModal() {
    if (ownerReviewModal) return ownerReviewModal;

    ownerReviewModal = document.createElement('div');
    ownerReviewModal.className = 'review-modal-backdrop';
    ownerReviewModal.hidden = true;
    ownerReviewModal.innerHTML = `
        <form class="review-modal" aria-labelledby="owner-review-modal-title">
            <button class="review-modal-close" type="button" aria-label="Đóng popup đánh giá"><i class="fa-solid fa-xmark"></i></button>
            <h2 id="owner-review-modal-title">Đánh giá khách thuê</h2>
            <p class="review-modal-vehicle" id="owner-review-subtitle"></p>
            <label class="review-rating-label">Mức độ hài lòng của bạn về khách thuê:</label>
            <div class="review-stars" role="group" aria-label="Chọn số sao đánh giá">
                ${[1, 2, 3, 4, 5].map(rating => `<button type="button" class="review-star" data-rating="${rating}" aria-label="${rating} sao" aria-pressed="false"><i class="fa-solid fa-star"></i></button>`).join('')}
            </div>
            <p class="review-rating-hint" aria-live="polite">Chọn số sao</p>
            <label class="review-comment-label" for="owner-review-comment">Nhận xét về khách thuê <span>(không bắt buộc)</span></label>
            <textarea id="owner-review-comment" maxlength="1000" rows="3" placeholder="Ví dụ: Khách trả xe đúng giờ, bảo quản xe cẩn thận..."></textarea>
            <p class="review-error" role="alert" hidden></p>
            <button class="review-submit" type="submit" disabled>Gửi đánh giá</button>
        </form>`;
    document.body.appendChild(ownerReviewModal);

    const form = ownerReviewModal.querySelector('form');
    const stars = Array.from(ownerReviewModal.querySelectorAll('.review-star'));
    const ratingHint = ownerReviewModal.querySelector('.review-rating-hint');
    const submitBtn = ownerReviewModal.querySelector('.review-submit');
    const errEl = ownerReviewModal.querySelector('.review-error');
    const ratingLabels = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];
    let selectedRating = 0;

    const setRating = (r) => {
        selectedRating = r;
        stars.forEach(star => {
            const isSel = Number(star.dataset.rating) <= r;
            star.classList.toggle('is-selected', isSel);
            star.setAttribute('aria-pressed', String(Number(star.dataset.rating) === r));
        });
        ratingHint.textContent = ratingLabels[r] || 'Chọn số sao';
        submitBtn.disabled = r === 0;
        errEl.hidden = true;
    };

    stars.forEach(star => star.addEventListener('click', () => setRating(Number(star.dataset.rating))));
    ownerReviewModal.querySelector('.review-modal-close').addEventListener('click', () => {
        ownerReviewModal.hidden = true;
        activeOwnerReviewReq = null;
    });
    ownerReviewModal.addEventListener('click', (e) => {
        if (e.target === ownerReviewModal) {
            ownerReviewModal.hidden = true;
            activeOwnerReviewReq = null;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!activeOwnerReviewReq || selectedRating < 1) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
        errEl.hidden = true;

        try {
            const res = await fetch(`/api/bookings/${activeOwnerReviewReq.bookingId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: selectedRating,
                    comment: ownerReviewModal.querySelector('#owner-review-comment').value.trim() || 'Khách thuê rất tốt!'
                })
            });
            const data = await res.json();
            if (!res.ok || !data.isSuccess) {
                throw new Error(data?.message || 'Không thể gửi đánh giá.');
            }

            ownerReviewModal.hidden = true;
            activeOwnerReviewReq = null;
            alert(data?.message || 'Đã gửi đánh giá khách thuê thành công!');
            loadOwnerBookingRequests();
        } catch (err) {
            errEl.textContent = err.message || 'Lỗi gửi đánh giá.';
            errEl.hidden = false;
            submitBtn.disabled = false;
        } finally {
            submitBtn.textContent = 'Gửi đánh giá';
        }
    });

    ownerReviewModal.reset = () => {
        setRating(0);
        ownerReviewModal.querySelector('#owner-review-comment').value = '';
        errEl.hidden = true;
    };

    return ownerReviewModal;
}

function openOwnerReviewModal(req) {
    const modal = ensureOwnerReviewModal();
    activeOwnerReviewReq = req;
    modal.reset();
    const subTitle = modal.querySelector('#owner-review-subtitle');
    if (subTitle) {
        subTitle.textContent = `Khách thuê: ${req.renterName || 'Khách thuê'} · Xe: ${req.vehicleName || 'Xe của bạn'}`;
    }
    modal.hidden = false;
}

applyRolePermissions();

if (window.AzuStore?.isOwner && window.AzuStore.isOwner()) {
    populateCalendarVehicleSelect();
    loadOwnerTrips();
    loadOwnerRevenue();
}

// Logout Modal
const logoutBtn = document.getElementById('trip-logout');
const logoutModal = document.getElementById('logout-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (logoutModal) logoutModal.hidden = false;
});

closeModalBtn?.addEventListener('click', () => {
    if (logoutModal) logoutModal.hidden = true;
});

logoutModal?.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
        logoutModal.hidden = true;
    }
});

if (confirmLogoutBtn && !confirmLogoutBtn.dataset.bound) {
    confirmLogoutBtn.dataset.bound = 'true';
    confirmLogoutBtn.addEventListener('click', async () => {
        if (window.AzuStore?.logout) {
            await window.AzuStore.logout();
        } else {
            sessionStorage.clear();
            window.location.href = '/';
        }
    });
}

