// admin owners management
(function () {
    let currentUser = null;
    let selectedOwnerId = null;
    let currentPage = 1;
    let currentTab = 'all';
    let searchQuery = '';
    let debounceTimer = null;

    document.addEventListener('DOMContentLoaded', () => {
        initAdminOwners();
    });

    async function initAdminOwners() {
        await checkAdminAuth();
        setupPageLayout();
        await loadMetrics();
        setupFiltersAndTabs();
        await loadOwners(1);
    }

    // check auth
    async function checkAdminAuth() {
        try {
            const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                window.location.href = '/?auth=login&returnUrl=/admin/owners.html';
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

            // sync header
            const avatarEl = document.querySelector('.header__avatar');
            const nameEl = document.querySelector('.header__user strong');
            const roleEl = document.querySelector('.header__user small');
            const displayName = currentUser.fullName || currentUser.userName || 'Admin';

            if (avatarEl) avatarEl.textContent = displayName.substring(0, 2).toUpperCase();
            if (nameEl) nameEl.textContent = displayName;
            if (roleEl) roleEl.textContent = isAdmin ? 'Quản trị viên' : 'Nhân viên';
        } catch (e) {
            console.error('Lỗi check auth:', e);
        }
    }

    // setup page layout
    function setupPageLayout() {
        const adminPage = document.getElementById('admin-page');
        if (!adminPage) return;

        adminPage.innerHTML = `
            <div class="admin-title">
                <h1>Hồ sơ chủ xe</h1>
            </div>
            <div class="admin-metrics admin-metrics--4">
                <article class="card admin-metric">
                    <div><span>Tổng hồ sơ</span><b aria-hidden="true">📋</b></div>
                    <strong id="metricTotal">0</strong>
                    <small>Đã đăng ký</small>
                </article>
                <article class="card admin-metric admin-metric--red">
                    <div><span>Chờ duyệt</span><b aria-hidden="true">⏳</b></div>
                    <strong id="metricPending">0</strong>
                    <small>Cần xử lý ngay</small>
                </article>
                <article class="card admin-metric admin-metric--green">
                    <div><span>Đã duyệt</span><b aria-hidden="true">✓</b></div>
                    <strong id="metricApproved">0</strong>
                    <small>Đang hoạt động</small>
                </article>
                <article class="card admin-metric">
                    <div><span>Tạm khóa</span><b aria-hidden="true">⊘</b></div>
                    <strong id="metricSuspended">0</strong>
                    <small>Hạn chế quyền</small>
                </article>
            </div>

            <section class="card admin-panel">
                <div class="admin-section-head">
                    <div>
                        <h2>Danh sách đăng ký chủ xe</h2>
                        <p id="ownersListCaption">Đang tải...</p>
                    </div>
                </div>

                <div class="admin-tools">
                    <label class="admin-search">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" placeholder="Tìm theo họ tên, username, SĐT, số CCCD..." aria-label="Tìm kiếm">
                    </label>
                </div>

                <div class="admin-tabs">
                    <button class="is-active" data-tab="all">Tất cả</button>
                    <button data-tab="Pending">Chờ duyệt <span class="tab-count" id="tabCountPending"></span></button>
                    <button data-tab="Approved">Đã duyệt</button>
                    <button data-tab="Rejected">Từ chối</button>
                    <button data-tab="Suspended">Tạm khóa</button>
                </div>

                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>CHỦ XE</th>
                                <th>SỐ CCCD</th>
                                <th>NGÀY NỘP</th>
                                <th>XÉT DUYỆT</th>
                                <th>TRUY CẬP</th>
                                <th>SỐ XE</th>
                                <th style="text-align: right;">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody id="ownersTableBody">
                            <tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="table-caption table-caption--between" id="ownersPagination">
                    <span>1–10 / 0 hồ sơ</span>
                    <div class="pagination-controls"></div>
                </div>
            </section>
        `;
    }

    // load metrics
    async function loadMetrics() {
        try {
            const res = await fetch('/api/admin/owners/metrics', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isSuccess || !data.data) return;

            const m = data.data;
            const elTotal = document.getElementById('metricTotal');
            const elPending = document.getElementById('metricPending');
            const elApproved = document.getElementById('metricApproved');
            const elSuspended = document.getElementById('metricSuspended');
            const tabPending = document.getElementById('tabCountPending');

            if (elTotal) elTotal.textContent = m.totalProfiles.toLocaleString('vi-VN');
            if (elPending) elPending.textContent = m.pendingCount.toLocaleString('vi-VN');
            if (elApproved) elApproved.textContent = m.approvedCount.toLocaleString('vi-VN');
            if (elSuspended) elSuspended.textContent = m.suspendedCount.toLocaleString('vi-VN');

            if (tabPending && m.pendingCount > 0) {
                tabPending.textContent = `(${m.pendingCount})`;
            } else if (tabPending) {
                tabPending.textContent = '';
            }

            // sync badge in sidebar
            const ownerSidebarItem = document.querySelector('.sidebar__item[data-icon="owners"]');
            if (ownerSidebarItem) {
                let badge = ownerSidebarItem.querySelector('.sidebar__count');
                if (m.pendingCount > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'sidebar__count';
                        ownerSidebarItem.appendChild(badge);
                    }
                    badge.textContent = m.pendingCount;
                } else if (badge) {
                    badge.remove();
                }
            }
        } catch (e) {
            console.error('Lỗi load metrics:', e);
        }
    }

    // filters & tabs
    function setupFiltersAndTabs() {
        const searchInput = document.querySelector('.admin-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    searchQuery = e.target.value.trim();
                    currentPage = 1;
                    loadOwners(currentPage);
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
                loadOwners(currentPage);
            });
        });
    }

    // load owners
    async function loadOwners(page = 1) {
        currentPage = page;
        const tbody = document.getElementById('ownersTableBody');
        const caption = document.getElementById('ownersListCaption');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách hồ sơ...</td></tr>`;

        try {
            const url = new URL('/api/admin/owners', window.location.origin);
            url.searchParams.set('page', currentPage);
            url.searchParams.set('pageSize', 10);
            if (searchQuery) url.searchParams.set('searchTerm', searchQuery);

            if (currentTab === 'Pending' || currentTab === 'Approved' || currentTab === 'Rejected') {
                url.searchParams.set('approvalStatus', currentTab);
            } else if (currentTab === 'Suspended') {
                url.searchParams.set('accessStatus', 'Suspended');
            }

            const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải dữ liệu từ máy chủ.</td></tr>`;
                return;
            }

            const result = await res.json();
            if (!result.isSuccess || !result.data) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">Không tìm thấy hồ sơ nào.</td></tr>`;
                return;
            }

            const paged = result.data;
            const items = paged.items || [];
            const totalCount = paged.totalCount;

            if (caption) {
                caption.textContent = `${totalCount} hồ sơ đăng ký`;
            }

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Không có hồ sơ nào phù hợp tiêu chí.</td></tr>`;
                renderPagination(0, 0, 1, 10);
                return;
            }

            tbody.innerHTML = '';
            items.forEach(owner => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';

                // format approval status badge
                let approvalBadge = `<span class="admin-status admin-status--blue">Chờ duyệt</span>`;
                if (owner.approvalStatus === 'Approved') {
                    approvalBadge = `<span class="admin-status admin-status--green">Đã duyệt</span>`;
                } else if (owner.approvalStatus === 'Rejected') {
                    approvalBadge = `<span class="admin-status admin-status--red">Từ chối</span>`;
                }

                // format access status badge
                let accessBadge = `<span class="admin-status admin-status--green">Hoạt động</span>`;
                if (owner.accessStatus === 'Suspended') {
                    accessBadge = `<span class="admin-status admin-status--red">Tạm khóa</span>`;
                } else if (owner.accessStatus === 'Inactive') {
                    accessBadge = `<span class="admin-status admin-status--neutral">Chưa kích hoạt</span>`;
                }

                const submittedDate = new Date(owner.submittedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                tr.innerHTML = `
                    <td>
                        <strong>${escapeHtml(owner.fullName || owner.userName)}</strong>
                        <small>@${escapeHtml(owner.userName)} · ${escapeHtml(owner.phoneNumber || 'Chưa có SĐT')}</small>
                    </td>
                    <td><code>${escapeHtml(owner.cccdNumber)}</code></td>
                    <td><small>${submittedDate}</small></td>
                    <td>${approvalBadge}</td>
                    <td>${accessBadge}</td>
                    <td><b>${owner.totalVehicles}</b> xe</td>
                    <td style="text-align: right;">
                        <button class="button button--light btn-view-owner" style="font-size: 11px; padding: 4px 10px;">Xem hồ sơ →</button>
                    </td>
                `;

                tr.addEventListener('click', (e) => {
                    showOwnerDetailModal(owner.ownerProfileId);
                });

                tbody.appendChild(tr);
            });

            renderPagination(totalCount, items.length, currentPage, 10);
        } catch (e) {
            console.error('Lỗi load owners:', e);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Lỗi kết nối tới máy chủ.</td></tr>`;
        }
    }

    // pagination
    function renderPagination(total, count, page, pageSize) {
        const wrap = document.getElementById('ownersPagination');
        if (!wrap) return;

        if (total === 0) {
            wrap.innerHTML = `<span>0 hồ sơ</span>`;
            return;
        }

        const start = (page - 1) * pageSize + 1;
        const end = Math.min(start + count - 1, total);
        const totalPages = Math.ceil(total / pageSize);

        let paginationHtml = `<span>${start}–${end} / ${total} hồ sơ</span>`;
        paginationHtml += `<div class="pagination-controls" style="display: flex; gap: 4px; align-items: center;">`;

        if (page > 1) {
            paginationHtml += `<button class="button button--light" data-page="${page - 1}" style="padding: 2px 8px; min-height: 26px;">‹ Trước</button>`;
        }
        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                paginationHtml += `<button class="button ${p === page ? 'button--primary' : 'button--light'}" data-page="${p}" style="padding: 2px 8px; min-height: 26px;">${p}</button>`;
            } else if (p === page - 2 || p === page + 2) {
                paginationHtml += `<span style="padding: 0 4px;">…</span>`;
            }
        }
        if (page < totalPages) {
            paginationHtml += `<button class="button button--light" data-page="${page + 1}" style="padding: 2px 8px; min-height: 26px;">Sau ›</button>`;
        }
        paginationHtml += `</div>`;

        wrap.innerHTML = paginationHtml;
        wrap.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const p = parseInt(btn.dataset.page, 10);
                loadOwners(p);
            });
        });
    }

    // detail modal
    async function showOwnerDetailModal(profileId) {
        try {
            const res = await fetch(`/api/admin/owners/${profileId}`, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                alert('Không thể tải chi tiết hồ sơ chủ xe.');
                return;
            }
            const data = await res.json();
            if (!data.isSuccess || !data.data) {
                alert(data.message || 'Không tìm thấy hồ sơ.');
                return;
            }

            const owner = data.data;
            const dialog = createDialog(`Hồ sơ chủ xe: ${owner.fullName || owner.userName}`);
            dialog.style.width = 'min(700px, calc(100vw - 32px))';

            const body = dialog.querySelector('.admin-dialog__body');
            const footer = dialog.querySelector('.admin-dialog__footer');

            let vehiclesHtml = '<p style="color: #64748b; font-style: italic;">Chưa có xe nào được đăng ký.</p>';
            if (owner.vehicles && owner.vehicles.length > 0) {
                vehiclesHtml = `
                    <div style="display: grid; gap: 8px; margin-top: 8px;">
                        ${owner.vehicles.map(v => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <div>
                                    <strong>${escapeHtml(v.brand)} ${escapeHtml(v.model)} (${v.year})</strong>
                                    <div style="font-size: 12px; color: #64748b;">Biển số: <code>${escapeHtml(v.licensePlate)}</code> · ${v.seats} chỗ · ${escapeHtml(v.city)}</div>
                                </div>
                                <div style="text-align: right;">
                                    <strong style="color: #b48528;">${v.pricePerDay ? v.pricePerDay.toLocaleString('vi-VN') + ' đ/ngày' : 'Chưa định giá'}</strong>
                                    <div><span class="admin-status admin-status--${v.status === 'Approved' ? 'green' : 'amber'}">${v.status}</span></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            const submittedDate = new Date(owner.submittedAt).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            body.innerHTML = `
                <div style="display: grid; gap: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Họ và tên:</span>
                            <div style="font-size: 14px; font-weight: 600;">${escapeHtml(owner.fullName || '—')}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Username:</span>
                            <div style="font-size: 14px; font-weight: 500;">@${escapeHtml(owner.userName)}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Số điện thoại:</span>
                            <div style="font-size: 14px; font-weight: 500;">${escapeHtml(owner.phoneNumber || '—')}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Email:</span>
                            <div style="font-size: 14px; font-weight: 500;">${escapeHtml(owner.email || '—')}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Số CCCD / CMND:</span>
                            <div style="font-size: 14px; font-weight: 700; color: #1e293b;">${escapeHtml(owner.cccdNumber)}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Thời điểm nộp:</span>
                            <div style="font-size: 13px;">${submittedDate}</div>
                        </div>
                    </div>

                    ${owner.rejectReason ? `
                        <div style="padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 12px;">
                            <strong>Lý do từ chối trước đó:</strong> ${escapeHtml(owner.rejectReason)}
                        </div>
                    ` : ''}

                    <div>
                        <h3 style="font-size: 14px; margin: 0 0 8px;">Giấy tờ căn cước công dân (CCCD)</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #fff; text-align: center;">
                                <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #475569;">Mặt trước CCCD</div>
                                ${owner.cccdImageFront ? `
                                    <img src="${owner.cccdImageFront}" alt="Mặt trước CCCD" style="max-height: 140px; max-width: 100%; border-radius: 6px; object-fit: contain; cursor: pointer;" onclick="window.open('${owner.cccdImageFront}', '_blank')">
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">(Nhấn vào ảnh để xem kích thước lớn)</div>
                                ` : '<div style="padding: 30px 0; color: #94a3b8;">Chưa tải ảnh</div>'}
                            </div>
                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #fff; text-align: center;">
                                <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #475569;">Mặt sau CCCD</div>
                                ${owner.cccdImageBack ? `
                                    <img src="${owner.cccdImageBack}" alt="Mặt sau CCCD" style="max-height: 140px; max-width: 100%; border-radius: 6px; object-fit: contain; cursor: pointer;" onclick="window.open('${owner.cccdImageBack}', '_blank')">
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">(Nhấn vào ảnh để xem kích thước lớn)</div>
                                ` : '<div style="padding: 30px 0; color: #94a3b8;">Chưa tải ảnh</div>'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style="font-size: 14px; margin: 0 0 4px;">Danh sách xe (${owner.vehicles.length})</h3>
                        ${vehiclesHtml}
                    </div>

                    <div id="ownerActionError" style="color: #dc2626; font-size: 13px; display: none;"></div>
                </div>
            `;

            // action buttons in footer
            footer.innerHTML = '';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'button button--light';
            cancelBtn.textContent = 'Đóng';
            cancelBtn.addEventListener('click', () => {
                dialog.close();
                dialog.remove();
            });
            footer.appendChild(cancelBtn);

            // toggle access button (if approved)
            if (owner.approvalStatus === 'Approved') {
                const isSuspended = owner.accessStatus === 'Suspended';
                const accessBtn = document.createElement('button');
                accessBtn.className = `button ${isSuspended ? 'button--primary' : 'button--light'}`;
                accessBtn.style.color = isSuspended ? '#fff' : '#dc2626';
                accessBtn.textContent = isSuspended ? 'Mở khóa quyền chủ xe' : 'Tạm khóa quyền';
                accessBtn.addEventListener('click', async () => {
                    const newStatus = isSuspended ? 'Active' : 'Suspended';
                    if (!confirm(`Bạn có chắc chắn muốn ${isSuspended ? 'mở khóa' : 'tạm khóa'} quyền chủ xe này?`)) return;

                    try {
                        const res = await fetch(`/api/admin/owners/${owner.ownerProfileId}/access`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ accessStatus: newStatus })
                        });
                        const resData = await res.json();
                        if (resData.isSuccess) {
                            dialog.close();
                            dialog.remove();
                            await loadMetrics();
                            await loadOwners(currentPage);
                        } else {
                            alert(resData.message || 'Lỗi thao tác.');
                        }
                    } catch (e) {
                        alert('Lỗi kết nối.');
                    }
                });
                footer.appendChild(accessBtn);
            }

            // reject button
            if (owner.approvalStatus !== 'Rejected') {
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'button button--light';
                rejectBtn.style.color = '#dc2626';
                rejectBtn.textContent = 'Từ chối';
                rejectBtn.addEventListener('click', () => {
                    showRejectOwnerPrompt(owner, dialog);
                });
                footer.appendChild(rejectBtn);
            }

            // approve button
            if (owner.approvalStatus !== 'Approved') {
                const approveBtn = document.createElement('button');
                approveBtn.className = 'button button--primary';
                approveBtn.textContent = '✓ Duyệt hồ sơ';
                approveBtn.addEventListener('click', async () => {
                    if (!confirm(`Xác nhận DUYỆT hồ sơ chủ xe của "${owner.fullName || owner.userName}"? Tài khoản sẽ được cấp vai trò Owner.`)) return;

                    approveBtn.disabled = true;
                    approveBtn.textContent = 'Đang duyệt...';

                    try {
                        const res = await fetch(`/api/admin/owners/${owner.ownerProfileId}/approve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const resData = await res.json();
                        if (resData.isSuccess) {
                            dialog.close();
                            dialog.remove();
                            await loadMetrics();
                            await loadOwners(currentPage);
                        } else {
                            alert(resData.message || 'Không thể duyệt hồ sơ.');
                            approveBtn.disabled = false;
                            approveBtn.textContent = '✓ Duyệt hồ sơ';
                        }
                    } catch (e) {
                        alert('Lỗi kết nối.');
                        approveBtn.disabled = false;
                        approveBtn.textContent = '✓ Duyệt hồ sơ';
                    }
                });
                footer.appendChild(approveBtn);
            }
        } catch (e) {
            console.error('Lỗi showOwnerDetailModal:', e);
            alert('Lỗi hiển thị hồ sơ.');
        }
    }

    // reject owner prompt
    function showRejectOwnerPrompt(owner, parentDialog) {
        const dialog = createDialog(`Từ chối hồ sơ: ${owner.fullName || owner.userName}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        body.innerHTML = `
            <div style="display: grid; gap: 12px;">
                <p>Vui lòng nhập lý do từ chối hồ sơ chủ xe để thông báo cho người dùng:</p>
                <textarea id="rejectOwnerReason" class="admin-textarea" rows="3" placeholder="Ví dụ: Ảnh CCCD bị mờ, thông tin không khớp với họ tên..."></textarea>
                <div id="rejectOwnerError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.className = 'button button--primary';
        submitBtn.style.background = '#dc2626';
        submitBtn.textContent = 'Xác nhận từ chối';
        submitBtn.addEventListener('click', async () => {
            const reason = dialog.querySelector('#rejectOwnerReason').value.trim();
            const errEl = dialog.querySelector('#rejectOwnerError');

            if (!reason) {
                errEl.textContent = 'Vui lòng nhập lý do từ chối.';
                errEl.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';

            try {
                const res = await fetch(`/api/admin/owners/${owner.ownerProfileId}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rejectReason: reason })
                });

                const resData = await res.json();
                if (resData.isSuccess) {
                    dialog.close();
                    dialog.remove();
                    if (parentDialog) {
                        parentDialog.close();
                        parentDialog.remove();
                    }
                    await loadMetrics();
                    await loadOwners(currentPage);
                } else {
                    errEl.textContent = resData.message || 'Lỗi từ chối hồ sơ.';
                    errEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Xác nhận từ chối';
                }
            } catch (e) {
                errEl.textContent = 'Lỗi kết nối máy chủ.';
                errEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Xác nhận từ chối';
            }
        });

        footer.appendChild(submitBtn);
    }

    // helper dialog
    function createDialog(title) {
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
        cancelBtn.textContent = 'Đóng';
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
