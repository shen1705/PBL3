const menuGroups = [
  {
    title: "Điều hành",
    items: [
      { id: "overview", label: "Tổng quan", href: "index.html" },
      { id: "owners", label: "Hồ sơ chủ xe", href: "owners.html", count: 12 },
      { id: "listings", label: "Kiểm duyệt tin đăng", href: "listings.html", count: 24 },
      { id: "disputes", label: "Tranh chấp & khiếu nại", href: "disputes.html", count: 7 },
    ],
  },
  {
    title: "Quản lý nền tảng",
    items: [
      { id: "users", label: "Tài khoản người dùng", href: "users.html" },
      { id: "fees", label: "Phí & hoa hồng", href: "fees.html" },
      { id: "revenue", label: "Doanh thu & thống kê", href: "revenue.html" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { id: "logs", label: "Nhật ký hoạt động", href: "logs.html" },
      { id: "settings", label: "Cài đặt & phân quyền", href: "settings.html" },
    ],
  },
];

const menuIcons = {
  overview: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  owners: '<path d="M12 3 19 6v5c0 4.5-2.9 7.8-7 10-4.1-2.2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  listings: '<path d="M3 14h2l2-5h9l4 4h1v5h-2"/><path d="M7 9 9 5h6l3 4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  disputes: '<path d="M4 5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-5l-4 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M18 9h2a2 2 0 0 1 2 2v7h-4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1"/><path d="M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.6V20"/>',
  fees: '<path d="M4 6h16M4 12h16M4 18h16"/><path d="M9 4v4M15 10v4M8 16v4"/>',
  revenue: '<path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M16 6h4v4"/>',
  logs: '<path d="M4 8a9 9 0 1 1-1 5"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>',
  settings: '<path d="M12 3 19 6v5c0 4.5-2.9 7.8-7 10-4.1-2.2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
};

function renderSidebar() {
  const el = document.getElementById("sidebar");
  const active = el.dataset.active;

  const groups = menuGroups.map(group => `
    <div class="sidebar__group">
      <p class="sidebar__group-title">${group.title}</p>
      ${group.items.map(item => `
        <a class="sidebar__item ${item.id === active ? "is-active" : ""}" data-icon="${item.id}" href="${item.href}">
          <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${menuIcons[item.id]}</svg>
          <span class="sidebar__label">${item.label}</span>
          ${item.count ? `<span class="sidebar__count">${item.count}</span>` : ""}
        </a>
      `).join("")}
    </div>
  `).join("");

  el.innerHTML = `
    ${groups}
    <div class="sidebar__notice">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.9 7.8-7 10-4.1-2.2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>
      <strong>An toàn từ mỗi thao tác</strong>
      <p>Các thay đổi được lưu trong nhật ký hệ thống.</p>
    </div>
    <a class="sidebar__logout" href="#">Đăng xuất</a>
  `;
}

function renderHeader() {
  document.getElementById("header").innerHTML = `
    <a class="header__logo" href="index.html" aria-label="A2U Car - Tổng quan Admin">
      <img src="assets/a2u-mark.svg" alt="" width="42" height="42">
      <span class="header__wordmark"><strong>A2U</strong><em>Car</em></span>
    </a>
    <nav class="header__nav" aria-label="Điều hướng chính">
      <a href="#">Về A2U Car</a>
      <a href="index.html" class="is-active">Trung tâm quản trị</a>
      <a href="#">Xem website</a>
    </nav>
    <div class="header__tools">
      <button class="header__icon-button" type="button" aria-label="Tin nhắn">▢</button>
      <button class="header__icon-button header__notification" type="button" aria-label="Thông báo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
      </button>
      <div class="header__user">
        <span class="header__avatar">MA</span>
        <div>
          <strong>Minh Anh</strong>
          <small>Quản trị viên</small>
        </div>
        <span aria-hidden="true">⌄</span>
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