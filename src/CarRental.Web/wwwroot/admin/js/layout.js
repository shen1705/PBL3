const menuGroups = [
  {
    title: "Vận hành",
    items: [
      { id: "overview", label: "Tổng quan", href: "index.html" },
      { id: "owners", label: "Chủ xe", href: "owners.html" },
      { id: "listings", label: "Tin đăng", href: "listings.html" },
      { id: "disputes", label: "Tranh chấp", href: "disputes.html" },
    ],
  },
  {
    title: "Nền tảng",
    items: [
      { id: "users", label: "Người dùng", href: "users.html" },
      { id: "fees", label: "Phí & hoa hồng", href: "fees.html" },
      { id: "revenue", label: "Doanh thu", href: "revenue.html" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { id: "logs", label: "Nhật ký", href: "logs.html" },
      { id: "settings", label: "Cài đặt", href: "settings.html" },
    ],
  },
];

function renderSidebar() {
  const el = document.getElementById("sidebar");
  const active = el.dataset.active;

  const groups = menuGroups.map(group => `
    <div class="sidebar__group">
      <p class="sidebar__group-title">${group.title}</p>
      ${group.items.map(item => `
        <a class="sidebar__item ${item.id === active ? "is-active" : ""}" data-icon="${item.id}" href="${item.href}">
          <span class="sidebar__label">${item.label}</span>
          ${item.count ? `<span class="sidebar__count">${item.count}</span>` : ""}
        </a>
      `).join("")}
    </div>
  `).join("");

  el.innerHTML = `
    ${groups}
    <a class="sidebar__logout" href="#">Đăng xuất</a>
  `;
}

function renderHeader() {
  document.getElementById("header").innerHTML = `
    <a class="header__logo" href="/" aria-label="AZU Car - Trang chủ">
      <img src="assets/a2u-mark.svg" alt="" width="42" height="42">
      <span class="header__wordmark"><strong>AZU</strong><em>Car</em></span>
    </a>
    <nav class="header__nav" aria-label="Điều hướng chính">
      <a href="/">Trang chủ</a>
      <a href="index.html" class="is-active">Quản trị</a>
    </nav>
    <div class="header__tools">
      <button class="header__icon-button header__notification" type="button" aria-label="Thông báo" data-admin-notifications>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
      </button>
      <div class="header__user">
        <span class="header__avatar">MA</span>
        <div>
          <strong>Minh Anh</strong>
          <small>Quản trị viên</small>
        </div>
        <svg class="header__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </div>
    </div>
  `;
}

renderHeader();
renderSidebar();

const assistant = document.createElement("div");
assistant.className = "ai-assistant";
assistant.innerHTML = `
  <section class="ai-assistant__panel" id="ai-assistant-panel" aria-labelledby="ai-assistant-title" role="status" hidden>
    <button class="ai-assistant__close" type="button" aria-label="Đóng thông báo">×</button>
    <strong id="ai-assistant-title">Trợ lý AI</strong>
    <p>Tính năng đang được chuẩn bị.</p>
  </section>
  <button class="ai-assistant__button" type="button" aria-label="Trợ lý AI" aria-controls="ai-assistant-panel" aria-expanded="false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v2"/>
      <circle cx="12" cy="2.5" r=".8" fill="currentColor" stroke="none"/>
      <rect x="4" y="6" width="16" height="13" rx="4"/>
      <path d="M8 11h.01M16 11h.01"/>
      <path d="M9 15h6M2 11v4M22 11v4M8 21h8"/>
    </svg>
  </button>
`;
document.body.append(assistant);

const assistantButton = assistant.querySelector(".ai-assistant__button");
const assistantPanel = assistant.querySelector(".ai-assistant__panel");
const assistantClose = assistant.querySelector(".ai-assistant__close");

assistantButton.addEventListener("click", () => {
  const isExpanded = assistantButton.getAttribute("aria-expanded") === "true";
  assistantButton.setAttribute("aria-expanded", String(!isExpanded));
  assistantPanel.hidden = isExpanded;
});
assistantClose.addEventListener("click", () => {
  assistantButton.setAttribute("aria-expanded", "false");
  assistantPanel.hidden = true;
  assistantButton.focus();
});

function formatVnd(val) {
  const n = Number(val) || 0;
  if (n === 0) return '0 đ';
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(2).replace('.', ',') + ' tỷ đ';
  }
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace('.', ',') + ' triệu đ';
  }
  return n.toLocaleString('vi-VN') + ' đ';
}

