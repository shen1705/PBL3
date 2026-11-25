if (!window.AzuStore.isLoggedIn()) {
    window.AzuStore.requireLogin('/account');
}

const accountKeys = {
    name: 'azuCarDisplayName',
    fullName: 'azuCarFullName',
    username: 'azuCarUserName',
    phone: 'azuCarPhone',
    email: 'azuCarEmail',
    birthday: 'azuCarBirthday',
    gender: 'azuCarGender',
    licenseNumber: 'azuCarLicenseNumber',
    licenseHolder: 'azuCarLicenseHolder',
    licenseBirthday: 'azuCarLicenseBirthday',
    hasDriverLicense: 'azuCarHasDriverLicense',
    licenseClass: 'azuCarLicenseClass',
    licenseExpiryDate: 'azuCarLicenseExpiryDate',
    licenseImageFront: 'azuCarLicenseImageFront'
};

function formatDate(value) {
    if (!value) return '';
    const dateParts = value.split('-');
    return dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : value;
}

// Sidebar & Sections
const accountSection = document.getElementById('account-section');
const tripsSection = document.getElementById('trips-section');
const addressSection = document.getElementById('address-section');
const privacySection = document.getElementById('privacy-section');
const passwordSection = document.getElementById('password-section');
const favoritesSection = document.getElementById('favorites-section');
const favoritesGrid = document.getElementById('favorites-grid');
const favoritesEmpty = document.getElementById('favorites-empty');
const navAccount = document.getElementById('nav-account');
const navCards = document.getElementById('nav-cards');
const navFavorites = document.getElementById('nav-favorites');
const navTrips = document.getElementById('nav-trips');
const navOrders = document.getElementById('nav-orders');
const navAddress = document.getElementById('nav-address');
const navPrivacy = document.getElementById('nav-privacy');
const navPassword = document.getElementById('nav-password');

// Dialogs & Forms
const addAddressDialog = document.getElementById('add-address-dialog');
const btnOpenAddAddress = document.getElementById('btn-open-add-address');
const newAddressForm = document.getElementById('new-address-form');
const addressEmptyState = document.getElementById('address-empty-state');
const addressList = document.getElementById('address-list');

const provinceSelect = document.getElementById('address-province-select');
const districtSelect = document.getElementById('address-district-select');
const wardSelect = document.getElementById('address-ward-select');
const addressTypeInput = document.getElementById('address-type-input');
const addressNameInput = document.getElementById('address-name-input');
const addressStreetInput = document.getElementById('address-street-input');
const addressIsDefault = document.getElementById('address-is-default');

const passwordPageForm = document.getElementById('password-page-form');
const passwordMsgAlert = document.getElementById('password-msg-alert');

const tripSidebarAvatar = document.getElementById('trip-sidebar-avatar');
const tripSidebarName = document.getElementById('trip-sidebar-name');
const profilePhone = document.getElementById('profile-phone');
const profileEmail = document.getElementById('profile-email');
const profileBirthday = document.getElementById('profile-birthday');
const profileGender = document.getElementById('profile-gender');
const accountTripCount = document.getElementById('account-trip-count');

// Trips elements
const tripsList = document.getElementById('trips-list');
const tripsEmpty = document.getElementById('trips-empty');
const tripDetailView = document.getElementById('trip-detail-view');
const emptyTripsTitle = document.getElementById('empty-trips-title');
const emptyTripsDescription = document.getElementById('empty-trips-description');
let currentTripDetail = null;
let currentTripDetailTab = 'overview';

// switch views
function showView(viewName, renderList = true) {
    const isCards = viewName === 'cards';
    const isAccount = viewName === 'account' || isCards;
    const isAddress = viewName === 'address';
    const isPrivacy = viewName === 'privacy';
    const isPassword = viewName === 'password';
    const isFavorites = viewName === 'favorites';
    const isTrips = !isAccount && !isAddress && !isPrivacy && !isPassword && !isFavorites;

    if (accountSection) accountSection.hidden = !isAccount;
    if (addressSection) addressSection.hidden = !isAddress;
    if (privacySection) privacySection.hidden = !isPrivacy;
    if (passwordSection) passwordSection.hidden = !isPassword;
    if (favoritesSection) favoritesSection.hidden = !isFavorites;
    if (tripsSection) tripsSection.hidden = !isTrips;

    document.querySelectorAll('.trips-side-nav .trips-side-link').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });

    if (isAccount) {
        if (isCards && navCards) {
            navCards.classList.add('active');
            navCards.setAttribute('aria-current', 'page');
        } else if (navAccount) {
            navAccount.classList.add('active');
            navAccount.setAttribute('aria-current', 'page');
        }
        renderAccountData();
    } else if (isFavorites) {
        if (navFavorites) {
            navFavorites.classList.add('active');
            navFavorites.setAttribute('aria-current', 'page');
        }
        loadFavoriteCars();
    } else if (isAddress) {
        if (navAddress) {
            navAddress.classList.add('active');
            navAddress.setAttribute('aria-current', 'page');
        }
        renderSavedAddresses();
    } else if (isPrivacy) {
        if (navPrivacy) {
            navPrivacy.classList.add('active');
            navPrivacy.setAttribute('aria-current', 'page');
        }
    } else if (isPassword) {
        if (navPassword) {
            navPassword.classList.add('active');
            navPassword.setAttribute('aria-current', 'page');
        }
        if (passwordMsgAlert) passwordMsgAlert.hidden = true;
        document.getElementById('current-password-input')?.focus();
    } else {
        if (navTrips) {
            navTrips.classList.add('active');
            navTrips.setAttribute('aria-current', 'page');
        }
        if (renderList) {
            renderTrips();
        }
    }
}

