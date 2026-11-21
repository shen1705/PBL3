// trip-handover-modal.js - Modals chuyên nghiệp cho Bàn giao xe (Flaw 1) và Cảnh báo Hủy chuyến phạt 8% (Flaw 4)
(function () {
    function ensureStyles() {
        if (document.getElementById('azu-trip-modals-styles')) return;
        const style = document.createElement('style');
        style.id = 'azu-trip-modals-styles';
        style.textContent = `
            .azu-tm-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.72);
                backdrop-filter: blur(4px);
                z-index: 100400;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                overflow-y: auto;
                box-sizing: border-box;
                animation: azuTmFadeIn 0.2s ease-out;
            }
            @keyframes azuTmFadeIn {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .azu-tm-card {
                background: #ffffff;
                width: 100%;
                max-width: 560px;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                border: 1px solid #e2e8f0;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                padding: 24px 28px;
                box-sizing: border-box;
                font-family: inherit;
                color: #1e293b;
            }
            .azu-tm-close {
                position: absolute;
                top: 18px;
                right: 18px;
                background: transparent;
                border: none;
                font-size: 20px;
                color: #64748b;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 6px;
                transition: all 0.15s;
            }
            .azu-tm-close:hover {
                color: #0f172a;
                background: #f1f5f9;
            }
            .azu-tm-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 11.5px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 3px 10px;
                border-radius: 9999px;
                margin-bottom: 8px;
            }
            .azu-tm-badge.pickup {
                background: #dcfce7;
                color: #15803d;
            }
            .azu-tm-badge.return {
                background: #dbeafe;
                color: #1d4ed8;
            }
            .azu-tm-badge.cancel {
                background: #fee2e2;
                color: #b91c1c;
            }
            .azu-tm-title {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 6px 0;
                color: #0f172a;
            }
            .azu-tm-subtitle {
                font-size: 13.5px;
                color: #64748b;
                margin: 0 0 18px 0;
                line-height: 1.45;
            }
            .azu-tm-trip-info {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 12px 14px;
                margin-bottom: 18px;
                font-size: 13px;
                line-height: 1.5;
            }
            .azu-tm-trip-info strong {
                color: #0f172a;
            }
            .azu-tm-form-group {
                margin-bottom: 14px;
            }
            .azu-tm-form-group label {
                display: block;
                font-size: 13px;
                font-weight: 600;
                color: #334155;
                margin-bottom: 5px;
            }
            .azu-tm-form-group label .req {
                color: #dc2626;
            }
            .azu-tm-input,
            .azu-tm-select,
            .azu-tm-textarea {
                width: 100%;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 9px 12px;
                font-family: inherit;
                font-size: 13.5px;
                color: #1e293b;
                box-sizing: border-box;
                background: #fff;
                transition: border-color 0.15s, box-shadow 0.15s;
            }
            .azu-tm-input:focus,
            .azu-tm-select:focus,
            .azu-tm-textarea:focus {
                outline: none;
                border-color: #00a550;
                box-shadow: 0 0 0 3px rgba(0, 165, 80, 0.12);
            }
            .azu-tm-hint {
                font-size: 12px;
                color: #64748b;
                margin-top: 4px;
                display: block;
            }
            .azu-tm-agree-wrap {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 10px 12px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 13px;
                color: #334155;
                margin: 16px 0;
                line-height: 1.4;
                cursor: pointer;
            }
            .azu-tm-agree-wrap input[type="checkbox"] {
                accent-color: #00a550;
                margin-top: 2px;
                width: 16px;
                height: 16px;
            }
            .azu-tm-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
            }
            .azu-tm-btn {
                padding: 9px 18px;
                border-radius: 8px;
                font-size: 13.5px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.15s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .azu-tm-btn.btn-cancel {
                background: #f1f5f9;
                color: #475569;
            }
            .azu-tm-btn.btn-cancel:hover {
                background: #e2e8f0;
                color: #1e293b;
            }
            .azu-tm-btn.btn-primary {
                background: #16a34a;
                color: #fff;
            }
            .azu-tm-btn.btn-primary:hover {
                background: #15803d;
            }
            .azu-tm-btn.btn-return {
                background: #2563eb;
                color: #fff;
            }
            .azu-tm-btn.btn-return:hover {
                background: #1d4ed8;
            }
            .azu-tm-btn.btn-danger {
                background: #dc2626;
                color: #fff;
            }
            .azu-tm-btn.btn-danger:hover {
                background: #b91c1c;
            }
        `;
        document.head.appendChild(style);
    }

    // Modal 1: Bàn giao xe (Pickup / Return)
    function openHandoverModal({ type = 'Pickup', trip, isOwner = false, onSuccess = null }) {
        if (!trip || !trip.bookingId) return;
        ensureStyles();

        const isPickup = (type === 'Pickup');
        const modal = document.createElement('div');
        modal.className = 'azu-tm-overlay';

        const carName = trip.vehicleName || 'Xe tự lái AZU';
        const plate = trip.licensePlate ? `(${trip.licensePlate})` : '';
        const partnerName = isOwner ? (trip.renterName || 'Khách thuê') : (trip.ownerName || 'Chủ xe');
        const remainingAmount = Number(trip.priceLockedTotal || 0) - Number(trip.depositAmount || 0);

        modal.innerHTML = `
            <div class="azu-tm-card" role="dialog" aria-modal="true">
                <button type="button" class="azu-tm-close" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>
                
                <span class="azu-tm-badge ${isPickup ? 'pickup' : 'return'}">
                    <i class="fa-solid ${isPickup ? 'fa-key' : 'fa-flag-checkered'}"></i>
                    ${isPickup ? 'Biên bản giao nhận xe · Khởi hành' : 'Biên bản nghiệm thu · Trả xe'}
                </span>
                
                <h3 class="azu-tm-title">
                    ${isPickup ? 'Bàn giao &amp; Nhận xe' : 'Nghiệm thu &amp; Trả xe'} #${trip.bookingId}
                </h3>
                
                <p class="azu-tm-subtitle">
                    ${isPickup
                        ? 'Hai bên cùng kiểm tra số km thực tế trên tablo, mức nhiên liệu và ghi nhận tình trạng xe trước khi bắt đầu hành trình.'
                        : 'Kiểm tra hiện trạng xe khi hoàn trả, số km đã đi và xác nhận các khoản phụ phí phát sinh (nếu có).'
                    }
                </p>

                <div class="azu-tm-trip-info">
                    <div><strong>Phương tiện:</strong> ${carName} ${plate}</div>
                    <div><strong>Đối tác cùng kiểm tra:</strong> ${partnerName}</div>
                    <div><strong>Thanh toán:</strong> <span style="color:#059669;font-weight:700;">Đã ký quỹ 100% qua sàn AZU Car</span></div>
                </div>

                <form id="azuHandoverForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="azu-tm-form-group">
                            <label for="tmOdometer">Số km Odometer <span class="req">*</span></label>
                            <input type="number" id="tmOdometer" class="azu-tm-input" placeholder="${isPickup ? 'Ví dụ: 35200' : 'Ví dụ: 35560'}" required min="0">
                            <small class="azu-tm-hint">Số km hiển thị trên tablo xe</small>
                        </div>

                        <div class="azu-tm-form-group">
                            <label for="tmFuelLevel">Mức nhiên liệu / Pin <span class="req">*</span></label>
                            <select id="tmFuelLevel" class="azu-tm-select" required>
                                <option value="100%" selected>100% (Đầy bình / Đầy pin)</option>
                                <option value="7/8">7/8 bình</option>
                                <option value="3/4">3/4 bình</option>
                                <option value="1/2">1/2 bình</option>
                                <option value="1/4">1/4 bình</option>
                                <option value="E">Mức báo vàng (Cần nạp)</option>
                            </select>
                        </div>
                    </div>

                    ${isPickup ? `
                        <div class="azu-tm-form-group">
                            <label>Trạng thái thanh toán tiền thuê xe</label>
                            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:10px 14px;color:#065f46;font-size:13px;display:flex;align-items:center;gap:10px;">
                                <i class="fa-solid fa-circle-check" style="font-size:18px;color:#10b981;flex-shrink:0;"></i>
                                <span><strong>Đã thanh toán 100% trực tuyến qua Ký quỹ Sàn AZU Car.</strong> Khách thuê không phải trả tiền thuê tại điểm nhận xe.</span>
                            </div>
                            <input type="hidden" id="tmPaymentMethod" value="online_escrow_100pct" />
                        </div>
                    ` : `
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:14px;">
                            <label style="font-size:13px;font-weight:700;display:block;margin-bottom:8px;color:#1e293b;">
                                <i class="fa-solid fa-receipt" style="color:#00a550;"></i> Phụ phí phát sinh trong chuyến (nếu có)
                            </label>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                                <div>
                                    <small style="color:#64748b;display:block;margin-bottom:3px;">Phí vượt km (VNĐ):</small>
                                    <input type="number" id="tmFeeKm" class="azu-tm-input" placeholder="0" min="0" step="1000">
                                </div>
                                <div>
                                    <small style="color:#64748b;display:block;margin-bottom:3px;">Phí trễ giờ (VNĐ):</small>
                                    <input type="number" id="tmFeeOvertime" class="azu-tm-input" placeholder="0" min="0" step="10000">
                                </div>
                                <div>
                                    <small style="color:#64748b;display:block;margin-bottom:3px;">Phí vệ sinh bẩn (VNĐ):</small>
                                    <input type="number" id="tmFeeClean" class="azu-tm-input" placeholder="0" min="0" step="10000">
                                </div>
                                <div>
                                    <small style="color:#64748b;display:block;margin-bottom:3px;">Phí khử mùi (VNĐ):</small>
                                    <input type="number" id="tmFeeDeodor" class="azu-tm-input" placeholder="0" min="0" step="50000">
                                </div>
                            </div>
                        </div>
                    `}

                    <div class="azu-tm-form-group">
                        <label for="tmNotes">Ghi chú hiện trạng phương tiện</label>
                        <textarea id="tmNotes" class="azu-tm-textarea" rows="2" placeholder="${isPickup ? 'Ghi nhận vết trầy xước có sẵn, vệ sinh khoang lái, giấy tờ xe...' : 'Ghi nhận tình trạng xe khi hoàn trả, thỏa thuận phụ phí đã thu...' }"></textarea>
                    </div>

                    <label class="azu-tm-agree-wrap">
                        <input type="checkbox" id="tmAgreeCheck" required>
                        <span>Tôi xác nhận đã cùng đối tác đồng kiểm thực tế các thông số trên và đồng ý ký xác nhận biên bản điện tử.</span>
                    </label>

                    <div class="azu-tm-actions">
                        <button type="button" class="azu-tm-btn btn-cancel azu-tm-btn-close">Hủy bỏ</button>
                        <button type="submit" class="azu-tm-btn ${isPickup ? 'btn-primary' : 'btn-return'}" id="azuTmSubmitBtn">
                            <i class="fa-solid ${isPickup ? 'fa-check' : 'fa-flag-checkered'}"></i>
                            ${isPickup ? 'Ký biên bản &amp; Nhận xe' : 'Nghiệm thu &amp; Hoàn tất trả xe'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const closeFn = () => {
            modal.remove();
        };

        modal.querySelectorAll('.azu-tm-close, .azu-tm-btn-close').forEach(b => b.addEventListener('click', closeFn));
        modal.addEventListener('click', (e) => { if (e.target === modal) closeFn(); });

        const form = modal.querySelector('#azuHandoverForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = modal.querySelector('#azuTmSubmitBtn');
            const odo = modal.querySelector('#tmOdometer')?.value;
            const fuel = modal.querySelector('#tmFuelLevel')?.value || '100%';
            const notes = modal.querySelector('#tmNotes')?.value.trim() || '';
            const payMethod = 'online_escrow_100pct';

            // If return, append surcharges to notes if any
            let finalNotes = notes;
            if (!isPickup) {
                const feeKm = Number(modal.querySelector('#tmFeeKm')?.value) || 0;
                const feeOt = Number(modal.querySelector('#tmFeeOvertime')?.value) || 0;
                const feeCl = Number(modal.querySelector('#tmFeeClean')?.value) || 0;
                const feeDe = Number(modal.querySelector('#tmFeeDeodor')?.value) || 0;
                const totalSur = feeKm + feeOt + feeCl + feeDe;
                if (totalSur > 0) {
                    finalNotes = `[Phụ phí: ${totalSur.toLocaleString('vi-VN')} đ (Km: ${feeKm}, Trễ: ${feeOt}, Vệ sinh: ${feeCl}, Khử mùi: ${feeDe})] ${notes}`.trim();
                }
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                const endpoint = `/api/bookings/${trip.bookingId}/${isPickup ? 'pickup' : 'return'}`;
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: isPickup ? 'Pickup' : 'Return',
                        odometer: odo ? Number(odo) : null,
                        fuelLevel: fuel,
                        notes: finalNotes,
                        remainingPaymentMethod: payMethod
                    })
                });
                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    alert(isPickup
                        ? 'Xác nhận nhận xe thành công! Chúc bạn có một hành trình an toàn.'
                        : 'Nghiệm thu và trả xe thành công! Cảm ơn bạn đã sử dụng dịch vụ của AZU Car.');
                    closeFn();
                    if (typeof onSuccess === 'function') onSuccess(data.data);
                } else {
                    alert('Lỗi: ' + (data?.message || 'Không thể thực hiện thao tác'));
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối máy chủ.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid ${isPickup ? 'fa-check' : 'fa-flag-checkered'}"></i> ${isPickup ? 'Ký biên bản &amp; Nhận xe' : 'Nghiệm thu &amp; Hoàn tất trả xe'}`;
                }
            }
        });
    }

    // Modal 2: Cảnh báo Hủy chuyến & Hệ quả tài chính (Phạt 8% / Mất cọc 25%)
    function openCancelBookingModal({ trip, isOwner = false, onSuccess = null }) {
        if (!trip || !trip.bookingId) return;
        ensureStyles();

        const modal = document.createElement('div');
        modal.className = 'azu-tm-overlay';

        const carName = trip.vehicleName || 'Xe tự lái AZU';
        const plate = trip.licensePlate ? `(${trip.licensePlate})` : '';
        const totalPrice = Number(trip.priceLockedTotal || 0);
        const depositPrice = Number(trip.depositAmount || 0);
        const ownerPenalty = Math.round(totalPrice * 0.08); // 8% theo quy định mới
        const isPending = (trip.status === 'Pending');

        let warningHtml = '';
        if (isPending) {
            warningHtml = `
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:#1e40af;line-height:1.45;">
                    <i class="fa-solid fa-circle-info" style="color:#2563eb;margin-right:4px;"></i>
                    <strong>Đơn thuê đang trong trạng thái Chờ duyệt:</strong>
                    Hủy chuyến lúc này hoàn toàn miễn phí. Toàn bộ tiền cọc <strong>${depositPrice.toLocaleString('vi-VN')} đ (100% tiền cọc)</strong> sẽ được giải phóng hoàn trả về tài khoản của bạn.
                </div>
            `;
        } else if (!isOwner) {
            // Renter Cancelling Accepted Booking
            warningHtml = `
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;margin-bottom:16px;font-size:13px;color:#991b1b;line-height:1.5;">
                    <div style="display:flex;align-items:center;gap:6px;font-weight:700;margin-bottom:6px;color:#b91c1c;">
                        <i class="fa-solid fa-triangle-exclamation"></i> CẢNH BÁO TÀI CHÍNH KHI HỦY CHUYẾN ĐÃ DUYỆT
                    </div>
                    Đơn thuê đã được chủ xe phê duyệt và xe đã được giữ lịch. Theo Điều 4.3 Chính sách hủy chuyến AZU Car:
                    <ul style="margin:6px 0 0 0;padding-left:18px;">
                        <li><strong>Toàn bộ tiền ký quỹ (${depositPrice.toLocaleString('vi-VN')} đ) SẼ KHÔNG ĐƯỢC HOÀN LẠI</strong> để bồi thường chi phí giữ lịch của chủ xe.</li>
                        <li>Số tiền ký quỹ sau khi trừ hoa hồng nền tảng sẽ được chuyển cho chủ xe.</li>
                    </ul>
                </div>
            `;
        } else {
            // Owner Cancelling Accepted Booking
            warningHtml = `
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;margin-bottom:16px;font-size:13px;color:#991b1b;line-height:1.5;">
                    <div style="display:flex;align-items:center;gap:6px;font-weight:700;margin-bottom:6px;color:#b91c1c;">
                        <i class="fa-solid fa-triangle-exclamation"></i> CẢNH BÁO CHẾ TÀI HỦY ĐƠN ĐỐI VỚI CHỦ XE
                    </div>
                    Đơn thuê đã được phê duyệt. Việc chủ xe chủ động hủy đơn gây ảnh hưởng trực tiếp đến kế hoạch của khách:
                    <ul style="margin:6px 0 0 0;padding-left:18px;">
                        <li>Khách thuê được <strong>hoàn tiền ký quỹ 100% (${depositPrice.toLocaleString('vi-VN')} đ)</strong> ngay lập tức.</li>
                        <li><strong>Chủ xe BỊ PHẠT 8% GIÁ TRỊ ĐƠN THUÊ: ${ownerPenalty.toLocaleString('vi-VN')} đ</strong> (khấu trừ vào kỳ chi trả doanh thu hoặc hạn chế quyền đăng xe theo chế tài hệ thống).</li>
                    </ul>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="azu-tm-card" role="dialog" aria-modal="true">
                <button type="button" class="azu-tm-close" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>
                
                <span class="azu-tm-badge cancel">
                    <i class="fa-solid fa-triangle-exclamation"></i> Hủy chuyến đi
                </span>
                
                <h3 class="azu-tm-title">Xác nhận hủy đơn thuê #${trip.bookingId}</h3>
                <p class="azu-tm-subtitle">Vui lòng kiểm tra kỹ hệ quả tài chính theo chính sách sàn trước khi xác nhận.</p>

                <div class="azu-tm-trip-info">
                    <div><strong>Phương tiện:</strong> ${carName} ${plate}</div>
                    <div><strong>Giá trị đơn thuê:</strong> ${totalPrice.toLocaleString('vi-VN')} đ</div>
                    <div><strong>Tiền thanh toán ký quỹ:</strong> ${depositPrice.toLocaleString('vi-VN')} đ</div>
                </div>

                ${warningHtml}

                <form id="azuCancelForm">
                    <div class="azu-tm-form-group">
                        <label for="tmCancelReasonSelect">Lý do hủy đơn <span class="req">*</span></label>
                        <select id="tmCancelReasonSelect" class="azu-tm-select" required>
                            <option value="Thay đổi kế hoạch di chuyển" selected>Thay đổi kế hoạch di chuyển</option>
                            <option value="Sự cố cá nhân đột xuất">Sự cố cá nhân đột xuất</option>
                            <option value="Thời tiết xấu / Bão lũ">Thời tiết xấu / Bão lũ</option>
                            <option value="Tìm được phương tiện khác">Tìm được phương tiện khác</option>
                            <option value="custom">Lý do khác...</option>
                        </select>
                    </div>

                    <div class="azu-tm-form-group" id="tmCancelCustomWrap" style="display:none;">
                        <label for="tmCancelReasonText">Mô tả lý do chi tiết <span class="req">*</span></label>
                        <textarea id="tmCancelReasonText" class="azu-tm-textarea" rows="2" placeholder="Nhập lý do hủy..."></textarea>
                    </div>

                    <div class="azu-tm-actions">
                        <button type="button" class="azu-tm-btn btn-cancel azu-tm-btn-close">Giữ lại chuyến đi</button>
                        <button type="submit" class="azu-tm-btn btn-danger" id="azuTmCancelSubmitBtn">
                            <i class="fa-solid fa-xmark"></i> Xác nhận hủy chuyến
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const closeFn = () => modal.remove();
        modal.querySelectorAll('.azu-tm-close, .azu-tm-btn-close').forEach(b => b.addEventListener('click', closeFn));
        modal.addEventListener('click', (e) => { if (e.target === modal) closeFn(); });

        const reasonSelect = modal.querySelector('#tmCancelReasonSelect');
        const customWrap = modal.querySelector('#tmCancelCustomWrap');
        const customInput = modal.querySelector('#tmCancelReasonText');
        if (reasonSelect && customWrap) {
            reasonSelect.addEventListener('change', () => {
                customWrap.style.display = reasonSelect.value === 'custom' ? 'block' : 'none';
                if (reasonSelect.value === 'custom' && customInput) customInput.focus();
            });
        }

        const form = modal.querySelector('#azuCancelForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = modal.querySelector('#azuTmCancelSubmitBtn');
            let reason = reasonSelect?.value || 'Khách thuê chủ động hủy đơn';
            if (reason === 'custom') {
                reason = customInput?.value.trim() || 'Lý do cá nhân khác';
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang hủy đơn...';

            try {
                const res = await fetch(`/api/bookings/${trip.bookingId}/cancel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: reason })
                });
                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    if (isPending) {
                        alert('Đã hủy chuyến thành công. Toàn bộ tiền ký quỹ đã được hoàn trả lại cho bạn.');
                    } else if (!isOwner) {
                        alert('Đã hủy chuyến. Tiền ký quỹ đã được xử lý bồi thường theo Điều khoản hủy chuyến.');
                    } else {
                        alert(`Đã hủy chuyến. Khoản phạt 8% (${ownerPenalty.toLocaleString('vi-VN')} đ) đã được ghi nhận vào hệ thống.`);
                    }
                    closeFn();
                    if (typeof onSuccess === 'function') onSuccess(data.data);
                } else {
                    alert('Lỗi: ' + (data?.message || 'Không thể hủy chuyến lúc này'));
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối máy chủ.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Xác nhận hủy chuyến';
                }
            }
        });
    }

    window.AzuTripModal = {
        openHandoverModal,
        openCancelBookingModal
    };
})();