async function syncAdminLayoutData() {
  try {
    // check auth
    const authRes = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
    if (authRes.ok) {
      const authData = await authRes.json();
      if (authData.isSuccess && authData.data) {
        const user = authData.data;
        const roles = user.roles || [];
        const isAdmin = roles.includes('Admin');
        const isStaff = roles.includes('Staff');

        if (!isAdmin && !isStaff) {
          window.location.href = '/';
          return;
        }

        const displayName = user.fullName || user.userName || 'Admin';
        const avatarEl = document.querySelector('.header__avatar');
        const nameEl = document.querySelector('.header__user strong');
        const roleEl = document.querySelector('.header__user small');
        const logoutLink = document.querySelector('.sidebar__logout');

        if (avatarEl) {
          avatarEl.textContent = displayName.substring(0, 2).toUpperCase();
        }
        if (nameEl) {
          nameEl.textContent = displayName;
        }
        if (roleEl) {
          roleEl.textContent = isAdmin ? 'Quản trị viên' : 'Nhân viên';
        }
        if (logoutLink) {
          logoutLink.href = '/logout';
        }
      } else {
        window.location.href = '/?auth=login&returnUrl=' + encodeURIComponent(window.location.pathname);
        return;
      }
    } else {
      window.location.href = '/?auth=login&returnUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    // load stats
    const metricsRes = await fetch('/api/admin/users/metrics', { headers: { 'Accept': 'application/json' } });
    if (metricsRes.ok) {
      const metricsData = await metricsRes.json();
      if (metricsData.isSuccess && metricsData.data) {
        const m = metricsData.data;

        // sidebar badges
        const updateSidebarBadge = (iconId, count) => {
          const item = document.querySelector(`.sidebar__item[data-icon="${iconId}"]`);
          if (!item) return;
          let badge = item.querySelector('.sidebar__count');
          if (count > 0) {
            if (!badge) {
              badge = document.createElement('span');
              badge.className = 'sidebar__count';
              item.appendChild(badge);
            }
            badge.textContent = count;
          } else if (badge) {
            badge.remove();
          }
        };

        updateSidebarBadge('owners', m.pendingOwnerCount);
        updateSidebarBadge('listings', m.pendingListingCount);
        updateSidebarBadge('disputes', m.openDisputeCount);

        // sync dashboard stats
        const overviewMain = document.querySelector('.overview-main');
        if (overviewMain) {
          const statCards = overviewMain.querySelectorAll('.stats-grid .stat-card strong');
          if (statCards.length >= 4) {
            statCards[0].textContent = formatVnd(m.totalGmv);
            statCards[1].textContent = formatVnd(m.platformRevenue);
            statCards[2].textContent = m.completedTripsCount.toLocaleString('vi-VN');
            statCards[3].textContent = m.totalUsers.toLocaleString('vi-VN');
          }

          const totalPending = m.pendingOwnerCount + m.pendingListingCount + m.openDisputeCount;
          const taskPill = overviewMain.querySelector('.task-card .pill');
          if (taskPill) taskPill.textContent = totalPending;
          const requestsTabCount = overviewMain.querySelector('#overview-tab-requests span');
          if (requestsTabCount) requestsTabCount.textContent = totalPending;

          const ownersTask = overviewMain.querySelector('.task-grid a[href="owners.html"] strong');
          if (ownersTask) ownersTask.textContent = m.pendingOwnerCount;
          const listingsTask = overviewMain.querySelector('.task-grid a[href="listings.html"] strong');
          if (listingsTask) listingsTask.textContent = m.pendingListingCount;
          const disputesTask = overviewMain.querySelector('.task-grid a[href="disputes.html"] strong');
          if (disputesTask) disputesTask.textContent = m.openDisputeCount;

          const priorityDisputes = overviewMain.querySelector('.priority-list a[href="disputes.html"] strong');
          if (priorityDisputes) priorityDisputes.textContent = m.openDisputeCount;
          const priorityOwners = overviewMain.querySelector('.priority-list a[href="owners.html"] strong');
          if (priorityOwners) priorityOwners.textContent = m.pendingOwnerCount;
          const priorityListings = overviewMain.querySelector('.priority-list a[href="listings.html"] strong');
          if (priorityListings) priorityListings.textContent = m.pendingListingCount;
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi đồng bộ dữ liệu layout admin:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncAdminLayoutData);
} else {
  syncAdminLayoutData();
}
