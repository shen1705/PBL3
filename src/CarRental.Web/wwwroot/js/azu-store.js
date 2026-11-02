(function (global) {
    const KEYS = {
        name: 'azuCarDisplayName',
        fullName: 'azuCarFullName',
        username: 'azuCarUserName',
        userId: 'azuCarUserId',
        roles: 'azuCarRoles',
        phone: 'azuCarPhone',
        email: 'azuCarEmail',
        trips: 'azuCarTrips',
        ownerCars: 'azuCarOwnerCars',
        returnTo: 'azuCarReturnTo',
        selectedCar: 'azuCarSelectedCar'
    };

    function currentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    function currentUrl() {
        return currentPage() + window.location.search + window.location.hash;
    }

    function readJson(key, fallback) {
        try {
            const raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    function isLoggedIn() {
        return Boolean(sessionStorage.getItem(KEYS.name));
    }

    function rememberReturnTo(url) {
        sessionStorage.setItem(KEYS.returnTo, url || currentUrl());
    }

    function consumeReturnTo() {
        const value = sessionStorage.getItem(KEYS.returnTo);
        sessionStorage.removeItem(KEYS.returnTo);
        return value;
    }

    function pageName(url) {
        return String(url || '').split('#')[0].split('?')[0].split('/').pop() || '';
    }

    function requireLogin() {
        if (isLoggedIn()) return true;
        try {
            sessionStorage.removeItem(KEYS.returnTo);
            sessionStorage.setItem('azuCarPromptLogin', '1');
        } catch (e) {}
        window.location.assign('index.html');
        return false;
    }

    function isOwner() {
        const roles = readJson(KEYS.roles, []);
        return Array.isArray(roles) && roles.some(r => String(r).toLowerCase() === 'owner');
    }

    function isAdminOrStaff() {
        const roles = readJson(KEYS.roles, []);
        return Array.isArray(roles) && roles.some(r => {
            const low = String(r).toLowerCase();
            return low === 'admin' || low === 'staff';
        });
    }

    function syncRoleUi() {
        const userIsOwner = isOwner();
        const ownerNavLinks = document.querySelectorAll('#owner-nav-link');
        ownerNavLinks.forEach(el => {
            el.textContent = userIsOwner ? 'Quản lý xe' : 'Trở thành chủ xe';
        });

        const navBecomeOwnerTexts = document.querySelectorAll('#nav-become-owner-text, .nav-become-owner-text');
        navBecomeOwnerTexts.forEach(el => {
            el.textContent = userIsOwner ? 'Quản lý xe' : 'Trở thành chủ xe';
        });



        window.dispatchEvent(new CustomEvent('azu:role-changed', { detail: { isOwner: userIsOwner } }));
    }

    function syncHeaderAuth() {
        const name = sessionStorage.getItem(KEYS.fullName) || sessionStorage.getItem(KEYS.name);
        const guestActions = document.getElementById('guest-actions');
        const accountDisplay = document.getElementById('account-display');
        const accountAvatar = document.getElementById('account-avatar');
        const accountName = document.getElementById('account-name');
        const tripsNavLink = document.getElementById('trips-nav-link');

        if (name) {
            if (guestActions) guestActions.hidden = true;
            if (accountDisplay) accountDisplay.hidden = false;
            if (accountAvatar) accountAvatar.textContent = Array.from(name.trim())[0].toLocaleUpperCase('vi');
            if (accountName) accountName.textContent = name;
            if (tripsNavLink) tripsNavLink.hidden = false;
        } else {
            if (guestActions) guestActions.hidden = false;
            if (accountDisplay) accountDisplay.hidden = true;
        }

        syncRoleUi();
    }

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.isSuccess && data.data) {
                    const u = data.data;
                    const displayName = (u.fullName && u.fullName.trim()) || u.userName || '';
                    sessionStorage.setItem(KEYS.name, displayName);
                    sessionStorage.setItem(KEYS.fullName, (u.fullName && u.fullName.trim()) || '');
                    sessionStorage.setItem(KEYS.username, u.userName || '');
                    sessionStorage.setItem(KEYS.userId, u.userId);
                    writeJson(KEYS.roles, u.roles || []);
                    if (u.phoneNumber) sessionStorage.setItem(KEYS.phone, u.phoneNumber);
                    if (u.email) sessionStorage.setItem(KEYS.email, u.email);
                    syncHeaderAuth();
                    window.dispatchEvent(new CustomEvent('azu:auth-changed', { detail: u }));
                    syncRoleUi();

                    const curPath = window.location.pathname.toLowerCase();
                    if ((curPath === '/' || curPath === '/index.html' || curPath === '') &&
                        u.roles && (u.roles.includes('Admin') || u.roles.includes('Staff'))) {
                        window.location.assign('/admin/users.html');
                        return data.data;
                    }

                    return data.data;
                }
            } else if (res.status === 401) {
                // Not authenticated on server; clear stale local session
                sessionStorage.removeItem(KEYS.name);
                sessionStorage.removeItem(KEYS.fullName);
                sessionStorage.removeItem(KEYS.username);
                sessionStorage.removeItem(KEYS.userId);
                sessionStorage.removeItem(KEYS.roles);
                sessionStorage.removeItem(KEYS.phone);
                sessionStorage.removeItem(KEYS.email);
                syncHeaderAuth();
                syncRoleUi();
            }
        } catch (err) {
            console.warn('Auth check skipped:', err);
        }
        return null;
    }

    async function login(identifier, password, rememberMe = true) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ identifier, password, rememberMe })
        });
        const data = await res.json();
        if (res.ok && data.isSuccess) {
            const u = data.data;
            const displayName = (u.fullName && u.fullName.trim()) || u.userName || '';
            sessionStorage.setItem(KEYS.name, displayName);
            sessionStorage.setItem(KEYS.fullName, (u.fullName && u.fullName.trim()) || '');
            sessionStorage.setItem(KEYS.username, u.userName || '');
            sessionStorage.setItem(KEYS.userId, u.userId);
            writeJson(KEYS.roles, u.roles || []);
            if (u.phoneNumber) sessionStorage.setItem(KEYS.phone, u.phoneNumber);
            if (u.email) sessionStorage.setItem(KEYS.email, u.email);
            syncHeaderAuth();
            window.dispatchEvent(new CustomEvent('azu:auth-changed', { detail: u }));
            syncRoleUi();

            if (u.roles && (u.roles.includes('Admin') || u.roles.includes('Staff'))) {
                window.location.assign('/admin/users.html');
                return data;
            }
        }
        return data;
    }

    async function register(reqData) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reqData)
        });
        const data = await res.json();
        if (res.ok && data.isSuccess) {
            const u = data.data;
            const displayName = (u.fullName && u.fullName.trim()) || u.userName || '';
            sessionStorage.setItem(KEYS.name, displayName);
            sessionStorage.setItem(KEYS.fullName, (u.fullName && u.fullName.trim()) || '');
            sessionStorage.setItem(KEYS.username, u.userName || '');
            sessionStorage.setItem(KEYS.userId, u.userId);
            writeJson(KEYS.roles, u.roles || []);
            if (u.phoneNumber) sessionStorage.setItem(KEYS.phone, u.phoneNumber);
            if (u.email) sessionStorage.setItem(KEYS.email, u.email);
            syncHeaderAuth();
            window.dispatchEvent(new CustomEvent('azu:auth-changed', { detail: u }));
            syncRoleUi();
        }
        return data;
    }

    async function logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        sessionStorage.removeItem(KEYS.name);
        sessionStorage.removeItem(KEYS.fullName);
        sessionStorage.removeItem(KEYS.username);
        sessionStorage.removeItem(KEYS.userId);
        sessionStorage.removeItem(KEYS.roles);
        sessionStorage.removeItem(KEYS.phone);
        sessionStorage.removeItem(KEYS.email);
        syncHeaderAuth();
        window.location.assign('/');
    }

    async function changePassword(currentPassword, newPassword, confirmPassword) {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
        return await res.json();
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                syncHeaderAuth();
                checkAuth();
            });
        } else {
            syncHeaderAuth();
            checkAuth();
        }

        // Bắt sự kiện bấm vào nút Đăng nhập / Đăng ký ở header trên mọi trang
        document.addEventListener('click', function(e) {
            const guestBtn = e.target.closest('#guest-actions button');
            if (!guestBtn) return;
            e.preventDefault();
            const isReg = guestBtn.classList.contains('btn-register-outline');
            if (currentPage() !== 'index.html' && currentPage() !== '') {
                try {
                    sessionStorage.setItem(isReg ? 'azuCarPromptRegister' : 'azuCarPromptLogin', '1');
                } catch (err) {}
                window.location.href = 'index.html';
            } else {
                const modal = document.getElementById(isReg ? 'registerModal' : 'loginModal');
                if (modal) modal.classList.add('active');
            }
        });
    }

    global.AzuStore = {
        KEYS,
        currentPage,
        currentUrl,
        isLoggedIn,
        isOwner,
        syncRoleUi,
        rememberReturnTo,
        consumeReturnTo,
        pageName,
        requireLogin,
        syncHeaderAuth,
        checkAuth,
        login,
        register,
        logout,
        changePassword,
        getTrips() {
            return readJson(KEYS.trips, []);
        },
        addTrip(trip) {
            const trips = this.getTrips();
            trips.unshift(trip);
            writeJson(KEYS.trips, trips);
        },
        getOwnerCars() {
            return readJson(KEYS.ownerCars, []);
        },
        addOwnerCar(car) {
            const cars = this.getOwnerCars();
            cars.unshift(car);
            writeJson(KEYS.ownerCars, cars);
        },
        setSelectedCar(car) {
            writeJson(KEYS.selectedCar, car);
        },
        getSelectedCar() {
            return readJson(KEYS.selectedCar, null);
        }
    };
})(window);