function handleHashNavigation() {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const bookingIdParam = urlParams.get('bookingId') || urlParams.get('id');

    if (hash === '#trips' || hash === '#orders' || bookingIdParam) {
        if (bookingIdParam) {
            showView('trips', false);
            openTripDetails(bookingIdParam);
        } else {
            showView('trips', true);
        }
    } else if (hash === '#favorites') {
        showView('favorites');
    } else if (hash === '#address') {
        showView('address');
    } else if (hash === '#privacy') {
        showView('privacy');
    } else if (hash === '#password') {
        showView('password');
    } else if (hash === '#cards') {
        showView('cards');
        setTimeout(() => {
            document.getElementById('payment-card-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    } else {
        showView('account');
    }
}

window.addEventListener('hashchange', handleHashNavigation);
window.addEventListener('azu:auth-changed', () => { renderAccountData(); });

// Sidebar Clicks
navAccount?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#account');
    showView('account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navCards?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#cards');
    showView('cards');
    setTimeout(() => {
        document.getElementById('payment-card-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
});

navFavorites?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#favorites');
    showView('favorites');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navTrips?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#trips');
    showView('trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navOrders?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#orders');
    showView('trips');
    document.querySelectorAll('.trips-side-nav .trips-side-link').forEach(link => link.classList.remove('active'));
    navOrders.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navAddress?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#address');
    showView('address');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navPrivacy?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#privacy');
    showView('privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navPassword?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#password');
    showView('password');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// privacy modal
const TRIP_PRIVACY_TEMPLATES = {
    personal: {
        title: 'CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN',
        subtitle: 'Tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân',
        badge: 'Quy chuẩn bảo mật',
        content: `
            <div class="contract-info-grid">
                <div class="info-block">
                    <h4>ĐỐI TƯỢNG ÁP DỤNG</h4>
                    <p><strong>Khách hàng:</strong> Khách thuê xe trên nền tảng AZU Car</p>
                    <p><strong>Phạm vi dữ liệu:</strong> Họ tên, SĐT, CCCD, GPLX, Email</p>
                </div>
                <div class="info-block">
                    <h4>TIÊU CHUẨN BẢO MẬT</h4>
                    <p><strong>Mã hóa an toàn:</strong> Giao thức SSL/TLS 256-bit chuẩn quốc tế</p>
                    <p><strong>Hệ thống máy chủ:</strong> Đám mây bảo mật đa tầng, sao lưu định kỳ</p>
                </div>
            </div>

            <div class="contract-terms-box">
                <p><strong>1. Mục đích thu thập thông tin:</strong> Dữ liệu cá nhân chỉ được thu thập nhằm mục đích xác thực danh tính hợp pháp của người lái xe (CCCD, GPLX), kích hoạt gói bảo hiểm chuyến đi và liên hệ hỗ trợ giao nhận phương tiện an toàn.</p>
            </div>

            <div class="contract-terms-box">
                <p><strong>2. Cam kết tuyệt đối không chia sẻ:</strong> AZU Car cam kết không bán, không chia sẻ hay cung cấp dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc thương mại khi chưa có sự đồng ý bằng văn bản điện tử.</p>
            </div>

            <div class="contract-terms-box">
                <p><strong>3. Quyền của Chủ thể dữ liệu:</strong> Khách hàng có quyền tra cứu, cập nhật thông tin trong mục Tài khoản hoặc yêu cầu trích xuất, khóa tài khoản và xóa vĩnh viễn dữ liệu cá nhân theo Điều 9 Nghị định 13/2023/NĐ-CP.</p>
            </div>
        `
    },
    trip: {
        title: 'CHÍNH SÁCH BẢO VỆ AN TOÀN CHUYẾN ĐI',
        subtitle: 'Bảo hiểm toàn diện & Hỗ trợ cứu hộ khẩn cấp 24/7 trên mọi nẻo đường',
        badge: 'An toàn chuyến đi',
        content: `
            <div class="contract-info-grid">
                <div class="info-block">
                    <h4>GÓI BẢO HIỂM CHUYẾN ĐI</h4>
                    <p><strong>Bảo hiểm thân vỏ:</strong> Bảo vệ vật chất phương tiện suốt hành trình</p>
                    <p><strong>Bảo hiểm tai nạn:</strong> Bảo vệ quyền lợi mọi hành khách ngồi trên xe</p>
                </div>
                <div class="info-block">
                    <h4>HỖ TRỢ CỨU HỘ 24/7</h4>
                    <p><strong>Đường dây nóng:</strong> 1900 9217 (Hoạt động 24/7)</p>
                    <p><strong>Mạng lưới cứu hộ:</strong> Phủ rộng trên toàn quốc</p>
                </div>
            </div>

            <div class="contract-terms-box">
                <p><strong>1. Kích hoạt bảo hiểm tự động:</strong> Mỗi chuyến thuê xe tự lái thành công đều được hệ thống tự động kích hoạt gói bảo hiểm chuyến đi tương ứng, giúp bảo vệ quyền lợi tối đa của khách thuê trước các rủi ro va chạm hoặc tổn thất ngoài ý muốn.</p>
            </div>

            <div class="contract-terms-box">
                <p><strong>2. Giám sát an toàn GPS hành trình:</strong> Dữ liệu định vị GSHT trên phương tiện chỉ được sử dụng cho mục đích bảo vệ tài sản và hỗ trợ cứu hộ khẩn cấp khi xe gặp sự cố kỹ thuật hoặc tai nạn giao thông trong thời gian chuyến thuê diễn ra.</p>
            </div>

            <div class="contract-terms-box">
                <p><strong>3. Minh bạch tiền đặt cọc & Xử lý phạt nguội:</strong> Tiền cọc giữ qua hệ thống AZU Car được hoàn trả minh bạch và nhanh chóng ngay sau khi hoàn tất thủ tục trả xe và đối soát biên bản bàn giao xe thực tế.</p>
            </div>
        `
    }
};

function openPrivacyDocPreview(policyKey) {
    const policy = TRIP_PRIVACY_TEMPLATES[policyKey];
    if (!policy) return;

    const modal = document.getElementById('privacyDocModal');
    const titleEl = document.getElementById('privacyModalTitle');
    const subEl = document.getElementById('privacyModalSubtitle');
    const badgeEl = document.getElementById('privacyModalBadge');
    const bodyEl = document.getElementById('privacyModalBody');

    if (titleEl) titleEl.textContent = policy.title;
    if (subEl) subEl.textContent = policy.subtitle;
    if (badgeEl) badgeEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${policy.badge}`;
    if (bodyEl) bodyEl.innerHTML = policy.content;

    if (modal) modal.hidden = false;
}

document.getElementById('openPersonalPrivacyLink')?.addEventListener('click', () => openPrivacyDocPreview('personal'));
document.getElementById('openTripPrivacyLink')?.addEventListener('click', () => openPrivacyDocPreview('trip'));

document.getElementById('closePrivacyDocModalBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('privacyDocModal');
    if (modal) modal.hidden = true;
});

// Toggle password visibility (eye icon)
document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
        const wrap = btn.closest('.password-input-wrap');
        const input = wrap?.querySelector('input');
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye', !isPass);
            icon.classList.toggle('fa-eye-slash', isPass);
        }
    });
});

// Handle Password Form Submission
passwordPageForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (passwordMsgAlert) {
        passwordMsgAlert.hidden = true;
        passwordMsgAlert.className = 'password-msg-alert';
        passwordMsgAlert.textContent = '';
    }

    const currentPass = passwordPageForm.elements.currentPassword.value;
    const newPass = passwordPageForm.elements.newPassword.value;
    const confirm = passwordPageForm.elements.confirmPassword.value;

    if (newPass !== confirm) {
        if (passwordMsgAlert) {
            passwordMsgAlert.className = 'password-msg-alert error';
            passwordMsgAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Mật khẩu mới và mật khẩu xác nhận không khớp!';
            passwordMsgAlert.hidden = false;
        } else {
            alert('Mật khẩu mới và mật khẩu xác nhận không khớp!');
        }
        return;
    }

    if (newPass.length < 6) {
        if (passwordMsgAlert) {
            passwordMsgAlert.className = 'password-msg-alert error';
            passwordMsgAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Mật khẩu mới phải có tối thiểu 6 ký tự!';
            passwordMsgAlert.hidden = false;
        } else {
            alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
        }
        return;
    }

    if (currentPass && newPass === currentPass) {
        if (passwordMsgAlert) {
            passwordMsgAlert.className = 'password-msg-alert error';
            passwordMsgAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Mật khẩu mới không được trùng với mật khẩu hiện tại!';
            passwordMsgAlert.hidden = false;
        } else {
            alert('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
        }
        return;
    }

    const submitBtn = passwordPageForm.querySelector('#btn-save-password');
    const origText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang cập nhật...';
    }

    try {
        const res = await window.AzuStore.changePassword(currentPass, newPass, confirm);
        if (res && res.isSuccess) {
            passwordPageForm.reset();
            passwordPageForm.querySelectorAll('input').forEach(inp => inp.type = 'password');
            passwordPageForm.querySelectorAll('.btn-toggle-eye i').forEach(icon => {
                icon.className = 'fa-regular fa-eye';
            });

            if (passwordMsgAlert) {
                passwordMsgAlert.className = 'password-msg-alert success';
                passwordMsgAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + (res.message || 'Đổi mật khẩu thành công! Thông tin đăng nhập đã được cập nhật an toàn.');
                passwordMsgAlert.hidden = false;
            } else {
                alert('Đổi mật khẩu thành công!');
            }
        } else {
            const errorMsg = res?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.';
            if (passwordMsgAlert) {
                passwordMsgAlert.className = 'password-msg-alert error';
                passwordMsgAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + errorMsg;
                passwordMsgAlert.hidden = false;
            } else {
                alert(errorMsg);
            }
        }
    } catch (err) {
        if (passwordMsgAlert) {
            passwordMsgAlert.className = 'password-msg-alert error';
            passwordMsgAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Lỗi kết nối máy chủ. Vui lòng thử lại sau.';
            passwordMsgAlert.hidden = false;
        } else {
            alert('Lỗi kết nối máy chủ.');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    }
});

document.getElementById('account-trip-count-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#trips');
    showView('trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Render Account Data
function renderAccountData() {
    const currentName = sessionStorage.getItem(accountKeys.fullName) || sessionStorage.getItem(accountKeys.name) || 'Người dùng';
    const firstLetter = Array.from(currentName)[0]?.toLocaleUpperCase('vi') || 'U';

    document.querySelectorAll('[data-name]').forEach(el => { el.textContent = currentName; });
    document.querySelectorAll('[data-avatar]').forEach(el => { el.textContent = firstLetter; });
    if (tripSidebarName) tripSidebarName.textContent = currentName;
    if (tripSidebarAvatar) tripSidebarAvatar.textContent = firstLetter;

    const currentUsername = sessionStorage.getItem(accountKeys.username) || '';
    const profileUsernameEl = document.getElementById('profile-username');
    if (profileUsernameEl) {
        profileUsernameEl.textContent = currentUsername ? `@${currentUsername}` : '---';
    }
    const profileDetailUsernameEl = document.getElementById('profile-detail-username');
    if (profileDetailUsernameEl) {
        profileDetailUsernameEl.textContent = currentUsername || '---';
    }

    const phone = sessionStorage.getItem(accountKeys.phone)?.trim();
    const email = sessionStorage.getItem(accountKeys.email)?.trim();
    const phoneStatusBadge = document.getElementById('phone-status-badge');
    const emailStatusBadge = document.getElementById('email-status-badge');

    if (profilePhone) profilePhone.textContent = phone || 'Chưa cập nhật';
    if (phoneStatusBadge) {
        if (phone) {
            phoneStatusBadge.className = 'status status-verified';
            phoneStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã xác thực';
        } else {
            phoneStatusBadge.className = 'status status-pending';
            phoneStatusBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Chưa xác thực';
        }
    }

    if (profileEmail) profileEmail.textContent = email || 'Chưa cập nhật';
    if (emailStatusBadge) {
        if (email) {
            emailStatusBadge.className = 'status status-verified';
            emailStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã xác thực';
        } else {
            emailStatusBadge.className = 'status status-pending';
            emailStatusBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Chưa xác thực';
        }
    }

    if (profileBirthday) profileBirthday.textContent = formatDate(sessionStorage.getItem(accountKeys.birthday)) || 'Chưa cập nhật';
    if (profileGender) profileGender.textContent = sessionStorage.getItem(accountKeys.gender) || 'Chưa cập nhật';
    if (accountTripCount) accountTripCount.textContent = String(window.AzuStore.getTrips().length);

    renderLicenseData();
    syncUserProfile();
    loadPaymentCards();
}

// Profile Form & Dialog
const profileDialog = document.getElementById('profile-dialog');
const profileForm = document.getElementById('profile-form');
const editProfileBtn = document.getElementById('edit-profile-button');

editProfileBtn?.addEventListener('click', () => {
    const currentName = sessionStorage.getItem(accountKeys.name) || '';
    if (profileForm) {
        profileForm.elements.name.value = currentName === 'Người dùng' ? '' : currentName;
        profileForm.elements.phone.value = sessionStorage.getItem(accountKeys.phone) || '';
        profileForm.elements.email.value = sessionStorage.getItem(accountKeys.email) || '';
        profileForm.elements.birthday.value = sessionStorage.getItem(accountKeys.birthday) || '';
        profileForm.elements.gender.value = sessionStorage.getItem(accountKeys.gender) || '';
    }
    if (profileDialog) profileDialog.hidden = false;
    profileForm?.elements.name.focus();
});

profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = new FormData(profileForm);
    const newName = String(values.get('name') || '').trim();
    if (!newName) return;

    sessionStorage.setItem(accountKeys.name, newName);
    sessionStorage.setItem(accountKeys.phone, String(values.get('phone') || '').trim());
    sessionStorage.setItem(accountKeys.email, String(values.get('email') || '').trim());
    sessionStorage.setItem(accountKeys.birthday, String(values.get('birthday') || ''));
    sessionStorage.setItem(accountKeys.gender, String(values.get('gender') || ''));

    if (profileDialog) profileDialog.hidden = true;
    renderAccountData();
    window.AzuStore?.syncHeaderAuth?.();
});

// GPLX License Form
const licenseForm = document.getElementById('license-form');
const licenseEditButton = document.getElementById('edit-license-button');
const licenseInputs = licenseForm ? Array.from(licenseForm.querySelectorAll('input:not([type="file"])')) : [];
const licenseImageInput = document.getElementById('license-image');
const licenseImagePreview = document.getElementById('license-image-preview');
const licenseUpload = document.getElementById('license-upload');
const uploadPrompt = document.getElementById('upload-prompt');
const licenseSaveButton = document.getElementById('license-save-button');

function renderLicenseData() {
    const licenseStatusBadge = document.getElementById('license-status-badge') || document.querySelector('.license-heading .status');
    const hasDl = sessionStorage.getItem(accountKeys.hasDriverLicense) === 'true';
    const licenseNum = sessionStorage.getItem(accountKeys.licenseNumber) || '';
    const licenseHolder = sessionStorage.getItem(accountKeys.licenseHolder) || sessionStorage.getItem(accountKeys.fullName) || sessionStorage.getItem(accountKeys.name) || '';
    const licenseBirthday = sessionStorage.getItem(accountKeys.licenseBirthday) || sessionStorage.getItem(accountKeys.birthday) || '1995-01-01';
    const userName = sessionStorage.getItem(accountKeys.username) || '';
    let licenseImage = sessionStorage.getItem(accountKeys.licenseImageFront) || '';
    if (!licenseImage && hasDl && userName) {
        licenseImage = `/seed/license-${userName.toLowerCase()}.jpg`;
    }

    const isVerified = sessionStorage.getItem('azuCarLicenseVerified') === 'true';
    if (licenseStatusBadge) {
        if (hasDl && isVerified) {
            licenseStatusBadge.className = 'status status-verified';
            licenseStatusBadge.style.cssText = '';
            licenseStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã xác thực';
        } else if (hasDl && !isVerified) {
            licenseStatusBadge.className = 'status status-pending';
            licenseStatusBadge.style.cssText = 'background:#fef3c7;color:#b45309;padding:4px 10px;border-radius:20px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;';
            licenseStatusBadge.innerHTML = '<i class="fa-solid fa-clock"></i> Chờ duyệt';
        } else {
            licenseStatusBadge.className = 'status status-unverified';
            licenseStatusBadge.style.cssText = '';
            licenseStatusBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Chưa xác thực';
        }
    }

    if (licenseForm) {
        if (licenseForm.elements.number) licenseForm.elements.number.value = licenseNum;
        if (licenseForm.elements.holder) licenseForm.elements.holder.value = licenseHolder;
        if (licenseForm.elements.birthday) licenseForm.elements.birthday.value = licenseBirthday;
    }

    if (licenseImagePreview) {
        if (licenseImage) {
            licenseImagePreview.src = licenseImage;
            licenseImagePreview.hidden = false;
            if (uploadPrompt) uploadPrompt.hidden = true;
        } else {
            licenseImagePreview.hidden = true;
            if (uploadPrompt) uploadPrompt.hidden = false;
        }
    }
}

async function syncUserProfile() {
    try {
        const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
            const json = await res.json();
            if (json.isSuccess && json.data) {
                const u = json.data;
                const displayName = (u.fullName && u.fullName.trim()) || u.userName || '';
                sessionStorage.setItem(accountKeys.name, displayName);
                sessionStorage.setItem(accountKeys.fullName, (u.fullName && u.fullName.trim()) || '');
                if (u.userName) sessionStorage.setItem(accountKeys.username, u.userName);
                if (u.phoneNumber) sessionStorage.setItem(accountKeys.phone, u.phoneNumber);
                if (u.email) sessionStorage.setItem(accountKeys.email, u.email);
                sessionStorage.setItem(accountKeys.hasDriverLicense, u.hasDriverLicense ? 'true' : 'false');
                const isDlVerified = Boolean(
                    u.isDriverLicenseVerified === true ||
                    (Array.isArray(u.claims) && u.claims.includes('DriverLicenseVerified'))
                );
                sessionStorage.setItem('azuCarLicenseVerified', isDlVerified ? 'true' : 'false');
                if (u.claims) sessionStorage.setItem('azuCarClaims', JSON.stringify(u.claims));
                if (u.licenseNumber) sessionStorage.setItem(accountKeys.licenseNumber, u.licenseNumber);
                if (u.licenseClass) sessionStorage.setItem(accountKeys.licenseClass, u.licenseClass);
                if (u.licenseExpiryDate) sessionStorage.setItem(accountKeys.licenseExpiryDate, u.licenseExpiryDate);
                if (u.licenseImageFront) {
                    sessionStorage.setItem(accountKeys.licenseImageFront, u.licenseImageFront);
                } else if (u.hasDriverLicense && u.userName) {
                    sessionStorage.setItem(accountKeys.licenseImageFront, `/seed/license-${u.userName.toLowerCase()}.jpg`);
                }
                renderLicenseData();
            }
        }
    } catch (e) {
        console.warn('Sync profile error:', e);
    }
}

if (licenseForm) {
    renderLicenseData();
}

function setLicenseEditing(isEditing) {
    licenseInputs.forEach(input => { input.disabled = !isEditing; });
    if (licenseImageInput) {
        licenseImageInput.disabled = !isEditing;
        licenseImageInput.required = isEditing && !sessionStorage.getItem(accountKeys.hasDriverLicense);
    }
    licenseUpload?.classList.toggle('is-disabled', !isEditing);
    if (licenseSaveButton) licenseSaveButton.hidden = !isEditing;
    if (licenseEditButton) {
        licenseEditButton.innerHTML = isEditing
            ? 'Hủy chỉnh sửa <i class="fa-solid fa-xmark"></i>'
            : 'Chỉnh sửa <i class="fa-solid fa-pen"></i>';
        licenseEditButton.setAttribute('aria-pressed', String(isEditing));
    }
}

licenseEditButton?.addEventListener('click', () => {
    const isEditing = licenseInputs.some(input => !input.disabled);
    if (isEditing) {
        renderLicenseData();
        if (licenseImageInput) licenseImageInput.value = '';
        setLicenseEditing(false);
        return;
    }

    setLicenseEditing(true);
    licenseForm?.elements.number?.focus();
});

licenseImageInput?.addEventListener('change', () => {
    const image = licenseImageInput.files[0];
    if (!image) return;
    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supportedImageTypes.includes(image.type)) {
        licenseImageInput.setCustomValidity('Vui lòng chọn ảnh định dạng JPG, PNG hoặc WEBP.');
        licenseImageInput.reportValidity();
        licenseImageInput.value = '';
        return;
    }
    if (image.size > 8 * 1024 * 1024) {
        licenseImageInput.setCustomValidity('Ảnh GPLX cần nhỏ hơn 8 MB.');
        licenseImageInput.reportValidity();
        licenseImageInput.value = '';
        return;
    }

    licenseImageInput.setCustomValidity('');
    if (licenseImagePreview) {
        licenseImagePreview.src = URL.createObjectURL(image);
        licenseImagePreview.hidden = false;
    }
    if (uploadPrompt) uploadPrompt.hidden = true;
});

licenseForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!licenseForm.reportValidity()) return;

    const values = new FormData(licenseForm);
    const num = String(values.get('number') || '').trim();
    const holder = String(values.get('holder') || '').trim();
    const bday = String(values.get('birthday') || '');

    const userName = sessionStorage.getItem(accountKeys.username) || 'renter1';
    let imageFront = sessionStorage.getItem(accountKeys.licenseImageFront) || `/seed/license-${userName.toLowerCase()}.jpg`;

    if (licenseImageInput && licenseImageInput.files && licenseImageInput.files[0]) {
        try {
            imageFront = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => resolve(`/seed/license-${userName.toLowerCase()}.jpg`);
                reader.readAsDataURL(licenseImageInput.files[0]);
            });
        } catch {
            imageFront = `/seed/license-${userName.toLowerCase()}.jpg`;
        }
    }

    try {
        const resp = await fetch('/api/auth/driver-license', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                licenseNumber: num,
                licenseClass: 'B2',
                expiryDate: '2035-12-31',
                imageFront: imageFront
            })
        });
        const resData = await resp.json();
        if (resp.ok && resData.isSuccess) {
            sessionStorage.setItem(accountKeys.licenseNumber, num);
            sessionStorage.setItem(accountKeys.licenseHolder, holder);
            sessionStorage.setItem(accountKeys.licenseBirthday, bday);
            sessionStorage.setItem(accountKeys.hasDriverLicense, 'true');
            sessionStorage.setItem('azuCarLicenseVerified', 'false');
            sessionStorage.setItem(accountKeys.licenseImageFront, imageFront);

            renderLicenseData();
            setLicenseEditing(false);
            alert('Đã cập nhật thông tin GPLX thành công! Hồ sơ đang được chuyển tới Quản trị viên để kiểm duyệt.');
            window.dispatchEvent(new CustomEvent('azu:auth-changed'));
        } else {
            alert(resData?.message || 'Không thể lưu thông tin GPLX.');
        }
    } catch {
        alert('Lỗi kết nối khi lưu thông tin GPLX.');
    }
});

// Dialog Close Buttons & ESC
document.querySelectorAll('[data-close-dialog]').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.dialog-backdrop').hidden = true;
    });
});

document.querySelectorAll('.dialog-backdrop').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.hidden = true;
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.dialog-backdrop').forEach(dialog => {
            dialog.hidden = true;
        });
    }
});

// Trips Logic
let trips = window.AzuStore.getTrips();
let activeTripType = 'current';

function tripIsCurrent(trip) {
    const returnDate = String(trip.return || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!returnDate) return true;

    const tripEnd = new Date(Number(returnDate[3]), Number(returnDate[2]) - 1, Number(returnDate[1]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripEnd >= today;
}

function getStatusBadgeInfo(status) {
    switch (status) {
        case 'Pending':
            return { text: 'Chờ chủ xe duyệt', bg: '#fef3c7', color: '#b45309' };
        case 'Accepted':
            return { text: 'Chủ xe đã duyệt', bg: '#dcfce7', color: '#15803d' };
        case 'Ongoing':
            return { text: 'Đang trong chuyến', bg: '#dbeafe', color: '#1d4ed8' };
        case 'Completed':
            return { text: 'Hoàn tất', bg: '#f1f5f9', color: '#475569' };
        case 'Cancelled':
            return { text: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' };
        case 'Rejected':
            return { text: 'Chủ xe từ chối', bg: '#fee2e2', color: '#b91c1c' };
        case 'Expired':
            return { text: 'Hết hạn duyệt', bg: '#f3f4f6', color: '#6b7280' };
        default:
            return { text: status, bg: '#f1f5f9', color: '#475569' };
    }
}

function escapeTripHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function formatTripDate(value, includeTime = false) {
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

function formatTripMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function tripDetailRow(label, value) {
    return `<div class="trip-detail-row"><span>${escapeTripHtml(label)}</span><strong>${escapeTripHtml(value || '—')}</strong></div>`;
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

    return `<section class="trip-calendar-month" aria-label="${escapeTripHtml(new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }))}">
        <strong>${escapeTripHtml(new Date(year, month, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }))}</strong>
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
        <span><i class="is-current-booking"></i> Đơn của bạn</span>
        <span><i class="is-busy"></i> Có đơn khác</span>
        <span><i class="is-owner-blocked"></i> Chủ xe đã khóa ngày</span>
    </div>`;
}

function renderTripDetail(booking, tab = 'overview') {
    const status = booking.status || '';
    const badge = getStatusBadgeInfo(status);
    const isAccepted = ['Accepted', 'Ongoing', 'Completed', 'Returned', 'InRental', 'Approved'].includes(status);
    const isCancelled = ['Cancelled', 'Rejected', 'Expired'].includes(status);
    const statusIndex = status === 'Completed' ? 3 : status === 'Ongoing' ? 2 : isAccepted ? 1 : 0;
    const steps = ['Chờ duyệt', 'Đã duyệt', 'Đang thuê', 'Hoàn tất'];
    const milestones = [
        formatTripDate(booking.createdAt, true),
        booking.acceptedAt ? formatTripDate(booking.acceptedAt, true) : 'Chờ chủ xe',
        booking.hasPickupConfirmed ? 'Đã xác nhận nhận xe' : 'Chưa nhận xe',
        booking.completedAt ? formatTripDate(booking.completedAt, true) : 'Chưa hoàn tất'
    ];
    const stepMarkup = steps.map((label, index) => `
        <div class="trip-progress-step ${index <= statusIndex && !isCancelled ? 'is-reached' : ''}">
            <span class="trip-progress-dot">${index + 1}</span>
            <strong>${label}</strong>
            <small>${escapeTripHtml(milestones[index])}</small>
        </div>`).join('');
    const handovers = Array.isArray(booking.handovers) ? booking.handovers : [];
    const currentUserId = sessionStorage.getItem('azuCarUserId') || '';
    const isOwner = Boolean(currentUserId && booking.ownerId === currentUserId && booking.renterId !== currentUserId);
    const userConfirmed = type => handovers.some(item =>
        String(item.type).toLowerCase() === type.toLowerCase() && item.confirmedBy === currentUserId);
    const canCancel = status === 'Pending' ||
        (status === 'Accepted' && new Date() < new Date(booking.startDate));
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
            ${confirmations.length ? confirmations.map(item => `<p>${escapeTripHtml(item.confirmerName || 'Thành viên')} · ${escapeTripHtml(formatTripDate(item.confirmedAt, true))}${item.odometer != null ? ` · ${escapeTripHtml(item.odometer)} km` : ''}${item.fuelLevel ? ` · ${escapeTripHtml(item.fuelLevel)}` : ''} · Ký quỹ sàn 100%</p>${item.notes ? `<p>${escapeTripHtml(item.notes)}</p>` : ''}`).join('') : '<p>Chưa có xác nhận.</p>'}
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
                description = `Khách thuê ${escapeTripHtml(booking.renterName || 'Khách')} đã đặt cọc và đang chờ bạn phê duyệt.`;
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
            const renterConfirmed = handovers.some(item =>
                String(item.type).toLowerCase() === 'return' && item.confirmedBy === booking.renterId);
            const ownerConfirmed = handovers.some(item =>
                String(item.type).toLowerCase() === 'return' && item.confirmedBy === booking.ownerId);

            if (isOwner) {
                if (renterConfirmed && !ownerConfirmed) {
                    title = 'Khách thuê đã gửi biên bản trả xe';
                    description = 'Khách thuê đã bàn giao trả xe. Vui lòng kiểm tra xe thực tế (ODO, nhiên liệu, thân vỏ, phạt nguội). Nếu xe ổn thỏa, hãy Nghiệm thu xe để hoàn tất. Nếu có hư hỏng/vi phạm, hãy Báo sự cố để phong tỏa tiền cọc.';
                    actions = `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Nghiệm thu nhận lại xe</button>${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                } else if (ownerConfirmed) {
                    title = 'Đã hoàn tất nghiệm thu';
                    description = 'Bạn đã xác nhận nhận lại xe.';
                    actions = '';
                } else {
                    title = 'Chuyến đang diễn ra';
                    description = 'Mở biên bản nhận lại xe khi khách trả xe để kiểm tra và kết thúc chuyến.';
                    actions = `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Mở biên bản nhận lại xe</button>${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                }
            } else {
                if (renterConfirmed) {
                    title = 'Đã gửi biên bản trả xe';
                    description = 'Bạn đã gửi thông tin bàn giao trả xe. Đang chờ chủ xe kiểm tra thực tế xe và xác nhận nghiệm thu hoàn tất chuyến đi.';
                    actions = `${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                } else {
                    title = 'Chuyến đang diễn ra';
                    description = 'Mở biên bản trả xe để ghi nhận tình trạng xe (ODO, mức xăng) và bàn giao cho chủ xe.';
                    actions = `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Mở biên bản trả xe</button>${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
                }
            }
        } else if (status === 'Completed') {
            title = 'Chuyến đã hoàn tất';
            description = isOwner ? 'Chuyến đi đã hoàn tất quyết toán. Chia sẻ đánh giá về khách thuê.' : 'Chuyến đi đã hoàn tất quyết toán. Chia sẻ đánh giá về chuyến đi.';
            actions = `${!booking.hasReviewed ? `<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="review">${isOwner ? 'Đánh giá khách thuê' : 'Đánh giá chuyến đi'}</button>` : '<span class="trip-detail-state is-done"><i class="fa-solid fa-check"></i> Đã đánh giá</span>'}${booking.hasDispute ? `<span class="trip-detail-state" style="margin-left: 8px;">Khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute" style="margin-left: 8px;">Khiếu nại sau chuyến</button>'}`;
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
        ${booking.hasDispute ? `<div class="trip-detail-notice is-warning">Đơn có khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}.</div>` : ''}`;
    } else if (tab === 'contract') {
        const reviews = Array.isArray(booking.reviews) ? booking.reviews : [];
        tabContent = `<div class="trip-detail-section">
            <h3>Thông tin hợp đồng</h3>
            ${tripDetailRow('Mã chuyến', `#${booking.bookingId}`)}
            ${tripDetailRow('Người thuê', booking.renterName)}
            ${tripDetailRow('Chủ xe', booking.ownerName)}
            ${tripDetailRow('Nhận xe', formatTripDate(booking.startDate, true))}
            ${tripDetailRow('Trả xe', formatTripDate(booking.endDate, true))}
            ${tripDetailRow('Tổng thời gian thuê', `${booking.rentalDays || 0} ngày`)}
            ${booking.pricePerDayAtBooking != null ? tripDetailRow('Giá thuê cơ bản mỗi ngày', formatTripMoney(booking.pricePerDayAtBooking)) : ''}
            ${tripDetailRow('Tổng giá thuê', formatTripMoney(booking.priceLockedTotal))}
            ${tripDetailRow('Ngày đặt', formatTripDate(booking.createdAt, true))}
            ${booking.responseDeadline ? tripDetailRow('Hạn phản hồi', formatTripDate(booking.responseDeadline, true)) : ''}
            ${booking.rejectReason ? tripDetailRow('Lý do từ chối', booking.rejectReason) : ''}
            ${booking.cancelReason ? tripDetailRow('Lý do hủy', booking.cancelReason) : ''}
            <div class="trip-detail-clauses">
                <h4>Điều khoản áp dụng</h4>
                <ul>
                    <li>Thanh toán ký quỹ 100% tổng giá thuê trực tuyến qua sàn AZU Car (tài khoản bảo chứng); không trả tiền thuê bằng tiền mặt khi nhận xe.</li>
                    <li>Chỉ có thể hủy khi đơn đang chờ duyệt hoặc đã được duyệt; đơn đã duyệt không thể hủy từ thời điểm nhận xe.</li>
                    <li>Nếu chủ xe không bàn giao xe, gửi báo sự cố kèm thông tin/bằng chứng để Staff xác minh. Nếu xác định lỗi chủ xe, đơn được xử lý theo quy trình khiếu nại và tiền cọc được hoàn theo kết quả xử lý.</li>
                </ul>
            </div>
            <div class="trip-terms-consent">
                ${booking.termsAcceptedAt
                    ? `<span class="trip-terms-confirmed"><i class="fa-solid fa-circle-check"></i> Đã đồng ý lúc ${escapeTripHtml(formatTripDate(booking.termsAcceptedAt, true))}</span>`
                    : `<label><input type="checkbox" data-trip-terms-checkbox><span>Tôi đã đọc và đồng ý với các điều khoản trên.</span></label><button type="button" class="trip-detail-action is-primary" data-trip-detail-action="accept-terms" disabled>Xác nhận đồng ý</button>`}
            </div>
            <button type="button" class="trip-detail-action is-secondary trip-print-contract" data-trip-detail-action="print"><i class="fa-solid fa-print"></i> In / Lưu PDF</button>
        </div>
        ${reviews.length ? `<div class="trip-detail-section"><h3>Đánh giá</h3>${reviews.map(review => `<p class="trip-detail-review"><strong>${escapeTripHtml(review.rating)} / 5</strong> · ${escapeTripHtml(review.comment || 'Không có nhận xét.')}</p>`).join('')}</div>` : ''}`;
    } else {
        const vehicleName = booking.vehicleName || 'Xe thuê';
        const image = window.AzuVehicleImages?.resolve(vehicleName, booking.coverImageUrl || '') || booking.coverImageUrl || '';
        const hasPriceBreakdown = booking.pricePerDayAtBooking != null &&
            booking.rentalSubtotal != null && booking.deliveryFee != null && booking.insuranceFee != null;
        const rentalSubtotal = hasPriceBreakdown ? Number(booking.rentalSubtotal) : Number(booking.priceLockedTotal || 0);
        const extraFees = hasPriceBreakdown ? Number(booking.deliveryFee) + Number(booking.insuranceFee) : null;
        const feeNotes = hasPriceBreakdown
            ? [
                Number(booking.deliveryFee) > 0 ? `Giao xe ${formatTripMoney(booking.deliveryFee)}` : '',
                Number(booking.insuranceFee) > 0 ? `Bảo hiểm ${formatTripMoney(booking.insuranceFee)}` : ''
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
                    ${image ? `<img src="${escapeTripHtml(image)}" alt="${escapeTripHtml(vehicleName)}">` : '<div class="trip-detail-image-placeholder"><i class="fa-solid fa-car-side"></i></div>'}
                    <div><h3>${escapeTripHtml(vehicleName)}</h3><p>${escapeTripHtml(booking.city || 'Chưa có địa điểm')}${booking.district ? ` · ${escapeTripHtml(booking.district)}` : ''}</p>
                    ${booking.licensePlate ? `<p class="trip-detail-plate"><span>Biển số</span><strong>${escapeTripHtml(booking.licensePlate)}</strong></p>` : ''}</div>
                </div>
                <h3>Lịch trình</h3>
                ${tripDetailRow('Nhận xe', formatTripDate(booking.startDate, true))}
                ${tripDetailRow('Trả xe', formatTripDate(booking.endDate, true))}
                ${tripDetailRow('Thời gian thuê', `${booking.rentalDays || 0} ngày`)}
                <details class="trip-rental-calendar"><summary>Lịch hoạt động &amp; ngày bận</summary>${renderRentalCalendar(booking)}</details>
                ${tripDetailRow('Hình thức nhận xe', booking.deliveryMethod || 'Nhận tại địa điểm xe')}
                ${booking.deliveryAddress ? tripDetailRow('Địa chỉ giao xe', booking.deliveryAddress) : ''}
                <h3 class="trip-detail-subheading">Thông tin khách hàng</h3>
                ${tripDetailRow('Khách thuê', booking.renterName || (isOwner ? 'Khách thuê' : 'Tôi'))}
                ${tripDetailRow('Số điện thoại', booking.renterPhone || 'Chưa cung cấp')}
                ${isOwner ? '' : `
                <h3 class="trip-detail-subheading">Liên hệ chủ xe</h3>
                ${tripDetailRow('Chủ xe', booking.ownerName || 'Chủ xe')}
                ${tripDetailRow('Số điện thoại', booking.ownerPhone || 'Chưa cung cấp')}
                `}
            </div>
            <aside class="trip-detail-payment">
                <h3>Cọc &amp; thanh toán</h3>
                <div class="trip-payment-line">
                    <div><span>Giá thuê</span>${hasPriceBreakdown ? `<small>${formatTripMoney(booking.pricePerDayAtBooking)} × ${booking.rentalDays || 0} ngày</small>` : ''}</div>
                    <strong>${formatTripMoney(rentalSubtotal)}</strong>
                </div>
                <div class="trip-payment-line">
                    <div><span>Phụ phí phát sinh</span>${extraFees && extraFees > 0 ? `<small>${escapeTripHtml(feeNotes)}</small>` : ''}</div>
                    <strong>${extraFees && extraFees > 0 ? formatTripMoney(extraFees) : '0 đ'}</strong>
                </div>
                <div class="trip-payment-total"><span>Tổng giá trị thuê</span><strong>${formatTripMoney(booking.priceLockedTotal)}</strong></div>
                <div class="trip-payment-deposit">
                    <div class="trip-payment-line">
                        <div><span>Thanh toán Ký quỹ (100%)</span><span class="trip-payment-status">${escapeTripHtml(depositLabel)}</span></div>
                        <strong>${formatTripMoney(booking.depositAmount)}</strong>
                    </div>
                </div>
            </aside>
        </div>
        ${isCancelled ? `<div class="trip-detail-notice is-warning">${escapeTripHtml(booking.cancelReason || booking.rejectReason || badge.text)}</div>` : ''}`;
    }

    return `<div class="trip-detail-heading">
        <button class="trip-detail-back" type="button" data-trip-detail-back><i class="fa-solid fa-arrow-left"></i> Quay lại lịch sử thuê</button>
        <div class="trip-detail-title-row"><h2>Chi tiết chuyến #${escapeTripHtml(booking.bookingId)}</h2><span class="trip-status" style="background:${badge.bg};color:${badge.color}">${escapeTripHtml(badge.text)}</span></div>
    </div>
    <div class="trip-progress" aria-label="Tiến trình chuyến thuê">${stepMarkup}</div>
    ${renderTasks()}
    <div class="trip-detail-tabs" role="tablist" aria-label="Thông tin chuyến">
        <button type="button" role="tab" aria-selected="${tab === 'overview'}" data-trip-detail-tab="overview">Tổng quan</button>
        <button type="button" role="tab" aria-selected="${tab === 'handover'}" data-trip-detail-tab="handover">Giao &amp; trả xe</button>
        <button type="button" role="tab" aria-selected="${tab === 'contract'}" data-trip-detail-tab="contract">Hợp đồng</button>
    </div>
    ${tabContent}`;
}

function renderCurrentTripDetail() {
    if (!tripDetailView || !currentTripDetail) return;
    tripDetailView.innerHTML = renderTripDetail(currentTripDetail, currentTripDetailTab);
    const detailImage = tripDetailView.querySelector('.trip-detail-vehicle img');
    detailImage?.addEventListener('error', () => {
        detailImage.src = window.AzuVehicleImages?.placeholder || '';
    }, { once: true });
}

async function handleTripDetailAction(action, button) {
    if (!currentTripDetail) return;
    if (action === 'print') {
        window.print();
        return;
    }
    if (action === 'handover') {
        currentTripDetailTab = 'handover';
        renderCurrentTripDetail();
        return;
    }
    const bookingId = currentTripDetail.bookingId;
    if (action === 'review') {
        const starsStr = prompt('Đánh giá chất lượng dịch vụ (từ 1 đến 5 sao):', '5');
        if (starsStr === null) return;
        const rating = parseInt(starsStr, 10);
        if (Number.isNaN(rating) || rating < 1 || rating > 5) {
            alert('Số sao không hợp lệ (vui lòng chọn từ 1 đến 5 sao).');
            return;
        }
        const comment = prompt('Nhận xét của bạn về chuyến đi:', 'Xe đi rất êm, sạch sẽ, chủ xe nhiệt tình!');
        if (comment === null) return;
        button.disabled = true;
        try {
            const r = await fetch(`/api/bookings/${bookingId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment: comment || 'Chuyến đi tuyệt vời!' })
            });
            const d = await r.json();
            if (r.ok && d.isSuccess) {
                alert(d?.message || 'Cảm ơn bạn đã gửi đánh giá!');
                await openTripDetails(bookingId);
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
    const currentUserId = sessionStorage.getItem('azuCarUserId') || '';
    const isOwner = Boolean(currentUserId && currentTripDetail.ownerId === currentUserId && currentTripDetail.renterId !== currentUserId);

    if (action === 'respond-accept' || action === 'respond-reject') {
        const accept = action === 'respond-accept';
        const reason = accept ? null : prompt('Nhập lý do từ chối đơn:');
        if (!accept && reason === null) return;
        url = `/api/bookings/${bookingId}/respond`;
        body = { accept, reason: reason ? reason.trim() : null };
        method = 'PUT';
    } else if (action === 'accept-terms') {
        const consent = tripDetailView.querySelector('[data-trip-terms-checkbox]');
        if (!consent?.checked) return;
        url = `/api/bookings/${bookingId}/accept-terms`;
    } else if (action === 'pickup' || action === 'return') {
        url = `/api/bookings/${bookingId}/${action}`;
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
                trip: currentTripDetail,
                isOwner,
                onSuccess: async () => {
                    await openTripDetails(bookingId);
                    renderTrips();
                }
            });
            return;
        }
        const reason = prompt('Nhập lý do hủy đơn:');
        if (reason === null) return;
        url = `/api/bookings/${bookingId}/cancel`;
        body = { reason: reason.trim() || (isOwner ? 'Chủ xe chủ động hủy đơn' : 'Khách thuê chủ động hủy chuyến') };
    } else if (action === 'dispute') {
        if (window.AzuDisputeModal) {
            window.AzuDisputeModal.open({
                bookingId: currentTripDetail.bookingId,
                vehicleName: currentTripDetail.vehicleName,
                otherPartyName: isOwner ? currentTripDetail.renterName : currentTripDetail.ownerName,
                isOwner,
                depositAmount: currentTripDetail.depositAmount || 0,
                onSuccess: async () => {
                    await openTripDetails(bookingId);
                }
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
            throw new Error(result?.message || 'Không thể cập nhật chuyến.');
        }
        if (result.data && typeof result.data === 'object' && result.data.bookingId) {
            currentTripDetail = result.data;
        } else {
            const detailResponse = await fetch(`/api/bookings/${bookingId}`);
            const detailResult = await detailResponse.json();
            if (!detailResponse.ok || !detailResult?.isSuccess || !detailResult.data) {
                throw new Error(detailResult?.message || 'Đã cập nhật nhưng không thể tải lại chi tiết chuyến.');
            }
            currentTripDetail = detailResult.data;
        }
        renderCurrentTripDetail();
    } catch (error) {
        const feedback = tripDetailView?.querySelector('.trip-detail-action-feedback');
        if (feedback) feedback.textContent = error.message || 'Lỗi kết nối máy chủ.';
        button.disabled = false;
    }
}

async function openTripDetails(bookingId) {
    if (!tripDetailView) return;
    currentTripDetail = null;
    currentTripDetailTab = 'overview';

    const url = new URL(window.location.href);
    if (url.searchParams.get('bookingId') !== String(bookingId)) {
        url.searchParams.set('bookingId', bookingId);
        url.searchParams.delete('id');
        history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + '#trips');
    }

    const tripsHeading = document.getElementById('trips-title')?.closest('.section-page-heading');
    if (tripsHeading) tripsHeading.hidden = true;
    document.querySelector('.trips-tabs')?.setAttribute('hidden', '');
    document.getElementById('trips-history-filters')?.setAttribute('hidden', '');
    if (tripsList) tripsList.hidden = true;
    if (tripsEmpty) tripsEmpty.hidden = true;
    tripDetailView.hidden = false;
    tripDetailView.innerHTML = '<p class="trip-detail-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải chi tiết chuyến...</p>';

    try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
        const result = await response.json();
        if (!response.ok || !result?.isSuccess || !result.data) {
            throw new Error(result?.message || 'Không thể tải chi tiết chuyến.');
        }
        currentTripDetail = result.data;
        renderCurrentTripDetail();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        tripDetailView.innerHTML = `<button class="trip-detail-back" type="button" data-trip-detail-back><i class="fa-solid fa-arrow-left"></i> Quay lại lịch sử thuê</button><p class="trip-detail-error">${escapeTripHtml(error.message || 'Không thể tải chi tiết chuyến.')}</p>`;
    }
}

tripDetailView?.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-trip-detail-action]');
    if (actionButton) {
        handleTripDetailAction(actionButton.dataset.tripDetailAction, actionButton);
        return;
    }

    const backButton = event.target.closest('[data-trip-detail-back]');
    if (backButton) {
        const url = new URL(window.location.href);
        if (url.searchParams.has('bookingId') || url.searchParams.has('id')) {
            url.searchParams.delete('bookingId');
            url.searchParams.delete('id');
            history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + '#trips');
        }
        currentTripDetail = null;
        if (tripDetailView) tripDetailView.hidden = true;
        renderTrips();
        return;
    }

    const tabButton = event.target.closest('[data-trip-detail-tab]');
    if (tabButton && currentTripDetail) {
        currentTripDetailTab = tabButton.dataset.tripDetailTab;
        renderCurrentTripDetail();
    }
});

tripDetailView?.addEventListener('change', event => {
    if (!event.target.matches('[data-trip-terms-checkbox]')) return;
    const acceptButton = tripDetailView.querySelector('[data-trip-detail-action="accept-terms"]');
    if (acceptButton) acceptButton.disabled = !event.target.checked;
});

async function renderTrips() {
    if (!tripsList || !tripsEmpty) return;

    const tripsHeading = document.getElementById('trips-title')?.closest('.section-page-heading');
    if (tripsHeading) tripsHeading.hidden = false;
    if (tripDetailView) tripDetailView.hidden = true;
    document.querySelector('.trips-tabs')?.removeAttribute('hidden');

    tripsList.replaceChildren();
    const loadingEl = document.createElement('div');
    loadingEl.style.padding = '32px 16px';
    loadingEl.style.textAlign = 'center';
    loadingEl.style.color = '#64748b';
    loadingEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách chuyến đi...';
    tripsList.appendChild(loadingEl);
    tripsList.hidden = false;
    tripsEmpty.hidden = true;

    let apiTrips = [];
    try {
        const resp = await fetch(`/api/bookings/my-trips?status=${activeTripType}`);
        if (resp.ok) {
            const resData = await resp.json();
            if (resData && resData.isSuccess && Array.isArray(resData.data)) {
                apiTrips = resData.data;
            }
        }
    } catch (e) {
        console.warn('Không thể tải danh sách chuyến từ API, dùng dữ liệu local:', e);
    }

    tripsList.replaceChildren();

    if (apiTrips.length === 0) {
        const localTrips = window.AzuStore?.getTrips ? window.AzuStore.getTrips() : [];
        const visibleTrips = localTrips.filter(trip => tripIsCurrent(trip) === (activeTripType === 'current'));

        if (!visibleTrips.length) {
            tripsList.hidden = true;
            tripsEmpty.hidden = false;
            if (emptyTripsTitle) {
                emptyTripsTitle.textContent = activeTripType === 'current'
                    ? 'Bạn chưa có chuyến đi nào'
                    : 'Chưa có chuyến đi trong lịch sử';
            }
            if (emptyTripsDescription) {
                emptyTripsDescription.textContent = activeTripType === 'current'
                    ? 'Hãy lên kế hoạch cho chuyến hành trình sắp tới và trải nghiệm dịch vụ xe tự lái cao cấp từ AZU Car ngay hôm nay.'
                    : 'Các chuyến đi đã hoàn tất sẽ được lưu lại tại đây.';
            }
            return;
        }

        tripsList.hidden = false;
        tripsEmpty.hidden = true;

        visibleTrips.forEach(trip => {
            const card = document.createElement('article');
            card.className = 'trip-card';
            card.style.position = 'relative';

            const image = document.createElement('img');
            image.src = trip.image || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600';
            image.alt = trip.name || 'Xe đã đặt';

            const info = document.createElement('div');
            const title = document.createElement('h2');
            const bId = trip.bookingId || trip.id;
            if (bId) {
                const titleLink = document.createElement('a');
                titleLink.href = `/booking/${bId}`;
                titleLink.textContent = trip.name;
                titleLink.title = 'Xem chi tiết đơn thuê xe';
                titleLink.style.cssText = 'color: #1c2635; text-decoration: none; transition: color 0.2s ease; cursor: pointer;';
                titleLink.addEventListener('mouseenter', () => { titleLink.style.color = '#2563eb'; });
                titleLink.addEventListener('mouseleave', () => { titleLink.style.color = '#1c2635'; });
                title.appendChild(titleLink);
            } else {
                title.textContent = trip.name;
            }
            const meta = document.createElement('p');
            meta.textContent = `${trip.location || 'TP. Đà Nẵng'} • ${trip.pickup || ''} - ${trip.return || ''}`;
            const status = document.createElement('span');
            status.className = 'trip-status';
            status.textContent = trip.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt';
            const price = document.createElement('strong');
            price.textContent = trip.total || (trip.price ? `${trip.price}/ngày` : '');
            info.append(title, meta, status, price);

            card.append(image, info);
            tripsList.append(card);
        });
        return;
    }

    tripsList.hidden = false;
    tripsEmpty.hidden = true;

    apiTrips.forEach(trip => {
        const card = document.createElement('article');
        card.className = 'trip-card';
        card.style.position = 'relative';

        const image = document.createElement('img');
        image.src = trip.coverImageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600';
        image.alt = trip.vehicleName;

        const info = document.createElement('div');
        const title = document.createElement('h2');
        const titleLink = document.createElement('a');
        titleLink.href = `/account?bookingId=${trip.bookingId}#trips`;
        titleLink.textContent = trip.vehicleName;
        titleLink.title = 'Xem chi tiết đơn thuê xe';
        titleLink.style.cssText = 'color: #1c2635; text-decoration: none; transition: color 0.2s ease; cursor: pointer;';
        titleLink.addEventListener('mouseenter', () => { titleLink.style.color = '#2563eb'; });
        titleLink.addEventListener('mouseleave', () => { titleLink.style.color = '#1c2635'; });
        titleLink.addEventListener('click', (e) => {
            e.preventDefault();
            openTripDetails(trip.bookingId);
        });

        title.appendChild(titleLink);
        if (trip.licensePlate) {
            const plateSmall = document.createElement('small');
            plateSmall.style.cssText = 'font-size: 13px; color: #64748b; font-weight: normal; margin-left: 6px;';
            plateSmall.textContent = `(${trip.licensePlate})`;
            title.appendChild(plateSmall);
        }

        const startStr = new Date(trip.startDate).toLocaleDateString('vi-VN');
        const endStr = new Date(trip.endDate).toLocaleDateString('vi-VN');
        const meta = document.createElement('p');
        meta.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${trip.city || 'TP. Đà Nẵng'} &bull; <i class="fa-regular fa-calendar-days"></i> ${startStr} - ${endStr} (${trip.rentalDays} ngày)`;

        const badge = getStatusBadgeInfo(trip.status);
        const statusSpan = document.createElement('span');
        statusSpan.className = 'trip-status';
        statusSpan.textContent = badge.text;
        statusSpan.style.backgroundColor = badge.bg;
        statusSpan.style.color = badge.color;

        const price = document.createElement('strong');
        price.textContent = `Tổng: ${Number(trip.priceLockedTotal || 0).toLocaleString('vi-VN')} đ`;

        const depositSmall = document.createElement('div');
        depositSmall.style.fontSize = '13px';
        depositSmall.style.color = '#1d4ed8';
        depositSmall.style.marginTop = '4px';
        depositSmall.textContent = `Đã thanh toán ký quỹ: ${Number(trip.depositAmount || 0).toLocaleString('vi-VN')} đ (100%)`;

        info.append(title, meta, statusSpan, price, depositSmall);

        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'margin-top: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';

        // 2. Trả xe (Flaw 1: Modal nghiệm thu kèm Odometer, nhiên liệu, phụ phí)
        if (trip.status === 'Ongoing') {
            const returnBtn = document.createElement('button');
            returnBtn.type = 'button';
            returnBtn.style.cssText = 'background: #2563eb; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            returnBtn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Xác nhận trả xe';
            returnBtn.addEventListener('click', () => {
                if (window.AzuTripModal?.openHandoverModal) {
                    window.AzuTripModal.openHandoverModal({
                        type: 'Return',
                        trip,
                        isOwner: false,
                        onSuccess: () => renderTrips()
                    });
                } else {
                    alert('Đang tải mô-đun nghiệm thu trả xe, vui lòng thử lại.');
                }
            });
            actionsDiv.appendChild(returnBtn);
        }

        // 2b. Khiếu nại sự cố
        if (trip.status === 'Ongoing' || trip.status === 'InTrip' || trip.status === 'Returned') {
            if (trip.hasDispute) {
                const disputeBadge = document.createElement('span');
                disputeBadge.style.cssText = 'font-size: 13px; color: #dc2626; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;';
                disputeBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Đang khiếu nại (Chờ xử lý)';
                actionsDiv.appendChild(disputeBadge);
            } else {
                const disputeBtn = document.createElement('button');
                disputeBtn.type = 'button';
                disputeBtn.style.cssText = 'background: #fff; color: #dc2626; border: 1px solid #fca5a5; padding: 6px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
                disputeBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Khiếu nại sự cố';
                disputeBtn.addEventListener('click', async () => {
                    const desc = prompt('Nhập chi tiết sự cố phát sinh (tối thiểu 10 ký tự):');
                    if (!desc) return;
                    if (desc.trim().length < 10) {
                        alert('Mô tả khiếu nại phải có ít nhất 10 ký tự.');
                        return;
                    }
                    disputeBtn.disabled = true;
                    try {
                        const r = await fetch(`/api/bookings/${trip.bookingId}/dispute`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ description: desc.trim() })
                        });
                        const d = await r.json();
                        if (r.ok && d.isSuccess) {
                            alert(d.message || 'Khiếu nại đã được gửi thành công.');
                            renderTrips();
                        } else {
                            alert('Lỗi: ' + (d?.message || 'Không thể gửi khiếu nại'));
                        }
                    } catch (e) {
                        alert('Lỗi kết nối máy chủ.');
                    } finally {
                        disputeBtn.disabled = false;
                    }
                });
                actionsDiv.appendChild(disputeBtn);
            }
        }

        // 3. Đánh giá
        if (trip.status === 'Completed') {
            if (!trip.hasReviewed) {
                const reviewBtn = document.createElement('button');
                reviewBtn.type = 'button';
                reviewBtn.style.cssText = 'background: #f59e0b; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
                reviewBtn.innerHTML = '<i class="fa-solid fa-star"></i> Đánh giá chuyến đi';
                reviewBtn.addEventListener('click', async () => {
                    const starsStr = prompt('Đánh giá chất lượng dịch vụ (từ 1 đến 5 sao):', '5');
                    if (starsStr === null) return;
                    const rating = parseInt(starsStr, 10);
                    if (isNaN(rating) || rating < 1 || rating > 5) {
                        alert('Số sao không hợp lệ (vui lòng chọn từ 1 đến 5 sao).');
                        return;
                    }
                    const comment = prompt('Nhận xét của bạn về chủ xe và xe:', 'Xe đi rất êm, sạch sẽ, chủ xe nhiệt tình và đúng giờ!');
                    if (comment === null) return;
                    reviewBtn.disabled = true;
                    try {
                        const r = await fetch(`/api/bookings/${trip.bookingId}/review`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rating, comment: comment || 'Chuyến đi tuyệt vời!' })
                        });
                        const d = await r.json();
                        if (r.ok && d.isSuccess) {
                            alert(d?.message || 'Cảm ơn bạn đã gửi đánh giá cho chuyến đi!');
                            renderTrips();
                        } else {
                            alert('Lỗi: ' + (d?.message || 'Không thể gửi đánh giá'));
                        }
                    } catch (e) {
                        alert('Lỗi kết nối máy chủ.');
                    } finally {
                        reviewBtn.disabled = false;
                    }
                });
                actionsDiv.appendChild(reviewBtn);
            } else {
                const reviewedBadge = document.createElement('span');
                reviewedBadge.style.cssText = 'font-size: 13px; color: #16a34a; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;';
                reviewedBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã gửi đánh giá';
                actionsDiv.appendChild(reviewedBadge);
            }
        }

        // 4. Hủy chuyến (Flaw 4: Modal cảnh báo hệ quả tài chính phạt 8% / mất cọc 25%)
        if (trip.status === 'Pending' || trip.status === 'Accepted') {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.style.cssText = 'background: #fff; color: #dc2626; border: 1px solid #fca5a5; padding: 6px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Hủy chuyến này';
            cancelBtn.addEventListener('click', () => {
                if (window.AzuTripModal?.openCancelBookingModal) {
                    window.AzuTripModal.openCancelBookingModal({
                        trip,
                        isOwner: false,
                        onSuccess: () => renderTrips()
                    });
                } else {
                    alert('Đang tải mô-đun hủy chuyến, vui lòng thử lại.');
                }
            });
            actionsDiv.appendChild(cancelBtn);
        }

        const detailLink = document.createElement('a');
        detailLink.href = `/account?bookingId=${trip.bookingId}#trips`;
        detailLink.className = 'trip-detail-open';
        detailLink.style.cssText = 'color: #8f6b24; text-decoration: underline; text-underline-offset: 3px; font-size: 13px; font-weight: 600; margin-left: auto; cursor: pointer; background: transparent; border: 0;';
        detailLink.textContent = 'Xem chi tiết';
        detailLink.addEventListener('mouseenter', () => { detailLink.style.color = '#6f5018'; });
        detailLink.addEventListener('mouseleave', () => { detailLink.style.color = '#8f6b24'; });
        detailLink.addEventListener('click', (e) => {
            e.preventDefault();
            openTripDetails(trip.bookingId);
        });
        actionsDiv.appendChild(detailLink);

        if (actionsDiv.children.length > 0) {
            info.appendChild(actionsDiv);
        }

        card.append(image, info);
        tripsList.append(card);
    });
}

document.querySelectorAll('.trip-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        activeTripType = tab.dataset.tripType;
        document.querySelectorAll('.trip-tab').forEach(item => {
            const isActive = item === tab;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', String(isActive));
        });
        renderTrips();
    });
});

// Nút quay lại về trang chủ
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('btn-back-home')) {
            window.location.href = '/';
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    });
});

