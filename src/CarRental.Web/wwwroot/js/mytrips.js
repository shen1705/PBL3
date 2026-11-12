if (!window.AzuStore.isLoggedIn()) {
    window.AzuStore.requireLogin('account.html');
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
    licenseBirthday: 'azuCarLicenseBirthday'
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
const navAccount = document.getElementById('nav-account');
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
function showView(viewName) {
    const isAccount = viewName === 'account';
    const isAddress = viewName === 'address';
    const isPrivacy = viewName === 'privacy';
    const isPassword = viewName === 'password';
    const isTrips = !isAccount && !isAddress && !isPrivacy && !isPassword;

    if (accountSection) accountSection.hidden = !isAccount;
    if (addressSection) addressSection.hidden = !isAddress;
    if (privacySection) privacySection.hidden = !isPrivacy;
    if (passwordSection) passwordSection.hidden = !isPassword;
    if (tripsSection) tripsSection.hidden = !isTrips;

    document.querySelectorAll('.trips-side-nav .trips-side-link').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });

    if (isAccount) {
        if (navAccount) {
            navAccount.classList.add('active');
            navAccount.setAttribute('aria-current', 'page');
        }
        renderAccountData();
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
        renderTrips();
    }
}

function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash === '#trips' || hash === '#orders') {
        showView('trips');
    } else if (hash === '#address') {
        showView('address');
    } else if (hash === '#privacy') {
        showView('privacy');
    } else if (hash === '#password') {
        showView('password');
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

if (licenseForm) {
    licenseForm.elements.number.value = sessionStorage.getItem(accountKeys.licenseNumber) || '';
    licenseForm.elements.holder.value = sessionStorage.getItem(accountKeys.licenseHolder) || '';
    licenseForm.elements.birthday.value = sessionStorage.getItem(accountKeys.licenseBirthday) || '1970-01-01';
}

function setLicenseEditing(isEditing) {
    licenseInputs.forEach(input => { input.disabled = !isEditing; });
    if (licenseImageInput) {
        licenseImageInput.disabled = !isEditing;
        licenseImageInput.required = isEditing;
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
        if (licenseForm) {
            licenseForm.elements.number.value = sessionStorage.getItem(accountKeys.licenseNumber) || '';
            licenseForm.elements.holder.value = sessionStorage.getItem(accountKeys.licenseHolder) || '';
            licenseForm.elements.birthday.value = sessionStorage.getItem(accountKeys.licenseBirthday) || '1970-01-01';
        }
        if (licenseImageInput) licenseImageInput.value = '';
        if (licenseImagePreview) {
            licenseImagePreview.src = '';
            licenseImagePreview.hidden = true;
        }
        if (uploadPrompt) uploadPrompt.hidden = false;
        setLicenseEditing(false);
        return;
    }

    setLicenseEditing(true);
    licenseForm?.elements.number.focus();
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

licenseForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!licenseForm.reportValidity()) return;

    const values = new FormData(licenseForm);
    sessionStorage.setItem(accountKeys.licenseNumber, String(values.get('number') || '').trim());
    sessionStorage.setItem(accountKeys.licenseHolder, String(values.get('holder') || '').trim());
    sessionStorage.setItem(accountKeys.licenseBirthday, String(values.get('birthday') || ''));
    setLicenseEditing(false);
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
let reviewModal;
let activeReviewTrip;

function closeReviewModal() {
    if (!reviewModal) return;
    if (activeReviewTrip) {
        sessionStorage.setItem(`review-prompt-dismissed-${activeReviewTrip.bookingId}`, 'true');
    }
    reviewModal.hidden = true;
    activeReviewTrip = null;
}

function ensureReviewModal() {
    if (reviewModal) return reviewModal;

    reviewModal = document.createElement('div');
    reviewModal.className = 'review-modal-backdrop';
    reviewModal.hidden = true;
    reviewModal.innerHTML = `
        <form class="review-modal" aria-labelledby="review-modal-title">
            <button class="review-modal-close" type="button" aria-label="Đóng popup đánh giá"><i class="fa-solid fa-xmark"></i></button>
            <h2 id="review-modal-title">Chuyến đi đã hoàn tất</h2>
            <p class="review-modal-vehicle"></p>
            <label class="review-rating-label">Trải nghiệm của bạn thế nào?</label>
            <div class="review-stars" role="group" aria-label="Chọn số sao đánh giá">
                ${[1, 2, 3, 4, 5].map(rating => `<button type="button" class="review-star" data-rating="${rating}" aria-label="${rating} sao" aria-pressed="false"><i class="fa-solid fa-star"></i></button>`).join('')}
            </div>
            <p class="review-rating-hint" aria-live="polite">Chọn số sao</p>
            <label class="review-comment-label" for="review-comment">Nhận xét <span>(không bắt buộc)</span></label>
            <textarea id="review-comment" maxlength="1000" rows="3" placeholder="Chia sẻ trải nghiệm của bạn..."></textarea>
            <p class="review-error" role="alert" hidden></p>
            <button class="review-submit" type="submit" disabled>Gửi đánh giá</button>
        </form>`;
    document.body.appendChild(reviewModal);

    const form = reviewModal.querySelector('form');
    const stars = Array.from(reviewModal.querySelectorAll('.review-star'));
    const ratingHint = reviewModal.querySelector('.review-rating-hint');
    const submitButton = reviewModal.querySelector('.review-submit');
    const errorMessage = reviewModal.querySelector('.review-error');
    const ratingLabels = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];
    let selectedRating = 0;

    const setRating = rating => {
        selectedRating = rating;
        stars.forEach(star => {
            const isSelected = Number(star.dataset.rating) <= rating;
            star.classList.toggle('is-selected', isSelected);
            star.setAttribute('aria-pressed', String(Number(star.dataset.rating) === rating));
        });
        ratingHint.textContent = ratingLabels[rating] || 'Chọn số sao';
        submitButton.disabled = rating === 0;
        errorMessage.hidden = true;
    };

    stars.forEach(star => star.addEventListener('click', () => setRating(Number(star.dataset.rating))));
    reviewModal.querySelector('.review-modal-close').addEventListener('click', closeReviewModal);
    reviewModal.addEventListener('click', event => {
        if (event.target === reviewModal) closeReviewModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !reviewModal.hidden) closeReviewModal();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!activeReviewTrip || selectedRating < 1) return;

        submitButton.disabled = true;
        submitButton.textContent = 'Đang gửi...';
        errorMessage.hidden = true;
        try {
            const response = await fetch(`/api/bookings/${activeReviewTrip.bookingId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: selectedRating,
                    comment: reviewModal.querySelector('#review-comment').value.trim()
                })
            });
            const result = await response.json();
            if (!response.ok || !result.isSuccess) {
                throw new Error(result?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
            }

            reviewModal.hidden = true;
            activeReviewTrip = null;
            alert(result?.message || 'Cảm ơn bạn đã gửi đánh giá cho chuyến đi!');
            renderTrips();
        } catch (error) {
            errorMessage.textContent = error.message || 'Lỗi kết nối máy chủ.';
            errorMessage.hidden = false;
            submitButton.disabled = false;
        } finally {
            submitButton.textContent = 'Gửi đánh giá';
        }
    });

    reviewModal.resetRating = () => setRating(0);
    return reviewModal;
}

function openReviewModal(trip) {
    const modal = ensureReviewModal();
    activeReviewTrip = trip;
    modal.querySelector('.review-modal-vehicle').textContent = trip.vehicleName || 'Cảm ơn bạn đã sử dụng dịch vụ AZU Car';
    modal.querySelector('#review-comment').value = '';
    modal.querySelector('.review-error').hidden = true;
    modal.resetRating();
    modal.hidden = false;
}

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
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('vi-VN', includeTime
        ? { dateStyle: 'medium', timeStyle: 'short' }
        : { dateStyle: 'medium' });
}

function formatTripMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function tripDetailRow(label, value) {
    return `<div class="trip-detail-row"><span>${escapeTripHtml(label)}</span><strong>${escapeTripHtml(value || '—')}</strong></div>`;
}

function maskLicensePlate(value) {
    let visibleCharacters = 0;
    return Array.from(String(value || '')).map(character => {
        if (!/[A-Za-z0-9]/.test(character)) return character;
        visibleCharacters += 1;
        return visibleCharacters <= 3 ? character : '•';
    }).join('');
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
    const hasBeenAccepted = isAccepted || Boolean(booking.acceptedAt);
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
    const userConfirmed = type => handovers.some(item =>
        String(item.type).toLowerCase() === type.toLowerCase() && item.confirmedBy === currentUserId);
    const userConfirmedPickup = userConfirmed('Pickup');
    const userConfirmedReturn = userConfirmed('Return');
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
        const formMarkup = allowed && !userConfirmation ? `<form class="trip-handover-form" data-handover-form="${action}">
            <label>Số công-tơ-mét (km)<input name="odometer" type="number" min="0" inputmode="numeric" placeholder="Không bắt buộc"></label>
            <label>Mức nhiên liệu<select name="fuelLevel"><option value="">Chọn mức</option><option>1/4 bình</option><option>1/2 bình</option><option>3/4 bình</option><option>Đầy bình</option></select></label>
            <label>Thanh toán phần còn lại<select name="remainingPaymentMethod"><option value="cash">Tiền mặt</option><option value="transfer">Chuyển khoản</option></select></label>
            <label class="trip-handover-notes">Ghi chú tình trạng<textarea name="notes" maxlength="1000" rows="2" placeholder="Không bắt buộc"></textarea></label>
            <button type="button" class="trip-detail-action is-primary" data-trip-detail-action="${action}">Xác nhận ${action === 'pickup' ? 'nhận xe' : 'trả xe'}</button>
        </form>` : '';
        return `<article class="trip-handover-card">
            <div class="trip-detail-title-row"><h3>${title}</h3><span class="trip-detail-state ${userConfirmation ? 'is-done' : ''}">${statusText}</span></div>
            ${confirmations.length ? confirmations.map(item => `<p>${escapeTripHtml(item.confirmerName || 'Thành viên')} · ${escapeTripHtml(formatTripDate(item.confirmedAt, true))}${item.odometer != null ? ` · ${escapeTripHtml(item.odometer)} km` : ''}${item.fuelLevel ? ` · ${escapeTripHtml(item.fuelLevel)}` : ''}${item.remainingPaymentMethod ? ` · ${item.remainingPaymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}` : ''}</p>${item.notes ? `<p>${escapeTripHtml(item.notes)}</p>` : ''}`).join('') : '<p>Chưa có xác nhận.</p>'}
            ${formMarkup}
        </article>`;
    };
    const renderTasks = () => {
        let title = 'Đơn thuê đã kết thúc';
        let description = 'Bạn có thể xem lại thông tin và biên bản của chuyến này.';
        let actions = '';

        if (status === 'Pending') {
            title = 'Đang chờ chủ xe duyệt';
            description = 'Lịch xe đang được giữ trong thời gian chờ phản hồi.';
            actions = '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="cancel">Hủy đơn</button>';
        } else if (status === 'Accepted') {
            title = userConfirmedPickup ? 'Chờ xác nhận nhận xe' : 'Đơn đã được duyệt';
            description = userConfirmedPickup ? 'Bạn đã xác nhận, chờ bên còn lại hoàn tất bàn giao.' : 'Kiểm tra xe và mở biên bản nhận xe để xác nhận.';
            actions = `${userConfirmedPickup ? '' : '<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Mở biên bản nhận xe</button>'}${canCancel ? '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="cancel">Hủy đơn</button>' : ''}`;
        } else if (status === 'Ongoing') {
            title = userConfirmedReturn ? 'Chờ xác nhận trả xe' : 'Chuyến đang diễn ra';
            description = userConfirmedReturn ? 'Bạn đã xác nhận trả xe, chờ bên còn lại hoàn tất.' : 'Mở biên bản trả xe để ghi nhận tình trạng và xác nhận.';
            actions = `${userConfirmedReturn ? '' : '<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="handover">Mở biên bản trả xe</button>'}${booking.hasDispute ? `<span class="trip-detail-state">Khiếu nại: ${escapeTripHtml(booking.disputeStatus || 'Đang xử lý')}</span>` : '<button type="button" class="trip-detail-action is-secondary" data-trip-detail-action="dispute">Báo sự cố</button>'}`;
        } else if (status === 'Completed' && !booking.hasReviewed) {
            title = 'Chuyến đã hoàn tất';
            description = 'Chia sẻ đánh giá về chuyến đi.';
            actions = '<button type="button" class="trip-detail-action is-primary" data-trip-detail-action="review">Đánh giá chuyến đi</button>';
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
            ${renderHandover('Pickup', 'Nhận xe', ['Accepted', 'Ongoing'].includes(status))}
            ${renderHandover('Return', 'Trả xe', status === 'Ongoing')}
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
                    <li>Tiền cọc trực tuyến bằng 25% tổng giá thuê; phần còn lại hai bên thanh toán trực tiếp.</li>
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
        const depositRecordedAt = booking.depositPaidAt || booking.createdAt;
        const depositReference = booking.depositReferenceCode
            ? `Mã ${booking.depositReferenceCode}`
            : `Mã đơn #${booking.bookingId}`;
        tabContent = `<div class="trip-detail-columns">
            <div class="trip-detail-section">
                <div class="trip-detail-vehicle">
                    ${image ? `<img src="${escapeTripHtml(image)}" alt="${escapeTripHtml(vehicleName)}">` : '<div class="trip-detail-image-placeholder"><i class="fa-solid fa-car-side"></i></div>'}
                    <div><h3>${escapeTripHtml(vehicleName)}</h3><p>${escapeTripHtml(booking.city || 'Chưa có địa điểm')}${booking.district ? ` · ${escapeTripHtml(booking.district)}` : ''}</p>
                    ${booking.licensePlate ? `<p class="trip-detail-plate"><span>Biển số</span><strong>${escapeTripHtml(hasBeenAccepted ? booking.licensePlate : maskLicensePlate(booking.licensePlate))}</strong><small>${hasBeenAccepted ? 'Đã hiển thị sau khi chủ xe duyệt' : 'Hiện rõ sau khi chủ xe duyệt đơn'}</small></p>` : ''}</div>
                </div>
                <h3>Lịch trình</h3>
                ${tripDetailRow('Nhận xe', formatTripDate(booking.startDate, true))}
                ${tripDetailRow('Trả xe', formatTripDate(booking.endDate, true))}
                ${tripDetailRow('Thời gian thuê', `${booking.rentalDays || 0} ngày`)}
                <details class="trip-rental-calendar"><summary>Lịch hoạt động &amp; ngày bận</summary>${renderRentalCalendar(booking)}</details>
                ${tripDetailRow('Hình thức nhận xe', booking.deliveryMethod || 'Nhận tại địa điểm xe')}
                ${booking.deliveryAddress ? tripDetailRow('Địa chỉ giao xe', booking.deliveryAddress) : ''}
                <h3 class="trip-detail-subheading">Liên hệ chủ xe</h3>
                ${tripDetailRow('Chủ xe', booking.ownerName)}
                ${tripDetailRow('Điện thoại', hasBeenAccepted ? (booking.ownerPhone || 'Chưa cung cấp') : 'Hiển thị sau khi chủ xe duyệt')}
            </div>
            <aside class="trip-detail-payment">
                <h3>Cọc &amp; thanh toán</h3>
                <div class="trip-payment-line">
                    <div><span>Giá thuê</span><small>${hasPriceBreakdown ? `${formatTripMoney(booking.pricePerDayAtBooking)} × ${booking.rentalDays || 0} ngày` : 'Giá đã khóa theo đơn thuê'}</small></div>
                    <strong>${formatTripMoney(rentalSubtotal)}</strong>
                </div>
                <div class="trip-payment-line">
                    <div><span>Phụ phí phát sinh</span><small>${escapeTripHtml(feeNotes)}</small></div>
                    <strong>${extraFees == null ? '—' : formatTripMoney(extraFees)}</strong>
                </div>
                <div class="trip-payment-total"><span>Tổng giá trị thuê</span><strong>${formatTripMoney(booking.priceLockedTotal)}</strong></div>
                <div class="trip-payment-deposit">
                    <div class="trip-payment-line"><div><span>Tiền cọc (25%)</span><small class="trip-payment-status">${escapeTripHtml(depositLabel)}</small></div><strong>${formatTripMoney(booking.depositAmount)}</strong></div>
                    <small class="trip-payment-meta">Thanh toán mô phỏng · ${escapeTripHtml(formatTripDate(depositRecordedAt, true))} · ${escapeTripHtml(depositReference)}</small>
                </div>
                <div class="trip-payment-line trip-payment-remaining">
                    <div><span>Bạn trả trực tiếp cho chủ xe</span><small>Ngoài hệ thống · hai bên tự thỏa thuận thời điểm và cách trả</small></div>
                    <strong>${formatTripMoney(booking.remainingAmount)}</strong>
                </div>
                <p class="trip-payment-note">Khi chủ xe từ chối, đơn hết hạn hoặc có sự cố, trạng thái và tiền cọc được xử lý theo kết quả của đơn.</p>
            </aside>
        </div>
        ${isCancelled ? `<div class="trip-detail-notice is-warning">${escapeTripHtml(booking.cancelReason || booking.rejectReason || badge.text)}</div>` : ''}`;
    }

    return `<div class="trip-detail-heading">
        <button class="trip-detail-back" type="button" data-trip-detail-back><i class="fa-solid fa-arrow-left"></i> Quay lại chuyến của tôi</button>
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
    if (action === 'review') {
        openReviewModal(currentTripDetail);
        return;
    }

    const bookingId = currentTripDetail.bookingId;
    let url = '';
    let body = {};
    if (action === 'accept-terms') {
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
            remainingPaymentMethod: form?.elements.namedItem('remainingPaymentMethod')?.value || 'cash'
        };
    } else if (action === 'cancel') {
        const reason = prompt('Nhập lý do hủy đơn:');
        if (reason === null) return;
        url = `/api/bookings/${bookingId}/cancel`;
        body = { reason: reason.trim() || 'Khách thuê chủ động hủy chuyến' };
    } else if (action === 'dispute') {
        const description = prompt('Mô tả sự cố phát sinh (tối thiểu 10 ký tự):');
        if (!description) return;
        if (description.trim().length < 10) {
            alert('Mô tả khiếu nại phải có ít nhất 10 ký tự.');
            return;
        }
        url = `/api/bookings/${bookingId}/dispute`;
        body = { description: description.trim() };
    }

    if (!url) return;
    button.disabled = true;
    try {
        const response = await fetch(url, {
            method: 'POST',
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
    document.querySelector('.trips-tabs')?.setAttribute('hidden', '');
    tripsList.hidden = true;
    tripsEmpty.hidden = true;
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
        tripDetailView.innerHTML = `<button class="trip-detail-back" type="button" data-trip-detail-back><i class="fa-solid fa-arrow-left"></i> Quay lại chuyến của tôi</button><p class="trip-detail-error">${escapeTripHtml(error.message || 'Không thể tải chi tiết chuyến.')}</p>`;
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
        const [renterResponse, ownerResponse] = await Promise.all([
            fetch(`/api/bookings/my-trips?status=${encodeURIComponent(activeTripType)}`),
            fetch(`/api/bookings/owner-requests?status=${encodeURIComponent(activeTripType)}`)
        ]);
        const [renterResult, ownerResult] = await Promise.all([
            renterResponse.ok ? renterResponse.json() : null,
            ownerResponse.ok ? ownerResponse.json() : null
        ]);
        const renterTrips = renterResult?.isSuccess && Array.isArray(renterResult.data) ? renterResult.data : [];
        const ownerTrips = ownerResult?.isSuccess && Array.isArray(ownerResult.data) ? ownerResult.data : [];
        const tripsById = new Map(renterTrips.map(trip => [trip.bookingId, trip]));
        ownerTrips.forEach(trip => {
            if (!tripsById.has(trip.bookingId)) tripsById.set(trip.bookingId, trip);
        });
        apiTrips = Array.from(tripsById.values());
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
            image.src = window.AzuVehicleImages?.resolve(trip.name, trip.image || '') || trip.image || '';
            image.addEventListener('error', () => {
                image.src = window.AzuVehicleImages?.placeholder || '';
            }, { once: true });
            image.alt = trip.name || 'Xe đã đặt';

            const info = document.createElement('div');
            const title = document.createElement('h2');
            title.textContent = trip.name;
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

    const currentUserId = sessionStorage.getItem('azuCarUserId') || '';
    apiTrips.forEach(trip => {
        const isOwnerTrip = Boolean(currentUserId && trip.ownerId === currentUserId && trip.renterId !== currentUserId);
        const card = document.createElement('article');
        card.className = 'trip-card';
        card.style.position = 'relative';

        const image = document.createElement('img');
        image.src = window.AzuVehicleImages?.resolve(trip.vehicleName, trip.coverImageUrl || '') || trip.coverImageUrl || '';
        image.addEventListener('error', () => {
            image.src = window.AzuVehicleImages?.placeholder || '';
        }, { once: true });
        image.alt = trip.vehicleName;

        const info = document.createElement('div');
        const title = document.createElement('h2');
        title.innerHTML = `${trip.vehicleName} ${trip.licensePlate ? `<small style="font-size: 13px; color: #64748b; font-weight: normal;">(${trip.licensePlate})</small>` : ''}`;
        const perspective = document.createElement('span');
        perspective.className = 'trip-role-label';
        perspective.textContent = isOwnerTrip ? `Bạn là chủ xe · Khách thuê: ${trip.renterName || 'Khách thuê'}` : `Bạn là người thuê · Chủ xe: ${trip.ownerName || 'Chủ xe'}`;

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
        depositSmall.textContent = `Đã cọc trực tuyến: ${Number(trip.depositAmount || 0).toLocaleString('vi-VN')} đ (25%)`;

        info.append(title, perspective, meta, statusSpan, price, depositSmall);

        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'margin-top: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';

        const detailBtn = document.createElement('button');
        detailBtn.type = 'button';
        detailBtn.className = 'trip-detail-open';
        detailBtn.textContent = 'Xem chi tiết';
        detailBtn.addEventListener('click', () => openTripDetails(trip.bookingId));
        actionsDiv.appendChild(detailBtn);

        if (isOwnerTrip && trip.status === 'Pending') {
            const respondToRequest = async (accept, button) => {
                const reason = accept ? null : prompt('Nhập lý do từ chối đơn:');
                if (!accept && reason === null) return;
                button.disabled = true;
                try {
                    const response = await fetch(`/api/bookings/${trip.bookingId}/respond`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accept, reason })
                    });
                    const result = await response.json();
                    if (!response.ok || !result?.isSuccess) throw new Error(result?.message || 'Không thể cập nhật đơn.');
                    renderTrips();
                } catch (error) {
                    alert(error.message || 'Lỗi kết nối máy chủ.');
                    button.disabled = false;
                }
            };

            const acceptButton = document.createElement('button');
            acceptButton.type = 'button';
            acceptButton.className = 'trip-detail-action is-primary';
            acceptButton.textContent = 'Duyệt đơn';
            acceptButton.addEventListener('click', () => respondToRequest(true, acceptButton));

            const rejectButton = document.createElement('button');
            rejectButton.type = 'button';
            rejectButton.className = 'trip-detail-action is-secondary';
            rejectButton.textContent = 'Từ chối';
            rejectButton.addEventListener('click', () => respondToRequest(false, rejectButton));
            actionsDiv.append(acceptButton, rejectButton);
        }

        // 1. Nhận xe
        if (trip.status === 'Accepted') {
            const pickupBtn = document.createElement('button');
            pickupBtn.type = 'button';
            pickupBtn.style.cssText = 'background: #16a34a; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            pickupBtn.innerHTML = '<i class="fa-solid fa-key"></i> Bàn giao / Nhận xe';
            pickupBtn.addEventListener('click', async () => {
                const conf = confirm(`Xác nhận bạn đã nhận bàn giao xe ${trip.vehicleName}? Chuyến đi sẽ chính thức bắt đầu.`);
                if (!conf) return;
                pickupBtn.disabled = true;
                try {
                    const r = await fetch(`/api/bookings/${trip.bookingId}/pickup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'Pickup' })
                    });
                    const d = await r.json();
                    if (r.ok && d.isSuccess) {
                        alert('Xác nhận nhận xe thành công! Chúc bạn có một hành trình an toàn và vui vẻ.');
                        renderTrips();
                    } else {
                        alert('Lỗi: ' + (d?.message || 'Không thể xác nhận nhận xe'));
                    }
                } catch (e) {
                    alert('Lỗi kết nối máy chủ.');
                } finally {
                    pickupBtn.disabled = false;
                }
            });
            actionsDiv.appendChild(pickupBtn);
        }

        // 2. Trả xe
        if (trip.status === 'Ongoing') {
            const returnBtn = document.createElement('button');
            returnBtn.type = 'button';
            returnBtn.style.cssText = 'background: #2563eb; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            returnBtn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Xác nhận trả xe';
            returnBtn.addEventListener('click', async () => {
                const conf = confirm(`Xác nhận hoàn tất chuyến đi và trả lại xe ${trip.vehicleName} cho chủ xe?`);
                if (!conf) return;
                returnBtn.disabled = true;
                try {
                    const r = await fetch(`/api/bookings/${trip.bookingId}/return`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'Return' })
                    });
                    const d = await r.json();
                    if (r.ok && d.isSuccess) {
                        if (String(d.data?.status || '').toLowerCase() === 'completed') {
                            openReviewModal(trip);
                        } else {
                            alert('Đã xác nhận trả xe. Chuyến đi sẽ hoàn tất sau khi chủ xe xác nhận.');
                        }
                        renderTrips();
                    } else {
                        alert('Lỗi: ' + (d?.message || 'Không thể xác nhận trả xe'));
                    }
                } catch (e) {
                    alert('Lỗi kết nối máy chủ.');
                } finally {
                    returnBtn.disabled = false;
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
                reviewBtn.addEventListener('click', () => openReviewModal(trip));
                actionsDiv.appendChild(reviewBtn);
            } else {
                const reviewedBadge = document.createElement('span');
                reviewedBadge.style.cssText = 'font-size: 13px; color: #16a34a; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;';
                reviewedBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã gửi đánh giá';
                actionsDiv.appendChild(reviewedBadge);
            }
        }

        // 4. Hủy chuyến
        if (trip.status === 'Pending' || trip.status === 'Accepted') {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.style.cssText = 'background: #fff; color: #dc2626; border: 1px solid #fca5a5; padding: 6px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Hủy chuyến này';
            cancelBtn.addEventListener('click', async () => {
                const reason = prompt('Nhập lý do hủy chuyến:');
                if (reason === null) return;
                cancelBtn.disabled = true;
                try {
                    const r = await fetch(`/api/bookings/${trip.bookingId}/cancel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reason: reason || 'Khách thuê chủ động hủy chuyến' })
                    });
                    const d = await r.json();
                    if (r.ok && d.isSuccess) {
                        alert('Hủy chuyến thành công! Tiền cọc đã được giải phóng.');
                        renderTrips();
                    } else {
                        alert('Lỗi: ' + (d?.message || 'Không thể hủy chuyến'));
                    }
                } catch (e) {
                    alert('Lỗi kết nối máy chủ.');
                } finally {
                    cancelBtn.disabled = false;
                }
            });
            actionsDiv.appendChild(cancelBtn);
        }

        if (actionsDiv.children.length > 0) {
            info.appendChild(actionsDiv);
        }

        card.append(image, info);
        tripsList.append(card);
    });

    const unreviewedTrip = apiTrips.find(trip =>
        trip.status === 'Completed' &&
        !trip.hasReviewed &&
        sessionStorage.getItem(`review-prompt-dismissed-${trip.bookingId}`) !== 'true'
    );
    if (unreviewedTrip && (!reviewModal || reviewModal.hidden)) {
        openReviewModal(unreviewedTrip);
    }
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
            window.location.href = 'index.html';
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
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

confirmLogoutBtn?.addEventListener('click', async () => {
    if (window.AzuStore?.logout) {
        await window.AzuStore.logout();
    } else {
        sessionStorage.clear();
        window.location.href = '/';
    }
});

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

// Khởi chạy
handleHashNavigation();
