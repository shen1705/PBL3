// admin users
(function () {
    let currentUser = null;
    let selectedUserId = null;
    let selectedUserData = null;
    let currentPage = 1;
    let currentTab = 'all';
    let currentRole = 'all';
    let searchQuery = '';
    let debounceTimer = null;

    document.addEventListener('DOMContentLoaded', () => {
        initAdminUsers();
    });

    async function initAdminUsers() {
        await checkAdminAuth();
        await loadMetrics();
        setupFiltersAndTabs();
        await loadUsers(1);
    }

    // check auth
    async function checkAdminAuth() {
        try {
            const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                window.location.href = '/?auth=login&returnUrl=/admin/users.html';
                return;
            }
            const data = await res.json();
            if (!data.isSuccess || !data.data) {
                window.location.href = '/';
                return;
            }

            currentUser = data.data;
            const roles = currentUser.roles || [];
            const isAdmin = roles.includes('Admin');
            const isStaff = roles.includes('Staff');

            if (!isAdmin && !isStaff) {
                alert('Tài khoản của bạn không có quyền truy cập trung tâm quản trị.');
                window.location.href = '/';
                return;
            }

            // header
            const avatarEl = document.querySelector('.header__avatar');
            const nameEl = document.querySelector('.header__user strong');
            const roleEl = document.querySelector('.header__user small');

            const displayName = currentUser.fullName || currentUser.userName || 'Admin';
            if (avatarEl) {
                avatarEl.textContent = displayName.substring(0, 2).toUpperCase();
            }
            if (nameEl) {
                nameEl.textContent = displayName;
            }
            if (roleEl) {
                roleEl.textContent = isAdmin ? 'Quản trị viên' : 'Nhân viên';
            }

            // logout link
            const logoutLink = document.querySelector('.sidebar__logout');
            if (logoutLink) {
                logoutLink.href = '/logout';
            }
        } catch (e) {
            console.error('Lỗi kiểm tra quyền Admin:', e);
        }
    }

    // load metrics
    async function loadMetrics() {
        try {
            const res = await fetch('/api/admin/users/metrics', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isSuccess || !data.data) return;

            const m = data.data;
            const metricValues = document.querySelectorAll('.admin-metrics .metric-card b');
            if (metricValues.length >= 4) {
                metricValues[0].textContent = m.totalUsers.toLocaleString('vi-VN');
                metricValues[1].textContent = m.activeUsers.toLocaleString('vi-VN');
                metricValues[2].textContent = m.ownerCount.toLocaleString('vi-VN');
                metricValues[3].textContent = m.sanctionedCount.toLocaleString('vi-VN');
            }
        } catch (e) {
            console.error('Lỗi tải thống kê:', e);
        }
    }

    // filters & tabs
    function setupFiltersAndTabs() {
        const searchInput = document.querySelector('.admin-search input');
        if (searchInput) {
            searchInput.placeholder = 'Tìm kiếm tên, username, email, SĐT...';
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    searchQuery = e.target.value.trim();
                    currentPage = 1;
                    loadUsers(currentPage);
                }, 300);
            });
        }

        const tabs = document.querySelectorAll('.admin-tabs button[data-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach(t => t.classList.remove('is-active'));
                tab.classList.add('is-active');
                currentTab = tab.dataset.tab;
                currentPage = 1;
                loadUsers(currentPage);
            });
        });

        // review button
        const reviewBtn = document.querySelector('.admin-notice button');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                const reviewTab = document.querySelector('.admin-tabs button[data-tab="review"]') ||
                                  document.querySelector('.admin-tabs button[data-tab="pending"]');
                if (reviewTab) reviewTab.click();
            });
        }
    }

    // load user list
    async function loadUsers(page = 1) {
        currentPage = page;
        const tbody = document.querySelector('.admin-table tbody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách tài khoản...</td></tr>`;

        try {
            const url = new URL('/api/admin/users', window.location.origin);
            url.searchParams.set('pageNumber', currentPage);
            url.searchParams.set('pageSize', 8);
            if (searchQuery) url.searchParams.set('query', searchQuery);
            if (currentTab && currentTab !== 'all') url.searchParams.set('tab', currentTab);
            if (currentRole && currentRole !== 'all') url.searchParams.set('role', currentRole);

            const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải dữ liệu từ máy chủ.</td></tr>`;
                return;
            }

            const result = await res.json();
            if (!result.isSuccess || !result.data) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: #64748b;">Không tìm thấy người dùng phù hợp.</td></tr>`;
                return;
            }

            const paged = result.data;
            const users = paged.items || [];

            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #64748b;">Không có tài khoản nào phù hợp tiêu chí tìm kiếm.</td></tr>`;
                renderPagination(0, 0, 1, 8);
                return;
            }

            tbody.innerHTML = '';
            users.forEach((u, index) => {
                const tr = document.createElement('tr');
                tr.dataset.status = u.accountStatus.toLowerCase();
                tr.style.cursor = 'pointer';

                // highlight row
                if (selectedUserId === u.id || (!selectedUserId && index === 0)) {
                    tr.style.background = '#f0f9ff';
                    if (!selectedUserId) {
                        selectedUserId = u.id;
                        loadUserDetail(u.id);
                    }
                }

                const roleBadgeClass = u.isAdmin ? 'badge--purple' : (u.isStaff ? 'badge--blue' : (u.isOwner ? 'badge--gold' : ''));
                const licenseBadge = u.hasDriverLicense 
                    ? `<span class="status status--green">GPLX ${u.driverLicenseClass || 'Hợp lệ'}</span>`
                    : `<span class="status status--gray">Chưa nộp GPLX</span>`;

                tr.innerHTML = `
                    <td>
                        <div class="row-main">
                            <span class="row-main__title"><strong>${escapeHtml(u.fullName || u.userName)}</strong></span>
                            <span class="row-main__sub">@${escapeHtml(u.userName)} · ${escapeHtml(u.email || '')} · ${escapeHtml(u.phoneNumber || 'Chưa có SĐT')}</span>
                        </div>
                    </td>
                    <td>
                        <span style="font-weight: 600; color: #1e293b;">${escapeHtml(u.primaryRole)}</span>
                    </td>
                    <td>${licenseBadge}</td>
                    <td>
                        <span class="status status--${u.statusBadgeColor}">${escapeHtml(u.statusBadgeText)}</span>
                    </td>
                    <td>
                        <small style="color: #64748b;">${u.tripsCount} chuyến · ${u.vehiclesCount} xe</small>
                    </td>
                    <td>
                        <button type="button" class="button button--light btn-select-user" style="min-height: 28px; padding: 0 10px; font-size: 11px;">
                            Xem hồ sơ →
                        </button>
                    </td>
                `;

                tr.addEventListener('click', () => {
                    document.querySelectorAll('.admin-table tbody tr').forEach(r => r.style.background = '');
                    tr.style.background = '#f0f9ff';
                    selectedUserId = u.id;
                    loadUserDetail(u.id);
                });

                tbody.appendChild(tr);
            });

            renderPagination(paged.totalCount, users.length, paged.pageNumber, paged.pageSize);

        } catch (e) {
            console.error('Lỗi loadUsers:', e);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: #ef4444;">Lỗi kết nối máy chủ.</td></tr>`;
        }
    }

    // pagination
    function renderPagination(totalCount, currentCount, pageNumber, pageSize) {
        const captionEl = document.querySelector('.card.admin-panel .table-caption--between');
        if (!captionEl) return;

        const totalPages = Math.ceil(totalCount / pageSize) || 1;
        const start = totalCount > 0 ? (pageNumber - 1) * pageSize + 1 : 0;
        const end = Math.min(pageNumber * pageSize, totalCount);

        captionEl.innerHTML = `
            <span>Hiển thị ${start}–${end} trong ${totalCount.toLocaleString('vi-VN')} tài khoản</span>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button type="button" class="btn-prev-page" style="cursor: pointer; background: transparent; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px;" ${pageNumber <= 1 ? 'disabled' : ''}>‹ Trang trước</button>
                <span>Trang ${pageNumber} / ${totalPages}</span>
                <button type="button" class="btn-next-page" style="cursor: pointer; background: transparent; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px;" ${pageNumber >= totalPages ? 'disabled' : ''}>Trang sau ›</button>
            </div>
        `;

        const prevBtn = captionEl.querySelector('.btn-prev-page');
        const nextBtn = captionEl.querySelector('.btn-next-page');

        if (prevBtn) prevBtn.addEventListener('click', () => { if (pageNumber > 1) loadUsers(pageNumber - 1); });
        if (nextBtn) nextBtn.addEventListener('click', () => { if (pageNumber < totalPages) loadUsers(pageNumber + 1); });
    }

    // user detail panel
    async function loadUserDetail(userId) {
        const detailPanel = document.querySelector('.admin-columns--half section.admin-panel:first-child');
        if (!detailPanel) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isSuccess || !data.data) return;

            const u = data.data;
            selectedUserData = u;

            const initials = (u.fullName || u.userName || 'ND').substring(0, 2).toUpperCase();

            let sanctionInfoHtml = '';
            if (u.isSanctioned && u.activeSanctionReason) {
                sanctionInfoHtml = `
                    <div style="margin: 12px 0; padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                        <strong style="color: #b91c1c; font-size: 13px;">⚠️ Đang chịu chế tài (${escapeHtml(u.activeSanctionType || '')}):</strong>
                        <p style="margin: 4px 0; color: #7f1d1d; font-size: 12.5px;">${escapeHtml(u.activeSanctionReason)}</p>
                        ${u.sanctionExpiresAt ? `<small style="color: #991b1b;">Hết hạn: ${new Date(u.sanctionExpiresAt).toLocaleString('vi-VN')}</small>` : '<small style="color: #991b1b;">Khóa vĩnh viễn</small>'}
                    </div>
                `;
            }

            const headerHtml = `
                <div class="panel-head">
                    <div>
                        <h2>Tài khoản đang xem</h2>
                        <p>${escapeHtml(u.primaryRole)} · @${escapeHtml(u.userName)}</p>
                    </div>
                </div>
                <div class="user-summary">
                    <span class="profile-avatar">${initials}</span>
                    <div>
                        <b>${escapeHtml(u.fullName || u.userName)}</b>
                        <p>
                            <span class="status status--${u.statusBadgeColor}">${escapeHtml(u.statusBadgeText)}</span>
                            ${u.hasDriverLicense ? '<span class="status status--green">Đã xác minh GPLX</span>' : '<span class="status status--gray">Chưa có GPLX</span>'}
                        </p>
                    </div>
                </div>
                ${sanctionInfoHtml}
                <div class="info-grid">
                    <div><small>Số điện thoại</small><b>${escapeHtml(u.phoneNumber || 'Chưa cập nhật')}</b></div>
                    <div><small>Email</small><b>${escapeHtml(u.email || 'Chưa cập nhật')}</b></div>
                    <div><small>Vai trò hệ thống</small><b>${escapeHtml(u.roles.join(', '))}</b></div>
                    <div><small>Hoạt động</small><b>${u.tripsCount} chuyến thuê · ${u.vehiclesCount} xe sở hữu</b></div>
                </div>
                <div class="panel-actions" style="margin-top: 18px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <button class="button button--light" id="btnActionResetPass" type="button">Đặt lại mật khẩu</button>
                    ${u.isSanctioned 
                        ? '<button class="button button--primary" id="btnActionLiftSanction" type="button" style="background: #10b981; border-color: #10b981;">✓ Mở khóa tài khoản</button>'
                        : '<button class="button button--danger" id="btnActionSanction" type="button">Khóa tài khoản</button>'}
                    ${currentUser && currentUser.roles && currentUser.roles.includes('Admin')
                        ? '<button class="button button--light" id="btnActionChangeRoles" type="button">Phân quyền</button>'
                        : ''}
                </div>
            `;

            detailPanel.innerHTML = headerHtml;

            // action buttons
            const btnResetPass = detailPanel.querySelector('#btnActionResetPass');
            const btnSanction = detailPanel.querySelector('#btnActionSanction');
            const btnLiftSanction = detailPanel.querySelector('#btnActionLiftSanction');
            const btnChangeRoles = detailPanel.querySelector('#btnActionChangeRoles');

            if (btnResetPass) btnResetPass.addEventListener('click', () => showResetPasswordModal(u));
            if (btnSanction) btnSanction.addEventListener('click', () => showSanctionModal(u));
            if (btnLiftSanction) btnLiftSanction.addEventListener('click', () => showLiftSanctionModal(u));
            if (btnChangeRoles) btnChangeRoles.addEventListener('click', () => showChangeRolesModal(u));

        } catch (e) {
            console.error('Lỗi loadUserDetail:', e);
        }
    }

    // sanction modal
    function showSanctionModal(user) {
        const dialog = createDialog(`Khóa tài khoản: ${user.fullName || user.userName}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <p style="margin: 0; color: #475569;">Chọn thời hạn và mức xử phạt chế tài áp dụng cho tài khoản <strong>@${escapeHtml(user.userName)}</strong>:</p>
                <div>
                    <label style="font-weight: 600; display: block; margin-bottom: 6px;">Thời hạn khóa tài khoản:</label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="sanctionType" value="Suspend7d" checked>
                            <span><strong>Tạm khóa 7 ngày</strong> (Vi phạm lần đầu, hủy chuyến sát giờ)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="sanctionType" value="Suspend30d">
                            <span><strong>Tạm khóa 30 ngày</strong> (Vi phạm tái diễn, tranh chấp nghiêm trọng)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="sanctionType" value="Ban">
                            <span style="color: #dc2626;"><strong>Khóa vĩnh viễn</strong> (Gian lận, vi phạm pháp luật)</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label for="sanctionReasonInput" style="font-weight: 600; display: block; margin-bottom: 6px;">Lý do khóa tài khoản <span style="color: #dc2626;">*</span>:</label>
                    <textarea id="sanctionReasonInput" class="admin-textarea" rows="3" placeholder="Nhập lý do chi tiết vi phạm..." style="width: 100%; box-sizing: border-box;" required></textarea>
                </div>
                <div id="sanctionModalError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'button button--danger';
        submitBtn.textContent = 'Xác nhận khóa';

        submitBtn.addEventListener('click', async () => {
            const reason = body.querySelector('#sanctionReasonInput').value.trim();
            const errEl = body.querySelector('#sanctionModalError');
            if (!reason) {
                errEl.textContent = 'Vui lòng nhập lý do khóa tài khoản.';
                errEl.style.display = 'block';
                return;
            }

            const selectedType = body.querySelector('input[name="sanctionType"]:checked').value;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';

            try {
                const res = await fetch(`/api/admin/users/${user.id}/sanction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ sanctionType: selectedType, reason: reason })
                });

                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    dialog.close();
                    dialog.remove();
                    alert(`Đã áp dụng chế tài khóa tài khoản @${user.userName} thành công.`);
                    await loadMetrics();
                    await loadUsers(currentPage);
                    await loadUserDetail(user.id);
                } else {
                    errEl.textContent = data.message || 'Không thể thực hiện thao tác.';
                    errEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Xác nhận khóa';
                }
            } catch (e) {
                errEl.textContent = 'Lỗi kết nối máy chủ.';
                errEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Xác nhận khóa';
            }
        });

        footer.prepend(submitBtn);
    }

    // lift sanction modal
    function showLiftSanctionModal(user) {
        const dialog = createDialog(`Mở khóa tài khoản: ${user.fullName || user.userName}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <p style="margin: 0; color: #334155;">Bạn có chắc chắn muốn gỡ bỏ chế tài và kích hoạt lại tài khoản <strong>@${escapeHtml(user.userName)}</strong> không?</p>
                <div>
                    <label for="liftReasonInput" style="font-weight: 600; display: block; margin-bottom: 6px;">Ghi chú mở khóa (tùy chọn):</label>
                    <textarea id="liftReasonInput" class="admin-textarea" rows="2" placeholder="Ghi chú lý do mở khóa hoặc kết quả kháng nghị..." style="width: 100%; box-sizing: border-box;"></textarea>
                </div>
                <div id="liftModalError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'button button--primary';
        submitBtn.style.background = '#10b981';
        submitBtn.style.borderColor = '#10b981';
        submitBtn.textContent = 'Xác nhận mở khóa';

        submitBtn.addEventListener('click', async () => {
            const reason = body.querySelector('#liftReasonInput').value.trim();
            const errEl = body.querySelector('#liftModalError');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';

            try {
                const res = await fetch(`/api/admin/users/${user.id}/lift-sanction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ reason: reason })
                });

                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    dialog.close();
                    dialog.remove();
                    alert(`Đã mở khóa tài khoản @${user.userName} thành công.`);
                    await loadMetrics();
                    await loadUsers(currentPage);
                    await loadUserDetail(user.id);
                } else {
                    errEl.textContent = data.message || 'Không thể mở khóa tài khoản.';
                    errEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Xác nhận mở khóa';
                }
            } catch (e) {
                errEl.textContent = 'Lỗi kết nối máy chủ.';
                errEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Xác nhận mở khóa';
            }
        });

        footer.prepend(submitBtn);
    }

    // reset password modal
    function showResetPasswordModal(user) {
        const dialog = createDialog(`Đặt lại mật khẩu: ${user.fullName || user.userName}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <p style="margin: 0; color: #334155;">Nhập mật khẩu mới cho tài khoản <strong>@${escapeHtml(user.userName)}</strong>:</p>
                <div>
                    <label for="newPassInput" style="font-weight: 600; display: block; margin-bottom: 6px;">Mật khẩu mới (tối thiểu 6 ký tự):</label>
                    <input type="text" id="newPassInput" value="Azu@123456" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px;" required>
                    <small style="color: #64748b; margin-top: 4px; display: block;">Mật khẩu mặc định gợi ý: <code>Azu@123456</code></small>
                </div>
                <div id="resetModalError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'button button--primary';
        submitBtn.textContent = 'Cập nhật mật khẩu';

        submitBtn.addEventListener('click', async () => {
            const newPassword = body.querySelector('#newPassInput').value.trim();
            const errEl = body.querySelector('#resetModalError');
            if (newPassword.length < 6) {
                errEl.textContent = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
                errEl.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang cập nhật...';

            try {
                const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ newPassword: newPassword })
                });

                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    dialog.close();
                    dialog.remove();
                    alert(`Đã đặt lại mật khẩu cho @${user.userName} thành công. Mật khẩu mới: ${newPassword}`);
                } else {
                    errEl.textContent = data.message || 'Không thể đặt lại mật khẩu.';
                    errEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Cập nhật mật khẩu';
                }
            } catch (e) {
                errEl.textContent = 'Lỗi kết nối máy chủ.';
                errEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Cập nhật mật khẩu';
            }
        });

        footer.prepend(submitBtn);
    }

    // assign role modal
    function showChangeRolesModal(user) {
        const dialog = createDialog(`Phân quyền tài khoản: ${user.fullName || user.userName}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        const userRoles = user.roles || [];
        const isRenter = userRoles.includes('Renter');
        const isOwner = userRoles.includes('Owner');
        const isStaff = userRoles.includes('Staff');
        const isAdmin = userRoles.includes('Admin');

        body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <p style="margin: 0; color: #334155;">Chọn các vai trò phân quyền cho tài khoản <strong>@${escapeHtml(user.userName)}</strong>:</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="roleCheckbox" value="Renter" ${isRenter ? 'checked' : ''}>
                        <span><strong>Người thuê (Renter)</strong> - Có quyền tìm và đặt xe</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="roleCheckbox" value="Owner" ${isOwner ? 'checked' : ''}>
                        <span><strong>Chủ xe (Owner)</strong> - Có quyền đăng xe và nhận đơn thuê</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="roleCheckbox" value="Staff" ${isStaff ? 'checked' : ''}>
                        <span><strong>Nhân viên (Staff)</strong> - Có quyền duyệt xe và quản lý tài khoản người dùng</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="roleCheckbox" value="Admin" ${isAdmin ? 'checked' : ''}>
                        <span style="color: #7c3aed;"><strong>Quản trị viên (Admin)</strong> - Toàn quyền quản trị hệ thống</span>
                    </label>
                </div>
                <div id="rolesModalError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'button button--primary';
        submitBtn.textContent = 'Lưu phân quyền';

        submitBtn.addEventListener('click', async () => {
            const checkedBoxes = Array.from(body.querySelectorAll('input[name="roleCheckbox"]:checked'));
            const newRoles = checkedBoxes.map(cb => cb.value);
            const errEl = body.querySelector('#rolesModalError');

            if (newRoles.length === 0) {
                errEl.textContent = 'Tài khoản phải có ít nhất một vai trò.';
                errEl.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang lưu...';

            try {
                const res = await fetch(`/api/admin/users/${user.id}/roles`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ roles: newRoles })
                });

                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    dialog.close();
                    dialog.remove();
                    alert(`Đã cập nhật phân quyền cho @${user.userName} thành công.`);
                    await loadUsers(currentPage);
                    await loadUserDetail(user.id);
                } else {
                    errEl.textContent = data.message || 'Không thể cập nhật phân quyền.';
                    errEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Lưu phân quyền';
                }
            } catch (e) {
                errEl.textContent = 'Lỗi kết nối máy chủ.';
                errEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Lưu phân quyền';
            }
        });

        footer.prepend(submitBtn);
    }

    // dialog helper
    function createDialog(title) {
        const prev = document.querySelector('.admin-dialog');
        if (prev) prev.remove();

        const dialog = document.createElement('dialog');
        dialog.className = 'admin-dialog';

        const header = document.createElement('div');
        header.className = 'admin-dialog__header';
        const h2 = document.createElement('h2');
        h2.textContent = title;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'admin-dialog__close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            dialog.close();
            dialog.remove();
        });
        header.append(h2, closeBtn);

        const body = document.createElement('div');
        body.className = 'admin-dialog__body';

        const footer = document.createElement('div');
        footer.className = 'admin-dialog__footer';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'button button--light';
        cancelBtn.textContent = 'Hủy';
        cancelBtn.addEventListener('click', () => {
            dialog.close();
            dialog.remove();
        });
        footer.append(cancelBtn);

        dialog.append(header, body, footer);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.close();
                dialog.remove();
            }
        });

        document.body.append(dialog);
        dialog.showModal();
        return dialog;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
