(() => {
    const pageEl = document.getElementById('booking-detail-page');
    const tripDetailView = document.getElementById('trip-detail-view');
    const bookingId = pageEl?.dataset.bookingId || window.location.pathname.split('/').filter(Boolean).pop() || '';

    if (window.AzuStore && !window.AzuStore.isLoggedIn()) {
        window.AzuStore.requireLogin(window.location.pathname + window.location.search);
        return;
    }

    let currentBooking = null;
    let currentTab = 'overview';

    function escapeHtml(value) {
        return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    }

    function formatDate(value, includeTime = false) {
        if (!value) return '—';
        let s = String(value);
        if (s.includes('T') && !s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
            s += 'Z';
        }
        const date = new Date(s);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            ...(includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' })
        });
    }

    function formatMoney(value) {
        return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
    }

    function detailRow(label, value) {
        return `<div class="trip-detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '—')}</strong></div>`;
    }

    function getStatusBadgeInfo(status) {
        switch (status) {
            case 'Pending':
                return { text: 'Chờ chủ xe duyệt', bg: '#fef3c7', color: '#b45309' };
            case 'Accepted':
                return { text: 'Đã duyệt (Chờ nhận xe)', bg: '#dbeafe', color: '#1d4ed8' };
            case 'Ongoing':
                return { text: 'Đang thuê (Đang trong chuyến)', bg: '#e0e7ff', color: '#4338ca' };
            case 'Completed':
                return { text: 'Đã hoàn tất', bg: '#dcfce7', color: '#15803d' };
            case 'Cancelled':
                return { text: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' };
            case 'Rejected':
                return { text: 'Chủ xe từ chối', bg: '#fee2e2', color: '#b91c1c' };
            case 'Expired':
                return { text: 'Hết hạn duyệt', bg: '#f3f4f6', color: '#6b7280' };
            default:
                return { text: status || 'Không rõ', bg: '#f1f5f9', color: '#475569' };
        }
    }

    function renderRentalMonth(year, month, booking) {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        const firstDay = new Date(year, month, 1);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const dayCount = new Date(year, month + 1, 0).getDate();
        const startKey = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        const endKey = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rangeContainsDay = (ranges, dateKey) => (ranges || []).some(range => {
            const rangeStart = new Date(range.startDate);
            const rangeEnd = new Date(range.endDate);
            return dateKey >= new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()).getTime() &&
                dateKey <= new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate()).getTime();
        });
        const cells = Array.from({ length: startOffset }, () => '<span class="trip-calendar-day is-empty"></span>');

        for (let day = 1; day <= dayCount; day++) {
            const dateKey = new Date(year, month, day).getTime();
            const isRentalDay = dateKey >= startKey && dateKey <= endKey;
            const isBusy = rangeContainsDay(booking.bookedRanges, dateKey);
            const isOwnerBlocked = rangeContainsDay(booking.blockedRanges, dateKey);
            const isAvailable = booking.isVehicleAvailableForRent && dateKey >= today.getTime() && !isBusy && !isOwnerBlocked && !isRentalDay;
            const classes = [
                'trip-calendar-day',
                isRentalDay ? 'is-current-booking' : '',
                !isRentalDay && isBusy ? 'is-busy' : '',
                !isRentalDay && !isBusy && isOwnerBlocked ? 'is-owner-blocked' : '',
                isAvailable ? 'is-available' : '',
                dateKey < today.getTime() ? 'is-past' : '',
                dateKey === startKey ? 'is-start' : '',
                dateKey === endKey ? 'is-end' : ''
            ].filter(Boolean).join(' ');
            cells.push(`<span class="${classes}">${day}</span>`);
        }

        return `<section class="trip-calendar-month" aria-label="${escapeHtml(new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }))}">
            <strong>${escapeHtml(new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }))}</strong>
            <div class="trip-calendar-grid"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>${cells.join('')}</div>
        </section>`;
    }

    function renderRentalCalendar(booking) {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '';

        const months = [];
        const monthCursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        while (monthCursor <= lastMonth) {
            months.push([monthCursor.getFullYear(), monthCursor.getMonth()]);
            monthCursor.setMonth(monthCursor.getMonth() + 1);
        }
        const listingActive = booking.isVehicleAvailableForRent;
        return `<div class="trip-availability-status ${listingActive ? 'is-active' : 'is-inactive'}">
            <i class="fa-solid ${listingActive ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
            ${listingActive ? 'Xe đang hoạt động cho thuê' : 'Tin xe hiện không hoạt động cho thuê'}
        </div>
        <div class="trip-rental-months">${months.map(([year, month]) => renderRentalMonth(year, month, booking)).join('')}</div>
        <div class="trip-calendar-legend">
            <span><i class="is-available"></i> Còn trống</span>
            <span><i class="is-current-booking"></i> Đơn này</span>
            <span><i class="is-busy"></i> Có đơn khác</span>
            <span><i class="is-owner-blocked"></i> Chủ xe đã khóa ngày</span>
        </div>`;
    }

    function getIsOwner(booking) {
        const currentUserId = sessionStorage.getItem('azuCarUserId') || '';
        return Boolean(currentUserId && booking.ownerId === currentUserId && booking.renterId !== currentUserId);
    }

    function renderBookingMarkup(booking, tab = 'overview') {
        const status = booking.status || '';
        const badge = getStatusBadgeInfo(status);
        const isAccepted = ['Accepted', 'Ongoing', 'Completed', 'Returned', 'InRental', 'Approved'].includes(status);
        const isCancelled = ['Cancelled', 'Rejected', 'Expired'].includes(status);
        const statusIndex = status === 'Completed' ? 3 : status === 'Ongoing' ? 2 : isAccepted ? 1 : 0;
        const steps = ['Chờ duyệt', 'Đã duyệt', 'Đang thuê', 'Hoàn tất'];
        const milestones = [
            formatDate(booking.createdAt, true),
            booking.acceptedAt ? formatDate(booking.acceptedAt, true) : 'Chờ chủ xe',
            booking.hasPickupConfirmed ? 'Đã xác nhận nhận xe' : 'Chưa nhận xe',
            booking.completedAt ? formatDate(booking.completedAt, true) : 'Chưa hoàn tất'
        ];
        const stepMarkup = steps.map((label, index) => `
            <div class="trip-progress-step ${index <= statusIndex && !isCancelled ? 'is-reached' : ''}">
                <span class="trip-progress-dot">${index + 1}</span>
                <strong>${label}</strong>
                <small>${escapeHtml(milestones[index])}</small>
            </div>`).join('');

        const handovers = Array.isArray(booking.handovers) ? booking.handovers : [];
        const currentUserId = sessionStorage.getItem('azuCarUserId') || '';
        const isOwner = getIsOwner(booking);
        const backHref = isOwner ? '/owner#quan-ly-chuyen-content' : '/account#trips';
        const backLabel = isOwner ? 'Quay lại quản lý chuyến' : 'Quay lại lịch sử thuê';
        const canCancel = status === 'Pending' || (status === 'Accepted' && new Date() < new Date(booking.startDate));

        const renderHandover = (type, title, allowed) => {
            const confirmations = handovers.filter(item => String(item.type).toLowerCase() === type.toLowerCase());
            const action = type.toLowerCase();
            const userConfirmation = confirmations.find(item => item.confirmedBy === currentUserId);
            const isComplete = confirmations.length >= 2;
            const statusText = userConfirmation
                ? 'Bạn đã xác nhận'
                : isComplete ? 'Hai bên đã xác nhận' : confirmations.length ? 'Chờ bên còn lại' : 'Chưa xác nhận';
            const actionButtonText = action === 'pickup'
                ? (isOwner ? 'bàn giao xe' : 'nhận xe')
                : (isOwner ? 'nhận lại xe' : 'trả xe');
            const formMarkup = allowed && !userConfirmation ? `<form class="trip-handover-form" data-handover-form="${action}">
                <label>Số công-tơ-mét (km)<input name="odometer" type="number" min="0" inputmode="numeric" placeholder="Không bắt buộc"></label>
                <label>Mức nhiên liệu<select name="fuelLevel"><option value="">Chọn mức</option><option>1/4 bình</option><option>1/2 bình</option><option>3/4 bình</option><option>Đầy bình</option></select></label>
                <label class="trip-handover-notes">Ghi chú tình trạng<textarea name="notes" maxlength="1000" rows="2" placeholder="Không bắt buộc"></textarea></label>
                <button type="button" class="trip-detail-action is-primary" data-trip-detail-action="${action}">Xác nhận ${actionButtonText}</button>
            </form>` : '';
            return `<article class="trip-handover-card">
                <div class="trip-detail-title-row"><h3>${title}</h3><span class="trip-detail-state ${userConfirmation ? 'is-done' : ''}">${statusText}</span></div>
                ${confirmations.length ? confirmations.map(item => `<p>${escapeHtml(item.confirmerName || 'Thành viên')} · ${escapeHtml(formatDate(item.confirmedAt, true))}${item.odometer != null ? ` · ${escapeHtml(item.odometer)} km` : ''}${item.fuelLevel ? ` · ${escapeHtml(item.fuelLevel)}` : ''} · Thanh toán 100% online</p>${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}`).join('') : '<p>Chưa có xác nhận.</p>'}
                ${formMarkup}
            </article>`;
        };

        const renderTasks = () => {
            let title = 'Đơn thuê đã kết thúc';
            let description = 'Bạn có thể xem lại thông tin và biên bản của chuyến này.';
            let actions = '';

            if (status === 'Pending') {
                if (isOwner) {
                    title = 'Yêu cầu thuê xe mới';
                    description = `Khách thuê ${escapeHtml(booking.renterName || 'Khách')} đã đặt cọc và đang chờ bạn phê duyệt.`;
                    actions = '<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="respond-accept">Duyệt đơn</button><button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="respond-reject">Từ chối</button>';
                } else {
                    title = 'Đang chờ chủ xe duyệt';
                    description = 'Lịch xe đang được giữ trong thời gian chờ phản hồi.';
                    actions = '<button type="button" class="trip-detail-action is-danger" data-trip-detail-action="cancel">Hủy đơn</button>';
                }
            } else if (status === 'Accepted') {
                title = 'Đơn đã được duyệt';
                description = isOwner
                    ? 'Đơn thuê đã được duyệt. Vui lòng chuẩn bị phương tiện theo lịch hẹn.'
                    : 'Đơn thuê đã được duyệt thành công. Vui lòng liên hệ chủ xe để nhận xe theo lịch hẹn.';
                actions = `${canCancel ? '<button type="button" class="trip-detail-action is-danger" data-trip-detail-action="cancel">Hủy đơn</button>' : ''}`;
            } else if (status === 'Ongoing') {
                const renterConfirmed = handovers.some(item => String(item.type).toLowerCase() === 'return' && item.confirmedBy === booking.renterId);
                const ownerConfirmed = handovers.some(item => String(item.type).toLowerCase() === 'return' && item.confirmedBy === booking.ownerId);
                if (isOwner) {
                    if (renterConfirmed && !ownerConfirmed) {
                        title = 'Khách thuê đã gửi biên bản trả xe';
                        description = 'Khách thuê đã bàn giao trả xe. Vui lòng kiểm tra xe thực tế (ODO, nhiên liệu, thân vỏ, phạt nguội) trước khi nghiệm thu hoàn tất.';
                        actions = `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Nghiệm thu nhận lại xe</button>${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                    } else if (ownerConfirmed) {
                        title = 'Đã hoàn tất nghiệm thu';
                        description = 'Bạn đã xác nhận nhận lại xe.';
                    } else {
                        title = 'Chuyến đang diễn ra';
                        description = 'Mở biên bản nhận lại xe khi khách trả xe để kiểm tra và kết thúc chuyến.';
                        actions = `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Mở biên bản nhận lại xe</button>${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                    }
                } else {
                    if (renterConfirmed) {
                        title = 'Đã gửi biên bản trả xe';
                        description = 'Đang chờ chủ xe kiểm tra thực tế và xác nhận nghiệm thu hoàn tất chuyến đi.';
                        actions = `${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                    } else {
                        title = 'Chuyến đang diễn ra';
                        description = 'Mở biên bản trả xe để ghi nhận tình trạng xe và bàn giao cho chủ xe.';
                        actions = `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Mở biên bản trả xe</button>${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                    }
                }
            } else if (status === 'Completed') {
                title = 'Chuyến đã hoàn tất';
                description = isOwner ? 'Chuyến đi đã hoàn tất quyết toán. Chia sẻ đánh giá về khách thuê.' : 'Chuyến đi đã hoàn tất quyết toán. Chia sẻ đánh giá về chuyến đi.';
                actions = `${!booking.hasReviewed ? `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="review">${isOwner ? 'Đánh giá khách thuê' : 'Đánh giá chuyến đi'}</button>` : '<span class="trip-detail-state is-done"><i class="fa-solid fa-check"></i> Đã đánh giá</span>'}${booking.hasDispute ? `<span class="trip-detail-state" style="margin-left: 8px;">Khiếu nại: ${escapeHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute" style="margin-left: 8px;">Khiếu nại sau chuyến</button>'}`;
            }

            return `<section class="trip-detail-task" aria-labelledby="trip-detail-task-title">
                <div><h3 id="trip-detail-task-title">${title}</h3><p>${description}</p></div>
                <div class="trip-detail-task-actions">${actions}</div>
                <p class="trip-detail-action-feedback" role="status" aria-live="polite"></p>
            </section>`;
        };

        let tabContent = '';
        if (tab === 'handover') {
            tabContent = `<div class="trip-handover-grid">
                ${renderHandover('Pickup', isOwner ? 'Bàn giao xe' : 'Nhận xe', ['Accepted', 'Ongoing'].includes(status))}
                ${renderHandover('Return', isOwner ? 'Nhận lại xe' : 'Trả xe', status === 'Ongoing')}
            </div>
            ${booking.hasDispute ? `<div class="trip-detail-notice is-warning">Đơn có khiếu nại: ${escapeHtml(booking.disputeStatus || 'Đang xử lý')}.</div>` : ''}`;
        } else if (tab === 'contract') {
            const reviews = Array.isArray(booking.reviews) ? booking.reviews : [];
            tabContent = `<div class="trip-detail-section">
                <h3>Thông tin hợp đồng</h3>
                ${detailRow('Mã đơn', `#${booking.bookingId}`)}
                ${detailRow('Người thuê', booking.renterName)}
                ${detailRow('Chủ xe', booking.ownerName)}
                ${detailRow('Nhận xe', formatDate(booking.startDate, true))}
                ${detailRow('Trả xe', formatDate(booking.endDate, true))}
                ${detailRow('Tổng thời gian thuê', `${booking.rentalDays || 0} ngày`)}
                ${booking.pricePerDayAtBooking != null ? detailRow('Giá thuê cơ bản mỗi ngày', formatMoney(booking.pricePerDayAtBooking)) : ''}
                ${detailRow('Tổng giá thuê', formatMoney(booking.priceLockedTotal))}
                ${detailRow('Ngày đặt', formatDate(booking.createdAt, true))}
                ${booking.responseDeadline ? detailRow('Hạn phản hồi', formatDate(booking.responseDeadline, true)) : ''}
                ${booking.rejectReason ? detailRow('Lý do từ chối', booking.rejectReason) : ''}
                ${booking.cancelReason ? detailRow('Lý do hủy', booking.cancelReason) : ''}
                <div class="trip-detail-clauses">
                    <h4>Điều khoản áp dụng</h4>
                    <ul>
                        <li>Thanh toán 100% online tổng giá thuê qua sàn AZU Car; không trả tiền thuê bằng tiền mặt khi nhận xe.</li>
                        <li>Chỉ có thể hủy khi đơn đang chờ duyệt hoặc đã được duyệt; đơn đã duyệt không thể hủy từ thời điểm nhận xe.</li>
                        <li>Nếu phát sinh sự cố trong quá trình giao nhận hoặc vận hành xe, gửi báo sự cố kèm bằng chứng để Staff xác minh và xử lý theo quy trình khiếu nại.</li>
                    </ul>
                </div>
                <div class="trip-terms-consent">
                    ${booking.termsAcceptedAt
                        ? `<span class="trip-terms-confirmed"><i class="fa-solid fa-circle-check"></i> Đã đồng ý lúc ${escapeHtml(formatDate(booking.termsAcceptedAt, true))}</span>`
                        : `<label><input type="checkbox" data-trip-terms-checkbox><span>Tôi đã đọc và đồng ý với các điều khoản trên.</span></label><button type="button" class="trip-detail-action is-primary" data-trip-detail-action="accept-terms" disabled>Xác nhận đồng ý</button>`}
                </div>
                <button type="button" class="trip-detail-action is-secondary trip-print-contract" data-trip-detail-action="print"><i class="fa-solid fa-print"></i> In / Lưu PDF</button>
            </div>
            ${reviews.length ? `<div class="trip-detail-section"><h3>Đánh giá</h3>${reviews.map(review => `<p class="trip-detail-review"><strong>${escapeHtml(review.rating)} / 5</strong> · ${escapeHtml(review.comment || 'Không có nhận xét.')}</p>`).join('')}</div>` : ''}`;
        } else {
            const vehicleName = booking.vehicleName || 'Xe thuê';
            const image = window.AzuVehicleImages?.resolve(vehicleName, booking.coverImageUrl || '') || booking.coverImageUrl || '';
            const hasPriceBreakdown = booking.pricePerDayAtBooking != null &&
                booking.rentalSubtotal != null && booking.deliveryFee != null && booking.insuranceFee != null;
            const rentalSubtotal = hasPriceBreakdown ? Number(booking.rentalSubtotal) : Number(booking.priceLockedTotal || 0);
            const extraFees = hasPriceBreakdown ? Number(booking.deliveryFee) + Number(booking.insuranceFee) : null;
            const feeNotes = hasPriceBreakdown
                ? [
                    Number(booking.deliveryFee) > 0 ? `Giao xe ${formatMoney(booking.deliveryFee)}` : '',
                    Number(booking.insuranceFee) > 0 ? `Bảo hiểm ${formatMoney(booking.insuranceFee)}` : ''
                ].filter(Boolean).join(' · ') || 'Chưa phát sinh'
                : 'Chi tiết phí chưa được lưu cho đơn cũ';
            const rawDepositStatus = String(booking.depositStatus || '').toLowerCase();
            const depositLabel = rawDepositStatus === 'refunded'
                ? 'Đã hoàn cọc'
                : rawDepositStatus === 'forfeited'
                    ? 'Đã xử lý theo đơn'
                    : rawDepositStatus === 'cancelled' || rawDepositStatus === 'canceled'
                        ? 'Đã giải phóng'
                        : status === 'Pending'
                            ? 'Đang giữ · chờ duyệt'
                            : status === 'Completed'
                                ? 'Đã quyết toán'
                                : 'Đang giữ';

            tabContent = `<div class="trip-detail-columns">
                <div class="trip-detail-section">
                    <div class="trip-detail-vehicle">
                        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(vehicleName)}">` : '<div class="trip-detail-image-placeholder"><i class="fa-solid fa-car-side"></i></div>'}
                        <div><h3>${escapeHtml(vehicleName)}</h3><p>${escapeHtml(booking.city || 'Chưa có địa điểm')}${booking.district ? ` · ${escapeHtml(booking.district)}` : ''}</p>
                        ${booking.licensePlate ? `<p class="trip-detail-plate"><span>Biển số</span><strong>${escapeHtml(booking.licensePlate)}</strong></p>` : ''}</div>
                    </div>
                    <h3>Lịch trình</h3>
                    ${detailRow('Nhận xe', formatDate(booking.startDate, true))}
                    ${detailRow('Trả xe', formatDate(booking.endDate, true))}
                    ${detailRow('Thời gian thuê', `${booking.rentalDays || 0} ngày`)}
                    <details class="trip-rental-calendar" open><summary>Lịch hoạt động &amp; ngày bận</summary>${renderRentalCalendar(booking)}</details>
                    ${(status === 'Accepted' || status === 'Ongoing') ? (() => {
                        const endDt = new Date(booking.endDate);
                        const pad = n => String(n).padStart(2, '0');
                        const localMin = Number.isNaN(endDt.getTime()) ? '' : `${endDt.getFullYear()}-${pad(endDt.getMonth() + 1)}-${pad(endDt.getDate())}T${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`;
                        const nextDay = new Date(endDt.getTime() + 86400000);
                        const localVal = Number.isNaN(nextDay.getTime()) ? '' : `${nextDay.getFullYear()}-${pad(nextDay.getMonth() + 1)}-${pad(nextDay.getDate())}T${pad(nextDay.getHours())}:${pad(nextDay.getMinutes())}`;
                        return `<div class="trip-extend-box" style="margin-top: 14px; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px;">
                            <h4 style="margin: 0 0 6px; font-size: 14px; color: #0f172a;"><i class="fa-regular fa-calendar-plus" style="color: #059669;"></i> Thuê thêm ngày (nếu lịch trống)</h4>
                            <p style="margin: 0 0 10px; font-size: 12.5px; color: #475569;">Gia hạn ngày trả xe nếu xe chưa có lịch đặt khác. Không áp dụng phí đệm 2h hay tiền phạt; tiền thuê thêm chỉ thanh toán ở cuối chuyến.</p>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <input type="datetime-local" id="extendEndDateInput" min="${escapeHtml(localMin)}" value="${escapeHtml(localVal)}" style="padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;">
                                <button type="button" class="trip-detail-action is-primary" data-trip-detail-action="extend">Xác nhận thuê thêm</button>
                            </div>
                            <p class="trip-extend-feedback" style="margin: 8px 0 0; font-size: 12.5px; color: #b91c1c;" role="status"></p>
                        </div>`;
                    })() : ''}
                    ${detailRow('Hình thức nhận xe', booking.deliveryMethod || 'Nhận tại địa điểm xe')}
                    ${booking.deliveryAddress ? detailRow('Địa chỉ giao xe', booking.deliveryAddress) : ''}
                    <h3 class="trip-detail-subheading">Thông tin khách hàng</h3>
                    ${detailRow('Khách thuê', booking.renterName || (isOwner ? 'Khách thuê' : 'Tôi'))}
                    ${detailRow('Số điện thoại', booking.renterPhone || 'Chưa cung cấp')}
                    ${isOwner ? '' : `
                    <h3 class="trip-detail-subheading">Liên hệ chủ xe</h3>
                    ${detailRow('Chủ xe', booking.ownerName || 'Chủ xe')}
                    ${detailRow('Số điện thoại', booking.ownerPhone || 'Chưa cung cấp')}
                    `}
                </div>
                <aside class="trip-detail-payment">
                    <h3>Cọc &amp; thanh toán</h3>
                    <div class="trip-payment-line">
                        <div><span>Giá thuê</span>${hasPriceBreakdown ? `<small>${formatMoney(booking.pricePerDayAtBooking)} × ${booking.rentalDays || 0} ngày</small>` : ''}</div>
                        <strong>${formatMoney(rentalSubtotal)}</strong>
                    </div>
                    <div class="trip-payment-line">
                        <div><span>Phụ phí phát sinh</span>${extraFees && extraFees > 0 ? `<small>${escapeHtml(feeNotes)}</small>` : ''}</div>
                        <strong>${extraFees && extraFees > 0 ? formatMoney(extraFees) : '0 đ'}</strong>
                    </div>
                    <div class="trip-payment-total"><span>Tổng giá trị thuê</span><strong>${formatMoney(booking.priceLockedTotal)}</strong></div>
                    <div class="trip-payment-deposit">
                        <div class="trip-payment-line">
                            <div><span>Tiền cọc đã đặt</span><span class="trip-payment-status">${escapeHtml(depositLabel)}</span><small>Mất tiền cọc khi hủy chuyến đã duyệt</small></div>
                            <strong>${formatMoney(booking.depositAmount)}</strong>
                        </div>
                        <div class="trip-payment-line" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
                            <div><span>Còn lại trả ở cuối chuyến</span><small>Bao gồm tiền thuê thêm ngày (nếu có)</small></div>
                            <strong style="color: #059669;">${formatMoney(Math.max(0, Number(booking.priceLockedTotal || 0) - Number(booking.depositAmount || 0)))}</strong>
                        </div>
                        ${booking.depositReferenceCode ? `<div class="trip-payment-line" style="margin-top: 6px;"><div><span>Mã giao dịch</span></div><small>${escapeHtml(booking.depositReferenceCode)}</small></div>` : ''}
                    </div>
                </aside>
            </div>
            ${isCancelled ? `<div class="trip-detail-notice is-warning">${escapeHtml(booking.cancelReason || booking.rejectReason || badge.text)}</div>` : ''}`;
        }

        return `<div class="trip-detail-heading">
            <a class="trip-detail-back" href="${backHref}" style="text-decoration: none;"><i class="fa-solid fa-arrow-left"></i> ${backLabel}</a>
            <div class="trip-detail-title-row"><h2>Chi tiết đơn thuê #${escapeHtml(booking.bookingId)}</h2><span class="trip-status" style="background:${badge.bg};color:${badge.color}">${escapeHtml(badge.text)}</span></div>
        </div>
        <div class="trip-progress" aria-label="Tiến trình chuyến thuê">${stepMarkup}</div>
        ${renderTasks()}
        <div class="trip-detail-tabs" role="tablist" aria-label="Thông tin đơn thuê">
            <button type="button" role="tab" aria-selected="${tab === 'overview'}" data-trip-detail-tab="overview">Tổng quan</button>
            <button type="button" role="tab" aria-selected="${tab === 'handover'}" data-trip-detail-tab="handover">Giao &amp; trả xe</button>
            <button type="button" role="tab" aria-selected="${tab === 'contract'}" data-trip-detail-tab="contract">Hợp đồng</button>
        </div>
        ${tabContent}`;
    }

    function renderCurrent() {
        if (!tripDetailView || !currentBooking) return;
        tripDetailView.innerHTML = renderBookingMarkup(currentBooking, currentTab);
        const detailImage = tripDetailView.querySelector('.trip-detail-vehicle img');
        detailImage?.addEventListener('error', () => {
            detailImage.src = window.AzuVehicleImages?.placeholder || '';
        }, { once: true });
    }

    async function loadBooking() {
        if (!tripDetailView || !bookingId) return;
        try {
            const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
            const result = await response.json();
            if (!response.ok || !result?.isSuccess || !result.data) {
                throw new Error(result?.message || 'Không thể tải chi tiết đơn thuê.');
            }
            currentBooking = result.data;
            renderCurrent();
        } catch (error) {
            tripDetailView.innerHTML = `<a class="trip-detail-back" href="/owner" style="text-decoration: none;"><i class="fa-solid fa-arrow-left"></i> Quay lại</a><p class="trip-detail-error">${escapeHtml(error.message || 'Không thể tải chi tiết đơn thuê.')}</p>`;
        }
    }

    async function handleAction(action, button) {
        if (!currentBooking) return;
        if (action === 'print') {
            window.print();
            return;
        }
        if (action === 'handover') {
            currentTab = 'handover';
            renderCurrent();
            return;
        }
        const id = currentBooking.bookingId;
        if (action === 'extend') {
            const input = tripDetailView.querySelector('#extendEndDateInput');
            const fb = tripDetailView.querySelector('.trip-extend-feedback');
            if (!input || !input.value) {
                if (fb) fb.textContent = 'Vui lòng chọn thời gian trả xe mới.';
                return;
            }
            const newEnd = new Date(input.value);
            if (Number.isNaN(newEnd.getTime())) {
                if (fb) fb.textContent = 'Thời gian trả xe mới không hợp lệ.';
                return;
            }
            button.disabled = true;
            if (fb) fb.textContent = '';
            try {
                const resp = await fetch(`/api/bookings/${id}/extend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newEndDate: newEnd.toISOString() })
                });
                const resData = await resp.json();
                if (!resp.ok || !resData?.isSuccess) {
                    if (fb) fb.textContent = resData?.message || 'Không thể gia hạn lịch thuê.';
                    button.disabled = false;
                    return;
                }
                currentBooking = resData.data || currentBooking;
                renderCurrent();
                alert('Gia hạn thuê thêm ngày thành công! Phụ thu thuê thêm sẽ được thanh toán ở cuối chuyến.');
            } catch {
                if (fb) fb.textContent = 'Lỗi kết nối máy chủ.';
                button.disabled = false;
            }
            return;
        }
        const isOwner = getIsOwner(currentBooking);

        if (action === 'review') {
            const starsStr = prompt('Đánh giá chất lượng dịch vụ (từ 1 đến 5 sao):', '5');
            if (starsStr === null) return;
            const rating = parseInt(starsStr, 10);
            if (Number.isNaN(rating) || rating < 1 || rating > 5) {
                alert('Số sao không hợp lệ (vui lòng chọn từ 1 đến 5 sao).');
                return;
            }
            const comment = prompt('Nhận xét của bạn:', isOwner ? 'Khách thuê lịch sự, giữ xe sạch sẽ, trả xe đúng giờ.' : 'Xe đi rất êm, sạch sẽ, chủ xe nhiệt tình!');
            if (comment === null) return;
            button.disabled = true;
            try {
                const r = await fetch(`/api/bookings/${id}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating, comment: comment || 'Tuyệt vời!' })
                });
                const d = await r.json();
                if (r.ok && d.isSuccess) {
                    alert(d?.message || 'Cảm ơn bạn đã gửi đánh giá!');
                    await loadBooking();
                } else {
                    alert('Lỗi: ' + (d?.message || 'Không thể gửi đánh giá'));
                    button.disabled = false;
                }
            } catch {
                alert('Lỗi kết nối máy chủ.');
                button.disabled = false;
            }
            return;
        }

        let url = '';
        let body = {};
        let method = 'POST';

        if (action === 'respond-accept' || action === 'respond-reject') {
            const accept = action === 'respond-accept';
            const reason = accept ? null : prompt('Nhập lý do từ chối đơn:');
            if (!accept && reason === null) return;
            url = `/api/bookings/${id}/respond`;
            body = { accept, reason: reason ? reason.trim() : null };
            method = 'PUT';
        } else if (action === 'accept-terms') {
            const consent = tripDetailView.querySelector('[data-trip-terms-checkbox]');
            if (!consent?.checked) return;
            url = `/api/bookings/${id}/accept-terms`;
        } else if (action === 'pickup' || action === 'return') {
            url = `/api/bookings/${id}/${action}`;
            const form = tripDetailView.querySelector(`[data-handover-form="${action}"]`);
            const odometerValue = form?.elements.namedItem('odometer')?.value;
            body = {
                type: action === 'pickup' ? 'Pickup' : 'Return',
                odometer: odometerValue ? Number(odometerValue) : null,
                fuelLevel: form?.elements.namedItem('fuelLevel')?.value || null,
                notes: form?.elements.namedItem('notes')?.value.trim() || null,
                remainingPaymentMethod: 'online_escrow_100pct'
            };
        } else if (action === 'cancel') {
            if (window.AzuTripModal?.openCancelBookingModal) {
                window.AzuTripModal.openCancelBookingModal({
                    trip: currentBooking,
                    isOwner,
                    onSuccess: () => loadBooking()
                });
                return;
            }
            const reason = prompt('Nhập lý do hủy đơn:');
            if (reason === null) return;
            url = `/api/bookings/${id}/cancel`;
            body = { reason: reason.trim() || (isOwner ? 'Chủ xe chủ động hủy đơn' : 'Khách thuê chủ động hủy chuyến') };
        } else if (action === 'dispute') {
            if (window.AzuDisputeModal) {
                window.AzuDisputeModal.open({
                    bookingId: currentBooking.bookingId,
                    vehicleName: currentBooking.vehicleName,
                    otherPartyName: isOwner ? currentBooking.renterName : currentBooking.ownerName,
                    isOwner,
                    depositAmount: currentBooking.depositAmount || 0,
                    onSuccess: () => loadBooking()
                });
            }
            return;
        }

        if (!url) return;
        button.disabled = true;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            if (!response.ok || !result?.isSuccess) {
                throw new Error(result?.message || 'Không thể cập nhật đơn thuê.');
            }
            if (result.data && typeof result.data === 'object' && result.data.bookingId) {
                currentBooking = result.data;
                renderCurrent();
            } else {
                await loadBooking();
            }
        } catch (error) {
            const feedback = tripDetailView?.querySelector('.trip-detail-action-feedback');
            if (feedback) feedback.textContent = error.message || 'Lỗi kết nối máy chủ.';
            button.disabled = false;
        }
    }

    tripDetailView?.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-trip-detail-action]');
        if (actionButton) {
            handleAction(actionButton.dataset.tripDetailAction, actionButton);
            return;
        }
        const tabButton = event.target.closest('[data-trip-detail-tab]');
        if (tabButton && currentBooking) {
            currentTab = tabButton.dataset.tripDetailTab;
            renderCurrent();
        }
    });

    tripDetailView?.addEventListener('change', event => {
        if (!event.target.matches('[data-trip-terms-checkbox]')) return;
        const acceptButton = tripDetailView.querySelector('[data-trip-detail-action="accept-terms"]');
        if (acceptButton) acceptButton.disabled = !event.target.checked;
    });

    loadBooking();
})();
