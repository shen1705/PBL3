document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. QUẢN LÝ POPUP MODALS ---
    const loginBtn = document.querySelector('.btn-slate');
    const registerBtn = document.querySelector('.btn-register-outline');
    const guestActions = document.getElementById('guest-actions');
    const accountDisplay = document.getElementById('account-display');
    const accountName = document.getElementById('account-name');
    const accountAvatar = document.getElementById('account-avatar');
    const renterNavLink = document.getElementById('renter-nav-link');
    const tripsNavLink = document.getElementById('trips-nav-link');
    const supportNavLink = document.getElementById('support-nav-link');
    const openOwnerModalBtn = document.getElementById('openOwnerModalBtn');

    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('login-form');
    const registerModal = document.getElementById('registerModal');
    const registerForm = document.getElementById('register-form');
    const registerCarModal = document.getElementById('registerCarModal');
    const locationModal = document.getElementById('locationModal');
    const openLocationModal = document.getElementById('openLocationModal');
    const locationInput = document.getElementById('locationInput');
    const selectedLocationText = document.getElementById('selectedLocationText') || document.getElementById('filterLocationText');
    const searchParams = new URLSearchParams(window.location.search);
    const savedLocation = sessionStorage.getItem('azuCarSelectedLocation');
    const requestedLocation = searchParams.get('location');
    const requestedPickup = searchParams.get('pickup');
    const requestedReturn = searchParams.get('return');

    const effectiveLocation = savedLocation || requestedLocation;
    if (selectedLocationText && effectiveLocation) {
        selectedLocationText.innerText = effectiveLocation;
    }
    if (requestedPickup) {
        const pickupText = document.getElementById('pickupTimeText');
        if (pickupText) pickupText.innerText = requestedPickup;
    }
    if (requestedReturn) {
        const returnText = document.getElementById('returnTimeText');
        if (returnText) returnText.innerText = requestedReturn;
    }
    updateRentalSummary();

    const locationCurrentText = document.getElementById('locationCurrentText');
    const locationOptions = document.querySelectorAll('.location-option');
    const confirmLocationBtn = document.getElementById('confirmLocationBtn');
    const closeLocationModalBtn = document.querySelector('.location-picker-close');
    
    const closeButtons = document.querySelectorAll('.modal-close-btn');

    function renderSignedInAccount(name) {
        const displayName = name.trim();
        if (!displayName) return;

        if (accountName) accountName.textContent = displayName;
        if (accountAvatar) accountAvatar.textContent = Array.from(displayName)[0].toLocaleUpperCase('vi');
        if (guestActions) guestActions.hidden = true;
        if (accountDisplay) accountDisplay.hidden = false;
        if (tripsNavLink) tripsNavLink.hidden = false;
    }

    function goToFind(overrides = {}) {
        const targetLocation = overrides.location || selectedLocationText?.innerText.trim() || 'TP. Đà Nẵng';
        sessionStorage.setItem('azuCarSelectedLocation', targetLocation);
        const params = new URLSearchParams({
            location: targetLocation,
            pickup: overrides.pickup || document.getElementById('pickupTimeText')?.innerText.trim() || '',
            return: overrides.return || document.getElementById('returnTimeText')?.innerText.trim() || ''
        });
        if (overrides.seats) params.set('seats', overrides.seats);
        if (overrides.carType) params.set('carType', overrides.carType);
        if (overrides.fuel) params.set('fuel', overrides.fuel);
        window.location.href = `find.html?${params.toString()}`;
    }

    function openCarDetail(car) {
        if (window.AzuStore?.setSelectedCar && car) {
            window.AzuStore.setSelectedCar(car);
        }
        goToFind();
    }

    function completeAuthentication(name) {
        const displayName = name.trim();
        if (!displayName) return;

        sessionStorage.setItem('azuCarDisplayName', displayName);
        sessionStorage.removeItem('azuCarReturnTo'); // Luôn xóa returnTo để sau khi đăng nhập luôn ở trang index

        // Luôn chuyển về hoặc hiển thị trang chủ đã đăng nhập (index.html)
        const cur = window.location.pathname.split('/').pop() || '';
        if (cur !== '' && cur !== 'index.html') {
            window.location.assign('index.html');
            return;
        }

        renderSignedInAccount(displayName);
        if (loginModal) loginModal.classList.remove('active');
        if (registerModal) registerModal.classList.remove('active');
        if (window.location.hash === '#loginModal' || window.location.hash === '#registerModal') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    // Xóa hash modal khỏi thanh địa chỉ nếu có từ trước để tránh tự mở lại khi F5
    if (window.location.hash === '#loginModal' || window.location.hash === '#registerModal') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const savedDisplayName = sessionStorage.getItem('azuCarDisplayName');
    if (savedDisplayName) {
        renderSignedInAccount(savedDisplayName);
        sessionStorage.removeItem('azuCarReturnTo');
    }

    // Kiểm tra cờ yêu cầu đăng nhập/đăng ký 1 lần (one-time flash flag)
    const shouldPromptLogin = sessionStorage.getItem('azuCarPromptLogin') === '1';
    const shouldPromptRegister = sessionStorage.getItem('azuCarPromptRegister') === '1';
    sessionStorage.removeItem('azuCarPromptLogin');
    sessionStorage.removeItem('azuCarPromptRegister');

    if (!window.AzuStore.isLoggedIn()) {
        if (shouldPromptLogin && loginModal) {
            loginModal.classList.add('active');
        } else if (shouldPromptRegister && registerModal) {
            registerModal.classList.add('active');
        }
    }

    // Bắt sự kiện bấm vào mục Trở thành chủ xe và Chuyến của tôi khi chưa đăng nhập
    document.querySelectorAll('a[href="become-owner.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!window.AzuStore.isLoggedIn()) {
                e.preventDefault();
                if (loginModal) loginModal.classList.add('active');
            }
        });
    });

    document.querySelectorAll('a[href="my-trips.html"], a[href^="/account"], a[href^="/my-trips"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!window.AzuStore.isLoggedIn()) {
                e.preventDefault();
                if (loginModal) loginModal.classList.add('active');
            }
        });
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.classList.add('active');
        });
    }
    if (registerCarModal && window.location.hash === '#registerCarModal') {
        registerCarModal.classList.add('active');
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const loginErrorBanner = document.getElementById('login-error-banner');
    const registerErrorBanner = document.getElementById('register-error-banner');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (loginErrorBanner) {
                loginErrorBanner.style.display = 'none';
                loginErrorBanner.textContent = '';
            }

            const identityInput = loginForm.elements.namedItem('identity');
            const passwordInput = loginForm.elements.namedItem('password');
            const identity = identityInput instanceof HTMLInputElement ? identityInput.value.trim() : '';
            const password = passwordInput instanceof HTMLInputElement ? passwordInput.value : '';

            if (!identity || !password) return;

            const submitBtn = loginForm.querySelector('.btn-submit-auth');
            const origText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang đăng nhập...';
            }

            try {
                const res = await window.AzuStore.login(identity, password, true);
                if (res && res.isSuccess) {
                    const displayName = res.data?.fullName || res.data?.userName || identity;
                    completeAuthentication(displayName);
                    loginForm.reset();
                } else {
                    if (loginErrorBanner) {
                        loginErrorBanner.textContent = res?.message || 'Đăng nhập không thành công. Vui lòng thử lại.';
                        loginErrorBanner.style.display = 'block';
                    } else {
                        alert(res?.message || 'Đăng nhập không thành công.');
                    }
                }
            } catch (err) {
                if (loginErrorBanner) {
                    loginErrorBanner.textContent = 'Lỗi kết nối máy chủ. Vui lòng thử lại.';
                    loginErrorBanner.style.display = 'block';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                }
            }
        });
    }

    if (registerForm) {
        const passwordInput = registerForm.elements.namedItem('password');
        const passwordConfirmInput = registerForm.elements.namedItem('passwordConfirm');
        const validatePasswordMatch = function() {
            if (passwordInput instanceof HTMLInputElement
                && passwordConfirmInput instanceof HTMLInputElement) {
                passwordConfirmInput.setCustomValidity(
                    passwordConfirmInput.value && passwordInput.value !== passwordConfirmInput.value
                        ? 'Mật khẩu nhập lại không khớp.'
                        : ''
                );
            }
        };

        if (passwordInput instanceof HTMLInputElement
            && passwordConfirmInput instanceof HTMLInputElement) {
            passwordInput.addEventListener('input', validatePasswordMatch);
            passwordConfirmInput.addEventListener('input', validatePasswordMatch);
        }

        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (registerErrorBanner) {
                registerErrorBanner.style.display = 'none';
                registerErrorBanner.textContent = '';
            }

            const nameInput = registerForm.elements.namedItem('name');
            const phoneInput = registerForm.elements.namedItem('phone');
            if (!(nameInput instanceof HTMLInputElement)
                || !(passwordInput instanceof HTMLInputElement)
                || !(passwordConfirmInput instanceof HTMLInputElement)) return;

            validatePasswordMatch();
            if (!registerForm.reportValidity()) return;

            const submitBtn = registerForm.querySelector('.btn-submit-auth');
            const origText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang xử lý đăng ký...';
            }

            try {
                const res = await window.AzuStore.register({
                    userName: nameInput.value.trim(),
                    fullName: nameInput.value.trim(),
                    phoneNumber: phoneInput instanceof HTMLInputElement ? phoneInput.value.trim() : '',
                    password: passwordInput.value,
                    confirmPassword: passwordConfirmInput.value
                });

                if (res && res.isSuccess) {
                    const displayName = res.data?.fullName || res.data?.userName || nameInput.value.trim();
                    completeAuthentication(displayName);
                    passwordConfirmInput.setCustomValidity('');
                    registerForm.reset();
                } else {
                    if (registerErrorBanner) {
                        registerErrorBanner.textContent = res?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại.';
                        registerErrorBanner.style.display = 'block';
                    } else {
                        alert(res?.message || 'Đăng ký không thành công.');
                    }
                }
            } catch (err) {
                if (registerErrorBanner) {
                    registerErrorBanner.textContent = 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.';
                    registerErrorBanner.style.display = 'block';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                }
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerModal) registerModal.classList.add('active');
        });
    }

    if (openOwnerModalBtn) {
        openOwnerModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerCarModal) registerCarModal.classList.add('active');
        });
    }

    if (openLocationModal && locationModal && locationInput && selectedLocationText) {
        const showLocationModal = function() {
            locationInput.value = '';
            if (locationCurrentText) locationCurrentText.innerText = selectedLocationText.innerText.trim();
            locationOptions.forEach(option => { option.hidden = false; });
            if (confirmLocationBtn) confirmLocationBtn.hidden = true;
            locationModal.classList.add('active');
            locationInput.focus();
        };
        openLocationModal.addEventListener('click', showLocationModal);
        openLocationModal.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showLocationModal();
            }
        });
    }

    function selectLocation(location) {
        const selectedLocation = location.trim();
        if (!selectedLocation) return;
        if (selectedLocationText) selectedLocationText.innerText = selectedLocation;
        if (locationCurrentText) locationCurrentText.innerText = selectedLocation;
        const resultsHeading = document.getElementById('resultsLocationHeading');
        if (resultsHeading) resultsHeading.innerText = `Xe tự lái tại ${selectedLocation}`;

        // Lưu vào sessionStorage để duy trì khi chuyển trang/reload
        sessionStorage.setItem('azuCarSelectedLocation', selectedLocation);

        // Cập nhật thanh địa chỉ URL ngay lập tức nếu đang ở trang find.html hoặc có query location
        try {
            const url = new URL(window.location.href);
            if (url.searchParams.has('location') || window.location.pathname.includes('find.html')) {
                url.searchParams.set('location', selectedLocation);
                window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
            }
        } catch (e) {}

        document.dispatchEvent(new CustomEvent('location:selected', {
            detail: { location: selectedLocation }
        }));
        if (locationModal) locationModal.classList.remove('active');
    }

    function confirmLocation() {
        selectLocation(locationInput ? locationInput.value : '');
    }

    if (confirmLocationBtn) confirmLocationBtn.addEventListener('click', confirmLocation);
    if (closeLocationModalBtn) {
        closeLocationModalBtn.addEventListener('click', () => locationModal.classList.remove('active'));
    }
    if (locationInput) {
        locationInput.addEventListener('input', function() {
            const query = this.value.trim().toLocaleLowerCase('vi');
            let hasExactMatch = false;
            locationOptions.forEach(option => {
                const location = option.dataset.location || '';
                const matches = location.toLocaleLowerCase('vi').includes(query);
                option.hidden = !matches;
                if (location.toLocaleLowerCase('vi') === query) hasExactMatch = true;
            });
            if (confirmLocationBtn) confirmLocationBtn.hidden = !query || hasExactMatch;
        });
        locationInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const visibleOption = Array.from(locationOptions).find(option => !option.hidden);
                if (visibleOption && visibleOption.dataset.location.toLocaleLowerCase('vi') === this.value.trim().toLocaleLowerCase('vi')) {
                    selectLocation(visibleOption.dataset.location);
                } else {
                    confirmLocation();
                }
            }
        });
    }
    locationOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectLocation(this.dataset.location || '');
        });
    });

    function closeModal(targetModal) {
        if (targetModal) targetModal.classList.remove('active');
        if (window.location.hash === '#loginModal' || window.location.hash === '#registerModal' || window.location.hash === '#registerCarModal') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    // --- 1.1 QUẢN LÝ POPUP CHÍNH SÁCH & BẢO VỆ DỮ LIỆU ---
    const policyPreviewModal = document.getElementById('policyPreviewModal');
    const closePolicyModalBtn = document.getElementById('closePolicyModalBtn');
    const btnAcceptPolicy = document.getElementById('btnAcceptPolicy');
    const tabBtnTerms = document.getElementById('tabBtnTerms');
    const tabBtnPrivacy = document.getElementById('tabBtnPrivacy');
    const policyModalBadge = document.getElementById('policyModalBadge');
    const policyModalTitle = document.getElementById('policyModalTitle');
    const policyModalSubtitle = document.getElementById('policyModalSubtitle');
    const policyModalBody = document.getElementById('policyModalBody');

    const POLICY_DATA = {
        terms: {
            title: 'CHÍNH SÁCH & QUY ĐỊNH THUÊ XE',
            subtitle: 'Quy chế hoạt động, điều kiện thuê xe & cam kết an toàn vận hành tại AZU Car',
            badge: '<i class="fa-solid fa-file-contract"></i> Quy chuẩn vận hành',
            content: `
                <div class="policy-section">
                    <h4><i class="fa-solid fa-id-card"></i> 1. Điều kiện đối với khách thuê xe</h4>
                    <p>• <strong>Độ tuổi:</strong> Khách thuê từ đủ 20 tuổi trở lên và có năng lực hành vi dân sự đầy đủ theo luật định.</p>
                    <p>• <strong>Giấy phép lái xe:</strong> Xuất trình bản gốc GPLX ô tô hạng B1/B2 trở lên còn hiệu lực sử dụng tại Việt Nam.</p>
                    <p>• <strong>Định danh cá nhân:</strong> Xuất trình CCCD gắn chip chính chủ hoặc Hộ chiếu gốc còn hạn để đối chiếu khi nhận bàn giao xe.</p>
                    <p>• <strong>Tài sản thế chấp:</strong> Xe máy có giá trị hiện hành từ 15.000.000đ kèm cà vẹt gốc hoặc đặt cọc tiền mặt theo quy định của từng xe.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-car-side"></i> 2. Quy trình giao nhận & Kiểm tra phương tiện</h4>
                    <p>• Hai bên cùng kiểm tra ngoại thất (vết xước móp), lốp xe, phụ kiện, mức nhiên liệu và đồng hồ công tơ mét (ODO).</p>
                    <p>• Chụp ảnh/quay video hiện trạng 4 góc thân xe và ký xác nhận Biên bản bàn giao phương tiện điện tử trước khi lăn bánh.</p>
                    <p>• Khi kết thúc chuyến đi, khách hàng hoàn trả xe đúng hiện trạng ban đầu, cùng mức nhiên liệu và vệ sinh sạch sẽ.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-triangle-exclamation"></i> 3. Trách nhiệm trong quá trình vận hành & Phạt nguội</h4>
                    <p>• Khách hàng tự chịu trách nhiệm về mọi hành vi vi phạm Luật Giao thông Đường bộ (quá tốc độ, vượt đèn đỏ, sai làn...).</p>
                    <p>• <strong>Phạt nguội:</strong> Khách hàng có trách nhiệm thanh toán toàn bộ chi phí xử lý vi phạm trong trường hợp có biên bản phạt nguội của CSGT phát sinh trong khung thời gian thuê xe (trong vòng 30 ngày kể từ ngày trả xe).</p>
                    <p>• Nghiêm cấm tuyệt đối sử dụng phương tiện vào mục đích phạm pháp, chở hàng cấm, hoặc lái xe khi đã sử dụng rượu bia, chất kích thích.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-calendar-xmark"></i> 4. Chính sách hủy chuyến & Hoàn trả tiền cọc</h4>
                    <p>• <strong>Hủy trước 24 giờ nhận xe:</strong> Hoàn trả 100% tiền đặt cọc vào tài khoản ngân hàng của khách trong vòng 24h làm việc.</p>
                    <p>• <strong>Hủy trong vòng 24 giờ trước giờ nhận xe:</strong> Phí hủy chuyến tương đương 30% giá trị cọc để hỗ trợ chủ xe giữ lịch.</p>
                    <p>• <strong>Chủ xe hủy chuyến:</strong> AZU Car hỗ trợ hoàn 100% tiền cọc và tìm phương tiện thay thế tương đương hoặc bồi thường quyền lợi.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-shield-halved"></i> 5. Bảo hiểm & Xử lý sự cố va chạm</h4>
                    <p>• Mọi chuyến đi trên AZU Car đều được tích hợp gói bảo hiểm vật chất phương tiện và bảo hiểm trách nhiệm dân sự bắt buộc.</p>
                    <p>• Khi xảy ra sự cố va chạm hoặc sự cố kỹ thuật trên đường, khách hàng vui lòng liên hệ ngay Hotline cứu hộ khẩn cấp <strong>1900 9217 (24/7)</strong> để được hướng dẫn xử lý bảo hiểm theo đúng quy trình.</p>
                </div>
            `
        },
        privacy: {
            title: 'CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN',
            subtitle: 'Tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân',
            badge: '<i class="fa-solid fa-user-shield"></i> Nghị định 13/2023/NĐ-CP',
            content: `
                <div class="policy-section">
                    <h4><i class="fa-solid fa-database"></i> 1. Mục đích thu thập dữ liệu cá nhân</h4>
                    <p>• <strong>Đối tượng dữ liệu:</strong> Họ và tên, số điện thoại, số CCCD gắn chip/Hộ chiếu, ảnh chụp GPLX và địa chỉ email.</p>
                    <p>• <strong>Mục đích sử dụng:</strong> Xác thực danh tính hợp pháp của người điều khiển phương tiện giao thông, khởi tạo hợp đồng điện tử tự động, kích hoạt gói bảo hiểm chuyến đi và hỗ trợ giao nhận xe an toàn.</p>
                    <p>• AZU Car chỉ thu thập đúng các thông tin cần thiết phục vụ vận hành chuyến thuê, không thu thập dữ liệu nhạy cảm ngoài phạm vi.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-lock"></i> 2. Tiêu chuẩn an toàn & Mã hóa dữ liệu</h4>
                    <p>• Toàn bộ dữ liệu truyền tải giữa thiết bị người dùng và máy chủ AZU Car được bảo vệ bằng giao thức mã hóa <strong>SSL/TLS 256-bit</strong> đạt chuẩn ngân hàng.</p>
                    <p>• Cơ sở dữ liệu người dùng được lưu trữ trên hạ tầng đám mây đa tầng (Cloud Server), có cơ chế xác thực đa yếu tố (2FA) và sao lưu định kỳ, phòng chống truy cập trái phép.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-handshake"></i> 3. Cam kết không chia sẻ dữ liệu cho bên thứ ba</h4>
                    <p>• AZU Car cam kết <strong>tuyệt đối không bán, không cho thuê, không chia sẻ</strong> dữ liệu cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại.</p>
                    <p>• Dữ liệu chỉ được cung cấp cho cơ quan chức năng nhà nước có thẩm quyền (Cảnh sát Giao thông, Tòa án...) khi có yêu cầu bằng văn bản chính thức theo quy định của pháp luật Việt Nam.</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-clock-rotate-left"></i> 4. Thời hạn lưu trữ dữ liệu</h4>
                    <p>• Dữ liệu tài khoản được duy trì trong suốt thời gian người dùng sử dụng dịch vụ trên nền tảng AZU Car.</p>
                    <p>• Hợp đồng thuê xe điện tử và chứng từ giao dịch được lưu trữ tối thiểu 03 năm theo Luật Giao dịch Điện tử để phục vụ tra cứu quyền lợi và giải quyết tranh chấp phát sinh (nếu có).</p>
                </div>

                <div class="policy-section">
                    <h4><i class="fa-solid fa-user-gear"></i> 5. Quyền của Chủ thể dữ liệu</h4>
                    <p>• <strong>Xem & Chỉnh sửa:</strong> Người dùng có toàn quyền xem, cập nhật hoặc điều chỉnh thông tin cá nhân bất cứ lúc nào trong mục "Tài khoản của tôi".</p>
                    <p>• <strong>Yêu cầu xóa dữ liệu:</strong> Theo Điều 9 Nghị định 13/2023/NĐ-CP, bạn có quyền yêu cầu tạm dừng xử lý, rút lại sự đồng ý hoặc xóa vĩnh viễn dữ liệu tài khoản bằng cách liên hệ tổng đài <strong>1900 9217</strong> hoặc gửi email tới <strong>support@azucar.vn</strong>.</p>
                </div>
            `
        }
    };

    function renderPolicyModal(policyKey) {
        const data = POLICY_DATA[policyKey] || POLICY_DATA.terms;
        if (policyModalTitle) policyModalTitle.textContent = data.title;
        if (policyModalSubtitle) policyModalSubtitle.textContent = data.subtitle;
        if (policyModalBadge) policyModalBadge.innerHTML = data.badge;
        if (policyModalBody) policyModalBody.innerHTML = data.content;

        if (tabBtnTerms) tabBtnTerms.classList.toggle('active', policyKey === 'terms');
        if (tabBtnPrivacy) tabBtnPrivacy.classList.toggle('active', policyKey === 'privacy');

        if (policyModalBody) policyModalBody.scrollTop = 0;
    }

    function openPolicyModal(policyKey = 'terms') {
        if (!policyPreviewModal) return;
        renderPolicyModal(policyKey);
        policyPreviewModal.hidden = false;
        requestAnimationFrame(() => {
            policyPreviewModal.classList.add('active');
        });
    }

    function closePolicyModal() {
        if (!policyPreviewModal) return;
        policyPreviewModal.classList.remove('active');
        setTimeout(() => {
            if (!policyPreviewModal.classList.contains('active')) {
                policyPreviewModal.hidden = true;
            }
        }, 250);
    }

    // Gắn sự kiện click mở modal chính sách cho các đường dẫn trong form đăng ký
    document.querySelectorAll('.open-policy-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const policyKey = this.getAttribute('data-policy') || 'terms';
            openPolicyModal(policyKey);
        });
    });

    if (tabBtnTerms) {
        tabBtnTerms.addEventListener('click', () => renderPolicyModal('terms'));
    }
    if (tabBtnPrivacy) {
        tabBtnPrivacy.addEventListener('click', () => renderPolicyModal('privacy'));
    }
    if (closePolicyModalBtn) {
        closePolicyModalBtn.addEventListener('click', closePolicyModal);
    }
    if (btnAcceptPolicy) {
        btnAcceptPolicy.addEventListener('click', closePolicyModal);
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            closeModal(targetModal);
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === policyPreviewModal) {
            closePolicyModal();
            return;
        }
        if (e.target.classList.contains('auth-modal-overlay')) {
            closeModal(e.target);
        }
        if (e.target === locationModal) locationModal.classList.remove('active');
    });

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (policyPreviewModal && policyPreviewModal.classList.contains('active')) {
                closePolicyModal();
                return;
            }
            closeModal(loginModal);
            closeModal(registerModal);
            closeModal(registerCarModal);
            closeModal(forgotModal);
            if (locationModal) locationModal.classList.remove('active');
        }
    });

    // --- 1.2 QUẢN LÝ POPUP QUÊN MẬT KHẨU ---
    const forgotModal = document.getElementById('forgotModal');
    const openForgotModalBtns = document.querySelectorAll('.forgot-link, #openForgotModal');
    const backToLoginFromForgotBtns = document.querySelectorAll('.back-to-login-link, #backToLoginFromForgot');
    const forgotStep1 = document.getElementById('forgotStep1');
    const forgotStep2 = document.getElementById('forgotStep2');
    const forgotStepSuccess = document.getElementById('forgotStepSuccess');
    const forgotFormStep1 = document.getElementById('forgot-form-step1');
    const forgotFormStep2 = document.getElementById('forgot-form-step2');
    const forgotIdentityInput = document.getElementById('forgot-identity');
    const forgotTargetText = document.getElementById('forgotTargetText');
    const forgotOtpInput = document.getElementById('forgot-otp');
    const btnResendOtp = document.getElementById('btnResendOtp');
    const otpCountdown = document.getElementById('otpCountdown');
    const backToStep1Forgot = document.getElementById('backToStep1Forgot');
    const btnGoToLoginAfterReset = document.getElementById('btnGoToLoginAfterReset');
    let otpTimerInterval = null;

    function maskIdentity(val) {
        if (!val) return '0905***456';
        if (val.includes('@')) {
            const parts = val.split('@');
            const name = parts[0];
            const domain = parts[1] || '';
            const masked = name.length > 2 ? name.slice(0, 2) + '***' : name + '***';
            return `${masked}@${domain}`;
        }
        const cleaned = val.replace(/\s+/g, '');
        if (cleaned.length >= 7) {
            return cleaned.slice(0, 4) + '***' + cleaned.slice(-3);
        }
        return cleaned.slice(0, 2) + '***';
    }

    function startOtpCountdown() {
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        let count = 59;
        if (otpCountdown) otpCountdown.textContent = count;
        if (btnResendOtp) {
            btnResendOtp.style.opacity = '0.6';
            btnResendOtp.style.pointerEvents = 'none';
        }
        otpTimerInterval = setInterval(() => {
            count--;
            if (otpCountdown) otpCountdown.textContent = count;
            if (count <= 0) {
                clearInterval(otpTimerInterval);
                otpTimerInterval = null;
                if (btnResendOtp) {
                    btnResendOtp.style.opacity = '1';
                    btnResendOtp.style.pointerEvents = 'auto';
                    btnResendOtp.innerHTML = 'Gửi lại mã';
                }
            }
        }, 1000);
    }

    function resetForgotModal() {
        if (otpTimerInterval) {
            clearInterval(otpTimerInterval);
            otpTimerInterval = null;
        }
        if (forgotStep1) forgotStep1.hidden = false;
        if (forgotStep2) forgotStep2.hidden = true;
        if (forgotStepSuccess) forgotStepSuccess.hidden = true;
        if (forgotFormStep1) forgotFormStep1.reset();
        if (forgotFormStep2) forgotFormStep2.reset();
    }

    openForgotModalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.classList.remove('active');
            resetForgotModal();
            if (forgotModal) {
                forgotModal.classList.add('active');
                setTimeout(() => {
                    if (forgotIdentityInput) forgotIdentityInput.focus();
                }, 100);
            }
        });
    });

    backToLoginFromForgotBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (forgotModal) forgotModal.classList.remove('active');
            if (loginModal) loginModal.classList.add('active');
        });
    });

    if (forgotFormStep1) {
        forgotFormStep1.addEventListener('submit', function(e) {
            e.preventDefault();
            const identity = forgotIdentityInput ? forgotIdentityInput.value.trim() : '';
            if (!identity) return;

            if (forgotTargetText) forgotTargetText.textContent = maskIdentity(identity);
            if (forgotStep1) forgotStep1.hidden = true;
            if (forgotStep2) forgotStep2.hidden = false;
            startOtpCountdown();
            setTimeout(() => {
                if (forgotOtpInput) forgotOtpInput.focus();
            }, 100);
        });
    }

    if (backToStep1Forgot) {
        backToStep1Forgot.addEventListener('click', function(e) {
            e.preventDefault();
            if (otpTimerInterval) {
                clearInterval(otpTimerInterval);
                otpTimerInterval = null;
            }
            if (forgotStep2) forgotStep2.hidden = true;
            if (forgotStep1) forgotStep1.hidden = false;
        });
    }

    if (btnResendOtp) {
        btnResendOtp.addEventListener('click', function() {
            startOtpCountdown();
            alert('Mã xác thực OTP mới đã được gửi lại vào điện thoại/email của bạn!');
        });
    }

    if (forgotFormStep2) {
        const newPasswordInput = document.getElementById('forgot-new-password');
        const confirmPasswordInput = document.getElementById('forgot-confirm-password');

        const validatePasswordsMatch = () => {
            if (newPasswordInput && confirmPasswordInput) {
                if (confirmPasswordInput.value && confirmPasswordInput.value !== newPasswordInput.value) {
                    confirmPasswordInput.setCustomValidity('Mật khẩu xác nhận không khớp.');
                } else {
                    confirmPasswordInput.setCustomValidity('');
                }
            }
        };

        if (newPasswordInput && confirmPasswordInput) {
            newPasswordInput.addEventListener('input', validatePasswordsMatch);
            confirmPasswordInput.addEventListener('input', validatePasswordsMatch);
        }

        forgotFormStep2.addEventListener('submit', async function(e) {
            e.preventDefault();
            validatePasswordsMatch();
            if (!forgotFormStep2.reportValidity()) return;

            const forgotErrorBanner2 = document.getElementById('forgot-error-banner-2');
            if (forgotErrorBanner2) {
                forgotErrorBanner2.style.display = 'none';
                forgotErrorBanner2.textContent = '';
            }

            const identity = forgotIdentityInput ? forgotIdentityInput.value.trim() : '';
            const otp = forgotOtpInput ? forgotOtpInput.value.trim() : '';
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

            const submitBtn = forgotFormStep2.querySelector('.btn-submit-auth');
            const origText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang xử lý...';
            }

            try {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: identity,
                        otp: otp,
                        newPassword: newPassword,
                        confirmPassword: confirmPassword
                    })
                });
                const data = await res.json();
                if (res.ok && data.isSuccess) {
                    if (forgotStep2) forgotStep2.hidden = true;
                    if (forgotStepSuccess) forgotStepSuccess.hidden = false;
                } else {
                    if (forgotErrorBanner2) {
                        forgotErrorBanner2.textContent = data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
                        forgotErrorBanner2.style.display = 'block';
                    } else {
                        alert(data.message || 'Không thể đặt lại mật khẩu.');
                    }
                }
            } catch (err) {
                if (forgotErrorBanner2) {
                    forgotErrorBanner2.textContent = 'Lỗi kết nối máy chủ. Vui lòng thử lại.';
                    forgotErrorBanner2.style.display = 'block';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                }
            }
        });
    }

    if (btnGoToLoginAfterReset) {
        btnGoToLoginAfterReset.addEventListener('click', function() {
            if (forgotModal) forgotModal.classList.remove('active');
            if (loginModal) {
                loginModal.classList.add('active');
                const loginIdentityInput = document.getElementById('login-identity');
                if (loginIdentityInput && forgotIdentityInput) {
                    loginIdentityInput.value = forgotIdentityInput.value.trim();
                }
            }
        });
    }

    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.classList.remove('active');
            if (registerModal) registerModal.classList.add('active');
        });
    }

    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerModal) registerModal.classList.remove('active');
            if (loginModal) loginModal.classList.add('active');
        });
    }

    // --- 2. ẨN / HIỆN MẬT KHẨU ---
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const inputField = this.previousElementSibling;
            if (inputField && inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else if (inputField) {
                inputField.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

    // --- 3. LỊCH ĐỘNG & QUẢN LÝ THỜI GIAN ---
    const openTimeModal = document.getElementById('openTimeModal');
    const timeModal = document.getElementById('timeModal');
    const btnConfirmTime = document.getElementById('btnConfirmTime');
    const modalPreviewText = document.getElementById('modalPreviewText');
    const modalSubPreviewText = document.getElementById('modalSubPreviewText');
    const selectPickupDate = document.getElementById('selectPickupDate');
    const selectReturnDate = document.getElementById('selectReturnDate');
    const selectedPickupDate = document.getElementById('selectedPickupDate');
    const selectedReturnDate = document.getElementById('selectedReturnDate');
    
    const currentMonthYearLabel = document.getElementById('currentMonthYearLabel');
    const dynamicCalendarDays = document.getElementById('dynamicCalendarDays');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const pickupTimeSelect = document.getElementById('pickupTimeSelect');
    const returnTimeSelect = document.getElementById('returnTimeSelect');
    const initialPickupTime = document.getElementById('pickupTimeText')?.textContent.match(/^(\d{2}:\d{2})/)?.[1];
    const initialReturnTime = document.getElementById('returnTimeText')?.textContent.match(/^(\d{2}:\d{2})/)?.[1];

    if (pickupTimeSelect && initialPickupTime && Array.from(pickupTimeSelect.options).some(option => option.value === initialPickupTime)) {
        pickupTimeSelect.value = initialPickupTime;
    }
    if (returnTimeSelect && initialReturnTime && Array.from(returnTimeSelect.options).some(option => option.value === initialReturnTime)) {
        returnTimeSelect.value = initialReturnTime;
    }

    const tabDaily = document.getElementById('tabDaily');
    const tabHourly = document.getElementById('tabHourly');
    const dailyContent = document.getElementById('dailyContent');
    const hourlyContent = document.getElementById('hourlyContent');

    let currentMode = 'daily';
    let selectionTarget = null;
    let today = new Date();
    let viewingYear = today.getFullYear();
    let viewingMonth = today.getMonth();

    function getInitialDate(elementId) {
        const dateMatch = document.getElementById(elementId)?.textContent.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        return dateMatch ? new Date(Number(dateMatch[3]), Number(dateMatch[2]) - 1, Number(dateMatch[1])) : null;
    }

    let startDateObj = getInitialDate('pickupTimeText') || new Date();
    let endDateObj = getInitialDate('returnTimeText');
    viewingYear = startDateObj.getFullYear();
    viewingMonth = startDateObj.getMonth();
    if (!endDateObj) {
        endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 3);
    }

    if (openTimeModal) {
        const showTimeModal = () => {
            selectionTarget = 'start';
            if (timeModal) timeModal.classList.add('active');
            renderCalendar();
            updateDateSelection();
            updatePreview();
        };
        openTimeModal.addEventListener('click', showTimeModal);
        openTimeModal.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showTimeModal();
            }
        });
    }

    if (selectPickupDate) {
        selectPickupDate.addEventListener('click', () => {
            selectionTarget = 'start';
            updateDateSelection();
        });
    }
    if (selectReturnDate) {
        selectReturnDate.addEventListener('click', () => {
            selectionTarget = startDateObj ? 'end' : 'start';
            updateDateSelection();
        });
    }

    if (tabDaily && tabHourly) {
        tabDaily.addEventListener('click', () => {
            currentMode = 'daily';
            tabDaily.style.color = '#4e6fca'; tabDaily.style.borderBottom = '2px solid #1d5194';
            tabHourly.style.color = '#94a3b8'; tabHourly.style.borderBottom = 'none';
            dailyContent.style.display = 'block'; hourlyContent.style.display = 'none';
            updateDateSelection();
            updatePreview();
        });
        tabHourly.addEventListener('click', () => {
            currentMode = 'hourly';
            tabHourly.style.color = '#4e6fca'; tabHourly.style.borderBottom = '2px solid #1d5194';
            tabDaily.style.color = '#94a3b8'; tabDaily.style.borderBottom = 'none';
            hourlyContent.style.display = 'block'; dailyContent.style.display = 'none';
            updateDateSelection();
            updatePreview();
        });
    }

    function renderCalendar() {
        if (!dynamicCalendarDays) return;
        dynamicCalendarDays.innerHTML = '';
        const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        currentMonthYearLabel.innerText = `${monthNames[viewingMonth]}, ${viewingYear}`;

        const firstDayIndex = (new Date(viewingYear, viewingMonth, 1).getDay() + 6) % 7;
        const totalDays = new Date(viewingYear, viewingMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            dynamicCalendarDays.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.innerText = day;
            dayDiv.style.padding = '8px 0';
            dayDiv.style.borderRadius = '6px';

            const currentObj = new Date(viewingYear, viewingMonth, day);

            if (startDateObj && currentObj.toDateString() === startDateObj.toDateString()) {
                dayDiv.style.background = '#1d5194';
                dayDiv.style.color = '#fff';
                dayDiv.style.fontWeight = '700';
            } else if (endDateObj && currentObj.toDateString() === endDateObj.toDateString()) {
                dayDiv.style.background = '#dbeafe';
                dayDiv.style.color = '#1e40af';
                dayDiv.style.fontWeight = '700';
            } else if (endDateObj && currentObj > startDateObj && currentObj < endDateObj) {
                dayDiv.style.background = '#eff6ff';
            }

            dayDiv.addEventListener('click', () => {
                if (selectionTarget === 'start') {
                    startDateObj = currentObj;
                    endDateObj = null;
                    selectionTarget = 'end';
                } else if (selectionTarget === 'end') {
                    if (!startDateObj || currentObj < startDateObj) {
                        startDateObj = currentObj;
                        endDateObj = null;
                    } else {
                        endDateObj = currentObj;
                        selectionTarget = null;
                    }
                } else if (!startDateObj || (startDateObj && endDateObj)) {
                    startDateObj = currentObj;
                    endDateObj = null;
                    selectionTarget = 'end';
                } else if (startDateObj && !endDateObj) {
                    if (currentObj < startDateObj) {
                        startDateObj = currentObj;
                    } else {
                        endDateObj = currentObj;
                        selectionTarget = null;
                    }
                }
                renderCalendar();
                updateDateSelection();
                updatePreview();
            });

            dynamicCalendarDays.appendChild(dayDiv);
        }
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { viewingMonth--; if (viewingMonth < 0) { viewingMonth = 11; viewingYear--; } renderCalendar(); });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { viewingMonth++; if (viewingMonth > 11) { viewingMonth = 0; viewingYear++; } renderCalendar(); });

    function formatDate(date) {
        if (!date) return "";
        let d = String(date.getDate()).padStart(2, '0');
        let m = String(date.getMonth() + 1).padStart(2, '0');
        let y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }

    function updateRentalSummary() {
        const timeSummary = document.getElementById('filterTimeText');
        const pickupText = document.getElementById('pickupTimeText')?.textContent.trim();
        const returnText = document.getElementById('returnTimeText')?.textContent.trim();
        if (timeSummary && pickupText && returnText) {
            timeSummary.innerText = `${pickupText} – ${returnText}`;
        }
    }

    function updateDateSelection() {
        if (selectedPickupDate) selectedPickupDate.innerText = startDateObj ? formatDate(startDateObj) : 'Chọn ngày';
        if (selectedReturnDate) selectedReturnDate.innerText = endDateObj ? formatDate(endDateObj) : 'Chọn ngày';
        if (selectPickupDate) selectPickupDate.classList.toggle('active', selectionTarget === 'start');
        if (selectReturnDate) selectReturnDate.classList.toggle('active', selectionTarget === 'end');
        if (btnConfirmTime) {
            btnConfirmTime.disabled = currentMode === 'daily' && (!startDateObj || !endDateObj);
        }
    }

    const hourlyDateInput = document.getElementById('hourlyDateInput');
    const hourlyPickupTime = document.getElementById('hourlyPickupTime');
    const hourlyDuration = document.getElementById('hourlyDuration');

    if (hourlyDateInput && hourlyPickupTime && hourlyDuration) {
        hourlyDateInput.addEventListener('change', updatePreview);
        hourlyPickupTime.addEventListener('change', updatePreview);
        hourlyDuration.addEventListener('change', updatePreview);
    }
    if (pickupTimeSelect && returnTimeSelect) {
        pickupTimeSelect.addEventListener('change', updatePreview);
        returnTimeSelect.addEventListener('change', updatePreview);
    }

    function updatePreview() {
        if (currentMode === 'hourly') {
            const rawDate = hourlyDateInput ? hourlyDateInput.value : "2026-10-14";
            let formattedDate = "14/10/2026";
            if (rawDate) {
                let parts = rawDate.split('-');
                if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            const time = hourlyPickupTime.value;
            const hours = parseInt(hourlyDuration.value);
            let [h, m] = time.split(':').map(Number);
            let endH = (h + hours) % 24;
            let endTimeStr = String(endH).padStart(2, '0') + ':' + String(m).padStart(2, '0');

            modalPreviewText.innerText = `${time}, ${formattedDate} - ${endTimeStr}, ${formattedDate}`;
            if (modalSubPreviewText) modalSubPreviewText.innerHTML = `Thời gian thuê: <span style="color: #1d5194; font-weight: 700;">${hours} giờ</span>`;
        } else {
            if (!startDateObj) return;
            let startStr = formatDate(startDateObj);
            let endStr = endDateObj ? formatDate(endDateObj) : startStr;
            let pTime = pickupTimeSelect ? pickupTimeSelect.value : "09:00";
            let rTime = returnTimeSelect ? returnTimeSelect.value : "20:00";

            modalPreviewText.innerText = `${pTime}, ${startStr} - ${rTime}, ${endStr}`;
            if (modalSubPreviewText) modalSubPreviewText.innerHTML = `Thời gian thuê: <span style="color: #1d5194; font-weight: 700;">Nhiều ngày</span>`;
        }
    }

    if (btnConfirmTime) {
        btnConfirmTime.addEventListener('click', () => {
            if (currentMode === 'daily' && startDateObj) {
                let startStr = formatDate(startDateObj);
                let endStr = endDateObj ? formatDate(endDateObj) : startStr;
                let pTime = pickupTimeSelect ? pickupTimeSelect.value : "09:00";
                let rTime = returnTimeSelect ? returnTimeSelect.value : "20:00";

                document.getElementById('pickupTimeText').innerText = `${pTime}, ${startStr}`;
                document.getElementById('returnTimeText').innerText = `${rTime}, ${endStr}`;
            } else if (currentMode === 'hourly') {
                document.getElementById('pickupTimeText').innerText = modalPreviewText.innerText.split(' - ')[0];
                document.getElementById('returnTimeText').innerText = modalPreviewText.innerText.split(' - ')[1];
            }
            updateRentalSummary();

            // Đồng bộ URL nếu đang ở trang find.html
            try {
                const url = new URL(window.location.href);
                if (window.location.pathname.includes('find.html')) {
                    const p = document.getElementById('pickupTimeText')?.textContent.trim();
                    const r = document.getElementById('returnTimeText')?.textContent.trim();
                    if (p) url.searchParams.set('pickup', p);
                    if (r) url.searchParams.set('return', r);
                    window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
                }
            } catch (e) {}

            if (timeModal) timeModal.classList.remove('active');
        });
    }

    // --- 4. BỘ LỌC DANH MỤC XE PHỔ BIẾN (TẤT CẢ, 4 CHỖ, 7 CHỖ, SUV, XE ĐIỆN) ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    const homeCarCards = document.querySelectorAll('.car-item-card');
    let currentCarFilter = 'all';

    function filterCars(filterKey) {
        currentCarFilter = filterKey;
        const normalizedKey = filterKey.toLowerCase().trim();

        homeCarCards.forEach(card => {
            const categories = (card.getAttribute('data-category') || 'all').toLowerCase().split(' ');
            const seats = card.getAttribute('data-seats') || '';
            let isMatch = false;

            if (normalizedKey === 'all' || normalizedKey === 'tất cả') {
                isMatch = true;
            } else if (normalizedKey === '4-seats' || normalizedKey === '4 chỗ') {
                isMatch = categories.includes('4-seats') || seats === '4' || seats === '5';
            } else if (normalizedKey === '7-seats' || normalizedKey === '7 chỗ') {
                isMatch = categories.includes('7-seats') || seats === '7';
            } else if (normalizedKey === 'suv') {
                isMatch = categories.includes('suv');
            } else if (normalizedKey === 'electric' || normalizedKey === 'xe điện') {
                isMatch = categories.includes('electric');
            }

            if (isMatch) {
                card.style.display = '';
                // Kích hoạt lại animation fade-in nhẹ nhàng
                card.style.animation = 'none';
                card.offsetHeight; // force reflow
                card.style.animation = 'fadeInCard 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filterKey = this.getAttribute('data-filter') || this.textContent.trim();
            filterCars(filterKey);
        });
    });

    const searchBtn = document.querySelector('.btn-search-main');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => goToFind());
    }

    // Nút "Xem tất cả xe" chuyển sang find.html đồng bộ theo danh mục đang chọn
    document.querySelector('.btn-view-all')?.addEventListener('click', () => {
        const overrides = {};
        if (currentCarFilter === '4-seats' || currentCarFilter === '4 chỗ') {
            overrides.seats = '4';
            overrides.carType = '4-seats';
        } else if (currentCarFilter === '7-seats' || currentCarFilter === '7 chỗ') {
            overrides.seats = '7';
            overrides.carType = '7-seats';
        } else if (currentCarFilter === 'suv') {
            overrides.carType = 'suv';
        } else if (currentCarFilter === 'electric' || currentCarFilter === 'xe điện') {
            overrides.fuel = 'electric';
            overrides.carType = 'electric';
        }
        goToFind(overrides);
    });

    document.querySelectorAll('.city-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const city = card.querySelector('h3')?.textContent.trim();
            if (city) {
                sessionStorage.setItem('azuCarSelectedLocation', city);
            }
            goToFind({ location: city });
        });
    });

    document.querySelectorAll('.car-item-card').forEach(card => {
        const openDetail = () => {
            const seatsAttr = card.getAttribute('data-seats');
            const transText = card.querySelector('.car-trans')?.textContent.trim() || 'Tự động';
            let seatsValue = seatsAttr ? `${seatsAttr} chỗ` : '5 chỗ';
            if (transText.includes('7 chỗ')) seatsValue = '7 chỗ';
            else if (transText.includes('4 chỗ')) seatsValue = '4 chỗ';

            openCarDetail({
                name: card.querySelector('h3')?.textContent.trim() || 'Xe AZU Car',
                image: card.querySelector('img')?.src || '',
                location: card.querySelector('.car-loc')?.textContent.replace(/^\s*/, '').trim() || '',
                price: card.querySelector('.val')?.childNodes[0]?.textContent.trim() || '',
                transmission: transText,
                seats: seatsValue
            });
        };
        card.style.cursor = 'pointer';
        card.addEventListener('click', openDetail);
        card.querySelector('.btn-detail')?.addEventListener('click', event => {
            event.stopPropagation();
            event.preventDefault();
            openDetail();
        });
    });

});