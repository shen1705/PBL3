/**
 * Xử lý quy trình đăng ký xe tự lái nhiều bước (4 bước theo thiết kế AZU Car)
 */
document.addEventListener('DOMContentLoaded', () => {
    const registrationOverlay = document.getElementById('registration-overlay');
    const startRegistrationBtn = document.getElementById('start-registration');
    const closeRegistrationBtn = document.getElementById('close-registration');
    
    // Step items & Panes
    const stepItems = document.querySelectorAll('.reg-step-item');
    const stepPanes = document.querySelectorAll('.reg-step-pane');
    
    // Form & buttons
    const formStep1 = document.getElementById('form-step-1');
    const btnSubmitReg = document.getElementById('btn-submit-registration');
    const btnToStep4 = document.getElementById('btn-to-step-4');
    const prevButtons = document.querySelectorAll('.btn-step-prev');

    // Dữ liệu tạm thời của xe đang đăng ký
    let vehicleDraft = {
        ownerName: '',
        phone: '',
        brand: '',
        model: '',
        plate: '',
        year: '2024',
        seats: '5 chỗ',
        price: 600000,
        location: 'Hải Châu, TP. Đà Nẵng'
    };

    let currentStep = 1;
    // Tự động điền thông tin tài khoản nếu đã đăng nhập
    const sessionName = sessionStorage.getItem('azuCarFullName') || sessionStorage.getItem('azuCarDisplayName');
    const sessionPhone = sessionStorage.getItem('azuCarPhone');
    const ownerNameInput = document.getElementById('reg-owner-name');
    const ownerPhoneInput = document.getElementById('reg-owner-phone');
    if (ownerNameInput && sessionName && !ownerNameInput.value) {
        ownerNameInput.value = sessionName;
    }
    if (ownerPhoneInput && sessionPhone && !ownerPhoneInput.value) {
        ownerPhoneInput.value = sessionPhone;
    }

    let maxVisitedStep = 1;

    // Chuyển bước trong wizard
    function goToStep(step) {
        if (step < 1 || step > 4) return;
        currentStep = step;
        if (step > maxVisitedStep) {
            maxVisitedStep = step;
        }

        // Cập nhật trạng thái thanh Stepper bên trái
        stepItems.forEach(item => {
            const itemStep = parseInt(item.dataset.step, 10);
            item.classList.toggle('active', itemStep === currentStep);
            item.classList.toggle('completed', itemStep < currentStep);
        });

        // Ẩn/Hiện nội dung pane bên phải
        stepPanes.forEach(pane => {
            pane.hidden = (pane.id !== `pane-step-${currentStep}`);
        });

        // Cuộn khung nội dung về đầu
        const mainPanel = document.querySelector('.reg-wizard-main');
        if (mainPanel) mainPanel.scrollTop = 0;
    }

    // Cho phép click vào các bước đã hoàn thành trên thanh Stepper
    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetStep = parseInt(item.dataset.step, 10);
            if (targetStep <= maxVisitedStep) {
                goToStep(targetStep);
            }
        });
    });

    // Mở modal đăng ký xe
    function openRegistration() {
        if (window.AzuStore && !window.AzuStore.requireLogin()) return;

        // Điền trước thông tin tài khoản nếu có
        const displayName = sessionStorage.getItem('azuCarDisplayName');
        const phone = sessionStorage.getItem('azuCarPhone');

        const ownerInput = document.getElementById('reg-owner-name');
        const phoneInput = document.getElementById('reg-owner-phone');

        if (ownerInput && displayName && !ownerInput.value) {
            ownerInput.value = displayName;
        }
        if (phoneInput && phone && !phoneInput.value) {
            phoneInput.value = phone;
        }

        goToStep(1);
        if (registrationOverlay) {
            registrationOverlay.hidden = false;
            ownerInput?.focus();
        }
    }

    // Đóng modal đăng ký xe
    function closeRegistration() {
        if (registrationOverlay) {
            registrationOverlay.hidden = true;
        }
    }

    if (startRegistrationBtn) {
        startRegistrationBtn.addEventListener('click', openRegistration);
    }

    if (closeRegistrationBtn) {
        closeRegistrationBtn.addEventListener('click', closeRegistration);
    }

    if (registrationOverlay) {
        registrationOverlay.addEventListener('click', (e) => {
            if (e.target === registrationOverlay) {
                closeRegistration();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && registrationOverlay && !registrationOverlay.hidden) {
            closeRegistration();
        }
    });

    // Nút "Quay lại" ở các bước
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prev, 10) || (currentStep - 1);
            goToStep(prevStep);
        });
    });

    // XỬ LÝ BƯỚC 1: Xác nhận thông tin xe -> sang Bước 2
    if (formStep1) {
        formStep1.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!formStep1.reportValidity()) return;

            vehicleDraft.ownerName = document.getElementById('reg-owner-name')?.value.trim() || '';
            vehicleDraft.phone = document.getElementById('reg-owner-phone')?.value.trim() || '';
            vehicleDraft.brand = document.getElementById('reg-car-brand')?.value.trim() || '';
            vehicleDraft.model = document.getElementById('reg-car-model')?.value.trim() || '';
            vehicleDraft.plate = document.getElementById('reg-car-plate')?.value.trim().toUpperCase() || '';
            vehicleDraft.year = document.getElementById('reg-car-year')?.value || '2024';
            vehicleDraft.seats = document.getElementById('reg-car-seats')?.value || '5 chỗ';
            vehicleDraft.price = parseInt(document.getElementById('reg-car-price')?.value, 10) || 600000;
            vehicleDraft.location = document.getElementById('reg-car-location')?.value || 'Quận Hải Châu, TP. Đà Nẵng';

            goToStep(2);
        });
    }

    // XỬ LÝ BƯỚC 2: Xem trước ảnh khi chọn file
    const photoInputs = document.querySelectorAll('.photo-file-input');
    photoInputs.forEach(input => {
        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (!file) return;

            const card = input.closest('.photo-card');
            const preview = card?.querySelector('.photo-preview');
            if (preview) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `<img src="${event.target.result}" alt="Ảnh xe" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // XỬ LÝ BƯỚC 2 -> GỬI HỒ SƠ LÊN BACKEND API -> SANG BƯỚC 3
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async () => {
            const fullCarName = `${vehicleDraft.brand} ${vehicleDraft.model} ${vehicleDraft.year}`.trim();

            if (!vehicleDraft.plate || !vehicleDraft.brand || !vehicleDraft.model) {
                alert('Vui lòng hoàn thành bước 1 (Điền thông tin xe) trước khi gửi hồ sơ.');
                goToStep(1);
                return;
            }

            // Kiểm tra đăng nhập
            if (window.AzuStore && !window.AzuStore.isLoggedIn()) {
                alert('Bạn cần đăng nhập để đăng ký xe cho thuê.');
                window.AzuStore.requireLogin('carregistermode');
                return;
            }

            btnSubmitReg.disabled = true;
            btnSubmitReg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi hồ sơ...';

            try {
                // Phân tích địa chỉ thành phố và quận/huyện
                const locStr = vehicleDraft.location || 'Quận Hải Châu, TP. Đà Nẵng';
                let city = 'TP. Đà Nẵng';
                if (locStr.includes('Hồ Chí Minh') || locStr.includes('HCM')) city = 'TP. Hồ Chí Minh';
                else if (locStr.includes('Hà Nội')) city = 'Hà Nội';

                let district = 'Hải Châu';
                const parts = locStr.split(',');
                if (parts.length > 0) {
                    district = parts[0].replace(/quận|huyện/i, '').trim();
                }

                const seatsNum = parseInt(String(vehicleDraft.seats).replace(/\D/g, ''), 10) || 5;
                const isElec = /vf|vinfast|điện|electric/i.test(`${vehicleDraft.brand} ${vehicleDraft.model}`);

                const payload = {
                    brand: vehicleDraft.brand,
                    model: vehicleDraft.model,
                    year: parseInt(vehicleDraft.year, 10) || 2024,
                    seats: seatsNum,
                    licensePlate: vehicleDraft.plate,
                    transmission: 'Automatic',
                    fuelType: isElec ? 'Electric' : 'Gasoline',
                    pricePerDay: Number(vehicleDraft.price) || 600000,
                    city: city,
                    district: district,
                    location: locStr,
                    description: `Xe ${vehicleDraft.brand} ${vehicleDraft.model} ${vehicleDraft.year} chính chủ cho thuê. Đầy đủ tiện nghi, giao xe đúng hẹn.`,
                    imageUrls: []
                };

                const res = await fetch('/api/vehicles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resData = await res.json();
                if (!res.ok || !resData.isSuccess) {
                    alert(resData.message || 'Không thể đăng ký xe. Vui lòng kiểm tra lại thông tin biển số hoặc số điện thoại.');
                    btnSubmitReg.disabled = false;
                    btnSubmitReg.innerHTML = 'Gửi hồ sơ đăng ký xe <i class="fa-solid fa-check"></i>';
                    return;
                }

                // Cập nhật roles trong sessionStorage nếu chưa có Owner
                try {
                    const roles = JSON.parse(sessionStorage.getItem('azuCarRoles') || '[]');
                    if (!roles.some(r => String(r).toLowerCase() === 'owner')) {
                        roles.push('Owner');
                        sessionStorage.setItem('azuCarRoles', JSON.stringify(roles));
                        window.AzuStore?.syncRoleUi?.();
                    }
                } catch (e) {}

                // Lưu tạm vào LocalStore để cache ngay lập tức
                if (window.AzuStore?.addOwnerCar) {
                    window.AzuStore.addOwnerCar({
                        id: resData.data?.vehicleId || Date.now(),
                        name: fullCarName,
                        plate: vehicleDraft.plate,
                        ownerName: vehicleDraft.ownerName,
                        phone: vehicleDraft.phone,
                        price: vehicleDraft.price,
                        seats: vehicleDraft.seats,
                        location: vehicleDraft.location,
                        status: 'pendingapproval',
                        kind: 'self-drive'
                    });
                }

                if (vehicleDraft.phone) {
                    sessionStorage.setItem('azuCarPhone', vehicleDraft.phone);
                }

                // Điền thông tin tóm tắt vào Bước 3
                const summaryName = document.getElementById('summary-car-name');
                const summaryPlate = document.getElementById('summary-car-plate');
                const summaryOwner = document.getElementById('summary-owner-name');

                if (summaryName) summaryName.textContent = fullCarName;
                if (summaryPlate) summaryPlate.textContent = vehicleDraft.plate || 'Đang cập nhật';
                if (summaryOwner) summaryOwner.textContent = vehicleDraft.ownerName || 'Chủ xe';

                goToStep(3);
            } catch (err) {
                console.error('Lỗi khi gửi hồ sơ xe:', err);
                alert('Lỗi kết nối máy chủ khi đăng ký xe. Vui lòng thử lại.');
            } finally {
                btnSubmitReg.disabled = false;
                btnSubmitReg.innerHTML = 'Gửi hồ sơ đăng ký xe <i class="fa-solid fa-check"></i>';
            }
        });
    }

    // XỬ LÝ BƯỚC 3 -> SANG BƯỚC 4
    if (btnToStep4) {
        btnToStep4.addEventListener('click', () => {
            goToStep(4);
        });
    }
});
