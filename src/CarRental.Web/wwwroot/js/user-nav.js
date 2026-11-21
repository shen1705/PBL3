/**
 * AZU Car User Navigation, Notification Center & Account Controls
 * Pure vanilla JavaScript with modern, human-crafted UX patterns
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initUserDropdowns();
        initNotificationCenter();
        initUserModals();
    });

    /* ==========================================================================
       1. User Profile & Notification Dropdowns
       ========================================================================== */
    function initUserDropdowns() {
        const profileTrigger = document.getElementById('userProfileTrigger');
        const profileDropdown = document.getElementById('userProfileDropdown');
        const notifBtn = document.getElementById('userNotificationBtn');
        const notifDropdown = document.getElementById('userNotifyDropdown');

        if (profileTrigger && profileDropdown) {
            profileTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = profileDropdown.style.display !== 'none';
                closeAllDropdowns();
                if (!isOpen) {
                    profileDropdown.style.display = 'block';
                    profileTrigger.setAttribute('aria-expanded', 'true');
                }
            });
        }

        if (notifBtn && notifDropdown) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = notifDropdown.style.display !== 'none';
                closeAllDropdowns();
                if (!isOpen) {
                    notifDropdown.style.display = 'flex';
                    notifBtn.setAttribute('aria-expanded', 'true');
                    loadUserNotifications();
                }
            });
        }

        // Click outside dismisses dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userProfileWrapper') && !e.target.closest('#userNotifWrapper')) {
                closeAllDropdowns();
            }
        });

        // Escape key dismisses dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });
    }

    function closeAllDropdowns() {
        const pd = document.getElementById('userProfileDropdown');
        const nd = document.getElementById('userNotifyDropdown');
        const pt = document.getElementById('userProfileTrigger');
        const nb = document.getElementById('userNotificationBtn');

        if (pd) pd.style.display = 'none';
        if (nd) nd.style.display = 'none';
        if (pt) pt.setAttribute('aria-expanded', 'false');
        if (nb) nb.setAttribute('aria-expanded', 'false');
    }

    /* ==========================================================================
       2. Notification Center (Renter & Owner Distinct Alerts)
       ========================================================================== */
    async function loadUserNotifications() {
        const listEl = document.getElementById('userNotifyList');
        const badgeEl = document.getElementById('userNotifyBadge');
        const unreadPill = document.getElementById('notifUnreadPill');
        if (!listEl) return;

        try {
            const res = await fetch('/api/notifications?count=20', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    // Not signed in
                    if (badgeEl) badgeEl.style.display = 'none';
                    return;
                }
                listEl.innerHTML = '<div class="notif-empty"><p>Không thể tải thông báo lúc này.</p></div>';
                return;
            }

            const json = await res.json();
            if (!json?.isSuccess || !json.data) {
                listEl.innerHTML = '<div class="notif-empty"><p>Không thể tải thông báo.</p></div>';
                return;
            }

            const data = json.data;
            const items = data.items || [];
            const unread = data.unreadCount || 0;

            // Update badge
            updateBadgeUI(unread);

            if (items.length === 0) {
                listEl.innerHTML = `
                    <div class="notif-empty">
                        <i class="fa-regular fa-bell-slash notif-empty-icon"></i>
                        <p style="font-weight:600;color:#64748b;margin:0 0 2px;">Không có thông báo mới</p>
                        <small style="color:#94a3b8;">Mọi cập nhật về chuyến đi của bạn sẽ xuất hiện tại đây.</small>
                    </div>`;
                return;
            }

            listEl.innerHTML = items.map(item => renderNotificationItem(item)).join('');

            // Bind click to mark read & navigate
            listEl.querySelectorAll('.notif-item').forEach(el => {
                el.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const notifId = el.dataset.id;
                    const actionUrl = el.dataset.url || '/account#trips';
                    const isRead = el.dataset.read === 'true';

                    if (!isRead && notifId) {
                        try {
                            await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
                        } catch (err) {
                            console.warn('Error marking notification as read', err);
                        }
                    }

                    closeAllDropdowns();
                    window.location.href = actionUrl;
                });
            });

        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            listEl.innerHTML = '<div class="notif-empty"><p>Lỗi kết nối máy chủ.</p></div>';
        }
    }

    function renderNotificationItem(item) {
        const title = escapeHtml(item.title || 'Thông báo');
        const msg = escapeHtml(item.message || '');
        const timeAgo = escapeHtml(item.timeAgo || 'Vừa xong');
        const isUnread = !item.isRead;
        const url = escapeHtml(item.actionUrl || '/account#trips');

        // Determine icon and color based on title / content keywords
        let iconClass = 'fa-solid fa-circle-info';
        let colorType = 'trip-new';

        const tLower = (item.title || '').toLowerCase();
        if (tLower.includes('thành công') || tLower.includes('duyệt') || tLower.includes('bàn giao') || tLower.includes('hoàn tất')) {
            colorType = 'trip-success';
            iconClass = tLower.includes('bàn giao') ? 'fa-solid fa-key' : 'fa-solid fa-circle-check';
        } else if (tLower.includes('hủy') || tLower.includes('từ chối')) {
            colorType = 'trip-danger';
            iconClass = 'fa-solid fa-circle-xmark';
        } else if (tLower.includes('hạn') || tLower.includes('khiếu nại') || tLower.includes('cảnh báo')) {
            colorType = 'trip-warn';
            iconClass = 'fa-solid fa-triangle-exclamation';
        }

        return `
            <a href="${url}" class="notif-item ${isUnread ? 'is-unread' : ''}" data-id="${item.notificationId}" data-url="${url}" data-read="${item.isRead}">
                <div class="notif-icon-box ${colorType}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notif-body">
                    <div class="notif-item-title">
                        <span>${title}</span>
                        ${isUnread ? '<span class="notif-dot"></span>' : ''}
                    </div>
                    <div class="notif-item-msg">${msg}</div>
                    <div class="notif-item-time">${timeAgo}</div>
                </div>
            </a>
        `;
    }

    function updateBadgeUI(unreadCount) {
        const badgeEl = document.getElementById('userNotifyBadge');
        const unreadPill = document.getElementById('notifUnreadPill');

        if (badgeEl) {
            if (unreadCount > 0) {
                badgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badgeEl.style.display = 'inline-flex';
            } else {
                badgeEl.style.display = 'none';
            }
        }

        if (unreadPill) {
            if (unreadCount > 0) {
                unreadPill.textContent = `${unreadCount} mới`;
                unreadPill.style.display = 'inline-block';
            } else {
                unreadPill.style.display = 'none';
            }
        }
    }

    function initNotificationCenter() {
        const markAllBtn = document.getElementById('btnMarkAllRead');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
                    if (res.ok) {
                        updateBadgeUI(0);
                        document.querySelectorAll('.notif-item.is-unread').forEach(el => {
                            el.classList.remove('is-unread');
                            el.dataset.read = 'true';
                            const dot = el.querySelector('.notif-dot');
                            if (dot) dot.remove();
                        });
                    }
                } catch (err) {
                    console.error('Error marking all notifications as read:', err);
                }
            });
        }

        // Initial check unread count on page load
        checkUnreadNotifications();

        // Check periodic unread count every 30 seconds
        setInterval(() => {
            if (!document.hidden) {
                checkUnreadNotifications();
            }
        }, 30000);
    }

    async function checkUnreadNotifications() {
        try {
            const res = await fetch('/api/notifications/unread-count', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                const json = await res.json();
                if (json?.isSuccess && typeof json.data === 'number') {
                    updateBadgeUI(json.data);
                }
            }
        } catch (_) {
            // silent fail for polling
        }
    }

    /* ==========================================================================
       3. User Modals: Change Password & Logout Confirmation
       ========================================================================== */
    function initUserModals() {
        // Change Password Modal
        const changePwdBtn = document.getElementById('btnOpenUserChangePwd');
        const changePwdModal = document.getElementById('userChangePwdModal');
        const closeChangePwdBtn = document.getElementById('closeUserChangePwdBtn');
        const changePwdForm = document.getElementById('user-change-pwd-form');
        const changePwdError = document.getElementById('user-change-pwd-error');

        if (changePwdBtn && changePwdModal) {
            changePwdBtn.addEventListener('click', () => {
                closeAllDropdowns();
                openUserModal(changePwdModal);
                if (changePwdError) changePwdError.style.display = 'none';
                if (changePwdForm) changePwdForm.reset();
            });
        }

        if (closeChangePwdBtn && changePwdModal) {
            closeChangePwdBtn.addEventListener('click', () => closeUserModal(changePwdModal));
        }

        if (changePwdForm) {
            changePwdForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const cur = document.getElementById('uCurrentPassword')?.value || '';
                const nxt = document.getElementById('uNewPassword')?.value || '';
                const cfm = document.getElementById('uConfirmPassword')?.value || '';
                const submitBtn = document.getElementById('btnSubmitUserChangePwd');

                if (!cur) {
                    showError(changePwdError, 'Vui lòng nhập mật khẩu hiện tại.');
                    return;
                }
                if (nxt.length < 6) {
                    showError(changePwdError, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
                    return;
                }
                if (nxt === cur) {
                    showError(changePwdError, 'Mật khẩu mới không được trùng với mật khẩu hiện tại.');
                    return;
                }
                if (nxt !== cfm) {
                    showError(changePwdError, 'Xác nhận mật khẩu mới không khớp.');
                    return;
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
                }

                try {
                    const res = await fetch('/api/auth/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            currentPassword: cur,
                            newPassword: nxt,
                            confirmPassword: cfm
                        })
                    });

                    const json = await res.json();
                    if (res.ok && json.isSuccess) {
                        closeUserModal(changePwdModal);
                        alert('🎉 Đổi mật khẩu tài khoản thành công!');
                    } else {
                        showError(changePwdError, json.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.');
                    }
                } catch (err) {
                    showError(changePwdError, 'Lỗi kết nối máy chủ. Vui lòng thử lại.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Cập nhật mật khẩu';
                    }
                }
            });
        }

        // Toggle eye password helper
        document.querySelectorAll('#userChangePwdModal .toggle-password').forEach(icon => {
            icon.addEventListener('click', () => {
                const input = icon.previousElementSibling;
                if (!input) return;
                const isPass = input.type === 'password';
                input.type = isPass ? 'text' : 'password';
                icon.classList.toggle('fa-eye', isPass);
                icon.classList.toggle('fa-eye-slash', !isPass);
            });
        });

        // Logout Confirmation Modal (Misue Pattern)
        const logoutTrigger = document.getElementById('btnUserHeaderLogout');
        const logoutModal = document.getElementById('logout-modal');
        const closeLogoutBtn = document.getElementById('close-modal-btn');
        const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

        function openLogoutDialog() {
            closeAllDropdowns();
            if (logoutModal) {
                logoutModal.hidden = false;
                document.body.style.overflow = 'hidden';
            }
        }

        function closeLogoutDialog() {
            if (logoutModal) {
                logoutModal.hidden = true;
                document.body.style.overflow = '';
            }
        }

        if (logoutTrigger && logoutModal) {
            logoutTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                openLogoutDialog();
            });
        }

        // Support any legacy trigger if present
        document.querySelectorAll('#trip-logout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openLogoutDialog();
            });
        });

        if (closeLogoutBtn) {
            closeLogoutBtn.addEventListener('click', closeLogoutDialog);
        }

        if (logoutModal) {
            logoutModal.addEventListener('click', (e) => {
                if (e.target === logoutModal) closeLogoutDialog();
            });
        }

        if (confirmLogoutBtn && !confirmLogoutBtn.dataset.bound) {
            confirmLogoutBtn.dataset.bound = 'true';
            confirmLogoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                confirmLogoutBtn.disabled = true;
                confirmLogoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng xuất...';
                try {
                    if (window.AzuStore?.logout) {
                        await window.AzuStore.logout();
                    } else {
                        sessionStorage.clear();
                        window.location.href = '/logout';
                    }
                } catch (err) {
                    console.error('Logout error:', err);
                    sessionStorage.clear();
                    window.location.href = '/logout';
                }
            });
        }

        // Close on backdrop click
        if (changePwdModal) {
            changePwdModal.addEventListener('click', (e) => {
                if (e.target === changePwdModal) closeUserModal(changePwdModal);
            });
        }

        // ESC key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (logoutModal && !logoutModal.hidden) closeLogoutDialog();
                if (changePwdModal && changePwdModal.classList.contains('active')) closeUserModal(changePwdModal);
            }
        });
    }

    function openUserModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeUserModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showError(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.style.display = 'block';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