// Logout Modal
const logoutBtn = document.getElementById('trip-logout');
const logoutModal = document.getElementById('logout-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (logoutModal) logoutModal.hidden = false;
});

closeModalBtn?.addEventListener('click', () => {
    if (logoutModal) logoutModal.hidden = true;
});

logoutModal?.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
        logoutModal.hidden = true;
    }
});

if (confirmLogoutBtn && !confirmLogoutBtn.dataset.bound) {
    confirmLogoutBtn.dataset.bound = 'true';
    confirmLogoutBtn.addEventListener('click', async () => {
        if (window.AzuStore?.logout) {
            await window.AzuStore.logout();
        } else {
            sessionStorage.clear();
            window.location.href = '/';
        }
    });
}

// address management

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const VIETNAM_LOCATIONS = {
    'TP. Đà Nẵng': {
        'Quận Hải Châu': ['Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Bình Thuận', 'Phường Bình Hiên'],
        'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'],
        'Quận Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải'],
        'Quận Thanh Khê': ['Phường Tam Thuận', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Xuân Hà', 'Phường Tân Chính', 'Phường Chính Gián', 'Phường Vĩnh Trung', 'Phường Thạc Gián', 'Phường An Khê', 'Phường Hòa Khê'],
        'Quận Cẩm Lệ': ['Phường Khuê Trung', 'Phường Hòa Thọ Đông', 'Phường Hòa Thọ Tây', 'Phường Hòa An', 'Phường Hòa Phát', 'Phường Hòa Xuân'],
        'Quận Liên Chiểu': ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Minh'],
        'Huyện Hòa Vang': ['Xã Hòa Châu', 'Xã Hòa Tiến', 'Xã Hòa Phước', 'Xã Hòa Khương', 'Xã Hòa Nhơn', 'Xã Hòa Phong', 'Xã Hòa Phú', 'Xã Hòa Ninh', 'Xã Hòa Liên', 'Xã Hòa Sơn', 'Xã Hòa Bắc']
    },
    'TP. Hồ Chí Minh': {
        'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
        'TP. Thủ Đức': ['Phường Thảo Điền', 'Phường An Phú', 'Phường Bình An', 'Phường Hiệp Phú', 'Phường Linh Trung', 'Phường Linh Chiểu', 'Phường Linh Tây', 'Phường Tam Phú', 'Phường Trường Thọ'],
        'Quận 3': ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 9', 'Phường 11', 'Phường 14'],
        'Quận 7': ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Phú Mỹ', 'Phường Tân Quy', 'Phường Tân Kiểng', 'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây'],
        'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 25']
    },
    'TP. Hà Nội': {
        'Quận Hoàn Kiếm': ['Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Gai', 'Phường Tràng Tiền', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Đồng Xuân'],
        'Quận Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Quán Thánh', 'Phường Thành Công'],
        'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
        'Quận Đống Đa': ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ô Chợ Dừa', 'Phường Quốc Tử Giám'],
        'Quận Tây Hồ': ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An', 'Phường Thụy Khuê', 'Phường Tứ Liên', 'Phường Xuân La', 'Phường Yên Phụ']
    },
    'Tỉnh Thừa Thiên Huế': {
        'TP. Huế': ['Phường Phú Hội', 'Phường Phú Nhuận', 'Phường Vĩnh Ninh', 'Phường Vỹ Dạ', 'Phường Xuân Phú', 'Phường Thuận Lộc', 'Phường Tây Lộc']
    },
    'Tỉnh Quảng Nam': {
        'TP. Hội An': ['Phường Cẩm Châu', 'Phường Cẩm An', 'Phường Cửa Đại', 'Phường Minh An', 'Phường Sơn Phong', 'Phường Tân An', 'Phường Thanh Hà'],
        'TP. Tam Kỳ': ['Phường An Mỹ', 'Phường An Sơn', 'Phường An Xuân', 'Phường Hòa Hương', 'Phường Phước Hòa', 'Phường Tân Thạnh', 'Phường Trường Xuân']
    },
    'Tỉnh Khánh Hòa': {
        'TP. Nha Trang': ['Phường Lộc Thọ', 'Phường Phước Tiến', 'Phường Tân Lập', 'Phường Vĩnh Hải', 'Phường Vĩnh Phước', 'Phường Xương Huân']
    },
    'Tỉnh Lâm Đồng': {
        'TP. Đà Lạt': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10']
    }
};

