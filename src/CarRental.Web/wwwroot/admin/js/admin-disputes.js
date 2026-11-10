// admin disputes handling
(function () {
    let currentUser = null;
    let selectedDisputeId = null;
    let currentPage = 1;
    let currentTab = 'all';
    let searchQuery = '';
    let debounceTimer = null;

    document.addEventListener('DOMContentLoaded', () => {
        initAdminDisputes();
    });

    async function initAdminDisputes() {
        await checkAdminAuth();
        setupPageLayout();
        await loadMetrics();
        setupFiltersAndTabs();
        await loadDisputes(1);
    }

    // check auth
    async function checkAdminAuth() {
        try {
            const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                window.location.href = '/?auth=login&returnUrl=/admin/disputes.html';
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
                <h1>Xử lý khiếu nại & tranh chấp</h1>
            </div>
            <div class="admin-metrics admin-metrics--4">
                <article class="card admin-metric">
                    <div><span>Tổng vụ việc</span><b aria-hidden="true">⚖</b></div>
                    <strong id="metricTotal">0</strong>
                    <small>Tiếp nhận</small>
                </article>
                <article class="card admin-metric admin-metric--red">
                    <div><span>Đang mở</span><b aria-hidden="true">⏳</b></div>
                    <strong id="metricOpen">0</strong>
                    <small>Cần giải quyết</small>
                </article>
                <article class="card admin-metric admin-metric--amber">
                    <div><span>Ưu tiên cao</span><b aria-hidden="true">⚑</b></div>
                    <strong id="metricHighPriority">0</strong>
                    <small>Quá 24 giờ</small>
                </article>
                <article class="card admin-metric admin-metric--green">
                    <div><span>Đã giải quyết</span><b aria-hidden="true">✓</b></div>
                    <strong id="metricResolved">0</strong>
                    <small>Hoàn tất xử lý</small>
                </article>
            </div>

            <section class="card admin-panel">
                <div class="admin-section-head">
                    <div>
                        <h2>Danh sách khiếu nại & tranh chấp</h2>
                        <p id="disputesCaption">Đang tải...</p>
                    </div>
                </div>

                <div class="admin-tools">
                    <label class="admin-search">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" placeholder="Tìm theo người gửi, mã đơn, xe, nội dung..." aria-label="Tìm kiếm">
                    </label>
                </div>

                <div class="admin-tabs">
                    <button class="is-active" data-tab="all">Tất cả</button>
                    <button data-tab="Open">Đang mở <span class="tab-count" id="tabCountOpen"></span></button>
                    <button data-tab="Resolved">Đã giải quyết</button>
                </div>

                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>VỤ VIỆC & XE</th>
                                <th>NGƯỜI KHIẾU NẠI</th>
                                <th>NỘI DUNG</th>
                                <th>GỬI LÚC</th>
                                <th>TRẠNG THÁI</th>
                                <th>KẾT QUẢ</th>
                                <th style="text-align: right;">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody id="disputesTableBody">
                            <tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách khiếu nại...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="table-caption table-caption--between" id="disputesPagination">
                    <span>1–10 / 0 vụ việc</span>
                    <div class="pagination-controls"></div>
                </div>
            </section>
        `;
    }

    // load metrics
    async function loadMetrics() {
        try {
            const res = await fetch('/api/admin/disputes/metrics', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isSuccess || !data.data) return;

            const m = data.data;
            const elTotal = document.getElementById('metricTotal');
            const elOpen = document.getElementById('metricOpen');
            const elHigh = document.getElementById('metricHighPriority');
            const elResolved = document.getElementById('metricResolved');
            const tabOpen = document.getElementById('tabCountOpen');

            if (elTotal) elTotal.textContent = m.totalDisputes.toLocaleString('vi-VN');
            if (elOpen) elOpen.textContent = m.openCount.toLocaleString('vi-VN');
            if (elHigh) elHigh.textContent = m.highPriorityCount.toLocaleString('vi-VN');
            if (elResolved) elResolved.textContent = m.resolvedCount.toLocaleString('vi-VN');

            if (tabOpen && m.openCount > 0) {
                tabOpen.textContent = `(${m.openCount})`;
            } else if (tabOpen) {
                tabOpen.textContent = '';
            }

            // sync badge in sidebar
            const disputeSidebarItem = document.querySelector('.sidebar__item[data-icon="disputes"]');
            if (disputeSidebarItem) {
                let badge = disputeSidebarItem.querySelector('.sidebar__count');
                if (m.openCount > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'sidebar__count';
                        disputeSidebarItem.appendChild(badge);
                    }
                    badge.textContent = m.openCount;
                } else if (badge) {
                    badge.remove();
                }
            }
        } catch (e) {
            console.error('Lỗi load dispute metrics:', e);
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
                    loadDisputes(currentPage);
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
                loadDisputes(currentPage);
            });
        });
    }

    // load disputes
    async function loadDisputes(page = 1) {
        currentPage = page;
        const tbody = document.getElementById('disputesTableBody');
        const caption = document.getElementById('disputesCaption');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách khiếu nại...</td></tr>`;

        try {
            const url = new URL('/api/admin/disputes', window.location.origin);
            url.searchParams.set('page', currentPage);
            url.searchParams.set('pageSize', 10);
            if (searchQuery) url.searchParams.set('searchTerm', searchQuery);
            if (currentTab !== 'all') url.searchParams.set('status', currentTab);

            const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải dữ liệu từ máy chủ.</td></tr>`;
                return;
            }

            const result = await res.json();
            if (!result.isSuccess || !result.data) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">Không tìm thấy khiếu nại nào.</td></tr>`;
                return;
            }

            const paged = result.data;
            const items = paged.items || [];
            const totalCount = paged.totalCount;

            if (caption) {
                caption.textContent = `${totalCount} vụ việc`;
            }

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Không có khiếu nại nào phù hợp tiêu chí.</td></tr>`;
                renderPagination(0, 0, 1, 10);
                return;
            }

            tbody.innerHTML = '';
            items.forEach(d => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';

                let statusBadge = `<span class="admin-status admin-status--red">Đang mở</span>`;
                if (d.status === 'Resolved') {
                    statusBadge = `<span class="admin-status admin-status--green">Đã giải quyết</span>`;
                }

                let resolutionText = '<small style="color: #94a3b8;">Chưa xử lý</small>';
                if (d.resolutionAction === 'ForceComplete') {
                    resolutionText = '<span class="admin-status admin-status--blue">Duyệt hoàn tất</span>';
                } else if (d.resolutionAction === 'CancelOwnerFault') {
                    resolutionText = '<span class="admin-status admin-status--red">Hủy (Lỗi chủ xe)</span>';
                } else if (d.resolutionAction === 'None') {
                    resolutionText = '<span class="admin-status admin-status--neutral">Ghi nhận nội bộ</span>';
                }

                const createdDate = new Date(d.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                tr.innerHTML = `
                    <td>
                        <strong>TC-${d.disputeId.toString().padStart(4, '0')} · Đơn #${d.bookingId}</strong>
                        <small>${escapeHtml(d.vehicleName)} · <code>${escapeHtml(d.licensePlate)}</code></small>
                    </td>
                    <td>
                        <strong>${escapeHtml(d.raiserName)}</strong>
                        <small><span class="admin-status admin-status--neutral" style="font-size: 10px;">${d.raiserRole}</span></small>
                    </td>
                    <td>
                        <div style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${escapeHtml(d.description)}
                        </div>
                    </td>
                    <td><small>${createdDate}</small></td>
                    <td>${statusBadge}</td>
                    <td>${resolutionText}</td>
                    <td style="text-align: right;">
                        <button class="button button--light" style="font-size: 11px; padding: 4px 10px;">${d.status === 'Open' ? 'Xử lý →' : 'Chi tiết →'}</button>
                    </td>
                `;

                tr.addEventListener('click', () => {
                    showDisputeDetailModal(d.disputeId);
                });

                tbody.appendChild(tr);
            });

            renderPagination(totalCount, items.length, currentPage, 10);
        } catch (e) {
            console.error('Lỗi load disputes:', e);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Lỗi kết nối tới máy chủ.</td></tr>`;
        }
    }

    // pagination
    function renderPagination(total, count, page, pageSize) {
        const wrap = document.getElementById('disputesPagination');
        if (!wrap) return;

        if (total === 0) {
            wrap.innerHTML = `<span>0 vụ việc</span>`;
            return;
        }

        const start = (page - 1) * pageSize + 1;
        const end = Math.min(start + count - 1, total);
        const totalPages = Math.ceil(total / pageSize);

        let paginationHtml = `<span>${start}–${end} / ${total} vụ việc</span>`;
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
                loadDisputes(p);
            });
        });
    }

    // dispute detail modal
    async function showDisputeDetailModal(disputeId) {
        try {
            const res = await fetch(`/api/admin/disputes/${disputeId}`, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                alert('Không thể tải chi tiết khiếu nại.');
                return;
            }
            const data = await res.json();
            if (!data.isSuccess || !data.data) {
                alert(data.message || 'Không tìm thấy khiếu nại.');
                return;
            }

            const d = data.data;
            const dialog = createDialog(`Vụ việc TC-${d.disputeId.toString().padStart(4, '0')} (Đơn thuê #${d.bookingId})`);
            dialog.style.width = 'min(760px, calc(100vw - 32px))';

            const body = dialog.querySelector('.admin-dialog__body');
            const footer = dialog.querySelector('.admin-dialog__footer');

            const isOpen = d.status === 'Open';

            const createdDate = new Date(d.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const startDate = new Date(d.startDate).toLocaleDateString('vi-VN');
            const endDate = new Date(d.endDate).toLocaleDateString('vi-VN');

            let handoversHtml = '<p style="color: #64748b; font-style: italic;">Chưa có biên bản bàn giao nào.</p>';
            if (d.handovers && d.handovers.length > 0) {
                handoversHtml = `
                    <div style="display: grid; gap: 6px;">
                        ${d.handovers.map(h => `
                            <div style="padding: 8px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px;">
                                <strong>${h.type === 'Pickup' ? 'Nhận xe đầu chuyến' : 'Trả xe cuối chuyến'}</strong> · 
                                <span>Xác nhận bởi: ${escapeHtml(h.confirmerName)}</span> · 
                                <small style="color: #64748b;">${new Date(h.confirmedAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</small>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            body.innerHTML = `
                <div style="display: grid; gap: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Xe liên quan:</span>
                            <div style="font-size: 14px; font-weight: 700;">${escapeHtml(d.vehicleName)} (<code>${escapeHtml(d.licensePlate)}</code>)</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Thời gian thuê:</span>
                            <div style="font-size: 13px;">${startDate} → ${endDate}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Người thuê:</span>
                            <div style="font-size: 13px; font-weight: 600;">${escapeHtml(d.renterName)} (${escapeHtml(d.renterPhone || '—')})</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Chủ xe:</span>
                            <div style="font-size: 13px; font-weight: 600;">${escapeHtml(d.ownerName)} (${escapeHtml(d.ownerPhone || '—')})</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Tổng tiền thuê:</span>
                            <div style="font-size: 14px; font-weight: 700; color: #b48528;">${d.priceLockedTotal.toLocaleString('vi-VN')} đ</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Tiền cọc giữ chỗ:</span>
                            <div style="font-size: 14px; font-weight: 700;">${d.depositAmount.toLocaleString('vi-VN')} đ</div>
                        </div>
                    </div>

                    <div style="padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <strong style="color: #0f172a;">Nội dung phản ánh từ ${escapeHtml(d.raiserName)} (${d.raiserRole}):</strong>
                            <small style="color: #64748b;">${createdDate}</small>
                        </div>
                        <p style="font-size: 13px; line-height: 1.6; margin: 0; color: #334155; white-space: pre-line;">${escapeHtml(d.description)}</p>

                        ${d.evidenceImage ? `
                            <div style="margin-top: 10px;">
                                <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px;">Ảnh bằng chứng kèm theo:</div>
                                <img src="${toImgUrl(d.evidenceImage)}" alt="Ảnh bằng chứng" style="max-height: 160px; max-width: 100%; border-radius: 6px; border: 1px solid #e2e8f0; object-fit: contain; cursor: pointer;" onclick="window.open('${toImgUrl(d.evidenceImage)}', '_blank')">
                            </div>
                        ` : ''}
                    </div>

                    <div>
                        <h4 style="font-size: 13px; margin: 0 0 6px;">Biên bản bàn giao của chuyến</h4>
                        ${handoversHtml}
                    </div>

                    ${!isOpen ? `
                        <div style="padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534;">
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">✓ Vụ việc đã được giải quyết</div>
                            <div style="font-size: 13px;">Hướng xử lý: <strong>${escapeHtml(d.resolutionAction || '—')}</strong></div>
                            <div style="font-size: 13px; margin-top: 2px;">Ghi chú: ${escapeHtml(d.resolutionNotes || '—')}</div>
                            <div style="font-size: 11px; color: #15803d; margin-top: 6px;">Xử lý bởi: ${escapeHtml(d.resolverName || 'Admin')} lúc ${d.resolvedAt ? new Date(d.resolvedAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}</div>
                        </div>
                    ` : `
                        <div style="padding: 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; display: grid; gap: 10px;">
                            <h4 style="margin: 0; font-size: 14px; color: #92400e;">Phán quyết & Giải quyết vụ việc</h4>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #451a03;">Chọn hướng xử lý:</label>
                                <select id="resolveActionSelect" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px;">
                                    <option value="ForceComplete">✓ Duyệt hoàn tất chuyến đi (Force Complete) & đối soát tiền / hoàn cọc</option>
                                    <option value="CancelOwnerFault">✗ Hủy chuyến do lỗi chủ xe (Cancel Owner Fault) & hoàn cọc cho khách</option>
                                    <option value="None">◉ Ghi nhận nội bộ / Hòa giải (Không can thiệp trạng thái đơn)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #451a03;">Ghi chú kết quả xử lý:</label>
                                <textarea id="resolveNotesInput" class="admin-textarea" rows="2" placeholder="Ví dụ: Đã xác minh hình ảnh bàn giao, cấn trừ cọc hợp lệ / Chủ xe không đến giao xe..."></textarea>
                            </div>
                            <div id="resolveDisputeError" style="color: #dc2626; font-size: 13px; display: none;"></div>
                        </div>
                    `}
                </div>
            `;

            footer.innerHTML = '';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'button button--light';
            closeBtn.textContent = 'Đóng';
            closeBtn.addEventListener('click', () => {
                dialog.close();
                dialog.remove();
            });
            footer.appendChild(closeBtn);

            if (isOpen) {
                const submitResolveBtn = document.createElement('button');
                submitResolveBtn.className = 'button button--primary';
                submitResolveBtn.textContent = '✓ Lưu giải quyết';
                submitResolveBtn.addEventListener('click', async () => {
                    const action = dialog.querySelector('#resolveActionSelect').value;
                    const notes = dialog.querySelector('#resolveNotesInput').value.trim();
                    const errEl = dialog.querySelector('#resolveDisputeError');

                    if (!notes) {
                        errEl.textContent = 'Vui lòng nhập ghi chú kết quả giải quyết.';
                        errEl.style.display = 'block';
                        return;
                    }

                    if (!confirm(`Xác nhận giải quyết vụ việc TC-${d.disputeId.toString().padStart(4, '0')} theo hướng "${action}"?`)) return;

                    submitResolveBtn.disabled = true;
                    submitResolveBtn.textContent = 'Đang xử lý...';

                    try {
                        const resolveRes = await fetch(`/api/admin/disputes/${d.disputeId}/resolve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                resolutionAction: action,
                                resolutionNotes: notes
                            })
                        });

                        const resData = await resolveRes.json();
                        if (resData.isSuccess) {
                            dialog.close();
                            dialog.remove();
                            await loadMetrics();
                            await loadDisputes(currentPage);
                        } else {
                            errEl.textContent = resData.message || 'Lỗi giải quyết vụ việc.';
                            errEl.style.display = 'block';
                            submitResolveBtn.disabled = false;
                            submitResolveBtn.textContent = '✓ Lưu giải quyết';
                        }
                    } catch (e) {
                        errEl.textContent = 'Lỗi kết nối máy chủ.';
                        errEl.style.display = 'block';
                        submitResolveBtn.disabled = false;
                        submitResolveBtn.textContent = '✓ Lưu giải quyết';
                    }
                });

                footer.appendChild(submitResolveBtn);
            }
        } catch (e) {
            console.error('Lỗi showDisputeDetailModal:', e);
            alert('Lỗi hiển thị khiếu nại.');
        }
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

    function toImgUrl(p) {
        if (!p) return '';
        if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('/')) return p;
        return '/' + p;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
