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
const emptyTripsTitle = document.getElementById('empty-trips-title');
const emptyTripsDescription = document.getElementById('empty-trips-description');

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

async function renderTrips() {
    if (!tripsList || !tripsEmpty) return;

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

    apiTrips.forEach(trip => {
        const card = document.createElement('article');
        card.className = 'trip-card';
        card.style.position = 'relative';

        const image = document.createElement('img');
        image.src = trip.coverImageUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600';
        image.alt = trip.vehicleName;

        const info = document.createElement('div');
        const title = document.createElement('h2');
        title.innerHTML = `${trip.vehicleName} ${trip.licensePlate ? `<small style="font-size: 13px; color: #64748b; font-weight: normal;">(${trip.licensePlate})</small>` : ''}`;

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

        info.append(title, meta, statusSpan, price, depositSmall);

        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'margin-top: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';

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
                        alert('Xác nhận trả xe thành công! Cảm ơn bạn đã đồng hành cùng AZU Car.');
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
                            alert('Cảm ơn bạn đã gửi đánh giá cho chuyến đi!');
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