const ADDRESS_STORAGE_KEY = 'azuCarSavedAddresses';

function getSavedAddresses() {
    try {
        const data = localStorage.getItem(ADDRESS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveAddresses(addresses) {
    try {
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
    } catch (e) {
        console.error(e);
    }
}

function renderSavedAddresses() {
    const addresses = getSavedAddresses();
    if (!addressEmptyState || !addressList) return;

    if (!addresses || addresses.length === 0) {
        addressEmptyState.hidden = false;
        addressList.hidden = true;
        addressList.innerHTML = '';
        return;
    }

    addressEmptyState.hidden = true;
    addressList.hidden = false;

    addressList.innerHTML = addresses.map(addr => {
        const iconClass = addr.type === 'Công ty' ? 'fa-building' : (addr.type === 'Khác' ? 'fa-location-dot' : 'fa-house');
        return `
            <div class="address-item" data-id="${addr.id}">
                <div class="address-item-left">
                    <div class="address-item-icon">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="address-item-info">
                        <h4>
                            <span>${escapeHtml(addr.name || addr.type)}</span>
                            ${addr.isDefault ? '<span class="address-badge-default">Mặc định</span>' : ''}
                        </h4>
                        <p>${escapeHtml(addr.fullAddress)}</p>
                    </div>
                </div>
                <div class="address-item-actions">
                    <button type="button" class="btn-delete-addr" data-delete-address="${addr.id}" title="Xoá địa chỉ">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    addressList.querySelectorAll('[data-delete-address]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-delete-address'));
            if (confirm('Bạn có chắc chắn muốn xoá địa chỉ này?')) {
                const current = getSavedAddresses().filter(a => a.id !== id);
                saveAddresses(current);
                renderSavedAddresses();
            }
        });
    });
}

function initLocationDropdowns() {
    if (!provinceSelect) return;
    provinceSelect.innerHTML = '<option value="">Chọn thành phố...</option>';
    Object.keys(VIETNAM_LOCATIONS).forEach(prov => {
        const opt = document.createElement('option');
        opt.value = prov;
        opt.textContent = prov;
        provinceSelect.appendChild(opt);
    });

    provinceSelect.addEventListener('change', () => {
        const prov = provinceSelect.value;
        if (districtSelect) {
            districtSelect.innerHTML = '<option value="">Chọn quận huyện...</option>';
            if (prov && VIETNAM_LOCATIONS[prov]) {
                districtSelect.disabled = false;
                Object.keys(VIETNAM_LOCATIONS[prov]).forEach(dist => {
                    const opt = document.createElement('option');
                    opt.value = dist;
                    opt.textContent = dist;
                    districtSelect.appendChild(opt);
                });
            } else {
                districtSelect.disabled = true;
            }
        }
        if (wardSelect) {
            wardSelect.innerHTML = '<option value="">Chọn phường xã...</option>';
            wardSelect.disabled = true;
        }
    });

    districtSelect?.addEventListener('change', () => {
        const prov = provinceSelect?.value;
        const dist = districtSelect.value;
        if (wardSelect) {
            wardSelect.innerHTML = '<option value="">Chọn phường xã...</option>';
            if (prov && dist && VIETNAM_LOCATIONS[prov] && VIETNAM_LOCATIONS[prov][dist]) {
                wardSelect.disabled = false;
                VIETNAM_LOCATIONS[prov][dist].forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = w;
                    opt.textContent = w;
                    wardSelect.appendChild(opt);
                });
            } else {
                wardSelect.disabled = true;
            }
        }
    });
}

// address type
document.querySelectorAll('.place-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.place-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-type') || 'Nhà riêng';
        if (addressTypeInput) addressTypeInput.value = type;

        if (addressNameInput) {
            const currentVal = addressNameInput.value.trim();
            if (!currentVal || currentVal === 'Nhà riêng' || currentVal === 'Công ty' || currentVal === 'Khác') {
                addressNameInput.value = type;
            }
        }
    });
});

// open address modal
btnOpenAddAddress?.addEventListener('click', () => {
    if (newAddressForm) newAddressForm.reset();
    if (provinceSelect) provinceSelect.value = '';
    if (districtSelect) {
        districtSelect.innerHTML = '<option value="">Chọn quận huyện...</option>';
        districtSelect.disabled = true;
    }
    if (wardSelect) {
        wardSelect.innerHTML = '<option value="">Chọn phường xã...</option>';
        wardSelect.disabled = true;
    }
    document.querySelectorAll('.place-type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.place-type-btn[data-type="Nhà riêng"]')?.classList.add('active');
    if (addressTypeInput) addressTypeInput.value = 'Nhà riêng';
    if (addressNameInput) addressNameInput.value = 'Nhà riêng';
    if (addressIsDefault) addressIsDefault.checked = getSavedAddresses().length === 0;

    if (addAddressDialog) addAddressDialog.hidden = false;
});

// save address
newAddressForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = addressTypeInput?.value || 'Nhà riêng';
    const name = addressNameInput?.value.trim() || type;
    const province = provinceSelect?.value || '';
    const district = districtSelect?.value || '';
    const ward = wardSelect?.value || '';
    const street = addressStreetInput?.value.trim() || '';
    const isDefault = Boolean(addressIsDefault?.checked);

    if (!province || !district || !ward || !street) {
        alert('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và nhập địa chỉ cụ thể!');
        return;
    }

    const fullAddress = `${street}, ${ward}, ${district}, ${province}`;
    const addresses = getSavedAddresses();

    if (isDefault) {
        addresses.forEach(a => { a.isDefault = false; });
        sessionStorage.setItem('azuCarAddress', fullAddress);
    } else if (addresses.length === 0) {
        sessionStorage.setItem('azuCarAddress', fullAddress);
    }

    const newAddr = {
        id: Date.now(),
        type,
        name,
        province,
        district,
        ward,
        street,
        fullAddress,
        isDefault: isDefault || addresses.length === 0
    };

    addresses.push(newAddr);
    saveAddresses(addresses);

    if (addAddressDialog) addAddressDialog.hidden = true;
    renderSavedAddresses();
});

initLocationDropdowns();
renderSavedAddresses();

// ==========================================
// THẺ THANH TOÁN (PAYMENT CARDS)
// ==========================================
const paymentCardPanel = document.getElementById('payment-card-panel');
const paymentCardEmpty = document.getElementById('payment-card-empty');
const paymentCardList = document.getElementById('payment-card-list');
const btnOpenAddCard = document.getElementById('btn-open-add-card');
const addPaymentCardModal = document.getElementById('addPaymentCardModal');
const closeAddPaymentCardBtn = document.getElementById('closeAddPaymentCardBtn');
const addPaymentCardForm = document.getElementById('add-payment-card-form');
const addCardErrorBanner = document.getElementById('add-card-error-banner');
const cardNumberInput = document.getElementById('card-number-input');
const cardExpiryInput = document.getElementById('card-expiry-input');
const cardCvvInput = document.getElementById('card-cvv-input');
const cardHolderInput = document.getElementById('card-holder-input');
const cardBankInput = document.getElementById('card-bank-input');
const cardDefaultCheckbox = document.getElementById('card-default-checkbox');
const cardBrandBadge = document.getElementById('cardBrandBadge');

function detectCardBrand(num) {
    const clean = (num || '').replace(/\s+/g, '');
    if (/^4/.test(clean)) return { brand: 'Visa', icon: 'fa-brands fa-cc-visa' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: 'Mastercard', icon: 'fa-brands fa-cc-mastercard' };
    if (/^(352[89]|35[3-8][0-9])/.test(clean)) return { brand: 'JCB', icon: 'fa-brands fa-cc-jcb' };
    if (/^(9704)/.test(clean)) return { brand: 'Napas', icon: 'fa-solid fa-credit-card' };
    return { brand: 'Thẻ quốc tế', icon: 'fa-regular fa-credit-card' };
}

cardNumberInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 19);
    e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    if (cardBrandBadge) {
        const info = detectCardBrand(val);
        cardBrandBadge.innerHTML = `<i class="${info.icon}"></i>`;
    }
});

cardExpiryInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
        val = val.slice(0, 2) + '/' + val.slice(2);
    }
    e.target.value = val;
});

cardCvvInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

cardHolderInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

btnOpenAddCard?.addEventListener('click', () => {
    if (addPaymentCardForm) addPaymentCardForm.reset();
    if (addCardErrorBanner) addCardErrorBanner.style.display = 'none';
    if (cardBrandBadge) cardBrandBadge.innerHTML = '<i class="fa-regular fa-credit-card"></i>';
    if (addPaymentCardModal) {
        addPaymentCardModal.hidden = false;
        addPaymentCardModal.style.display = 'flex';
        addPaymentCardModal.classList.add('active');
    }
    cardNumberInput?.focus();
});

closeAddPaymentCardBtn?.addEventListener('click', () => {
    if (addPaymentCardModal) {
        addPaymentCardModal.classList.remove('active');
        addPaymentCardModal.style.display = 'none';
    }
});

addPaymentCardModal?.addEventListener('click', (e) => {
    if (e.target === addPaymentCardModal) {
        addPaymentCardModal.classList.remove('active');
        addPaymentCardModal.style.display = 'none';
    }
});

function showCardError(msg) {
    if (addCardErrorBanner) {
        addCardErrorBanner.textContent = msg;
        addCardErrorBanner.style.display = 'block';
    } else {
        alert(msg);
    }
}

addPaymentCardForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (addCardErrorBanner) addCardErrorBanner.style.display = 'none';

    const rawNum = (cardNumberInput?.value || '').replace(/\s+/g, '');
    const holder = (cardHolderInput?.value || '').trim();
    const expiry = (cardExpiryInput?.value || '').trim();
    const cvv = (cardCvvInput?.value || '').trim();
    const bankName = (cardBankInput?.value || '').trim();
    const isDefault = Boolean(cardDefaultCheckbox?.checked);

    if (rawNum.length < 12 || rawNum.length > 19) {
        showCardError('Số thẻ không hợp lệ (12 - 19 chữ số).');
        return;
    }
    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2) {
        showCardError('Hạn sử dụng phải đúng định dạng MM/YY (ví dụ: 12/28).');
        return;
    }
    const month = parseInt(expiryParts[0], 10);
    let year = parseInt(expiryParts[1], 10);
    if (isNaN(month) || month < 1 || month > 12) {
        showCardError('Tháng hết hạn không hợp lệ (01 - 12).');
        return;
    }
    if (year < 100) year += 2000;
    if (cvv.length < 3 || cvv.length > 4) {
        showCardError('Mã CVV phải gồm 3 hoặc 4 chữ số.');
        return;
    }

    const payload = {
        cardNumber: rawNum,
        cardHolderName: holder,
        expiryMonth: month,
        expiryYear: year,
        cvv: cvv,
        bankName: bankName || null,
        setAsDefault: isDefault
    };

    const submitBtn = document.getElementById('btnSubmitAddCard');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang liên kết...';
    }

    try {
        const resp = await fetch('/api/payment-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const result = await resp.json();
        if (resp.ok && result && result.isSuccess) {
            if (addPaymentCardModal) {
                addPaymentCardModal.classList.remove('active');
                addPaymentCardModal.style.display = 'none';
            }
            await loadPaymentCards();
        } else {
            showCardError(result?.message || 'Không thể liên kết thẻ. Vui lòng kiểm tra lại thông tin.');
        }
    } catch {
        showCardError('Lỗi kết nối khi liên kết thẻ thanh toán.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Liên kết thẻ';
        }
    }
});

async function loadPaymentCards() {
    if (!paymentCardList || !paymentCardEmpty) return;
    try {
        const resp = await fetch('/api/payment-cards', {
            headers: { 'Accept': 'application/json' }
        });
        if (!resp.ok) {
            paymentCardEmpty.hidden = false;
            paymentCardList.hidden = true;
            return;
        }
        const result = await resp.json();
        const cards = result && result.isSuccess && Array.isArray(result.data) ? result.data : [];
        if (cards.length === 0) {
            paymentCardEmpty.hidden = false;
            paymentCardList.hidden = true;
            return;
        }

        paymentCardEmpty.hidden = true;
        paymentCardList.hidden = false;
        paymentCardList.innerHTML = cards.map(c => {
            const brandName = c.cardBrand || c.cardType || 'Thẻ quốc tế';
            const typeStr = brandName.toLowerCase();
            const isVisa = typeStr.includes('visa');
            const isMastercard = typeStr.includes('mastercard');
            const isJcb = typeStr.includes('jcb');
            const brandIcon = isVisa ? 'fa-brands fa-cc-visa' : (isMastercard ? 'fa-brands fa-cc-mastercard' : (isJcb ? 'fa-brands fa-cc-jcb' : 'fa-regular fa-credit-card'));
            const expiryStr = c.expiryFormatted || ((c.expiryMonth && c.expiryYear) ? `${String(c.expiryMonth).padStart(2, '0')}/${String(c.expiryYear).slice(-2)}` : '');
            const maskedNum = c.cardNumberMasked || c.maskedCardNumber || '•••• •••• •••• ••••';
            return `
                <div class="payment-card-item ${c.isDefault ? 'is-default' : ''}" data-card-id="${c.cardId}">
                    <div class="payment-card-top">
                        <div class="payment-card-brand-wrap">
                            <i class="${brandIcon} payment-card-brand-icon"></i>
                            <span class="payment-card-bank-name">${c.bankName || brandName}</span>
                        </div>
                        ${c.isDefault ? '<span class="badge-default-card"><i class="fa-solid fa-circle-check"></i> Mặc định</span>' : ''}
                    </div>
                    <div class="payment-card-number">${maskedNum}</div>
                    <div class="payment-card-bottom">
                        <div>
                            <div class="payment-card-holder-name">${c.cardHolderName || 'Chủ thẻ'}</div>
                            ${expiryStr ? `<div class="payment-card-expiry">Hạn: ${expiryStr}</div>` : ''}
                        </div>
                        <div class="payment-card-actions">
                            ${!c.isDefault ? `<button type="button" class="btn-set-default-card" data-card-id="${c.cardId}">Đặt mặc định</button>` : ''}
                            <button type="button" class="btn-delete-card" data-card-id="${c.cardId}" title="Xóa thẻ" aria-label="Xóa thẻ"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        paymentCardList.querySelectorAll('.btn-set-default-card').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const cardId = e.currentTarget.getAttribute('data-card-id');
                if (!cardId) return;
                try {
                    const r = await fetch(`/api/payment-cards/${cardId}/default`, {
                        method: 'PUT',
                        headers: { 'Accept': 'application/json' }
                    });
                    const d = await r.json();
                    if (d && d.isSuccess) {
                        await loadPaymentCards();
                    } else {
                        alert(d?.message || 'Không thể đặt thẻ mặc định');
                    }
                } catch {
                    alert('Lỗi kết nối khi đặt thẻ mặc định');
                }
            });
        });

        paymentCardList.querySelectorAll('.btn-delete-card').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const cardId = e.currentTarget.getAttribute('data-card-id');
                if (!cardId) return;
                if (!confirm('Bạn có chắc chắn muốn xóa thẻ liên kết này không?')) return;
                try {
                    const r = await fetch(`/api/payment-cards/${cardId}`, {
                        method: 'DELETE',
                        headers: { 'Accept': 'application/json' }
                    });
                    const d = await r.json();
                    if (d && d.isSuccess) {
                        await loadPaymentCards();
                    } else {
                        alert(d?.message || 'Không thể xóa thẻ');
                    }
                } catch {
                    alert('Lỗi kết nối khi xóa thẻ');
                }
            });
        });
    } catch (err) {
        console.error('Error loading payment cards:', err);
    }
}

