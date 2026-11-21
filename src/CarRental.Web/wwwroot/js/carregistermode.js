// register car wizard
document.addEventListener('DOMContentLoaded', () => {
    const registrationOverlay = document.getElementById('registration-overlay');
    const startRegistrationBtn = document.getElementById('start-registration');
    const closeRegistrationBtn = document.getElementById('close-registration');
    
    // steps & panes
    const stepItems = document.querySelectorAll('.reg-step-item');
    const stepPanes = document.querySelectorAll('.reg-step-pane');
    
    // form & buttons
    const formStep1 = document.getElementById('form-step-1');
    const btnSubmitReg = document.getElementById('btn-submit-registration');
    const btnToStep4 = document.getElementById('btn-to-step-4');
    const prevButtons = document.querySelectorAll('.btn-step-prev');

    // draft car data
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
    // autofill user info
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

    // switch step
    function goToStep(step) {
        if (step < 1 || step > 4) return;
        currentStep = step;
        if (step > maxVisitedStep) {
            maxVisitedStep = step;
        }

        // update stepper
        stepItems.forEach(item => {
            const itemStep = parseInt(item.dataset.step, 10);
            item.classList.toggle('active', itemStep === currentStep);
            item.classList.toggle('completed', itemStep < currentStep);
        });

        // show pane
        stepPanes.forEach(pane => {
            pane.hidden = (pane.id !== `pane-step-${currentStep}`);
        });

        // scroll top
        const mainPanel = document.querySelector('.reg-wizard-main');
        if (mainPanel) mainPanel.scrollTop = 0;
    }

    // stepper click
    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetStep = parseInt(item.dataset.step, 10);
            if (targetStep <= maxVisitedStep) {
                goToStep(targetStep);
            }
        });
    });

    // open modal
    function openRegistration() {
        if (window.AzuStore && !window.AzuStore.requireLogin()) return;

        // prefill info
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
            document.querySelector('.owner-register-main')?.setAttribute('hidden', '');
            registrationOverlay.classList.add('wizard-inpage-mode');
            registrationOverlay.hidden = false;
            ownerInput?.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // close modal / back from wizard
    function closeRegistration() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('start') === 'true') {
            window.location.href = '/owner';
            return;
        }
        if (registrationOverlay) {
            registrationOverlay.hidden = true;
            registrationOverlay.classList.remove('wizard-inpage-mode');
            document.querySelector('.owner-register-main')?.removeAttribute('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const initParams = new URLSearchParams(window.location.search);
    if (initParams.get('start') === 'true' || window.location.hash === '#wizard') {
        openRegistration();
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

    // back buttons
    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prev, 10) || (currentStep - 1);
            goToStep(prevStep);
        });
    });

    // step 1 submit
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

    // preview images & store data
    const uploadedPhotos = { front: '', back: '', interior: '', doc: '' };
    const photoInputs = document.querySelectorAll('.photo-file-input');
    photoInputs.forEach(input => {
        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (!file) return;

            const card = input.closest('.photo-card');
            const preview = card?.querySelector('.photo-preview');
            const slotId = card?.id || '';
            const key = slotId.replace('slot-', '');

            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedPhotos[key] = event.target.result;
                if (preview) {
                    preview.innerHTML = `<img src="${event.target.result}" alt="Ảnh xe" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                }
            };
            reader.readAsDataURL(file);
        });
    });

    // step 2 to step 3
    const btnToStep3 = document.getElementById('btn-to-step-3');
    if (btnToStep3) {
        btnToStep3.addEventListener('click', () => {
            if (!vehicleDraft.plate || !vehicleDraft.brand || !vehicleDraft.model) {
                alert('Vui lòng hoàn thành bước 1 (Điền thông tin xe) trước khi tiếp tục.');
                goToStep(1);
                return;
            }
            goToStep(3);
        });
    }

    // step 3 collateral custom toggle
    const regCollateralType = document.getElementById('reg-collateral-type');
    const regCollateralCustomWrap = document.getElementById('reg-collateral-custom-wrap');
    if (regCollateralType && regCollateralCustomWrap) {
        regCollateralType.addEventListener('change', () => {
            regCollateralCustomWrap.style.display = regCollateralType.value === 'custom' ? 'block' : 'none';
        });
    }

    // step 3 submit to api
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async (e) => {
            e.preventDefault();
            const fullCarName = `${vehicleDraft.brand} ${vehicleDraft.model} ${vehicleDraft.year}`.trim();

            if (!vehicleDraft.plate || !vehicleDraft.brand || !vehicleDraft.model) {
                alert('Vui lòng hoàn thành bước 1 (Điền thông tin xe) trước khi gửi hồ sơ.');
                goToStep(1);
                return;
            }

            // check login
            if (window.AzuStore && !window.AzuStore.isLoggedIn()) {
                alert('Bạn cần đăng nhập để đăng ký xe cho thuê.');
                window.AzuStore.requireLogin('carregistermode');
                return;
            }

            btnSubmitReg.disabled = true;
            btnSubmitReg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi hồ sơ...';

            try {
                // Collect Step 3 data
                const colType = regCollateralType ? regCollateralType.value : 'none';
                let colText = 'Không yêu cầu khách thuê thế chấp Tiền mặt hoặc Xe máy.';
                if (colType === 'bike_or_cash') {
                    colText = 'Yêu cầu ký quỹ bảo chứng trực tuyến qua sàn AZU Car (không giao tiền mặt tại chỗ).';
                } else if (colType === 'cash_only') {
                    colText = 'Yêu cầu ký quỹ điện tử 15.000.000 đ qua sàn AZU Car.';
                } else if (colType === 'custom') {
                    const customInput = document.getElementById('reg-collateral-custom-text')?.value.trim();
                    colText = customInput || 'Quy định thế chấp riêng theo thỏa thuận với chủ xe.';
                }

                const fees = {
                    limitKm: Number(document.getElementById('reg-fee-limit-km')?.value) || 300,
                    limitFee: Number(document.getElementById('reg-fee-limit-cost')?.value) || 3000,
                    overtimeFee: Number(document.getElementById('reg-fee-overtime')?.value) || 70000,
                    cleanFee: Number(document.getElementById('reg-fee-clean')?.value) || 80000,
                    deodorFee: Number(document.getElementById('reg-fee-deodor')?.value) || 500000
                };

                const checkedAmenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(el => el.value);
                const termsRaw = document.getElementById('reg-custom-terms')?.value.trim() || '';
                const terms = termsRaw ? termsRaw.split('\n').map(t => t.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean) : [];

                const policyMeta = {
                    collateral: { type: colType, text: colText },
                    extraFees: fees,
                    amenities: checkedAmenities,
                    terms: terms
                };
                const metaBlock = `\n<!--AZU_POLICY:${JSON.stringify(policyMeta)}-->`;

                // parse city and district
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

                // Collect uploaded or sample images
                const defaultCover = (window.AzuVehicleImages?.resolve && window.AzuVehicleImages.resolve(`${vehicleDraft.brand} ${vehicleDraft.model}`)) || 'https://upload.wikimedia.org/wikipedia/commons/6/62/VinFast_VF_9_Plus_IMG_1523.jpg';
                const imagesList = [];
                if (uploadedPhotos.front) imagesList.push(uploadedPhotos.front);
                if (uploadedPhotos.back) imagesList.push(uploadedPhotos.back);
                if (uploadedPhotos.interior) imagesList.push(uploadedPhotos.interior);
                if (imagesList.length === 0) imagesList.push(defaultCover);

                const sampleDoc = uploadedPhotos.doc || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Giay_chung_nhan_dang_ky_xe_o_to.jpg/640px-Giay_chung_nhan_dang_ky_xe_o_to.jpg';

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
                    description: `Xe ${vehicleDraft.brand} ${vehicleDraft.model} ${vehicleDraft.year} chính chủ cho thuê. Đầy đủ tiện nghi, bảo dưỡng định kỳ, giao xe đúng hẹn.${metaBlock}`,
                    imageUrls: imagesList,
                    registrationCertImage: sampleDoc,
                    inspectionCertImage: sampleDoc,
                    insuranceImage: sampleDoc,
                    inspectionExpiryDate: '2027-12-31',
                    insuranceExpiryDate: '2027-12-31'
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

                const vehicleId = resData.data?.vehicleId || Date.now();

                // Save custom policies to localStorage
                try {
                    localStorage.setItem(`azu_car_collateral_${vehicleId}`, colText);
                    localStorage.setItem(`azu_car_extrafees_${vehicleId}`, JSON.stringify(fees));
                    localStorage.setItem(`azu_car_amenities_${vehicleId}`, JSON.stringify(checkedAmenities));
                    localStorage.setItem(`azu_car_terms_${vehicleId}`, JSON.stringify(terms));
                } catch (e) {
                    console.warn('LocalStorage save warning:', e);
                }

                // add owner role
                try {
                    const roles = JSON.parse(sessionStorage.getItem('azuCarRoles') || '[]');
                    if (!roles.some(r => String(r).toLowerCase() === 'owner')) {
                        roles.push('Owner');
                        sessionStorage.setItem('azuCarRoles', JSON.stringify(roles));
                        window.AzuStore?.syncRoleUi?.();
                    }
                } catch (e) {}

                // cache local
                if (window.AzuStore?.addOwnerCar) {
                    window.AzuStore.addOwnerCar({
                        id: vehicleId,
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

                // summary step 4
                const summaryName = document.getElementById('summary-car-name');
                const summaryPlate = document.getElementById('summary-car-plate');
                const summaryOwner = document.getElementById('summary-owner-name');
                const summaryCollateral = document.getElementById('summary-collateral');

                if (summaryName) summaryName.textContent = fullCarName;
                if (summaryPlate) summaryPlate.textContent = vehicleDraft.plate || 'Đang cập nhật';
                if (summaryOwner) summaryOwner.textContent = vehicleDraft.ownerName || 'Chủ xe';
                if (summaryCollateral) summaryCollateral.textContent = colText;

                goToStep(4);
            } catch (err) {
                console.error('Lỗi khi gửi hồ sơ xe:', err);
                alert('Lỗi kết nối máy chủ khi đăng ký xe. Vui lòng thử lại.');
            } finally {
                btnSubmitReg.disabled = false;
                btnSubmitReg.innerHTML = 'Gửi hồ sơ đăng ký xe <i class="fa-solid fa-check"></i>';
            }
        });
    }

    // step 3 submit (legacy)
    if (btnToStep4) {
        btnToStep4.addEventListener('click', () => {
            goToStep(4);
        });
    }
});
