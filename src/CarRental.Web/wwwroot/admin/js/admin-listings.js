// admin listings moderation
(function () {
    let currentUser = null;
    let selectedListingId = null;
    let currentPage = 1;
    let currentTab = 'all';
    let currentCity = 'all';
    let searchQuery = '';
    let debounceTimer = null;

    document.addEventListener('DOMContentLoaded', () => {
        initAdminListings();
    });

    async function initAdminListings() {
        await checkAdminAuth();
        setupPageLayout();
        await loadMetrics();
        setupFiltersAndTabs();
        await loadListings(1);
    }

    // check auth
    async function checkAdminAuth() {
        try {
            const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                window.location.href = '/?auth=login&returnUrl=/admin/listings.html';
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
                <h1>Kiểm duyệt tin đăng</h1>
            </div>
            <div class="admin-metrics admin-metrics--4">
                <article class="card admin-metric">
                    <div><span>Tổng bài đăng</span><b aria-hidden="true">🚗</b></div>
                    <strong id="metricTotal">0</strong>
                    <small>Toàn hệ thống</small>
                </article>
                <article class="card admin-metric admin-metric--amber">
                    <div><span>Chờ kiểm duyệt</span><b aria-hidden="true">⏳</b></div>
                    <strong id="metricPending">0</strong>
                    <small>Đang đợi duyệt</small>
                </article>
                <article class="card admin-metric admin-metric--red">
                    <div><span>Quá 24 giờ</span><b aria-hidden="true">◷</b></div>
                    <strong id="metricOver24h">0</strong>
                    <small>Ưu tiên xử lý</small>
                </article>
                <article class="card admin-metric admin-metric--green">
                    <div><span>Đang hiển thị</span><b aria-hidden="true">✓</b></div>
                    <strong id="metricPublic">0</strong>
                    <small>Công khai</small>
                </article>
            </div>

            <section class="card admin-panel">
                <div class="admin-section-head">
                    <div>
                        <h2>Danh sách tin đăng xe</h2>
                        <p id="listingsCaption">Đang tải...</p>
                    </div>
                </div>

                <div class="admin-tools">
                    <label class="admin-search">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" placeholder="Tìm theo tên xe, biển số, chủ xe, địa chỉ..." aria-label="Tìm kiếm">
                    </label>
                    <select id="selectCity" aria-label="Lọc theo thành phố">
                        <option value="all">Tất cả thành phố</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Đà Nẵng">Đà Nẵng</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    </select>
                </div>

                <div class="admin-tabs">
                    <button class="is-active" data-tab="all">Tất cả</button>
                    <button data-tab="PendingApproval">Chờ duyệt <span class="tab-count" id="tabCountPending"></span></button>
                    <button data-tab="Public">Đang hiển thị</button>
                    <button data-tab="Hidden">Tạm ẩn / Đã gỡ</button>
                </div>

                <div class="admin-table-wrap">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>XE & BIỂN SỐ</th>
                                <th>CHỦ XE</th>
                                <th>KHU VỰC</th>
                                <th>GIÁ/NGÀY</th>
                                <th>GỬI LÚC</th>
                                <th>TRẠNG THÁI</th>
                                <th style="text-align: right;">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody id="listingsTableBody">
                            <tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách tin đăng...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="table-caption table-caption--between" id="listingsPagination">
                    <span>1–10 / 0 tin</span>
                    <div class="pagination-controls"></div>
                </div>
            </section>
        `;
    }

    // load metrics
    async function loadMetrics() {
        try {
            const res = await fetch('/api/admin/listings/metrics', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isSuccess || !data.data) return;

            const m = data.data;
            const elTotal = document.getElementById('metricTotal');
            const elPending = document.getElementById('metricPending');
            const elOver24h = document.getElementById('metricOver24h');
            const elPublic = document.getElementById('metricPublic');
            const tabPending = document.getElementById('tabCountPending');

            if (elTotal) elTotal.textContent = m.totalListings.toLocaleString('vi-VN');
            if (elPending) elPending.textContent = m.pendingCount.toLocaleString('vi-VN');
            if (elOver24h) elOver24h.textContent = m.pendingOver24hCount.toLocaleString('vi-VN');
            if (elPublic) elPublic.textContent = m.publicCount.toLocaleString('vi-VN');

            if (tabPending && m.pendingCount > 0) {
                tabPending.textContent = `(${m.pendingCount})`;
            } else if (tabPending) {
                tabPending.textContent = '';
            }

            // sync badge in sidebar
            const listingSidebarItem = document.querySelector('.sidebar__item[data-icon="listings"]');
            if (listingSidebarItem) {
                let badge = listingSidebarItem.querySelector('.sidebar__count');
                if (m.pendingCount > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'sidebar__count';
                        listingSidebarItem.appendChild(badge);
                    }
                    badge.textContent = m.pendingCount;
                } else if (badge) {
                    badge.remove();
                }
            }
        } catch (e) {
            console.error('Lỗi load listing metrics:', e);
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
                    loadListings(currentPage);
                }, 300);
            });
        }

        const citySelect = document.getElementById('selectCity');
        if (citySelect) {
            citySelect.addEventListener('change', (e) => {
                currentCity = e.target.value;
                currentPage = 1;
                loadListings(currentPage);
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
                loadListings(currentPage);
            });
        });
    }

    // load listings
    async function loadListings(page = 1) {
        currentPage = page;
        const tbody = document.getElementById('listingsTableBody');
        const caption = document.getElementById('listingsCaption');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Đang tải danh sách bài đăng...</td></tr>`;

        try {
            const url = new URL('/api/admin/listings', window.location.origin);
            url.searchParams.set('page', currentPage);
            url.searchParams.set('pageSize', 10);
            if (searchQuery) url.searchParams.set('searchTerm', searchQuery);
            if (currentTab !== 'all') url.searchParams.set('moderationStatus', currentTab);
            if (currentCity !== 'all') url.searchParams.set('city', currentCity);

            const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Không thể tải dữ liệu từ máy chủ.</td></tr>`;
                return;
            }

            const result = await res.json();
            if (!result.isSuccess || !result.data) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">Không tìm thấy bài đăng nào.</td></tr>`;
                return;
            }

            const paged = result.data;
            const items = paged.items || [];
            const totalCount = paged.totalCount;

            if (caption) {
                caption.textContent = `${totalCount} bài đăng xe`;
            }

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">Không có bài đăng nào phù hợp tiêu chí.</td></tr>`;
                renderPagination(0, 0, 1, 10);
                return;
            }

            tbody.innerHTML = '';
            items.forEach(listing => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';

                let statusBadge = `<span class="admin-status admin-status--amber">Chờ duyệt</span>`;
                if (listing.moderationStatus === 'Public') {
                    statusBadge = `<span class="admin-status admin-status--green">Đang hiển thị</span>`;
                } else if (listing.moderationStatus === 'Hidden') {
                    statusBadge = `<span class="admin-status admin-status--red">Tạm ẩn</span>`;
                }

                const createdDate = new Date(listing.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                const thumb = listing.thumbnailUrl || '/images/default-car.jpg';

                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${thumb}" alt="${escapeHtml(listing.brand)}" style="width: 44px; height: 32px; object-fit: cover; border-radius: 4px; background: #f1f5f9;">
                            <div>
                                <strong>${escapeHtml(listing.brand)} ${escapeHtml(listing.model)} (${listing.year})</strong>
                                <small>Biển số: <code>${escapeHtml(listing.licensePlate)}</code></small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong>${escapeHtml(listing.ownerName || 'Chủ xe')}</strong>
                        <small>${escapeHtml(listing.ownerPhone || '')}</small>
                    </td>
                    <td>
                        <div>${escapeHtml(listing.district)}</div>
                        <small>${escapeHtml(listing.city)}</small>
                    </td>
                    <td><strong style="color: #b48528;">${listing.pricePerDay.toLocaleString('vi-VN')} đ</strong></td>
                    <td><small>${createdDate}</small></td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right;">
                        <button class="button button--light" style="font-size: 11px; padding: 4px 10px;">Đối chiếu →</button>
                    </td>
                `;

                tr.addEventListener('click', () => {
                    showListingDetailModal(listing.listingId);
                });

                tbody.appendChild(tr);
            });

            renderPagination(totalCount, items.length, currentPage, 10);
        } catch (e) {
            console.error('Lỗi load listings:', e);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #ef4444;">Lỗi kết nối tới máy chủ.</td></tr>`;
        }
    }

    // pagination
    function renderPagination(total, count, page, pageSize) {
        const wrap = document.getElementById('listingsPagination');
        if (!wrap) return;

        if (total === 0) {
            wrap.innerHTML = `<span>0 tin đăng</span>`;
            return;
        }

        const start = (page - 1) * pageSize + 1;
        const end = Math.min(start + count - 1, total);
        const totalPages = Math.ceil(total / pageSize);

        let paginationHtml = `<span>${start}–${end} / ${total} tin đăng</span>`;
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
                loadListings(p);
            });
        });
    }

    // listing detail modal
    async function showListingDetailModal(listingId) {
        try {
            const res = await fetch(`/api/admin/listings/${listingId}`, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                alert('Không thể tải chi tiết bài đăng.');
                return;
            }
            const data = await res.json();
            if (!data.isSuccess || !data.data) {
                alert(data.message || 'Không tìm thấy bài đăng.');
                return;
            }

            const l = data.data;
            const dialog = createDialog(`Kiểm duyệt tin xe: ${l.brand} ${l.model} (${l.licensePlate})`);
            dialog.style.width = 'min(860px, calc(100vw - 32px))';

            const body = dialog.querySelector('.admin-dialog__body');
            const footer = dialog.querySelector('.admin-dialog__footer');

            let imagesGallery = '<p style="color: #64748b; font-style: italic;">Chưa có ảnh xe.</p>';
            if (l.images && l.images.length > 0) {
                imagesGallery = `
                    <div style="display: flex; gap: 8px; overflow-x: auto; padding: 6px 0;">
                        ${l.images.map(img => `
                            <img src="${img.imagePath}" alt="Ảnh xe" style="height: 100px; width: 140px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="window.open('${img.imagePath}', '_blank')">
                        `).join('')}
                    </div>
                `;
            }

            const isPending = l.moderationStatus === 'PendingApproval';
            const isPublic = l.moderationStatus === 'Public';

            body.innerHTML = `
                <div style="display: grid; gap: 16px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Dòng xe:</span>
                            <div style="font-size: 15px; font-weight: 700;">${escapeHtml(l.brand)} ${escapeHtml(l.model)} (${l.year})</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Biển số xe:</span>
                            <div style="font-size: 15px; font-weight: 700; color: #1e293b;"><code>${escapeHtml(l.licensePlate)}</code></div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Chủ sở hữu:</span>
                            <div style="font-size: 14px; font-weight: 600;">${escapeHtml(l.ownerName)} (${escapeHtml(l.ownerPhone)})</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Giá thuê đề xuất:</span>
                            <div style="font-size: 15px; font-weight: 700; color: #b48528;">${l.pricePerDay.toLocaleString('vi-VN')} đ / ngày</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Thông số kỹ thuật:</span>
                            <div style="font-size: 13px;">${l.seats} chỗ · Số ${escapeHtml(l.transmission)} · Nhiên liệu ${escapeHtml(l.fuelType)}</div>
                        </div>
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Địa điểm giao nhận:</span>
                            <div style="font-size: 13px;">${escapeHtml(l.location)}, ${escapeHtml(l.district)}, ${escapeHtml(l.city)}</div>
                        </div>
                    </div>

                    ${l.moderationNote ? `
                        <div style="padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 12px;">
                            <strong>Ghi chú kiểm duyệt:</strong> ${escapeHtml(l.moderationNote)}
                            ${l.moderatorName ? ` <small>(bởi ${escapeHtml(l.moderatorName)})</small>` : ''}
                        </div>
                    ` : ''}

                    <div>
                        <h3 style="font-size: 14px; margin: 0 0 6px;">Ảnh thực tế của xe (${l.images.length})</h3>
                        ${imagesGallery}
                    </div>

                    <div>
                        <h3 style="font-size: 14px; margin: 0 0 8px;">Giấy tờ xe đối chiếu (Đăng ký, Đăng kiểm, Bảo hiểm)</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #fff; text-align: center;">
                                <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #475569;">Giấy đăng ký xe</div>
                                ${l.registrationCertImage ? `
                                    <img src="${l.registrationCertImage}" alt="Đăng ký xe" style="max-height: 110px; max-width: 100%; border-radius: 4px; object-fit: contain; cursor: pointer;" onclick="window.open('${l.registrationCertImage}', '_blank')">
                                ` : '<div style="padding: 24px 0; color: #94a3b8; font-size: 11px;">Chưa cung cấp</div>'}
                            </div>

                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #fff; text-align: center;">
                                <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #475569;">Bảo hiểm TNDS</div>
                                ${l.insuranceImage ? `
                                    <img src="${l.insuranceImage}" alt="Bảo hiểm xe" style="max-height: 110px; max-width: 100%; border-radius: 4px; object-fit: contain; cursor: pointer;" onclick="window.open('${l.insuranceImage}', '_blank')">
                                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Hạn: ${l.insuranceExpiryDate || '—'}</div>
                                ` : '<div style="padding: 24px 0; color: #94a3b8; font-size: 11px;">Chưa cung cấp</div>'}
                            </div>

                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #fff; text-align: center;">
                                <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #475569;">Sổ đăng kiểm</div>
                                ${l.inspectionCertImage ? `
                                    <img src="${l.inspectionCertImage}" alt="Đăng kiểm xe" style="max-height: 110px; max-width: 100%; border-radius: 4px; object-fit: contain; cursor: pointer;" onclick="window.open('${l.inspectionCertImage}', '_blank')">
                                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Hạn: ${l.inspectionExpiryDate || '—'}</div>
                                ` : '<div style="padding: 24px 0; color: #94a3b8; font-size: 11px;">Chưa cung cấp</div>'}
                            </div>
                        </div>
                    </div>

                    ${l.description ? `
                        <div>
                            <span style="color: #64748b; font-size: 11px;">Mô tả từ chủ xe:</span>
                            <div style="font-size: 13px; line-height: 1.5; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                                ${escapeHtml(l.description)}
                            </div>
                        </div>
                    ` : ''}
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

            // Hide / Take down button (if Public)
            if (isPublic) {
                const hideBtn = document.createElement('button');
                hideBtn.className = 'button button--light';
                hideBtn.style.color = '#dc2626';
                hideBtn.textContent = 'Gỡ tin vi phạm';
                hideBtn.addEventListener('click', () => {
                    showHideListingPrompt(l, dialog);
                });
                footer.appendChild(hideBtn);
            }

            // Reject button (if Pending)
            if (isPending) {
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'button button--light';
                rejectBtn.style.color = '#dc2626';
                rejectBtn.textContent = 'Từ chối tin';
                rejectBtn.addEventListener('click', () => {
                    showRejectListingPrompt(l, dialog);
                });
                footer.appendChild(rejectBtn);
            }

            // Approve button (if Pending or Hidden)
            if (!isPublic) {
                const approveBtn = document.createElement('button');
                approveBtn.className = 'button button--primary';
                approveBtn.textContent = '✓ Duyệt công khai';
                approveBtn.addEventListener('click', async () => {
                    if (!confirm(`Xác nhận DUYỆT công khai bài đăng xe "${l.brand} ${l.model}"? Tin sẽ xuất hiện trong kết quả tìm kiếm của khách thuê.`)) return;

                    approveBtn.disabled = true;
                    approveBtn.textContent = 'Đang duyệt...';

                    try {
                        const res = await fetch(`/api/admin/listings/${l.listingId}/approve`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ note: 'Đã kiểm tra hợp lệ hồ sơ giấy tờ.' })
                        });
                        const resData = await res.json();
                        if (resData.isSuccess) {
                            dialog.close();
                            dialog.remove();
                            await loadMetrics();
                            await loadListings(currentPage);
                        } else {
                            alert(resData.message || 'Lỗi duyệt tin.');
                            approveBtn.disabled = false;
                            approveBtn.textContent = '✓ Duyệt công khai';
                        }
                    } catch (e) {
                        alert('Lỗi kết nối.');
                        approveBtn.disabled = false;
                        approveBtn.textContent = '✓ Duyệt công khai';
                    }
                });
                footer.appendChild(approveBtn);
            }
        } catch (e) {
            console.error('Lỗi showListingDetailModal:', e);
            alert('Lỗi hiển thị bài đăng.');
        }
    }

    // reject listing prompt
    function showRejectListingPrompt(listing, parentDialog) {
        const dialog = createDialog(`Từ chối tin: ${listing.brand} ${listing.model}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        body.innerHTML = `
            <div style="display: grid; gap: 12px;">
                <p>Nhập lý do từ chối bài đăng xe để gửi phản hồi cho chủ xe:</p>
                <textarea id="rejectListingReason" class="admin-textarea" rows="3" placeholder="Ví dụ: Thiếu ảnh đăng kiểm, biển số không rõ ràng, giá thuê bất thường..."></textarea>
                <div id="rejectListingError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.className = 'button button--primary';
        submitBtn.style.background = '#dc2626';
        submitBtn.textContent = 'Xác nhận từ chối';
        submitBtn.addEventListener('click', async () => {
            const reason = dialog.querySelector('#rejectListingReason').value.trim();
            const errEl = dialog.querySelector('#rejectListingError');

            if (!reason) {
                errEl.textContent = 'Vui lòng nhập lý do từ chối.';
                errEl.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';

            try {
                const res = await fetch(`/api/admin/listings/${listing.listingId}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ moderationNote: reason })
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
                    await loadListings(currentPage);
                } else {
                    errEl.textContent = resData.message || 'Lỗi từ chối.';
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

    // hide listing prompt
    function showHideListingPrompt(listing, parentDialog) {
        const dialog = createDialog(`Gỡ vi phạm bài đăng: ${listing.brand} ${listing.model}`);
        const body = dialog.querySelector('.admin-dialog__body');
        const footer = dialog.querySelector('.admin-dialog__footer');

        body.innerHTML = `
            <div style="display: grid; gap: 12px;">
                <p>Nhập căn cứ vi phạm để gỡ / tạm ẩn bài đăng này khỏi sàn AZU Car:</p>
                <textarea id="hideListingReason" class="admin-textarea" rows="3" placeholder="Ví dụ: Nhận được phản ánh xe không đúng thực tế, biển số giả mạo..."></textarea>
                <div id="hideListingError" style="color: #dc2626; font-size: 13px; display: none;"></div>
            </div>
        `;

        const submitBtn = document.createElement('button');
        submitBtn.className = 'button button--primary';
        submitBtn.style.background = '#dc2626';
        submitBtn.textContent = 'Gỡ bài đăng ngay';
        submitBtn.addEventListener('click', async () => {
            const reason = dialog.querySelector('#hideListingReason').value.trim();
            const errEl = dialog.querySelector('#hideListingError');

            if (!reason) {
                errEl.textContent = 'Vui lòng nhập lý do gỡ bài đăng.';
                errEl.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';

            try {
                const res = await fetch(`/api/admin/listings/${listing.listingId}/hide`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: reason })
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
                    await loadListings(currentPage);
                } else {
                    errEl.textContent = resData.message || 'Lỗi gỡ tin.';
                    errEl.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Gỡ bài đăng ngay';
                }
            } catch (e) {
                errEl.textContent = 'Lỗi kết nối máy chủ.';
                errEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Gỡ bài đăng ngay';
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