function getFavoritesStorageKey() {
    const user = window.AzuStore?.getUser ? window.AzuStore.getUser() : null;
    return user?.userId ? `azuCarFavorites_${user.userId}` : 'azuCarFavorites_guest';
}

// Xe da luu (Favorites)
async function loadFavoriteCars() {
    if (!favoritesGrid || !favoritesEmpty) return;
    const key = getFavoritesStorageKey();
    let favIds = [];
    try {
        let stored = localStorage.getItem(key);
        if (!stored) {
            stored = localStorage.getItem('azuCarFavorites');
            if (stored) localStorage.setItem(key, stored);
        }
        favIds = stored ? JSON.parse(stored) : [];
    } catch {
        favIds = [];
    }

    if (!Array.isArray(favIds) || favIds.length === 0) {
        favoritesGrid.innerHTML = '';
        favoritesGrid.hidden = true;
        favoritesEmpty.hidden = false;
        return;
    }

    try {
        const res = await fetch('/api/vehicles?pageSize=100', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
            favoritesGrid.innerHTML = '';
            favoritesGrid.hidden = true;
            favoritesEmpty.hidden = false;
            return;
        }
        const json = await res.json();
        const allCars = (json && json.data && Array.isArray(json.data.items)) ? json.data.items : [];
        const cars = allCars.filter(c => favIds.includes(String(c.id || c.vehicleId)));

        if (cars.length === 0) {
            favoritesGrid.innerHTML = '';
            favoritesGrid.hidden = true;
            favoritesEmpty.hidden = false;
            return;
        }

        favoritesEmpty.hidden = true;
        favoritesGrid.hidden = false;

        favoritesGrid.innerHTML = cars.map(car => {
            const carId = car.id || car.vehicleId;
            const img = car.coverImageUrl || '/seed/car-vf8.webp';
            const price = Number(car.pricePerDay || 0).toLocaleString('vi-VN');
            const seats = car.seats || 4;
            const fuel = car.fuelType || 'Xăng';
            const transmission = car.transmission || 'Tự động';
            const location = car.district ? `${car.district}, ${car.city}` : (car.city || 'Đà Nẵng');

            return `
                <div class="fav-car-card" data-car-id="${carId}">
                    <div class="fav-car-img-wrap">
                        <img src="${img}" alt="${car.brand} ${car.model}" onerror="this.src='/seed/car-vf8.webp'">
                        <button type="button" class="btn-remove-fav" data-fav-id="${carId}" title="Bỏ lưu xe">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                    </div>
                    <div class="fav-car-content">
                        <h3 class="fav-car-title">${car.brand} ${car.model} ${car.year ? `<small>(${car.year})</small>` : ''}</h3>
                        <div class="fav-car-specs">
                            <span><i class="fa-solid fa-user-group"></i> ${seats} chỗ</span>
                            <span><i class="fa-solid fa-gear"></i> ${transmission}</span>
                            <span><i class="fa-solid fa-gas-pump"></i> ${fuel}</span>
                        </div>
                        <div class="fav-car-loc"><i class="fa-solid fa-location-dot"></i> ${location}</div>
                        <div class="fav-car-foot">
                            <div class="fav-car-price"><strong>${price} đ</strong><span>/ngày</span></div>
                            <a href="/find?vehicleId=${carId}" class="btn-fav-rent">Thuê xe</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        favoritesGrid.querySelectorAll('.btn-remove-fav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const idToRemove = btn.getAttribute('data-fav-id');
                if (!idToRemove) return;
                const key = getFavoritesStorageKey();
                let currentFavs = JSON.parse(localStorage.getItem(key) || localStorage.getItem('azuCarFavorites') || '[]');
                currentFavs = currentFavs.filter(x => String(x) !== String(idToRemove));
                localStorage.setItem(key, JSON.stringify(currentFavs));
                localStorage.setItem('azuCarFavorites', JSON.stringify(currentFavs));
                window.dispatchEvent(new CustomEvent('azuCarFavoritesChanged', { detail: { favorites: currentFavs } }));
                loadFavoriteCars();
            });
        });
    } catch {
        favoritesGrid.hidden = true;
        favoritesEmpty.hidden = false;
    }
}

// Khởi chạy
handleHashNavigation();
