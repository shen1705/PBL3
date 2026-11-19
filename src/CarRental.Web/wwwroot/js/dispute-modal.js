// dispute-modal.js - Modal Báo cáo sự cố & Đề xuất phụ phí / Phạt vi phạm (AZU Escrow)
(function () {
    const DISPUTE_CATEGORIES = {
        owner: [
            { id: 'OdorCleaning', icon: 'fa-solid fa-wind', name: 'Hút thuốc / Mùi hôi / Vệ sinh nội thất', hint: 'Khách hút thuốc lá trong xe, mang đồ tanh/mùi hôi, làm bẩn nỉ/da (Đề xuất: 300.000đ - 800.000đ)', defaultAmount: 500000, sampleImg: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=800' },
            { id: 'LostItems', icon: 'fa-solid fa-box-open', name: 'Mất mát đồ đạc / Phụ kiện trên xe', hint: 'Mất thảm lót sàn, lốp dự phòng, tẩu sạc, camera hành trình...', defaultAmount: 400000, sampleImg: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=800' },
            { id: 'Damage', icon: 'fa-solid fa-car-burst', name: 'Trầy xước, cọ quẹt, hư hỏng thân vỏ / kính', hint: 'Móp méo, trầy xước ba-đờ-sốc, nứt kính (đối chiếu biên bản giao nhận)', defaultAmount: 1000000, sampleImg: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800' },
            { id: 'FuelBattery', icon: 'fa-solid fa-gas-pump', name: 'Trả xe thiếu xăng / dung lượng pin', hint: 'Mức nhiên liệu hoặc pin khi trả thấp hơn lúc bàn giao nhận xe', defaultAmount: 250000, sampleImg: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
            { id: 'OvertimeDistance', icon: 'fa-solid fa-clock', name: 'Trả xe quá giờ / Đi vượt hạn mức kilomet', hint: 'Khách bàn giao trễ so với giờ hợp đồng hoặc vượt km thỏa thuận', defaultAmount: 300000, sampleImg: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
            { id: 'TrafficFine', icon: 'fa-solid fa-receipt', name: 'Biên bản phạt nguội vi phạm giao thông (CSGT)', hint: 'Nhận thông báo phạt nguội trong khoảng thời gian khách thuê xe', defaultAmount: 1500000, sampleImg: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
            { id: 'Other', icon: 'fa-solid fa-circle-exclamation', name: 'Sự cố hoặc vi phạm thỏa thuận khác', hint: 'Các vi phạm khác không thuộc danh mục trên', defaultAmount: 0, sampleImg: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800' }
        ],
        renter: [
            { id: 'TechnicalIssue', icon: 'fa-solid fa-wrench', name: 'Xe gặp sự cố kỹ thuật / Hỏng máy / Điều hòa', hint: 'Xe chết máy, hỏng lạnh, nổi đèn lỗi động cơ trong chuyến', defaultAmount: 0, sampleImg: '/seed/dispute-evidence-1.jpg' },
            { id: 'LateDelivery', icon: 'fa-solid fa-clock', name: 'Chủ xe giao xe trễ hẹn / Không giao xe', hint: 'Chủ xe không đến điểm hẹn hoặc chậm trễ ảnh hưởng lịch trình', defaultAmount: 0, sampleImg: '' },
            { id: 'DifferentVehicle', icon: 'fa-solid fa-car', name: 'Xe thực tế không đúng mô tả / bài đăng', hint: 'Xe khác biển số, khác dòng xe hoặc tình trạng quá cũ/bẩn', defaultAmount: 0, sampleImg: '' },
            { id: 'Overcharge', icon: 'fa-solid fa-hand-holding-dollar', name: 'Chủ xe đòi phụ thu sai thỏa thuận', hint: 'Ép trả các khoản phí ngoài hợp đồng và quy định sàn', defaultAmount: 0, sampleImg: '' },
            { id: 'Other', icon: 'fa-solid fa-circle-exclamation', name: 'Khiếu nại sự cố khác', hint: 'Các mâu thuẫn hoặc vi phạm khác cần sàn phân xử', defaultAmount: 0, sampleImg: '' }
        ]
    };

    function ensureStyles() {
        if (document.getElementById('azu-dispute-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'azu-dispute-modal-styles';
        style.textContent = `
            .azu-disp-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.72);
                backdrop-filter: blur(4px);
                z-index: 100300;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                overflow-y: auto;
                box-sizing: border-box;
                animation: azuDispFadeIn 0.2s ease-out;
            }
            @keyframes azuDispFadeIn {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .azu-disp-card {
                background: #ffffff;
                width: 100%;
                max-width: 580px;
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
            .azu-disp-close {
                position: absolute;
                top: 18px;
                right: 18px;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                border: none;
                background: #f1f5f9;
                color: #64748b;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                transition: all 0.15s;
            }
            .azu-disp-close:hover {
                background: #e2e8f0;
                color: #0f172a;
            }
            .azu-disp-header {
                display: flex;
                gap: 14px;
                align-items: flex-start;
                margin-bottom: 18px;
            }
            .azu-disp-icon {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: #fee2e2;
                color: #dc2626;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }
            .azu-disp-header h3 {
                margin: 0 0 4px;
                font-size: 19px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.3;
            }
            .azu-disp-header p {
                margin: 0;
                font-size: 13.5px;
                color: #64748b;
            }
            .azu-disp-notice {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 20px;
            }
            .azu-disp-notice-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 13.5px;
                font-weight: 600;
                color: #92400e;
                margin-bottom: 6px;
            }
            .azu-disp-notice-desc {
                margin: 0;
                font-size: 12.5px;
                line-height: 1.5;
                color: #78350f;
            }
            .azu-disp-form-group {
                margin-bottom: 18px;
            }
            .azu-disp-form-group label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13.5px;
                font-weight: 600;
                color: #334155;
                margin-bottom: 6px;
            }
            .azu-disp-form-group select,
            .azu-disp-form-group input[type="text"],
            .azu-disp-form-group input[type="url"],
            .azu-disp-form-group input[type="number"],
            .azu-disp-form-group textarea {
                width: 100%;
                padding: 10px 14px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                background: #ffffff;
                box-sizing: border-box;
                color: #0f172a;
                transition: border-color 0.15s, box-shadow 0.15s;
            }
            .azu-disp-form-group select:focus,
            .azu-disp-form-group input:focus,
            .azu-disp-form-group textarea:focus {
                outline: none;
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
            }
            .azu-disp-pills {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }
            .azu-disp-pill {
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 4px 10px;
                font-size: 12px;
                color: #475569;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.15s;
            }
            .azu-disp-pill:hover {
                background: #e2e8f0;
                color: #0f172a;
            }
            .azu-disp-pill.is-active {
                background: #eff6ff;
                border-color: #93c5fd;
                color: #1d4ed8;
                font-weight: 600;
            }
            .azu-disp-samples {
                margin-top: 8px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                align-items: center;
            }
            .azu-disp-sample-title {
                font-size: 12px;
                color: #64748b;
                font-weight: 600;
            }
            .azu-disp-sample-btn {
                background: #f8fafc;
                border: 1px dashed #cbd5e1;
                border-radius: 6px;
                padding: 3px 8px;
                font-size: 11.5px;
                color: #3b82f6;
                cursor: pointer;
                transition: all 0.15s;
            }
            .azu-disp-sample-btn:hover {
                background: #eff6ff;
                border-color: #3b82f6;
            }
            .azu-disp-preview {
                margin-top: 10px;
                position: relative;
                display: inline-block;
                max-width: 100%;
            }
            .azu-disp-preview img {
                max-width: 100%;
                max-height: 140px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                object-fit: cover;
                display: block;
            }
            .azu-disp-preview-del {
                position: absolute;
                top: 4px;
                right: 4px;
                background: rgba(0,0,0,0.65);
                color: #fff;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
                border: none;
            }
            .azu-disp-char-hint {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #64748b;
                margin-top: 4px;
            }
            .azu-disp-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #f1f5f9;
            }
            .azu-disp-btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.15s;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .azu-disp-btn-secondary {
                background: #f1f5f9;
                color: #475569;
            }
            .azu-disp-btn-secondary:hover {
                background: #e2e8f0;
                color: #0f172a;
            }
            .azu-disp-btn-danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
            }
            .azu-disp-btn-danger:hover {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            }
            .azu-disp-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .azu-disp-error {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #b91c1c;
                padding: 10px 14px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 14px;
            }
        `;
        document.head.appendChild(style);
    }

    function open(options = {}) {
        ensureStyles();

        const {
            bookingId,
            vehicleName = 'Phương tiện',
            otherPartyName = 'Thành viên',
            isOwner = false,
            depositAmount = 0,
            onSuccess = null
        } = options;

        if (!bookingId) {
            alert('Không tìm thấy mã đơn thuê xe.');
            return;
        }

        const categories = isOwner ? DISPUTE_CATEGORIES.owner : DISPUTE_CATEGORIES.renter;

        // Existing overlay removal
        const oldModal = document.getElementById('azu-dispute-modal-overlay');
        if (oldModal) oldModal.remove();

        const overlay = document.createElement('div');
        overlay.id = 'azu-dispute-modal-overlay';
        overlay.className = 'azu-disp-overlay';

        overlay.innerHTML = `
            <div class="azu-disp-card" role="dialog" aria-modal="true" aria-labelledby="azu-disp-title">
                <button type="button" class="azu-disp-close" id="azu-disp-close-btn" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>
                <div class="azu-disp-header">
                    <div class="azu-disp-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div>
                        <h3 id="azu-disp-title">${isOwner ? 'Báo cáo sự cố & Đề xuất phụ phí / Phạt vi phạm' : 'Báo cáo sự cố / Khiếu nại chuyến đi'}</h3>
                        <p>Đơn <strong>#BK-${bookingId}</strong> · Xe: <strong>${escapeHtml(vehicleName)}</strong> · Đối tác: ${escapeHtml(otherPartyName)}</p>
                    </div>
                </div>

                <div class="azu-disp-notice">
                    <div class="azu-disp-notice-row">
                        <span><i class="fa-solid fa-shield-halved"></i> Tiền cọc bảo chứng (AZU Escrow):</span>
                        <span style="font-size:15px; color:#b45309">${Number(depositAmount || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                    <p class="azu-disp-notice-desc">
                        ${isOwner
                            ? 'Hệ thống sẽ <strong>phong tỏa tiền cọc 25%</strong> của khách thuê. Khoản phụ phí/phạt bồi thường đề xuất của bạn sẽ được chuyển đến <strong>Quản trị viên (Admin)</strong> đối chiếu chứng cứ và phê duyệt khấu trừ trực tiếp từ nguồn cọc này bồi hoàn cho bạn.'
                            : 'Khiếu nại sẽ được chuyển đến Quản trị viên để thụ lý, tạm hoãn hoàn cọc và quyết toán cho đến khi có phán quyết thỏa đáng.'}
                    </p>
                </div>

                <div id="azu-disp-error-banner" class="azu-disp-error" style="display:none;"></div>

                <form id="azu-disp-form">
                    <div class="azu-disp-form-group">
                        <label for="azu-disp-cat"><i class="fa-solid fa-list-check"></i> Phân loại vi phạm / Sự cố *</label>
                        <select id="azu-disp-cat" required>
                            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <small id="azu-disp-cat-hint" style="display:block; margin-top:5px; font-size:12px; color:#64748b;">${categories[0]?.hint || ''}</small>
                    </div>

                    <div class="azu-disp-form-group">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <label for="azu-disp-amount" style="margin:0;"><i class="fa-solid fa-money-bill-wave"></i> ${isOwner ? 'Số tiền phạt / phụ phí đề xuất khấu trừ (VNĐ) *' : 'Số tiền yêu cầu bồi hoàn (VNĐ - Không bắt buộc)'}</label>
                            <span id="azu-disp-amount-badge" style="font-size:13px; font-weight:700; color:#dc2626;">0 đ</span>
                        </div>
                        <input type="number" id="azu-disp-amount" min="0" max="100000000" step="10000" placeholder="${isOwner ? 'Ví dụ: 500000' : 'Ví dụ: 300000'}" value="${isOwner ? (categories[0]?.defaultAmount || 500000) : ''}" ${isOwner ? 'required' : ''}>
                        
                        <div class="azu-disp-pills">
                            <span style="font-size:12px; color:#64748b; line-height:26px;">Chọn nhanh:</span>
                            <button type="button" class="azu-disp-pill" data-amount="300000">+300.000 đ</button>
                            <button type="button" class="azu-disp-pill" data-amount="500000">+500.000 đ</button>
                            <button type="button" class="azu-disp-pill" data-amount="1000000">+1.000.000 đ</button>
                            ${depositAmount > 0 ? `<button type="button" class="azu-disp-pill" data-amount="${depositAmount}">Toàn bộ cọc (${Number(depositAmount).toLocaleString('vi-VN')} đ)</button>` : ''}
                        </div>
                    </div>

                    <div class="azu-disp-form-group">
                        <label for="azu-disp-evidence"><i class="fa-solid fa-camera"></i> Hình ảnh bằng chứng (URL ảnh chụp / biên bản) *</label>
                        <input type="url" id="azu-disp-evidence" placeholder="Nhập hoặc dán link ảnh chứng cứ (hoặc chọn mẫu bên dưới)" value="${categories[0]?.sampleImg || ''}" required>
                        
                        <div class="azu-disp-samples">
                            <span class="azu-disp-sample-title">Ảnh mẫu test nhanh:</span>
                            <button type="button" class="azu-disp-sample-btn" data-url="https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=800">Ảnh nội thất bẩn/mùi</button>
                            <button type="button" class="azu-disp-sample-btn" data-url="https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800">Ảnh trầy xước xe</button>
                            <button type="button" class="azu-disp-sample-btn" data-url="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800">Biên bản phạt CSGT</button>
                            <button type="button" class="azu-disp-sample-btn" data-url="/seed/dispute-evidence-1.jpg">Ảnh sự cố kỹ thuật</button>
                        </div>

                        <div id="azu-disp-preview-box" class="azu-disp-preview" style="display:${categories[0]?.sampleImg ? 'block' : 'none'};">
                            <img id="azu-disp-preview-img" src="${categories[0]?.sampleImg || ''}" alt="Xem trước ảnh bằng chứng">
                            <button type="button" class="azu-disp-preview-del" id="azu-disp-preview-del">&times;</button>
                        </div>
                    </div>

                    <div class="azu-disp-form-group">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <label for="azu-disp-desc" style="margin:0;"><i class="fa-solid fa-align-left"></i> Mô tả chi tiết sự cố / Vi phạm *</label>
                            <span id="azu-disp-char-count" style="font-size:12px; color:#64748b;">0 / 10 ký tự</span>
                        </div>
                        <textarea id="azu-disp-desc" rows="3" minlength="10" maxlength="1000" placeholder="${isOwner ? 'Mô tả cụ thể: vị trí hư hỏng, mùi hôi nội thất, đồ đạc bị mất, số giờ trễ hạn, hoặc số tiền trên biên bản CSGT...' : 'Mô tả cụ thể sự cố xe hoặc vi phạm của chủ xe...'}" required></textarea>
                    </div>

                    <div class="azu-disp-actions">
                        <button type="button" class="azu-disp-btn azu-disp-btn-secondary" id="azu-disp-cancel-btn">Hủy bỏ</button>
                        <button type="submit" class="azu-disp-btn azu-disp-btn-danger" id="azu-disp-submit-btn">
                            <i class="fa-solid fa-paper-plane"></i> Gửi khiếu nại & Phong tỏa cọc
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind events
        const closeBtn = document.getElementById('azu-disp-close-btn');
        const cancelBtn = document.getElementById('azu-disp-cancel-btn');
        const form = document.getElementById('azu-disp-form');
        const catSelect = document.getElementById('azu-disp-cat');
        const catHint = document.getElementById('azu-disp-cat-hint');
        const amountInput = document.getElementById('azu-disp-amount');
        const amountBadge = document.getElementById('azu-disp-amount-badge');
        const evidenceInput = document.getElementById('azu-disp-evidence');
        const previewBox = document.getElementById('azu-disp-preview-box');
        const previewImg = document.getElementById('azu-disp-preview-img');
        const previewDel = document.getElementById('azu-disp-preview-del');
        const descInput = document.getElementById('azu-disp-desc');
        const charCount = document.getElementById('azu-disp-char-count');
        const errorBanner = document.getElementById('azu-disp-error-banner');
        const submitBtn = document.getElementById('azu-disp-submit-btn');

        function updateAmountDisplay() {
            const val = Number(amountInput.value) || 0;
            amountBadge.textContent = val.toLocaleString('vi-VN') + ' đ';
        }
        updateAmountDisplay();
        amountInput.addEventListener('input', updateAmountDisplay);

        // Pills
        overlay.querySelectorAll('.azu-disp-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const amt = Number(pill.dataset.amount);
                amountInput.value = amt;
                updateAmountDisplay();
            });
        });

        // Category change
        catSelect.addEventListener('change', () => {
            const selected = categories.find(c => c.id === catSelect.value);
            if (selected) {
                catHint.textContent = selected.hint || '';
                if (selected.defaultAmount && isOwner && (!amountInput.value || Number(amountInput.value) === 0)) {
                    amountInput.value = selected.defaultAmount;
                    updateAmountDisplay();
                }
                if (selected.sampleImg && !evidenceInput.value) {
                    evidenceInput.value = selected.sampleImg;
                    updatePreview();
                }
            }
        });

        // Evidence preview
        function updatePreview() {
            const url = evidenceInput.value.trim();
            if (url) {
                previewImg.src = url;
                previewBox.style.display = 'block';
            } else {
                previewBox.style.display = 'none';
            }
        }
        evidenceInput.addEventListener('input', updatePreview);

        previewDel.addEventListener('click', () => {
            evidenceInput.value = '';
            previewBox.style.display = 'none';
        });

        // Sample buttons
        overlay.querySelectorAll('.azu-disp-sample-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                evidenceInput.value = btn.dataset.url;
                updatePreview();
            });
        });

        // Description char count
        descInput.addEventListener('input', () => {
            const len = descInput.value.trim().length;
            charCount.textContent = `${len} / 10 ký tự ${len < 10 ? '(chưa đủ)' : '✓'}`;
            charCount.style.color = len >= 10 ? '#16a34a' : '#64748b';
        });

        function closeModal() {
            overlay.remove();
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', onEsc);
            }
        });

        // Form Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorBanner.style.display = 'none';

            const category = catSelect.value;
            const proposedAmount = Number(amountInput.value) || 0;
            const evidenceImage = evidenceInput.value.trim();
            const description = descInput.value.trim();

            if (description.length < 10) {
                errorBanner.textContent = 'Mô tả sự cố phải có ít nhất 10 ký tự.';
                errorBanner.style.display = 'block';
                descInput.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi khiếu nại...';

            try {
                const response = await fetch(`/api/bookings/${bookingId}/dispute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookingId: Number(bookingId),
                        category,
                        proposedAmount: proposedAmount > 0 ? proposedAmount : null,
                        evidenceImage,
                        description
                    })
                });

                const result = await response.json();
                if (!response.ok || !result?.isSuccess) {
                    throw new Error(result?.message || 'Không thể gửi khiếu nại.');
                }

                closeModal();
                alert(result.message || 'Khiếu nại và đề xuất phụ phí của bạn đã được gửi thành công đến Quản trị viên!');

                if (typeof onSuccess === 'function') {
                    onSuccess(result);
                }
            } catch (err) {
                errorBanner.textContent = err.message || 'Lỗi kết nối máy chủ.';
                errorBanner.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi khiếu nại & Phong tỏa cọc';
            }
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    window.AzuDisputeModal = {
        open,
        categories: DISPUTE_CATEGORIES
    };
})();
