// admin fee and commission configuration
(function () {
    let currentUser = null;
    let feeSettings = null;

    document.addEventListener('DOMContentLoaded', () => {
        initAdminFees();
    });

    async function initAdminFees() {
        await checkAdminAuth();
        setupPageLayout();
        await loadFeeSettings();
        setupSimulator();
    }

    // check auth
    async function checkAdminAuth() {
        try {
            const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) {
                window.location.href = '/?auth=login&returnUrl=/admin/fees.html';
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
                <h1>Phí & Hoa hồng</h1>
            </div>
            <div class="admin-metrics admin-metrics--3">
                <article class="card admin-metric">
                    <div><span>Hoa hồng sàn</span><b aria-hidden="true">％</b></div>
                    <strong id="metricCommissionRate">5%</strong>
                    <small>Mặc định đơn hoàn tất</small>
                </article>
                <article class="card admin-metric admin-metric--blue">
                    <div><span>Doanh thu sàn thu được</span><b aria-hidden="true">⌁</b></div>
                    <strong id="metricPlatformRevenue">0 đ</strong>
                    <small id="metricCompletedTrips">0 chuyến hoàn tất</small>
                </article>
                <article class="card admin-metric admin-metric--green">
                    <div><span>Tổng GMV nền tảng</span><b aria-hidden="true">▣</b></div>
                    <strong id="metricTotalGmv">0 đ</strong>
                    <small>Tổng giá trị giao dịch</small>
                </article>
            </div>

            <div class="admin-columns admin-columns--half" style="margin-top: 16px;">
                <section class="card admin-panel">
                    <div class="admin-section-head">
                        <div>
                            <h2>Cấu hình quy định phí sàn</h2>
                            <p id="feeUpdateInfo">Đang tải cấu hình...</p>
                        </div>
                    </div>

                    <div id="permissionNotice" style="display: none; padding: 10px 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e; font-size: 12px; margin-bottom: 14px;">
                        <strong>Quyền hạn:</strong> Tài khoản của bạn là Nhân viên (Staff). Chỉ Quản trị viên cấp cao (Admin) mới có quyền cập nhật cấu hình hoa hồng & tỷ lệ phạt.
                    </div>

                    <form id="feeConfigForm" style="display: grid; gap: 14px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155;">Tỷ lệ hoa hồng sàn (%):</label>
                                <input type="number" id="inputCommissionRate" step="0.5" min="1" max="50" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600;">
                                <small style="font-size: 11px; color: #64748b;">Trích từ tổng tiền thuê khi chuyến hoàn tất</small>
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155;">Tỷ lệ tiền cọc (%):</label>
                                <input type="number" id="inputDepositRate" step="1" min="5" max="90" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600;">
                                <small style="font-size: 11px; color: #64748b;">Khách thanh toán cọc lúc tạo đơn</small>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155;">Phạt hủy chuyến chủ xe (%):</label>
                                <input type="number" id="inputPenaltyRate" step="1" min="5" max="90" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600;">
                                <small style="font-size: 11px; color: #64748b;">Chủ xe hủy chuyến sau khi đã duyệt</small>
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155;">Hạn phản hồi duyệt đơn (giờ):</label>
                                <input type="number" id="inputDeadlineHours" step="1" min="1" max="168" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600;">
                                <small style="font-size: 11px; color: #64748b;">Quá hạn đơn chuyển sang Hết hạn (Expired)</small>
                            </div>
                        </div>

                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155;">Ghi chú điều chỉnh:</label>
                            <textarea id="inputFeeNote" class="admin-textarea" rows="2" placeholder="Lý do điều chỉnh chính sách hoa hồng sàn..."></textarea>
                        </div>

                        <div id="feeFormMessage" style="display: none; font-size: 13px;"></div>

                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                            <button type="submit" id="btnSaveFee" class="button button--primary" style="min-height: 36px; padding: 0 20px;">✓ Lưu cấu hình</button>
                        </div>
                    </form>
                </section>

                <section class="card admin-panel">
                    <div class="admin-section-head">
                        <div>
                            <h2>Mô phỏng phân chia doanh thu</h2>
                            <p>Tính toán thực tế theo cấu hình đang áp dụng</p>
                        </div>
                    </div>

                    <div style="display: grid; gap: 14px;">
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #334155;">Nhập tổng tiền thuê chuyến xe thử nghiệm (VNĐ):</label>
                            <input type="number" id="simTripTotal" value="2000000" step="100000" min="100000" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; font-weight: 700; color: #0f172a;">
                        </div>

                        <div class="fee-breakdown" style="padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; display: grid; gap: 10px;">
                            <div style="display: flex; justify-content: space-between; font-size: 13px;">
                                <span>Tổng tiền thuê niêm yết:</span>
                                <b id="simDisplayTotal">2.000.000 đ</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #0284c7;">
                                <span>Tiền cọc khách thanh toán trực tuyến (<span id="simDepositPct">25</span>%):</span>
                                <b id="simDepositAmount">500.000 đ</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b;">
                                <span>Tiền còn lại thanh toán lúc nhận xe (75%):</span>
                                <b id="simRemainingAmount">1.500.000 đ</b>
                            </div>
                            <div style="height: 1px; background: #cbd5e1; margin: 4px 0;"></div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #dc2626;">
                                <span>Hoa hồng sàn AZU Car (<span id="simCommissionPct">5</span>%):</span>
                                <b id="simCommissionAmount">-100.000 đ</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; color: #166534; padding-top: 4px;">
                                <span>Chủ xe thực nhận (<span id="simOwnerPct">95</span>%):</span>
                                <strong id="simOwnerPayout">1.900.000 đ</strong>
                            </div>
                            <div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 4px;">
                                * Khoản cọc sẽ được hoàn trả cho khách thuê sau khi chuyến đi kết thúc và hai bên hoàn tất biên bản giao nhận xe mà không có khiếu nại phát sinh.
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    // load fee settings
    async function loadFeeSettings() {
        try {
            const res = await fetch('/api/admin/fees', { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isSuccess || !data.data) return;

            feeSettings = data.data;

            // metrics
            const elRate = document.getElementById('metricCommissionRate');
            const elRev = document.getElementById('metricPlatformRevenue');
            const elGmv = document.getElementById('metricTotalGmv');
            const elTrips = document.getElementById('metricCompletedTrips');

            if (elRate) elRate.textContent = `${(feeSettings.commissionRate * 100).toFixed(1).replace('.0', '')}%`;
            if (elRev) elRev.textContent = feeSettings.totalPlatformRevenue.toLocaleString('vi-VN') + ' đ';
            if (elGmv) elGmv.textContent = feeSettings.totalGmv.toLocaleString('vi-VN') + ' đ';
            if (elTrips) elTrips.textContent = `${feeSettings.completedBookingsCount} chuyến hoàn tất`;

            // fill form
            const inComm = document.getElementById('inputCommissionRate');
            const inDep = document.getElementById('inputDepositRate');
            const inPen = document.getElementById('inputPenaltyRate');
            const inDead = document.getElementById('inputDeadlineHours');
            const infoEl = document.getElementById('feeUpdateInfo');

            if (inComm) inComm.value = (feeSettings.commissionRate * 100);
            if (inDep) inDep.value = (feeSettings.depositRate * 100);
            if (inPen) inPen.value = (feeSettings.ownerCancelPenaltyRate * 100);
            if (inDead) inDead.value = feeSettings.responseDeadlineHours;

            if (infoEl) {
                if (feeSettings.updatedAt) {
                    const dt = new Date(feeSettings.updatedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    infoEl.textContent = `Cập nhật lần cuối bởi ${feeSettings.updaterName || 'Admin'} lúc ${dt}`;
                } else {
                    infoEl.textContent = 'Quy tắc chuẩn hệ thống AZU Car';
                }
            }

            // permission check
            const noticeEl = document.getElementById('permissionNotice');
            const saveBtn = document.getElementById('btnSaveFee');

            if (!feeSettings.canEditConfig) {
                if (noticeEl) noticeEl.style.display = 'block';
                if (inComm) inComm.disabled = true;
                if (inDep) inDep.disabled = true;
                if (inPen) inPen.disabled = true;
                if (inDead) inDead.disabled = true;
                if (saveBtn) saveBtn.style.display = 'none';
            }

            updateSimulatorValues();
            setupFormSubmit();
        } catch (e) {
            console.error('Lỗi load fee settings:', e);
        }
    }

    // simulator
    function setupSimulator() {
        const simInput = document.getElementById('simTripTotal');
        if (simInput) {
            simInput.addEventListener('input', () => {
                updateSimulatorValues();
            });
        }
    }

    function updateSimulatorValues() {
        const simInput = document.getElementById('simTripTotal');
        if (!simInput) return;

        const total = parseFloat(simInput.value) || 0;
        const commRate = feeSettings ? feeSettings.commissionRate : 0.05;
        const depRate = feeSettings ? feeSettings.depositRate : 0.25;

        const depAmount = Math.round(total * depRate);
        const remAmount = Math.max(0, total - depAmount);
        const commAmount = Math.round(total * commRate);
        const ownerPayout = Math.max(0, total - commAmount);

        const elDispTotal = document.getElementById('simDisplayTotal');
        const elDepPct = document.getElementById('simDepositPct');
        const elDepAmount = document.getElementById('simDepositAmount');
        const elRemAmount = document.getElementById('simRemainingAmount');
        const elCommPct = document.getElementById('simCommissionPct');
        const elCommAmount = document.getElementById('simCommissionAmount');
        const elOwnerPct = document.getElementById('simOwnerPct');
        const elOwnerPayout = document.getElementById('simOwnerPayout');

        if (elDispTotal) elDispTotal.textContent = total.toLocaleString('vi-VN') + ' đ';
        if (elDepPct) elDepPct.textContent = (depRate * 100).toFixed(0);
        if (elDepAmount) elDepAmount.textContent = depAmount.toLocaleString('vi-VN') + ' đ';
        if (elRemAmount) elRemAmount.textContent = remAmount.toLocaleString('vi-VN') + ' đ';
        if (elCommPct) elCommPct.textContent = (commRate * 100).toFixed(1).replace('.0', '');
        if (elCommAmount) elCommAmount.textContent = '-' + commAmount.toLocaleString('vi-VN') + ' đ';
        if (elOwnerPct) elOwnerPct.textContent = ((1 - commRate) * 100).toFixed(1).replace('.0', '');
        if (elOwnerPayout) elOwnerPayout.textContent = ownerPayout.toLocaleString('vi-VN') + ' đ';
    }

    // form submit
    function setupFormSubmit() {
        const form = document.getElementById('feeConfigForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const commVal = parseFloat(document.getElementById('inputCommissionRate').value);
            const depVal = parseFloat(document.getElementById('inputDepositRate').value);
            const penVal = parseFloat(document.getElementById('inputPenaltyRate').value);
            const deadVal = parseInt(document.getElementById('inputDeadlineHours').value, 10);
            const noteVal = document.getElementById('inputFeeNote').value.trim();

            const msgEl = document.getElementById('feeFormMessage');
            const btn = document.getElementById('btnSaveFee');

            if (isNaN(commVal) || commVal < 1 || commVal > 50) {
                if (msgEl) {
                    msgEl.style.display = 'block';
                    msgEl.style.color = '#dc2626';
                    msgEl.textContent = 'Tỷ lệ hoa hồng phải từ 1% đến 50%.';
                }
                return;
            }

            if (!confirm(`Xác nhận CẬP NHẬT cấu hình tỷ lệ hoa hồng sàn thành ${commVal}%?`)) return;

            btn.disabled = true;
            btn.textContent = 'Đang lưu...';

            try {
                const res = await fetch('/api/admin/fees', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        commissionRate: commVal / 100,
                        depositRate: depVal ? depVal / 100 : null,
                        ownerCancelPenaltyRate: penVal ? penVal / 100 : null,
                        responseDeadlineHours: deadVal || null,
                        note: noteVal || null
                    })
                });

                const resData = await res.json();
                if (resData.isSuccess) {
                    if (msgEl) {
                        msgEl.style.display = 'block';
                        msgEl.style.color = '#16a34a';
                        msgEl.textContent = '✓ Đã cập nhật cấu hình phí & hoa hồng thành công!';
                    }
                    await loadFeeSettings();
                } else {
                    if (msgEl) {
                        msgEl.style.display = 'block';
                        msgEl.style.color = '#dc2626';
                        msgEl.textContent = resData.message || 'Lỗi cập nhật cấu hình.';
                    }
                }
            } catch (err) {
                if (msgEl) {
                    msgEl.style.display = 'block';
                    msgEl.style.color = '#dc2626';
                    msgEl.textContent = 'Lỗi kết nối tới máy chủ.';
                }
            } finally {
                btn.disabled = false;
                btn.textContent = '✓ Lưu cấu hình';
            }
        });
    }
})();
