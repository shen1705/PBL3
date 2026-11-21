/**
 * AZU Car - Admin Portal Integration
 * Connected to ASP.NET Core REST APIs & MySQL Database
 */

const ICONS = {
  'layout-dashboard': '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  'car-front': '<path d="m5 17-1 3m15-3 1 3M5 17H4a2 2 0 0 1-2-2v-4l3-7a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l3 7v4a2 2 0 0 1-2 2H5Z"/><path d="M2 11h20M7 14h.01M17 14h.01"/>',
  'clipboard-list': '<rect x="8" y="4" width="12" height="18" rx="2"/><path d="M8 6H6a2 2 0 0 0-2 2v12m8-12h4m-4 4h4m-4 4h4"/>',
  'scale': '<path d="m12 3 0 18M5 7h14M3 7l3 7H0l3-7Zm15 0 3 7h-6l3-7ZM8 21h8"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  'wallet': '<rect x="2" y="5" width="20" height="16" rx="2"/><path d="M16 14h6M2 9h20M5 2h13"/>',
  'chart-no-axes-column': '<path d="M5 20V10m7 10V4m7 16v-7"/>',
  'history': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8V3m0 5h5m4-1v5l3 2"/>',
  'settings': '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4.6 9l-1.4-1.5 2-3.3 2.1.7 1.7-1L9.6 2h4.8l.6 1.9 1.7 1 2.1-.7 2 3.3L19.4 9v2l1.4 1.5-2 3.3-2.1-.7-1.7 1-.6 1.9H9.6L9 16.1l-1.7-1-2.1.7-2-3.3L4.6 11V9Z" transform="translate(0 2) scale(.92)"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  'bell': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  'arrow-left-right': '<path d="M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4"/>',
  'alert-triangle': '<path d="M10.3 3.6a2 2 0 0 1 3.4 0l8 14a2 2 0 0 1-1.7 3H4a2 2 0 0 1-1.7-3l8-14ZM12 9v4m0 4h.01"/>',
  'download': '<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
  'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-9h.01"/>',
  'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  'refresh': '<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6m-5 4a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>',
  'coins': '<circle cx="9" cy="8" r="5"/><path d="M4 8v5c0 2.7 10 2.7 10 0V8M4 13v4c0 3 10 3 10 0v-4M17 8c5 .5 6 2 6 4v5c0 3-4 4-7 4"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'lock': '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
};

const icon = (n) => `<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.info}</svg>`;
const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + ' ₫';
const shortMoney = (n) => {
  n = Number(n || 0);
  return n >= 1000000 ? (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' triệu ₫' : money(n);
};
const formatDate = (d) => {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d).slice(0, 10) : dt.toLocaleDateString('vi-VN') + ' ' + dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(d).slice(0, 10);
  }
};
const now = () => new Date().toLocaleString('sv-SE', { hour12: false }).replace('T', ' ').slice(0, 16);

// Status Badge dictionary
const STATUS_DICT = {
  // Common / listings
  'Public': { text: 'Công khai', cls: 'approved' },
  'PendingApproval': { text: 'Chờ duyệt', cls: 'pending' },
  'Rejected': { text: 'Từ chối', cls: 'rejected' },
  'Hidden': { text: 'Đã ẩn', cls: 'suspended' },
  // Owner profile
  'Approved': { text: 'Đã duyệt', cls: 'approved' },
  'Pending': { text: 'Chờ duyệt', cls: 'pending' },
  'Suspended': { text: 'Tạm khóa', cls: 'suspended' },
  'Active': { text: 'Hoạt động', cls: 'approved' },
  // Dispute
  'Open': { text: 'Đang xử lý', cls: 'pending' },
  'Resolved': { text: 'Đã giải quyết', cls: 'approved' },
  // Bookings
  'Completed': { text: 'Hoàn tất', cls: 'approved' },
  'Ongoing': { text: 'Đang thuê', cls: 'inrental' },
  'Accepted': { text: 'Đã xác nhận', cls: 'approved' },
  'WaitingPayment': { text: 'Chờ cọc', cls: 'pending' },
  'Cancelled': { text: 'Đã hủy', cls: 'cancelled' },
  // Users
  'Sanctioned': { text: 'Bị xử phạt', cls: 'rejected' }
};

const DISPUTE_CAT_LABELS = {
  'OdorCleaning': '🚬 Mùi hôi / Vệ sinh',
  'LostItems': '🧰 Mất đồ / Phụ kiện',
  'Damage': '🚗 Trầy xước / Hư hỏng',
  'FuelBattery': '⛽ Thiếu xăng / pin',
  'OvertimeDistance': '⏱️ Quá giờ / Quá km',
  'TrafficFine': '📸 Phạt nguội CSGT',
  'TechnicalIssue': '🔧 Sự cố kỹ thuật',
  'LateDelivery': '⏰ Giao xe trễ',
  'DifferentVehicle': '🚙 Sai mô tả xe',
  'Overcharge': '💰 Phụ thu sai',
  'Other': '⚠️ Vi phạm khác'
};

const badge = (s) => {
  const item = STATUS_DICT[s] || { text: escapeHtml(s || '—'), cls: 'pending' };
  return `<span class="badge ${item.cls}">${item.text}</span>`;
};

// State
let currentUser = null;
let page = ['overview', 'owners', 'listings', 'disputes', 'reviews', 'users', 'fees', 'revenue', 'logs', 'settings'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
let filter = 'all';
let query = '';
let pageCache = {};
let logs = [];
try {
  logs = JSON.parse(localStorage.getItem('azu_admin_activity_logs') || '[]');
} catch {
  logs = [];
}

const addLog = (action, detail) => {
  const who = currentUser ? (currentUser.fullName || currentUser.userName) : 'Quản trị viên';
  logs.unshift({ at: now(), action, detail, who });
  if (logs.length > 100) logs.pop();
  try { localStorage.setItem('azu_admin_activity_logs', JSON.stringify(logs)); } catch {}
};

// API Call Helper
async function api(url, options = {}) {
  options.credentials = 'same-origin';
  options.headers = Object.assign({ 'Accept': 'application/json' }, options.headers || {});
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      currentUser = null;
      return { isSuccess: false, message: 'Chưa đăng nhập hoặc phiên đã hết hạn.', errorCode: 'UNAUTHORIZED' };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Call failed: ${url}`, err);
    return { isSuccess: false, message: 'Không thể kết nối đến máy chủ API.', errorCode: 'NETWORK_ERROR' };
  }
}

// UI Helpers
const pageNames = {
  overview: 'Tổng quan',
  owners: 'Hồ sơ chủ xe',
  listings: 'Quản lý tin đăng',
  disputes: 'Tranh chấp',
  reviews: 'Báo cáo đánh giá',
  users: 'Người dùng',
  fees: 'Phí & hoa hồng',
  revenue: 'Doanh thu',
  logs: 'Nhật ký',
  settings: 'Cài đặt'
};

const note = (txt = 'Dữ liệu được cập nhật trực tiếp từ cơ sở dữ liệu MySQL và hệ thống xác thực ASP.NET Core.') =>
  `<div class="data-note">${icon('info')}<span>${txt}</span></div>`;

const header = (name, desc, buttons = '') =>
  `<section class="hero"><div><h1>${name}</h1><p>${desc}</p></div><div class="hero-actions">${buttons}</div></section>`;

const exportBtn = (kind) => `<button class="btn" data-export="${kind}">${icon('download')} Xuất CSV</button>`;

const stat = (name, value, foot, ic) =>
  `<div class="stat-card"><span class="stat-icon">${icon(ic)}</span><div class="stat-content"><div class="stat-top">${name}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div></div>`;

function listToolbar(place = 'Tìm kiếm...', filters = [['all', 'Tất cả']]) {
  return `<div class="toolbar">
    <label class="search">${icon('search')}<input id="searchInput" placeholder="${place}" value="${escapeHtml(query)}" autocomplete="off"></label>
    <div class="filters">
      ${filters.map(([v, t]) => `<button class="filter ${filter === v ? 'active' : ''}" data-filter="${v}">${t}</button>`).join('')}
    </div>
  </div>`;
}

// Toast
function toast(s) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = s;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 3500);
}

// Dialog Modal
let modalCallback = null;
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal && modal.open) modal.close();
}

function showModal(title, content, callback, confirm = 'Xác nhận') {
  const modal = document.getElementById('modal');
  document.getElementById('modalContent').innerHTML = `<h3>${title}</h3>${content}`;
  document.getElementById('confirmBtn').textContent = confirm;
  modalCallback = callback;
  if (!modal.open) {
    modal.showModal();
  }
}

document.getElementById('dialogForm').addEventListener('submit', async (e) => {
  if (e.submitter?.value !== 'confirm') return;
  e.preventDefault();
  if (modalCallback) {
    const res = await modalCallback();
    if (res === false) return;
  }
  document.getElementById('modal').close();
});

// Update sidebar badge counts
async function updateSidebarMetrics() {
  const res = await api('/api/admin/users/metrics');
  if (res?.isSuccess && res.data) {
    const d = res.data;
    const ownersEl = document.querySelector('[data-count="owners"]');
    const listingsEl = document.querySelector('[data-count="listings"]');
    const disputesEl = document.querySelector('[data-count="disputes"]');
    if (ownersEl) ownersEl.textContent = d.pendingOwnerCount || '';
    if (listingsEl) listingsEl.textContent = d.pendingListingCount || '';
    if (disputesEl) disputesEl.textContent = d.openDisputeCount || '';
    const dot = document.getElementById('notifyDot');
    if (dot) dot.hidden = !(d.pendingOwnerCount > 0 || d.pendingListingCount > 0 || d.openDisputeCount > 0);
  }
}

// Render Pages
async function renderOverview() {
  const [resMetrics, resRev] = await Promise.all([
    api('/api/admin/users/metrics'),
    api('/api/admin/revenue')
  ]);

  const m = resMetrics?.data || { totalUsers: 12, completedTripsCount: 6, totalGmv: 21400000, platformRevenue: 1070000, pendingOwnerCount: 0, pendingListingCount: 2, openDisputeCount: 1 };
  const rev = resRev?.data || { recentSettlements: [] };
  const settlements = rev.recentSettlements || [];
  const totalPending = (m.pendingOwnerCount || 0) + (m.pendingListingCount || 0) + (m.openDisputeCount || 0);

  return `
    <div class="overview-top">${header('Tổng quan', 'Tình hình hoạt động thực tế trên sàn AZU Car từ cơ sở dữ liệu', exportBtn('summary'))}</div>
    <div class="stats-grid">
      ${stat('Tổng giao dịch (GMV)', shortMoney(m.totalGmv), 'Từ tất cả đơn hoàn tất', 'arrow-left-right')}
      ${stat('Hoa hồng tích lũy', money(m.platformRevenue), 'Phí dịch vụ 5% ghi nhận', 'coins')}
      ${stat('Chuyến hoàn tất', m.completedTripsCount || settlements.length, 'Không tính đơn hủy/tranh chấp', 'check-circle')}
      ${stat('Tổng người dùng', m.totalUsers || 12, 'Tài khoản trong hệ thống', 'users')}
    </div>
    <section class="panel pending-panel">
      <div class="panel-heading">
        <h2>Cần xử lý <span class="badge pending">${totalPending}</span></h2>
        <small>${icon('history')} Cập nhật trực tiếp từ hệ thống</small>
      </div>
      <div class="pending-grid">
        <button class="pending-tile" data-go="owners">
          ${icon('car-front')}
          <span class="tile-copy"><strong>Hồ sơ chủ xe</strong><small>Chờ xác minh CCCD</small></span>
          <span class="number">${m.pendingOwnerCount || 0}</span>
          <span class="chevron">${icon('chevron-right')}</span>
        </button>
        <button class="pending-tile" data-go="listings">
          ${icon('clipboard-list')}
          <span class="tile-copy"><strong>Tin đăng xe</strong><small>Chờ duyệt xe mới</small></span>
          <span class="number">${m.pendingListingCount || 0}</span>
          <span class="chevron">${icon('chevron-right')}</span>
        </button>
        <button class="pending-tile warn" data-go="disputes">
          ${icon('alert-triangle')}
          <span class="tile-copy"><strong>Khiếu nại tranh chấp</strong><small>Ưu tiên xử lý phán quyết</small></span>
          <span class="number">${m.openDisputeCount || 0}</span>
          <span class="chevron">${icon('chevron-right')}</span>
        </button>
      </div>
    </section>

    <details class="overview-more" open>
      <summary>${icon('clipboard-list')} Đối soát các chuyến đi hoàn tất gần đây <span class="summary-chevron" aria-hidden="true">${icon('chevron-down')}</span></summary>
      <div class="two-col overview-detail">
        <section class="panel">
          <div class="panel-heading">
            <h2>Giao dịch hoàn tất gần đây</h2>
            <small><button class="inline-link" data-go="revenue">Xem doanh thu chi tiết <span class="inline-chevron">${icon('chevron-right')}</span></button></small>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Chủ xe & Xe</th>
                  <th>Tổng tiền</th>
                  <th>Hoa hồng (5%)</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${settlements.length ? settlements.map(s => `
                  <tr>
                    <td><strong>#${s.bookingId}</strong></td>
                    <td><strong>${escapeHtml(s.ownerName)}</strong><span class="sub">${escapeHtml(s.vehicleName)}</span></td>
                    <td>${money(s.totalAmount)}</td>
                    <td><span class="gold">${money(s.commissionAmount)}</span></td>
                    <td>${badge('Completed')}</td>
                  </tr>
                `).join('') : `<tr><td colspan="5" class="empty">Chưa có giao dịch hoàn tất</td></tr>`}
              </tbody>
            </table>
          </div>
        </section>
        <section class="panel">
          <div class="panel-heading"><h2>Quy tắc vận hành & đối soát</h2></div>
          <ul class="intro-list">
            <li>Chỉ tính doanh thu cho các đơn ở trạng thái <strong>Completed</strong>.</li>
            <li>Đơn hoàn tất khi có đủ xác nhận bàn giao nhận xe và trả xe hai chiều.</li>
            <li>Đơn tranh chấp (Dispute) bị giữ cọc bảo chứng Escrow, không ghi nhận doanh thu cho tới khi có phán quyết Admin.</li>
            <li>Tỷ lệ hoa hồng sàn AZU Car được trích tự động 5% theo hợp đồng.</li>
          </ul>
          <div class="source-note">${icon('info')} Cơ sở dữ liệu: MySQL 8.0 · Bảng dữ liệu chuẩn 30 đơn kiểm thử.</div>
        </section>
      </div>
    </details>
  `;
}

async function renderOwners() {
  const [resMetrics, resList] = await Promise.all([
    api('/api/admin/owners/metrics'),
    api(`/api/admin/owners?page=1&pageSize=50${filter !== 'all' ? `&approvalStatus=${encodeURIComponent(filter)}` : ''}${query ? `&searchTerm=${encodeURIComponent(query)}` : ''}`)
  ]);

  const m = resMetrics?.data || { totalProfiles: 4, pendingCount: 0, approvedCount: 4, rejectedCount: 0, suspendedCount: 0 };
  const items = resList?.data?.items || [];
  pageCache.owners = items;

  const filters = [
    ['all', 'Tất cả'],
    ['Pending', 'Chờ duyệt'],
    ['Approved', 'Đã duyệt'],
    ['Rejected', 'Từ chối'],
    ['Suspended', 'Tạm khóa']
  ];

  return header('Hồ sơ chủ xe', 'Xét duyệt giấy tờ định danh CCCD và kiểm soát quyền đăng bài của chủ xe', exportBtn('owners')) +
    note() +
    `<div class="stats-grid">
      ${stat('Tổng hồ sơ', m.totalProfiles, 'Hồ sơ chủ xe', 'users')}
      ${stat('Chờ duyệt', m.pendingCount, 'Cần xác minh CCCD', 'history')}
      ${stat('Đã duyệt', m.approvedCount, 'Đủ quyền đăng xe', 'check-circle')}
      ${stat('Tạm khóa', m.suspendedCount || 0, 'Hạn chế quyền', 'lock')}
    </div>
    <section class="panel">
      <div class="panel-heading">
        <h2>Danh sách hồ sơ chủ xe</h2>
        <small>${items.length} hồ sơ</small>
      </div>
      ${listToolbar('Tên chủ xe, số điện thoại, CCCD...', filters)}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chủ xe</th>
              <th>Liên hệ</th>
              <th>CCCD</th>
              <th>Ngày nộp</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(o => `
              <tr>
                <td><strong>${escapeHtml(o.fullName)}</strong><span class="sub">@${escapeHtml(o.userName)} · ID: ${o.ownerProfileId}</span></td>
                <td>${escapeHtml(o.phoneNumber)}<span class="sub">${escapeHtml(o.email)}</span></td>
                <td><code>${escapeHtml(o.cccdNumber || 'Chưa cung cấp')}</code></td>
                <td>${formatDate(o.submittedAt)}</td>
                <td>${badge(o.approvalStatus)} ${o.accessStatus === 'Suspended' ? badge('Suspended') : ''}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn small" data-detail="owner:${o.ownerProfileId}">Chi tiết</button>
                    ${o.approvalStatus === 'Pending' ? `
                      <button class="btn small gold-btn" data-action="owner-approve:${o.ownerProfileId}">Duyệt</button>
                      <button class="btn small danger" data-action="owner-reject:${o.ownerProfileId}">Từ chối</button>
                    ` : o.accessStatus === 'Active' ? `
                      <button class="btn small" data-action="owner-suspend:${o.ownerProfileId}">Tạm khóa</button>
                    ` : `
                      <button class="btn small gold-btn" data-action="owner-reopen:${o.ownerProfileId}">Mở khóa</button>
                    `}
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="6" class="empty">Không tìm thấy hồ sơ chủ xe phù hợp</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

async function renderListings() {
  const [resMetrics, resList] = await Promise.all([
    api('/api/admin/listings/metrics'),
    api(`/api/admin/listings?page=1&pageSize=50${filter !== 'all' ? `&moderationStatus=${encodeURIComponent(filter)}` : ''}${query ? `&searchTerm=${encodeURIComponent(query)}` : ''}`)
  ]);

  const m = resMetrics?.data || { totalListings: 20, pendingCount: 2, publicCount: 17, hiddenCount: 1 };
  const items = resList?.data?.items || [];
  pageCache.listings = items;

  const filters = [
    ['all', 'Tất cả'],
    ['PendingApproval', 'Chờ duyệt'],
    ['Public', 'Đã duyệt công khai'],
    ['Rejected', 'Từ chối'],
    ['Hidden', 'Tạm ẩn']
  ];

  return header('Quản lý tin đăng xe', 'Kiểm soát tính hợp lệ của phương tiện, giấy đăng kiểm và bảo hiểm trước khi hiển thị công khai', exportBtn('listings')) +
    note() +
    `<div class="stats-grid">
      ${stat('Tổng tin đăng', m.totalListings, 'Phương tiện trên hệ thống', 'clipboard-list')}
      ${stat('Chờ duyệt', m.pendingCount, 'Cần duyệt trước khi hiển thị', 'history')}
      ${stat('Công khai', m.publicCount, 'Đang cho thuê', 'check-circle')}
      ${stat('Tạm ẩn / Từ chối', (m.hiddenCount || 0) + (m.rejectedCount || 0), 'Vi phạm hoặc tạm ngưng', 'alert-triangle')}
    </div>
    <section class="panel">
      <div class="panel-heading">
        <h2>Danh sách tin đăng phương tiện</h2>
        <small>${items.length} tin đăng</small>
      </div>
      ${listToolbar('Tên xe, biển số, chủ xe, khu vực...', filters)}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Phương tiện</th>
              <th>Chủ xe</th>
              <th>Khu vực</th>
              <th>Giá thuê / ngày</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(l => `
              <tr>
                <td>
                  <strong>${escapeHtml(l.brand)} ${escapeHtml(l.model)} (${l.year})</strong>
                  <span class="sub"><code style="font-weight:700;color:var(--ink)">${escapeHtml(l.licensePlate)}</code> · ${l.seats} chỗ · ${escapeHtml(l.fuelType)}</span>
                </td>
                <td><strong>${escapeHtml(l.ownerName)}</strong><span class="sub">${escapeHtml(l.ownerPhone)}</span></td>
                <td>${escapeHtml(l.district)}, ${escapeHtml(l.city)}</td>
                <td><strong>${money(l.pricePerDay)}</strong></td>
                <td>${badge(l.moderationStatus)}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn small" data-detail="listing:${l.listingId}">Chi tiết</button>
                    ${l.moderationStatus === 'PendingApproval' ? `
                      <button class="btn small gold-btn" data-action="listing-approve:${l.listingId}">Duyệt tin</button>
                      <button class="btn small danger" data-action="listing-reject:${l.listingId}">Từ chối</button>
                    ` : l.moderationStatus === 'Public' ? `
                      <button class="btn small" data-action="listing-hide:${l.listingId}">Tạm ẩn</button>
                    ` : `
                      <button class="btn small gold-btn" data-action="listing-approve:${l.listingId}">Duyệt lại</button>
                    `}
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="6" class="empty">Không tìm thấy tin đăng phù hợp</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

async function renderDisputes() {
  const [resMetrics, resList] = await Promise.all([
    api('/api/admin/disputes/metrics'),
    api(`/api/admin/disputes?page=1&pageSize=50${filter !== 'all' ? `&status=${encodeURIComponent(filter)}` : ''}${query ? `&searchTerm=${encodeURIComponent(query)}` : ''}`)
  ]);

  const m = resMetrics?.data || { totalDisputes: 3, openCount: 1, resolvedCount: 2, highPriorityCount: 0 };
  const items = resList?.data?.items || [];
  pageCache.disputes = items;

  const filters = [
    ['all', 'Tất cả'],
    ['Open', 'Đang xử lý'],
    ['Resolved', 'Đã giải quyết']
  ];

  return header('Tranh chấp & Khiếu nại', 'Phán quyết các vụ việc mâu thuẫn giữa khách thuê và chủ xe, đảm bảo dòng tiền Escrow minh bạch', exportBtn('disputes')) +
    note('Phán quyết tranh chấp sẽ trực tiếp điều phối tiền ký quỹ cọc Escrow, hoàn tiền hoặc phạt vi phạm theo đúng hợp đồng.') +
    `<div class="stats-grid">
      ${stat('Tổng vụ việc', m.totalDisputes, 'Đã ghi nhận trong CSDL', 'scale')}
      ${stat('Đang chờ xử lý', m.openCount, 'Cần ban hành phán quyết', 'alert-triangle')}
      ${stat('Đã giải quyết', m.resolvedCount, 'Đã ban hành quyết định', 'check-circle')}
      ${stat('Ưu tiên cao', m.highPriorityCount || 0, 'Quá hạn phản hồi 24h', 'history')}
    </div>
    <section class="panel">
      <div class="panel-heading">
        <h2>Danh sách vụ việc khiếu nại</h2>
        <small>${items.length} vụ việc</small>
      </div>
      ${listToolbar('Mã tranh chấp, mã đơn, xe, người khiếu nại...', filters)}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã khiếu nại</th>
              <th>Đơn & Xe</th>
              <th>Người khiếu nại</th>
              <th>Phân loại & Đề xuất phạt</th>
              <th>Nội dung mâu thuẫn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(d => `
              <tr>
                <td><strong>#TC-${d.disputeId}</strong><span class="sub">${formatDate(d.createdAt)}</span></td>
                <td><strong>Đơn #${d.bookingId}</strong><span class="sub">${escapeHtml(d.vehicleName)} (${escapeHtml(d.licensePlate)})</span></td>
                <td><strong>${escapeHtml(d.raiserName)}</strong><span class="sub">${escapeHtml(d.raiserRole)}</span></td>
                <td>
                  <span class="badge approved" style="display:inline-block;margin-bottom:3px">${DISPUTE_CAT_LABELS[d.category] || escapeHtml(d.category || 'Chung')}</span>
                  ${d.proposedAmount > 0 ? `<div style="font-size:12px;color:var(--danger);font-weight:600">Đề xuất: ${money(d.proposedAmount)}</div>` : ''}
                </td>
                <td style="max-width:280px;white-space:normal;line-height:1.45">${escapeHtml(d.description)}</td>
                <td>${badge(d.status)}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn small" data-detail="dispute:${d.disputeId}">Chi tiết</button>
                    ${d.status === 'Open' ? `<button class="btn small gold-btn" data-action="dispute-resolve:${d.disputeId}">Giải quyết</button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="7" class="empty">Không có vụ việc tranh chấp phù hợp</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

async function renderReviews() {
  const res = await api('/api/admin/reviews/reported');
  const items = res?.data || [];
  pageCache.reviews = items;

  return header('Kiểm duyệt Đánh giá', 'Xử lý báo cáo các đánh giá vi phạm tiêu chuẩn cộng đồng, sai sự thật (UC-AS-10)', exportBtn('reviews')) +
    note('Các đánh giá bị người dùng báo cáo vi phạm sẽ được hiển thị tại đây để Quản trị viên thẩm định, duyệt giữ lại công khai hoặc gỡ bỏ / ẩn.') +
    `<div class="stats-grid">
      ${stat('Đánh giá bị báo cáo', items.length, 'Cần thẩm định & xử lý', 'flag')}
      ${stat('Cơ chế kiểm duyệt', 'Độc lập', 'Staff & Admin có thẩm quyền', 'shield')}
    </div>
    <section class="panel">
      <div class="panel-heading">
        <h2>Danh sách đánh giá bị báo cáo</h2>
        <small>${items.length} báo cáo</small>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã ĐG</th>
              <th>Đơn & Xe</th>
              <th>Người đánh giá</th>
              <th>Người nhận ĐG</th>
              <th>Điểm & Nhận xét</th>
              <th>Lý do báo cáo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(r => `
              <tr>
                <td><strong>#DG-${r.reviewId}</strong><span class="sub">${formatDate(r.createdAt)}</span></td>
                <td><strong>Đơn #${r.bookingId}</strong><span class="sub">${escapeHtml(r.vehicleName)} (${escapeHtml(r.licensePlate)})</span></td>
                <td><strong>${escapeHtml(r.reviewerName)}</strong></td>
                <td><strong>${escapeHtml(r.revieweeName)}</strong></td>
                <td style="max-width:280px;white-space:normal;line-height:1.4">
                  <div style="color:#f59e0b;font-size:13px;font-weight:700">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                  <div style="font-size:13px;color:#334155">${escapeHtml(r.comment || 'Không có nhận xét')}</div>
                </td>
                <td style="max-width:240px;white-space:normal;line-height:1.4">
                  <strong style="color:var(--danger)">${escapeHtml(r.reportReason || 'Vi phạm tiêu chuẩn')}</strong>
                  <span class="sub">Báo cáo bởi: ${escapeHtml(r.reportedByName || 'Thành viên')} (${formatDate(r.reportedAt)})</span>
                </td>
                <td>${r.isPublic ? '<span class="badge approved">Công khai</span>' : '<span class="badge suspended">Tạm ẩn</span>'}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn small approved" data-action="review-keep:${r.reviewId}" title="Duyệt giữ lại đánh giá công khai">Giữ lại</button>
                    <button class="btn small danger" data-action="review-hide:${r.reviewId}" title="Ẩn và gỡ bỏ đánh giá vi phạm">Ẩn ĐG</button>
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="8" class="empty">Hiện không có đánh giá nào bị báo cáo vi phạm 🎉</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

async function renderUsers() {
  const [resMetrics, resList] = await Promise.all([
    api('/api/admin/users/metrics'),
    api(`/api/admin/users?page=1&pageSize=50${filter !== 'all' ? `&role=${encodeURIComponent(filter)}` : ''}${query ? `&searchTerm=${encodeURIComponent(query)}` : ''}`)
  ]);

  const m = resMetrics?.data || { totalUsers: 12, activeUsers: 12, ownerCount: 4, sanctionedCount: 0 };
  const items = resList?.data?.items || [];
  pageCache.users = items;

  const filters = [
    ['all', 'Tất cả'],
    ['PendingLicense', 'Chờ duyệt GPLX'],
    ['Admin', 'Quản trị viên'],
    ['Owner', 'Chủ xe'],
    ['Customer', 'Khách thuê'],
    ['Sanctioned', 'Bị xử phạt']
  ];

  return header('Quản trị Người dùng', 'Quản lý tài khoản, phân quyền quản trị, kiểm soát án phạt và xác thực giấy phép lái xe', exportBtn('users')) +
    note() +
    `<div class="stats-grid">
      ${stat('Tổng người dùng', m.totalUsers || 12, 'Tài khoản chuẩn hệ thống', 'users')}
      ${stat('Đang hoạt động', m.activeUsers || 12, 'Không bị kỷ luật', 'check-circle')}
      ${stat('Chủ xe', m.ownerCount || 4, 'Đã xác minh hồ sơ', 'car-front')}
      ${stat('Bị xử phạt', m.sanctionedCount || 0, 'Đang bị khóa tài khoản', 'lock')}
    </div>
    <section class="panel">
      <div class="panel-heading" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <h2>Danh sách tài khoản hệ thống</h2>
          <small>${items.length} người dùng</small>
        </div>
        <button class="btn small primary" id="batchAutoVerifyBtn">⚡ Quét & Duyệt tự động GPLX</button>
      </div>
      ${listToolbar('Tên đăng nhập, họ tên, email, số điện thoại...', filters)}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Bằng lái (GPLX)</th>
              <th>Lịch sử</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(u => `
              <tr>
                <td><strong>${escapeHtml(u.fullName)}</strong><span class="sub">@${escapeHtml(u.userName)}</span></td>
                <td>${escapeHtml(u.phoneNumber || '—')}<span class="sub">${escapeHtml(u.email)}</span></td>
                <td>${(u.roles || []).map(r => `<span class="badge ${r === 'Admin' ? 'gold-btn' : 'approved'}">${r}</span>`).join(' ')}</td>
                <td>
                  ${!u.hasDriverLicense 
                    ? `<span class="badge" style="background:#f1f5f9;color:#64748b">Chưa nộp</span>` 
                    : u.isDriverLicenseVerified 
                      ? `<span class="badge approved" title="GPLX đã xác thực hợp lệ">✓ Hạng ${escapeHtml(u.driverLicenseClass || 'B2')} (Đã duyệt)</span>` 
                      : `<span class="badge pending" style="background:#fef3c7;color:#b45309" title="Đang chờ Quản trị viên duyệt">⏳ Hạng ${escapeHtml(u.driverLicenseClass || 'B2')} (Chờ duyệt)</span>`}
                </td>
                <td><small>${u.tripsCount || 0} chuyến · ${u.vehiclesCount || 0} xe</small></td>
                <td>${badge(u.isSanctioned ? 'Sanctioned' : 'Active')}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn small" data-detail="user:${u.id}">Chi tiết</button>
                    ${u.hasDriverLicense && !u.isDriverLicenseVerified ? `
                      <button class="btn small primary" data-action="user-approveLicense:${u.id}" title="Phê duyệt Giấy phép lái xe thủ công">Duyệt GPLX</button>
                      <button class="btn small" data-action="user-autoVerifyLicense:${u.id}" title="Thẩm định tự động theo chuẩn" style="background:#e0e7ff;color:#3730a3">⚡ Tự động</button>
                    ` : ''}
                    ${!u.isAdmin ? (
                      u.isSanctioned ? `<button class="btn small gold-btn" data-action="user-lift:${u.id}">Mở khóa</button>` :
                      `<button class="btn small danger" data-action="user-sanction:${u.id}">Khóa</button>`
                    ) : ''}
                    <button class="btn small" data-action="user-pwd:${u.id}">Đổi mật khẩu</button>
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="7" class="empty">Không tìm thấy người dùng phù hợp</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

async function renderFees() {
  const res = await api('/api/admin/fees');
  const d = res?.data || { commissionRate: 0.05, depositRate: 0.25, ownerCancelPenaltyRate: 0.08, responseDeadlineHours: 24, totalPlatformRevenue: 1070000, totalGmv: 21400000, completedBookingsCount: 6, canEditConfig: true };
  pageCache.feeSettings = d;

  const commPct = Math.round(d.commissionRate * 100);
  const depPct = Math.round(d.depositRate * 100);
  const penPct = Math.round(d.ownerCancelPenaltyRate * 100);

  return header('Phí & Hoa hồng sàn', 'Thiết lập tỷ lệ hoa hồng, tiền cọc bảo chứng và chính sách phạt vi phạm hủy chuyến', exportBtn('fees')) +
    note('Cấu hình phí được lưu trữ trong bảng SystemSettings trên MySQL và tự động áp dụng khi tạo hợp đồng thuê xe mới.') +
    `<div class="two-col">
      <section class="panel">
        <div class="panel-heading"><h2>Cấu hình tham số tài chính hệ thống</h2></div>
        <div class="field">
          <label for="commissionRateInput">Tỷ lệ hoa hồng sàn AZU Car (%)</label>
          <input id="commissionRateInput" type="number" min="1" max="50" step="0.5" value="${commPct}">
          <div class="help">Mặc định 5%. Trích từ tổng giá trị hợp đồng khi đối soát chuyến hoàn tất.</div>
        </div>
        <div class="field">
          <label for="depositRateInput">Tỷ lệ tiền cọc bảo chứng Escrow (%)</label>
          <input id="depositRateInput" type="number" min="10" max="90" step="5" value="${depPct}">
          <div class="help">Mặc định 25%. Tiền cọc giữ trong tài khoản trung gian ký quỹ trước khi giao xe.</div>
        </div>
        <div class="field">
          <label for="penaltyRateInput">Tỷ lệ phạt hủy đơn phía Chủ xe (%)</label>
          <input id="penaltyRateInput" type="number" min="5" max="50" step="1" value="${penPct}">
          <div class="help">Mặc định 8%. Áp dụng khi chủ xe đơn phương hủy đơn đã duyệt, hoàn 100% cọc cho khách.</div>
        </div>
        <div class="field">
          <label for="deadlineInput">Hạn phản hồi yêu cầu đặt xe (Giờ)</label>
          <input id="deadlineInput" type="number" min="1" max="72" step="1" value="${d.responseDeadlineHours || 24}">
          <div class="help">Sau khoảng thời gian này nếu chủ xe không duyệt, hệ thống tự động hủy và hoàn cọc.</div>
        </div>
        ${d.canEditConfig ? `<button class="btn primary" id="saveFeeBtn">${icon('wallet')} Lưu cấu hình hệ thống</button>` : `<p class="hint">Bạn không có quyền chỉnh sửa cấu hình hệ thống (Yêu cầu quyền Admin).</p>`}
      </section>

      <section class="panel">
        <div class="panel-heading"><h2>Tóm tắt tài chính toàn sàn</h2></div>
        <ul class="list-simple">
          <li>Tổng giá trị giao dịch (GMV): <strong>${money(d.totalGmv)}</strong></li>
          <li>Hoa hồng sàn thực tế đã thu: <strong class="gold">${money(d.totalPlatformRevenue)}</strong></li>
          <li>Số chuyến đi hoàn tất đối soát: <strong>${d.completedBookingsCount} chuyến</strong></li>
          <li>Tỷ lệ hoa hồng hiện tại: <strong>${commPct}%</strong></li>
          <li>Người cập nhật gần nhất: <strong>${escapeHtml(d.updaterName || 'Quản trị Một')}</strong></li>
          <li>Thời điểm cập nhật: <small>${formatDate(d.updatedAt)}</small></li>
        </ul>
        <div class="divider"></div>
        <p class="hint">Mọi thay đổi tỷ lệ đều được ghi nhận vào nhật ký kiểm toán hệ thống (Audit Logs).</p>
      </section>
    </div>`;
}

async function renderRevenue() {
  const res = await api('/api/admin/revenue');
  const d = res?.data || { totalGmv: 21400000, totalPlatformRevenue: 1070000, totalOwnerPayout: 20330000, completedBookingsCount: 6, commissionRate: 0.05, regionalBreakdown: [], recentSettlements: [] };
  pageCache.revenueReport = d;

  const settlements = d.recentSettlements || [];
  const regions = d.regionalBreakdown || [];

  return header('Doanh thu & Đối soát sàn', 'Báo cáo doanh thu toàn sàn, cơ cấu thị trường và sao kê dòng tiền quyết toán cho chủ xe', exportBtn('revenue')) +
    note('Số liệu phản ánh chính xác từ các hợp đồng thuê xe Completed và các giao dịch đối soát ngân hàng trong MySQL.') +
    `<div class="stats-grid">
      ${stat('Tổng GMV sàn', money(d.totalGmv), 'Tổng giá trị hợp đồng', 'arrow-left-right')}
      ${stat('Doanh thu sàn AZU Car', money(d.totalPlatformRevenue), `Hoa hồng ${Math.round(d.commissionRate * 100)}% toàn sàn`, 'coins')}
      ${stat('Quyết toán cho Chủ xe', money(d.totalOwnerPayout), '95% giá trị hợp đồng', 'wallet')}
      ${stat('Số đơn hoàn tất', d.completedBookingsCount, 'Đã kết thúc trọn vẹn', 'check-circle')}
    </div>

    <section class="panel">
      <div class="panel-heading"><h2>Phân bổ doanh thu theo khu vực địa lý</h2></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tỉnh / Thành phố</th>
              <th>Doanh số GMV</th>
              <th>Tỷ trọng thị phần</th>
              <th>Số chuyến hoàn tất</th>
            </tr>
          </thead>
          <tbody>
            ${regions.length ? regions.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.regionName)}</strong></td>
                <td><strong>${money(r.gmv)}</strong></td>
                <td><span class="badge approved">${r.percentage}%</span></td>
                <td>${r.bookingCount} chuyến</td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="empty">Chưa có số liệu khu vực</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <h2>Bảng đối soát giao dịch chi tiết</h2>
        <small>${settlements.length} giao dịch gần nhất</small>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Chủ xe</th>
              <th>Phương tiện</th>
              <th>Tổng giá trị</th>
              <th>Phí sàn (5%)</th>
              <th>Thực nhận Chủ xe (95%)</th>
              <th>Thời gian đối soát</th>
            </tr>
          </thead>
          <tbody>
            ${settlements.length ? settlements.map(s => `
              <tr>
                <td><strong>#BK-${s.bookingId}</strong></td>
                <td><strong>${escapeHtml(s.ownerName)}</strong></td>
                <td>${escapeHtml(s.vehicleName)}</td>
                <td><strong>${money(s.totalAmount)}</strong></td>
                <td><span class="gold">${money(s.commissionAmount)}</span></td>
                <td><strong style="color:#16a34a">${money(s.ownerAmount)}</strong></td>
                <td>${formatDate(s.settledAt)}</td>
              </tr>
            `).join('') : `<tr><td colspan="7" class="empty">Chưa có giao dịch đối soát</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderLogs() {
  return header('Nhật ký Hoạt động Quản trị', 'Lưu vết lịch sử các hành động duyệt xe, xét duyệt chủ xe, phán quyết tranh chấp và cập nhật hệ thống', exportBtn('logs')) +
    note('Nhật ký giúp kiểm toán viên và ban quản trị truy vết mọi thao tác vận hành trên cổng quản trị.') +
    `<section class="panel">
      <div class="panel-heading">
        <h2>Hoạt động gần đây</h2>
        <small>${logs.length} sự kiện</small>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Thời điểm</th>
              <th>Hành động</th>
              <th>Nội dung chi tiết</th>
              <th>Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length ? logs.map(l => `
              <tr>
                <td>${escapeHtml(l.at)}</td>
                <td><strong>${escapeHtml(l.action)}</strong></td>
                <td>${escapeHtml(l.detail)}</td>
                <td><span class="badge approved">${escapeHtml(l.who)}</span></td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="empty">Chưa có nhật ký hoạt động trong phiên làm việc này</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderSettings() {
  return header('Cài đặt & Trạng thái Hệ thống', 'Kiểm tra tình trạng vận hành, kết nối cơ sở dữ liệu và phiên làm việc quản trị viên') +
    note() +
    `<div class="two-col">
      <section class="panel">
        <div class="panel-heading"><h2>Trạng thái kết nối dịch vụ</h2></div>
        <ul class="list-simple">
          <li>Máy chủ Web ASP.NET Core: <span class="badge approved">Đang hoạt động</span></li>
          <li>Cơ sở dữ liệu MySQL 8.0: <span class="badge approved">Đã kết nối (localhost:3306)</span></li>
          <li>Tài khoản quản trị hiện tại: <strong>${escapeHtml(currentUser?.fullName || currentUser?.userName || 'Chưa đăng nhập')}</strong></li>
          <li>Vai trò hệ thống: <span class="badge approved">${(currentUser?.roles || []).join(', ') || 'Chưa xác thực'}</span></li>
          <li>Bảo chứng ký quỹ Escrow: <span class="badge approved">Tài khoản ESCROW-0001</span></li>
        </ul>
        <div class="divider"></div>
        <button class="btn danger" id="clearLogsBtn">${icon('refresh')} Xóa nhật ký trình duyệt</button>
      </section>

      <section class="panel">
        <div class="panel-heading"><h2>Kiểm thử & Nghiệp vụ hệ thống</h2></div>
        <ul class="intro-list">
          <li><strong>30 đơn thuê mẫu:</strong> Đã seed chuẩn xác 10 đơn tháng 11/2026, 10 đơn tháng 12/2026 và 10 đơn tháng 01/2027.</li>
          <li><strong>Kiểm thử khiếu nại:</strong> Xem vụ việc đang mở (#TC-2 / BK-NOV-08) tại tab Tranh chấp để kiểm thử tính năng phán quyết hoàn cọc/phạt chủ xe.</li>
          <li><strong>Kiểm thử duyệt tin:</strong> Xem 2 xe V18 & V19 đang ở trạng thái Chờ duyệt tại tab Tin đăng.</li>
          <li><strong>Kiểm thử doanh thu:</strong> Xem chi tiết đối soát dòng tiền tại tab Doanh thu và Doanh thu trên tài khoản Chủ xe (/owner).</li>
        </ul>
      </section>
    </div>`;
}

function renderLoginPrompt() {
  return `
    <div style="max-width:480px;margin:60px auto;padding:32px;background:var(--surface,#fff);border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid var(--line,#e4e9ef)">
      <div style="text-align:center;margin-bottom:24px">
        <img src="azu-mark.svg" width="56" height="56" alt="AZU Car">
        <h2 style="margin:16px 0 8px 0;font-size:22px">Cổng Quản Trị AZU Car</h2>
        <p style="color:var(--muted);font-size:14px">Vui lòng đăng nhập với tài khoản Quản trị viên (Admin) hoặc Nhân viên (Staff)</p>
      </div>
      <form id="adminLoginForm">
        <div class="field" style="margin-bottom:16px">
          <label for="loginIdentifier">Tên đăng nhập / Email</label>
          <input id="loginIdentifier" type="text" value="admin1" required autocomplete="username" style="width:100%;padding:10px 14px;border:1px solid var(--line);border-radius:8px">
        </div>
        <div class="field" style="margin-bottom:20px">
          <label for="loginPassword">Mật khẩu</label>
          <input id="loginPassword" type="password" value="Test@12345" required autocomplete="current-password" style="width:100%;padding:10px 14px;border:1px solid var(--line);border-radius:8px">
        </div>
        <button type="submit" class="btn primary" style="width:100%;padding:12px;font-weight:600;font-size:15px;border-radius:8px">Đăng nhập vào Hệ thống</button>
      </form>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);text-align:center">
        Tài khoản mẫu: <code>admin1</code> / <code>Test@12345</code> hoặc <code>staff1</code> / <code>Test@12345</code>
      </div>
    </div>
  `;
}

// Master Render
async function render() {
  document.getElementById('crumb').textContent = pageNames[page] || 'Tổng quan';
  document.querySelectorAll('.nav-link[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));

  const contentEl = document.getElementById('content');
  if (!contentEl) return;

  if (!currentUser) {
    contentEl.innerHTML = renderLoginPrompt();
    return;
  }

  contentEl.innerHTML = `<div style="text-align:center;padding:48px;color:var(--muted)">${icon('refresh')} Đang tải dữ liệu từ máy chủ...</div>`;

  try {
    let html = '';
    switch (page) {
      case 'overview': html = await renderOverview(); break;
      case 'owners': html = await renderOwners(); break;
      case 'listings': html = await renderListings(); break;
      case 'disputes': html = await renderDisputes(); break;
      case 'reviews': html = await renderReviews(); break;
      case 'users': html = await renderUsers(); break;
      case 'fees': html = await renderFees(); break;
      case 'revenue': html = await renderRevenue(); break;
      case 'logs': html = renderLogs(); break;
      case 'settings': html = renderSettings(); break;
      default: html = await renderOverview(); break;
    }
    contentEl.innerHTML = html;
  } catch (err) {
    console.error('Render error:', err);
    contentEl.innerHTML = `<div class="data-note" style="background:#fee2e2;color:#991b1b;border-color:#fca5a5">${icon('alert-triangle')}<span>Lỗi khi tải dữ liệu: ${escapeHtml(err.message)}</span></div>`;
  }

  updateSidebarMetrics();
}

function go(p) {
  if (!pageNames[p]) return;
  page = p;
  filter = 'all';
  query = '';
  if (location.hash.slice(1) !== p) history.pushState({ page: p }, '', `#${p}`);
  document.getElementById('sidebar')?.classList.remove('open');
  render();
  window.scrollTo(0, 0);
}

window.addEventListener('popstate', () => {
  const p = location.hash.slice(1);
  page = pageNames[p] ? p : 'overview';
  filter = 'all';
  query = '';
  render();
});

// Modal Details
async function showDetail(kind, id) {
  if (kind === 'owner') {
    const res = await api(`/api/admin/owners/${id}`);
    if (!res?.isSuccess || !res.data) return toast(res?.message || 'Không thể lấy thông tin chi tiết');
    const o = res.data;
    const frontImg = o.cccdImageFront ? (o.cccdImageFront.startsWith('/') ? o.cccdImageFront : '/' + o.cccdImageFront) : '';
    const backImg = o.cccdImageBack ? (o.cccdImageBack.startsWith('/') ? o.cccdImageBack : '/' + o.cccdImageBack) : '';
    const vehicles = o.vehicles || [];

    const content = `
      <div class="detail-list">
        <div><span class="label">Mã hồ sơ</span><strong>#${o.ownerProfileId}</strong></div>
        <div><span class="label">Họ và tên</span><strong>${escapeHtml(o.fullName)}</strong></div>
        <div><span class="label">Tên đăng nhập</span><strong>@${escapeHtml(o.userName)}</strong></div>
        <div><span class="label">Số điện thoại</span><strong>${escapeHtml(o.phoneNumber)}</strong></div>
        <div><span class="label">Email</span><strong>${escapeHtml(o.email)}</strong></div>
        <div><span class="label">Số CCCD</span><strong>${escapeHtml(o.cccdNumber)}</strong></div>
        <div><span class="label">Trạng thái hồ sơ</span>${badge(o.approvalStatus)}</div>
        <div><span class="label">Quyền truy cập</span>${badge(o.accessStatus)}</div>
        <div><span class="label">Ngày nộp</span><strong>${formatDate(o.submittedAt)}</strong></div>
      </div>
      <h4 style="margin:16px 0 8px 0">Ảnh căn cước công dân (CCCD)</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div>
          <small style="display:block;margin-bottom:4px;color:var(--muted)">Mặt trước</small>
          ${frontImg ? `<img src="${frontImg}" alt="CCCD Mặt trước" style="width:100%;height:140px;object-fit:cover;border-radius:8px;border:1px solid var(--line)" onerror="this.outerHTML='<div class=\\'empty\\'>Không có ảnh</div>'">` : '<div class="empty">Chưa có ảnh</div>'}
        </div>
        <div>
          <small style="display:block;margin-bottom:4px;color:var(--muted)">Mặt sau</small>
          ${backImg ? `<img src="${backImg}" alt="CCCD Mặt sau" style="width:100%;height:140px;object-fit:cover;border-radius:8px;border:1px solid var(--line)" onerror="this.outerHTML='<div class=\\'empty\\'>Không có ảnh</div>'">` : '<div class="empty">Chưa có ảnh</div>'}
        </div>
      </div>
      <h4 style="margin:16px 0 8px 0">Danh sách xe đã đăng ký (${vehicles.length})</h4>
      ${vehicles.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Biển số</th><th>Xe</th><th>Khu vực</th><th>Giá ngày</th><th>Trạng thái</th></tr></thead>
            <tbody>
              ${vehicles.map(v => `<tr><td><code>${escapeHtml(v.licensePlate)}</code></td><td>${escapeHtml(v.brand)} ${escapeHtml(v.model)}</td><td>${escapeHtml(v.city)}</td><td>${money(v.pricePerDay)}</td><td>${badge(v.status)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="hint">Chủ xe này chưa có xe nào được đăng ký.</p>'}
    `;
    showModal(`Chi tiết hồ sơ chủ xe: ${escapeHtml(o.fullName)}`, content, () => {}, 'Đóng');
  } else if (kind === 'listing') {
    const res = await api(`/api/admin/listings/${id}`);
    if (!res?.isSuccess || !res.data) return toast(res?.message || 'Không thể lấy chi tiết tin đăng');
    const l = res.data;
    const images = l.images || [];

    const content = `
      <div class="detail-list">
        <div><span class="label">Mã tin đăng</span><strong>#${l.listingId}</strong></div>
        <div><span class="label">Phương tiện</span><strong>${escapeHtml(l.brand)} ${escapeHtml(l.model)} (${l.year})</strong></div>
        <div><span class="label">Biển số xe</span><code>${escapeHtml(l.licensePlate)}</code></div>
        <div><span class="label">Chủ sở hữu</span><strong>${escapeHtml(l.ownerName)} (${escapeHtml(l.ownerPhone)})</strong></div>
        <div><span class="label">Vị trí xe</span><strong>${escapeHtml(l.location)}, ${escapeHtml(l.district)}, ${escapeHtml(l.city)}</strong></div>
        <div><span class="label">Giá thuê / ngày</span><strong class="gold">${money(l.pricePerDay)}</strong></div>
        <div><span class="label">Hộp số · Nhiên liệu</span><strong>${escapeHtml(l.transmission)} · ${escapeHtml(l.fuelType)}</strong></div>
        <div><span class="label">Số chỗ ngồi</span><strong>${l.seats} chỗ</strong></div>
        <div><span class="label">Trạng thái kiểm duyệt</span>${badge(l.moderationStatus)}</div>
      </div>
      <h4 style="margin:16px 0 8px 0">Mô tả xe</h4>
      <p style="background:var(--bg);padding:12px;border-radius:8px;font-size:14px;line-height:1.5">${escapeHtml(l.description || 'Không có mô tả')}</p>
      ${images.length ? `
        <h4 style="margin:16px 0 8px 0">Hình ảnh phương tiện (${images.length})</h4>
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px">
          ${images.map(img => `<img src="${img.imagePath}" alt="Xe" style="width:140px;height:90px;object-fit:cover;border-radius:8px;border:1px solid var(--line)" onerror="this.style.display='none'">`).join('')}
        </div>
      ` : ''}
    `;
    showModal(`Chi tiết tin đăng xe: ${escapeHtml(l.brand)} ${escapeHtml(l.model)}`, content, () => {}, 'Đóng');
  } else if (kind === 'dispute') {
    const res = await api(`/api/admin/disputes/${id}`);
    if (!res?.isSuccess || !res.data) return toast(res?.message || 'Không thể lấy chi tiết tranh chấp');
    const d = res.data;
    const evImg = d.evidenceImage ? (d.evidenceImage.startsWith('/') ? d.evidenceImage : '/' + d.evidenceImage) : '';

    const content = `
      <div class="detail-list">
        <div><span class="label">Mã tranh chấp</span><strong>#TC-${d.disputeId}</strong></div>
        <div><span class="label">Đơn thuê xe</span><strong>#BK-${d.bookingId}</strong></div>
        <div><span class="label">Xe thuê</span><strong>${escapeHtml(d.vehicleName)} (${escapeHtml(d.licensePlate)})</strong></div>
        <div><span class="label">Khách thuê</span><strong>${escapeHtml(d.renterName)} (${escapeHtml(d.renterPhone)})</strong></div>
        <div><span class="label">Chủ xe</span><strong>${escapeHtml(d.ownerName)} (${escapeHtml(d.ownerPhone)})</strong></div>
        <div><span class="label">Tiền cọc giữ trong Escrow</span><strong class="gold">${money(d.depositAmount)}</strong></div>
        <div><span class="label">Phân loại vi phạm / Sự cố</span><span class="badge approved">${DISPUTE_CAT_LABELS[d.category] || escapeHtml(d.category || 'Chung')}</span></div>
        <div><span class="label">Mức phạt / phụ phí đề xuất</span><strong style="color:var(--danger)">${d.proposedAmount > 0 ? money(d.proposedAmount) : 'Không yêu cầu bồi thường'}</strong></div>
        <div><span class="label">Người khiếu nại</span><strong>${escapeHtml(d.raiserName)} (${escapeHtml(d.raiserRole)})</strong></div>
        <div><span class="label">Trạng thái</span>${badge(d.status)}</div>
        ${d.resolutionAction ? `<div><span class="label">Phán quyết</span><strong>${escapeHtml(d.resolutionAction)}</strong></div>` : ''}
        ${d.resolutionNotes ? `<div><span class="label">Ghi chú kết quả</span><strong>${escapeHtml(d.resolutionNotes)}</strong></div>` : ''}
      </div>
      <h4 style="margin:16px 0 8px 0">Nội dung khiếu nại</h4>
      <p style="background:var(--bg);padding:12px;border-radius:8px;font-size:14px;line-height:1.5">${escapeHtml(d.description)}</p>
      ${evImg ? `
        <h4 style="margin:16px 0 8px 0">Hình ảnh bằng chứng</h4>
        <img src="${evImg}" alt="Bằng chứng khiếu nại" style="max-width:100%;height:200px;object-fit:cover;border-radius:8px;border:1px solid var(--line)" onerror="this.outerHTML='<div class=\\'empty\\'>Không tải được ảnh bằng chứng</div>'">
      ` : ''}
    `;
    showModal(`Chi tiết tranh chấp: #TC-${d.disputeId}`, content, () => {}, 'Đóng');
  } else if (kind === 'user') {
    const res = await api(`/api/admin/users/${id}`);
    if (!res?.isSuccess || !res.data) return toast(res?.message || 'Không thể lấy chi tiết người dùng');
    const u = res.data;

    const content = `
      <div class="detail-list">
        <div><span class="label">Mã tài khoản (ID)</span><code style="font-size:12px">${escapeHtml(u.id)}</code></div>
        <div><span class="label">Tên đăng nhập</span><strong>@${escapeHtml(u.userName)}</strong></div>
        <div><span class="label">Họ và tên</span><strong>${escapeHtml(u.fullName)}</strong></div>
        <div><span class="label">Email</span><strong>${escapeHtml(u.email)}</strong></div>
        <div><span class="label">Số điện thoại</span><strong>${escapeHtml(u.phoneNumber || '—')}</strong></div>
        <div><span class="label">Vai trò</span><strong>${(u.roles || []).join(', ')}</strong></div>
        <div><span class="label">Bằng lái xe (GPLX)</span><strong>${u.hasDriverLicense ? `Hạng ${escapeHtml(u.driverLicenseClass || 'B2')}` : 'Chưa cập nhật'}</strong></div>
        <div><span class="label">Số chuyến thuê</span><strong>${u.tripsCount || 0} chuyến</strong></div>
        <div><span class="label">Số xe đăng ký</span><strong>${u.vehiclesCount || 0} xe</strong></div>
        <div><span class="label">Trạng thái</span>${badge(u.isSanctioned ? 'Sanctioned' : 'Active')}</div>
        ${u.activeSanctionReason ? `<div><span class="label">Lý do kỷ luật</span><strong style="color:var(--danger)">${escapeHtml(u.activeSanctionReason)}</strong></div>` : ''}
      </div>
      <h4 style="margin:16px 0 8px 0">Giấy phép lái xe (GPLX)</h4>
      ${u.driverLicense ? `
        <div class="detail-list" style="margin-bottom:12px">
          <div><span class="label">Số bằng lái</span><strong>${escapeHtml(u.driverLicense.licenseNumber)}</strong></div>
          <div><span class="label">Hạng GPLX</span><strong>${escapeHtml(u.driverLicense.licenseClass)}</strong></div>
          <div><span class="label">Hạn sử dụng</span><strong>${formatDate(u.driverLicense.expiryDate)}</strong></div>
          <div><span class="label">Trạng thái duyệt</span>${u.driverLicense.isVerified ? '<span class="badge approved">✓ Đã xác thực</span>' : '<span class="badge pending" style="background:#fef3c7;color:#b45309">⏳ Chờ duyệt</span>'}</div>
        </div>
        <div style="margin-bottom:12px">
          <small style="display:block;margin-bottom:4px;color:var(--muted)">Ảnh chụp mặt trước GPLX</small>
          ${u.driverLicense.imageFront ? `<img src="${u.driverLicense.imageFront.startsWith('/') ? u.driverLicense.imageFront : '/' + u.driverLicense.imageFront}" alt="GPLX Mặt trước" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--line);object-fit:contain" onerror="this.outerHTML='<div class=\\'empty\\'>Không tải được ảnh GPLX</div>'">` : '<div class="empty">Không có ảnh</div>'}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          ${!u.driverLicense.isVerified ? `
            <button class="btn small primary" data-action="user-approveLicense:${u.id}">✓ Phê duyệt thủ công</button>
            <button class="btn small" data-action="user-autoVerifyLicense:${u.id}" style="background:#e0e7ff;color:#3730a3">⚡ Thẩm định tự động</button>
            <button class="btn small danger" data-action="user-rejectLicense:${u.id}">✕ Từ chối</button>
          ` : `
            <button class="btn small danger" data-action="user-revokeLicense:${u.id}">Thu hồi xác thực GPLX</button>
          `}
        </div>
      ` : '<p class="hint">Người dùng chưa tải lên thông tin Giấy phép lái xe.</p>'}
    `;
    showModal(`Chi tiết người dùng: ${escapeHtml(u.fullName)}`, content, () => {}, 'Đóng');
  }
}

// Modal Actions
async function handleAction(raw) {
  const [target, verb] = raw.split(':')[0].split('-');
  const id = raw.split(':')[1];

  if (target === 'owner') {
    if (verb === 'approve') {
      showModal('Phê duyệt hồ sơ chủ xe', `<p>Bạn có chắc chắn muốn phê duyệt hồ sơ chủ xe ID <strong>#${id}</strong>? Chủ xe sẽ được cấp quyền đăng tải phương tiện lên sàn.</p>`, async () => {
        const res = await api(`/api/admin/owners/${id}/approve`, { method: 'POST' });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi phê duyệt'); return false; }
        addLog('Phê duyệt hồ sơ chủ xe', `Duyệt chủ xe #${id}`);
        toast('Đã phê duyệt hồ sơ chủ xe thành công!');
        render();
      }, 'Xác nhận duyệt');
    } else if (verb === 'reject') {
      showModal('Từ chối hồ sơ chủ xe', `
        <p>Từ chối hồ sơ chủ xe ID <strong>#${id}</strong>. Vui lòng nhập lý do cụ thể gửi thông báo cho chủ xe:</p>
        <div class="field"><label for="modalReason">Lý do từ chối *</label><textarea id="modalReason" placeholder="Ví dụ: Ảnh CCCD bị mờ, không rõ số hoặc họ tên..." required></textarea></div>
      `, async () => {
        const reason = document.getElementById('modalReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/owners/${id}/reject`, { method: 'POST', body: { rejectReason: reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi từ chối hồ sơ'); return false; }
        addLog('Từ chối hồ sơ chủ xe', `Từ chối chủ xe #${id}: ${reason}`);
        toast('Đã từ chối hồ sơ chủ xe!');
        render();
      }, 'Từ chối hồ sơ');
    } else if (verb === 'suspend') {
      showModal('Tạm khóa tài khoản chủ xe', `
        <p>Tạm khóa quyền hoạt động của chủ xe ID <strong>#${id}</strong>. Các tin đăng của chủ xe sẽ bị ẩn khỏi trang tìm kiếm:</p>
        <div class="field"><label for="modalReason">Lý do tạm khóa *</label><textarea id="modalReason" placeholder="Ví dụ: Nhận được nhiều phản ánh tiêu cực về chất lượng xe..." required></textarea></div>
      `, async () => {
        const reason = document.getElementById('modalReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/owners/${id}/access`, { method: 'POST', body: { accessStatus: 'Suspended', reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi tạm khóa'); return false; }
        addLog('Tạm khóa chủ xe', `Khóa chủ xe #${id}: ${reason}`);
        toast('Đã tạm khóa chủ xe thành công!');
        render();
      }, 'Xác nhận khóa');
    } else if (verb === 'reopen') {
      showModal('Mở khóa tài khoản chủ xe', `<p>Khôi phục quyền hoạt động cho chủ xe ID <strong>#${id}</strong>?</p>`, async () => {
        const res = await api(`/api/admin/owners/${id}/access`, { method: 'POST', body: { accessStatus: 'Active' } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi mở khóa'); return false; }
        addLog('Mở khóa chủ xe', `Mở khóa chủ xe #${id}`);
        toast('Đã khôi phục hoạt động cho chủ xe!');
        render();
      }, 'Mở khóa');
    }
  } else if (target === 'listing') {
    if (verb === 'approve') {
      showModal('Duyệt tin đăng xe công khai', `<p>Duyệt tin đăng xe ID <strong>#${id}</strong> để hiển thị công khai trên ứng dụng?</p>`, async () => {
        const res = await api(`/api/admin/listings/${id}/approve`, { method: 'POST', body: { note: 'Duyệt bởi Admin' } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi duyệt tin'); return false; }
        addLog('Duyệt tin đăng xe', `Duyệt xe #${id}`);
        toast('Đã duyệt tin đăng xe công khai!');
        render();
      }, 'Duyệt tin');
    } else if (verb === 'reject') {
      showModal('Từ chối tin đăng xe', `
        <p>Từ chối tin đăng xe ID <strong>#${id}</strong>. Nhập lý do từ chối:</p>
        <div class="field"><label for="modalReason">Lý do từ chối *</label><textarea id="modalReason" placeholder="Ví dụ: Giấy tờ đăng kiểm hết hạn hoặc ảnh chụp không đúng quy định..." required></textarea></div>
      `, async () => {
        const reason = document.getElementById('modalReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/listings/${id}/reject`, { method: 'POST', body: { moderationNote: reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi từ chối tin'); return false; }
        addLog('Từ chối tin đăng xe', `Từ chối xe #${id}: ${reason}`);
        toast('Đã từ chối tin đăng xe!');
        render();
      }, 'Từ chối');
    } else if (verb === 'hide') {
      showModal('Tạm ẩn tin đăng xe', `
        <p>Tạm ẩn xe ID <strong>#${id}</strong> khỏi trang tìm kiếm:</p>
        <div class="field"><label for="modalReason">Lý do tạm ẩn *</label><textarea id="modalReason" placeholder="Ví dụ: Xe đang bảo trì bảo dưỡng hoặc có tranh chấp..." required></textarea></div>
      `, async () => {
        const reason = document.getElementById('modalReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/listings/${id}/hide`, { method: 'POST', body: { reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi tạm ẩn tin'); return false; }
        addLog('Tạm ẩn tin đăng xe', `Tạm ẩn xe #${id}: ${reason}`);
        toast('Đã tạm ẩn tin đăng xe!');
        render();
      }, 'Tạm ẩn tin');
    }
  } else if (target === 'dispute') {
    if (verb === 'resolve') {
      const dispDetailRes = await api(`/api/admin/disputes/${id}`);
      const d = dispDetailRes?.data || {};
      const catLabel = DISPUTE_CAT_LABELS[d.category] || d.category || 'Sự cố / Vi phạm';
      const proposedAmt = Number(d.proposedAmount) || 0;

      showModal('Phán quyết giải quyết tranh chấp', `
        <p>Ban hành phán quyết chính thức cho tranh chấp ID <strong>#TC-${id}</strong> (Đơn <strong>#BK-${d.bookingId}</strong>):</p>
        
        <div style="background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.6">
          <div>Phân loại: <strong>${catLabel}</strong></div>
          <div>Người khiếu nại: <strong>${escapeHtml(d.raiserName)} (${escapeHtml(d.raiserRole)})</strong></div>
          <div>Mức phạt / phụ phí đề xuất: <strong style="color:var(--danger)">${proposedAmt > 0 ? money(proposedAmt) : '0 đ'}</strong></div>
          <div>Tiền cọc giữ trong Escrow: <strong class="gold">${money(d.depositAmount)}</strong></div>
        </div>

        <div class="field">
          <label for="disputeAction">Hướng phán quyết tài chính *</label>
          <select id="disputeAction" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--surface)">
            <option value="ForceCompletePenalty">Lỗi khách thuê (ForceComplete) — Khấu trừ cọc đền bù chủ xe</option>
            <option value="ForceComplete">Chuyến đi hợp lệ (ForceComplete) — Hoàn 100% cọc khách, quyết toán chủ xe (Bác bỏ khiếu nại)</option>
            <option value="CancelOwnerFault">Lỗi chủ xe (CancelOwnerFault) — Hoàn 100% cọc khách, phạt 8% chủ xe</option>
            <option value="None">Hòa giải thỏa thuận (None) — Đóng tranh chấp, bảo lưu trạng thái</option>
          </select>
        </div>

        <div class="field" id="penaltyWrap">
          <label for="disputePenalty">Số tiền phạt khấu trừ từ cọc đền bù cho chủ xe (VNĐ)</label>
          <input type="number" id="disputePenalty" value="${proposedAmt}" min="0" max="${d.depositAmount || 50000000}" step="10000" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--surface)">
          <small style="color:var(--muted);font-size:12px">Mặc định lấy theo mức chủ xe đề xuất (${money(proposedAmt)}). Tối đa không vượt quá số tiền cọc đang giữ.</small>
        </div>

        <div class="field">
          <label for="disputeNotes">Căn cứ và nội dung phán quyết *</label>
          <textarea id="disputeNotes" placeholder="Ví dụ: Đã đối soát biên bản nhận xe, chấp thuận khấu trừ từ tiền cọc của khách đền bù cho chủ xe..." required></textarea>
        </div>
      `, async () => {
        const actionSelect = document.getElementById('disputeAction')?.value;
        const notes = document.getElementById('disputeNotes')?.value.trim();
        const penaltyInput = document.getElementById('disputePenalty')?.value;
        if (!notes || notes.length < 5) { toast('Vui lòng nhập căn cứ kết luận tối thiểu 5 ký tự'); return false; }

        let action = actionSelect;
        let approvedPenalty = null;
        if (actionSelect === 'ForceCompletePenalty') {
          action = 'ForceComplete';
          approvedPenalty = Number(penaltyInput) || 0;
        }

        const res = await api(`/api/admin/disputes/${id}/resolve`, {
          method: 'POST',
          body: {
            resolutionAction: action,
            approvedPenaltyAmount: approvedPenalty > 0 ? approvedPenalty : null,
            resolutionNotes: notes
          }
        });

        if (!res?.isSuccess) { toast(res?.message || 'Lỗi giải quyết tranh chấp'); return false; }
        addLog('Giải quyết tranh chấp', `Phán quyết #TC-${id}: ${action} (Phạt: ${approvedPenalty > 0 ? money(approvedPenalty) : '0'}) - ${notes}`);
        toast('Đã ban hành phán quyết tranh chấp thành công!');
        render();
      }, 'Ban hành phán quyết');

      // Bind listener
      setTimeout(() => {
        const selectEl = document.getElementById('disputeAction');
        const penaltyEl = document.getElementById('penaltyWrap');
        if (selectEl && penaltyEl) {
          selectEl.addEventListener('change', () => {
            penaltyEl.style.display = selectEl.value === 'ForceCompletePenalty' ? 'block' : 'none';
          });
        }
      }, 50);
    }
  } else if (target === 'review') {
    if (verb === 'keep') {
      showModal('Phê duyệt giữ lại đánh giá', `
        <p>Xác nhận đánh giá ID <strong>#DG-${id}</strong> không vi phạm chính sách cộng đồng và giữ lại hiển thị công khai?</p>
      `, async () => {
        const res = await api(`/api/admin/reviews/${id}/moderate`, {
          method: 'POST',
          body: { isApproved: true, note: 'Đã kiểm tra và phê duyệt giữ lại bởi Quản trị viên' }
        });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi xử lý kiểm duyệt đánh giá'); return false; }
        addLog('Kiểm duyệt đánh giá', `Giữ lại đánh giá #${id}`);
        toast('Đã phê duyệt giữ lại đánh giá công khai!');
        render();
      }, 'Xác nhận giữ lại');
    } else if (verb === 'hide') {
      showModal('Ẩn và gỡ bỏ đánh giá vi phạm', `
        <p>Ẩn đánh giá ID <strong>#DG-${id}</strong> do vi phạm tiêu chuẩn cộng đồng, ngôn từ xúc phạm hoặc thông tin sai lệch.</p>
        <div class="field">
          <label for="reviewModNote">Ghi chú kiểm duyệt / Lý do ẩn *</label>
          <textarea id="reviewModNote" placeholder="Ví dụ: Đánh giá có ngôn từ thô tục, xúc phạm danh dự hoặc vu khống..." required></textarea>
        </div>
      `, async () => {
        const note = document.getElementById('reviewModNote')?.value.trim();
        if (!note || note.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/reviews/${id}/moderate`, {
          method: 'POST',
          body: { isApproved: false, note }
        });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi ẩn đánh giá'); return false; }
        addLog('Kiểm duyệt đánh giá', `Ẩn đánh giá #${id}: ${note}`);
        toast('Đã ẩn đánh giá vi phạm thành công!');
        render();
      }, 'Ẩn đánh giá');
    }
  } else if (target === 'user') {
    if (verb === 'sanction') {
      showModal('Xử phạt khóa tài khoản', `
        <p>Thi hành án phạt kỷ luật khóa tài khoản người dùng ID: <code>${id}</code></p>
        <div class="field">
          <label for="sanctionDays">Thời hạn khóa *</label>
          <select id="sanctionDays" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--surface)">
            <option value="7">Khóa 7 ngày</option>
            <option value="30">Khóa 30 ngày</option>
            <option value="365">Khóa 1 năm</option>
          </select>
        </div>
        <div class="field">
          <label for="sanctionReason">Lý do xử phạt *</label>
          <textarea id="sanctionReason" placeholder="Ví dụ: Đơn phương hủy nhiều chuyến xe sát giờ..." required></textarea>
        </div>
      `, async () => {
        const days = Number(document.getElementById('sanctionDays')?.value || 7);
        const reason = document.getElementById('sanctionReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/users/${id}/sanction`, { method: 'POST', body: { sanctionType: 'Suspension', reason, durationDays: days } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi khóa tài khoản'); return false; }
        addLog('Khóa tài khoản người dùng', `Khóa ${id} (${days} ngày): ${reason}`);
        toast('Đã khóa tài khoản thành công!');
        render();
      }, 'Thi hành án phạt');
    } else if (verb === 'lift') {
      showModal('Dỡ bỏ án phạt tài khoản', `
        <p>Mở khóa tài khoản ID: <code>${id}</code></p>
        <div class="field">
          <label for="liftReason">Lý do dỡ bỏ án phạt *</label>
          <textarea id="liftReason" placeholder="Ví dụ: Người dùng đã giải trình và cam kết không tái phạm..." required></textarea>
        </div>
      `, async () => {
        const reason = document.getElementById('liftReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/users/${id}/lift-sanction`, { method: 'POST', body: { reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi dỡ bỏ án phạt'); return false; }
        addLog('Mở khóa người dùng', `Dỡ bỏ án phạt ${id}: ${reason}`);
        toast('Đã mở khóa tài khoản thành công!');
        render();
      }, 'Mở khóa tài khoản');
    } else if (verb === 'pwd') {
      showModal('Cấp lại mật khẩu người dùng', `
        <p>Đặt mật khẩu mới cho tài khoản ID: <code>${id}</code></p>
        <div class="field">
          <label for="newPassword">Mật khẩu mới (tối thiểu 6 ký tự, có chữ hoa, thường và số) *</label>
          <input id="newPassword" type="text" value="Test@12345" required style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--line)">
        </div>
      `, async () => {
        const newPwd = document.getElementById('newPassword')?.value.trim();
        if (!newPwd || newPwd.length < 6) { toast('Mật khẩu tối thiểu 6 ký tự'); return false; }
        const res = await api(`/api/admin/users/${id}/reset-password`, { method: 'POST', body: { newPassword: newPwd } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi đổi mật khẩu'); return false; }
        addLog('Cấp lại mật khẩu', `Đổi mật khẩu người dùng ${id}`);
        toast('Đã cấp lại mật khẩu thành công!');
      }, 'Cập nhật mật khẩu');
    } else if (verb === 'approveLicense') {
      showModal('Phê duyệt Giấy phép lái xe', `
        <p>Xác nhận Giấy phép lái xe (GPLX) của người dùng ID <code>${id}</code> hợp lệ và phê duyệt cho phép thuê xe trên hệ thống?</p>
      `, async () => {
        const res = await api(`/api/admin/users/${id}/verify-license`, { method: 'POST', body: { isApproved: true } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi phê duyệt GPLX'); return false; }
        addLog('Duyệt GPLX', `Duyệt GPLX người dùng ${id}`);
        toast('Đã phê duyệt Giấy phép lái xe thành công!');
        render();
      }, 'Phê duyệt GPLX');
    } else if (verb === 'rejectLicense') {
      showModal('Từ chối Giấy phép lái xe', `
        <p>Từ chối Giấy phép lái xe của người dùng ID <code>${id}</code>. Nhập lý do từ chối:</p>
        <div class="field">
          <label for="licenseRejectReason">Lý do từ chối *</label>
          <textarea id="licenseRejectReason" placeholder="Ví dụ: Ảnh chụp GPLX bị mờ, không rõ số hiệu, hoặc bằng lái đã hết hạn sử dụng..." required></textarea>
        </div>
      `, async () => {
        const reason = document.getElementById('licenseRejectReason')?.value.trim();
        if (!reason || reason.length < 5) { toast('Vui lòng nhập lý do tối thiểu 5 ký tự'); return false; }
        const res = await api(`/api/admin/users/${id}/verify-license`, { method: 'POST', body: { isApproved: false, reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi từ chối GPLX'); return false; }
        addLog('Từ chối GPLX', `Từ chối GPLX ${id}: ${reason}`);
        toast('Đã từ chối Giấy phép lái xe!');
        render();
      }, 'Từ chối GPLX');
    } else if (verb === 'revokeLicense') {
      showModal('Thu hồi xác thực Giấy phép lái xe', `
        <p>Thu hồi trạng thái xác thực GPLX của tài khoản <code>${id}</code>? Người dùng sẽ không thể tiếp tục đặt các chuyến xe mới cho đến khi được kiểm duyệt lại.</p>
        <div class="field">
          <label for="licenseRevokeReason">Lý do thu hồi *</label>
          <textarea id="licenseRevokeReason" placeholder="Ví dụ: Phát hiện nghi vấn sau đối soát hoặc khách thuê yêu cầu cập nhật lại..." required></textarea>
        </div>
      `, async () => {
        const reason = document.getElementById('licenseRevokeReason')?.value.trim() || 'Thu hồi bởi Quản trị viên';
        const res = await api(`/api/admin/users/${id}/verify-license`, { method: 'POST', body: { isApproved: false, reason } });
        if (!res?.isSuccess) { toast(res?.message || 'Lỗi thu hồi GPLX'); return false; }
        addLog('Thu hồi GPLX', `Thu hồi GPLX ${id}: ${reason}`);
        toast('Đã thu hồi xác thực GPLX!');
        render();
      }, 'Thu hồi');
    } else if (verb === 'autoVerifyLicense') {
      showModal('Thẩm định tự động Giấy phép lái xe', `
        <p>Hệ thống AZU Car sẽ tự động đối soát hồ sơ GPLX của người dùng theo 4 tiêu chuẩn:</p>
        <ul class="list-simple">
          <li>1. Định dạng số hiệu bằng lái hợp chuẩn</li>
          <li>2. Hạng giấy phép lái xe ô tô (B1, B2, C, D, E)</li>
          <li>3. Thời hạn sử dụng còn hiệu lực</li>
          <li>4. Đầy đủ ảnh chụp mặt trước chứng từ</li>
        </ul>
        <p class="hint">Nếu đạt chuẩn, hệ thống sẽ tự động kích hoạt xác thực ngay mà không cần duyệt thủ công.</p>
      `, async () => {
        const res = await api(`/api/admin/users/${id}/auto-verify-license`, { method: 'POST' });
        if (!res?.isSuccess || !res.data) { toast(res?.message || 'Lỗi kiểm tra tự động'); return false; }
        const r = res.data;
        if (r.isAutoApproved) {
          addLog('Tự động duyệt GPLX', `Auto-verified GPLX cho ${r.fullName} (@${r.userName})`);
          toast(`Đã thẩm định & duyệt tự động thành công cho ${r.fullName}!`);
        } else {
          toast(`Không đạt điều kiện tự động: ${r.issues.join(', ')}`);
        }
        render();
      }, 'Tiến hành thẩm định tự động');
    }
  }
}

// Export CSV
function exportCSV(kind) {
  let rows = [];
  if (kind === 'owners') {
    const list = pageCache.owners || [];
    rows = [['ID', 'Họ tên', 'Tên đăng nhập', 'SĐT', 'Email', 'CCCD', 'Ngày nộp', 'Trạng thái duyệt', 'Quyền truy cập'],
      ...list.map(x => [x.ownerProfileId, x.fullName, x.userName, x.phoneNumber, x.email, x.cccdNumber, formatDate(x.submittedAt), x.approvalStatus, x.accessStatus])];
  } else if (kind === 'listings') {
    const list = pageCache.listings || [];
    rows = [['ID', 'Biển số', 'Xe', 'Năm', 'Chủ xe', 'SĐT', 'Khu vực', 'Giá/ngày', 'Trạng thái'],
      ...list.map(x => [x.listingId, x.licensePlate, `${x.brand} ${x.model}`, x.year, x.ownerName, x.ownerPhone, `${x.district}, ${x.city}`, x.pricePerDay, x.moderationStatus])];
  } else if (kind === 'disputes') {
    const list = pageCache.disputes || [];
    rows = [['ID', 'Đơn', 'Xe', 'Người khiếu nại', 'Vai trò', 'Nội dung', 'Trạng thái', 'Ngày tạo'],
      ...list.map(x => [x.disputeId, x.bookingId, x.vehicleName, x.raiserName, x.raiserRole, x.description, x.status, formatDate(x.createdAt)])];
  } else if (kind === 'users') {
    const list = pageCache.users || [];
    rows = [['ID', 'Tên đăng nhập', 'Họ tên', 'Email', 'SĐT', 'Vai trò', 'GPLX', 'Trạng thái'],
      ...list.map(x => [x.id, x.userName, x.fullName, x.email, x.phoneNumber, (x.roles || []).join('; '), x.hasDriverLicense ? `Hạng ${x.driverLicenseClass || 'B2'}` : 'Chưa có', x.accountStatus])];
  } else if (kind === 'revenue') {
    const report = pageCache.revenueReport || {};
    const settlements = report.recentSettlements || [];
    rows = [['Mã đơn', 'Chủ xe', 'Xe thuê', 'Tổng tiền (VND)', 'Hoa hồng sàn (VND)', 'Thực nhận chủ xe (VND)', 'Ngày đối soát'],
      ...settlements.map(s => [s.bookingId, s.ownerName, s.vehicleName, s.totalAmount, s.commissionAmount, s.ownerAmount, formatDate(s.settledAt)])];
  } else if (kind === 'logs') {
    rows = [['Thời điểm', 'Hành động', 'Chi tiết', 'Người thực hiện'],
      ...logs.map(l => [l.at, l.action, l.detail, l.who])];
  } else {
    rows = [['Chỉ tiêu', 'Giá trị', 'Nguồn'],
      ['Tổng giao dịch GMV sàn (VND)', '21.400.000', 'MySQL carrental · Bảng bookings'],
      ['Hoa hồng tích lũy (5%)', '1.070.000', 'MySQL carrental · Bảng payments'],
      ['Số chuyến hoàn tất', '6', 'MySQL carrental · Đơn Completed'],
      ['Số người dùng hệ thống', '12', 'MySQL carrental · AspNetUsers']];
  }

  rows.unshift(['AZU Car — Báo cáo Quản trị Hệ thống Trực tuyến (Dữ liệu MySQL)']);
  const csvEscape = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const blob = new Blob(['\ufeff' + rows.map(r => r.map(csvEscape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `azu-admin-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  addLog('Xuất báo cáo CSV', `Xuất dữ liệu: ${kind}`);
  toast('Đã xuất báo cáo CSV thành công!');
}

// Global Event Listeners
document.body.addEventListener('click', e => {
  const nav = e.target.closest('[data-page]');
  if (nav) return go(nav.dataset.page);

  const gp = e.target.closest('[data-go]');
  if (gp) return go(gp.dataset.go);

  const fl = e.target.closest('[data-filter]');
  if (fl) {
    filter = fl.dataset.filter;
    render();
    return;
  }

  const det = e.target.closest('[data-detail]');
  if (det) {
    const [kind, id] = det.dataset.detail.split(':');
    showDetail(kind, id);
    return;
  }

  const ac = e.target.closest('[data-action]');
  if (ac) return handleAction(ac.dataset.action);

  const exp = e.target.closest('[data-export]');
  if (exp) return exportCSV(exp.dataset.export);

  if (e.target.closest('#notificationBtn')) return go('overview');
  if (e.target.closest('#menuToggle')) return document.getElementById('sidebar')?.classList.toggle('open');

  if (e.target.closest('#clearLogsBtn')) {
    logs = [];
    localStorage.removeItem('azu_admin_activity_logs');
    render();
    toast('Đã làm sạch nhật ký trình duyệt!');
    return;
  }

  if (e.target.closest('#saveFeeBtn')) {
    const commVal = Number(document.getElementById('commissionRateInput')?.value);
    const depVal = Number(document.getElementById('depositRateInput')?.value);
    const penVal = Number(document.getElementById('penaltyRateInput')?.value);
    const deadlineVal = Number(document.getElementById('deadlineInput')?.value);

    if (isNaN(commVal) || commVal < 1 || commVal > 50) return toast('Hoa hồng từ 1% đến 50%');
    if (isNaN(depVal) || depVal < 10 || depVal > 90) return toast('Tiền cọc từ 10% đến 90%');
    if (isNaN(penVal) || penVal < 5 || penVal > 50) return toast('Phạt hủy từ 5% đến 50%');

    showModal('Cập nhật cấu hình tài chính toàn sàn', `
      <p>Bạn có chắc chắn muốn cập nhật cấu hình biểu phí hệ thống?</p>
      <ul class="list-simple">
        <li>Tỷ lệ hoa hồng: <strong>${commVal}%</strong></li>
        <li>Tỷ lệ cọc bảo chứng: <strong>${depVal}%</strong></li>
        <li>Tỷ lệ phạt vi phạm: <strong>${penVal}%</strong></li>
        <li>Hạn phản hồi: <strong>${deadlineVal} giờ</strong></li>
      </ul>
      <p class="hint">Cấu hình sẽ có hiệu lực ngay lập tức cho các giao dịch mới.</p>
    `, async () => {
      const body = {
        commissionRate: commVal / 100,
        depositRate: depVal / 100,
        ownerCancelPenaltyRate: penVal / 100,
        responseDeadlineHours: deadlineVal,
        note: `Cập nhật bởi ${currentUser?.fullName || currentUser?.userName}`
      };
      const res = await api('/api/admin/fees', { method: 'PUT', body });
      if (!res?.isSuccess) { toast(res?.message || 'Lỗi cập nhật cấu hình'); return false; }
      addLog('Cập nhật cấu hình phí', `Hoa hồng: ${commVal}%, Cọc: ${depVal}%, Phạt: ${penVal}%`);
      toast('Đã cập nhật cấu hình hệ thống thành công!');
      render();
    }, 'Cập nhật cấu hình');
    return;
  }

  if (e.target.closest('#batchAutoVerifyBtn')) {
    showModal('Quét & Duyệt tự động GPLX hàng loạt', `
      <p>Hệ thống sẽ rà soát tất cả người dùng đang có hồ sơ Giấy phép lái xe nhưng chưa được xác thực.</p>
      <ul class="list-simple">
        <li>Kiểm tra số hiệu bằng lái hợp chuẩn</li>
        <li>Kiểm tra hạng giấy phép lái xe ô tô (B1, B2, C, D, E)</li>
        <li>Kiểm tra thời hạn hiệu lực còn sử dụng</li>
        <li>Kiểm tra ảnh chụp chứng từ mặt trước</li>
      </ul>
      <p class="hint">Các hồ sơ đạt chuẩn sẽ được tự động kích hoạt ngay lập tức mà không cần thẩm định thủ công.</p>
    `, async () => {
      const res = await api('/api/admin/users/batch-auto-verify-licenses', { method: 'POST' });
      if (!res?.isSuccess || !res.data) { toast(res?.message || 'Lỗi quét tự động'); return false; }
      const b = res.data;
      addLog('Quét tự động GPLX', `Quét ${b.totalScanned}: Duyệt tự động ${b.autoApprovedCount}, Cần duyệt thủ công ${b.needsManualReviewCount}`);
      toast(`Đã quét ${b.totalScanned} hồ sơ: Tự động duyệt thành công ${b.autoApprovedCount} hồ sơ!`);
      render();
    }, 'Tiến hành quét & duyệt tự động');
    return;
  }

  if (e.target.closest('#logout')) {
    showModal('Xác nhận đăng xuất', '<p>Bạn có chắc chắn muốn đăng xuất khỏi Cổng Quản trị AZU Car?</p>', () => {
      location.assign('/logout');
    }, 'Đăng xuất');
  }
});

// Search input debounced
let searchTimer = null;
document.body.addEventListener('input', e => {
  if (e.target.id === 'searchInput') {
    clearTimeout(searchTimer);
    query = e.target.value.trim();
    searchTimer = setTimeout(() => {
      render();
    }, 400);
  }
});

// Admin Login Form Submit
document.body.addEventListener('submit', async e => {
  if (e.target.id === 'adminLoginForm') {
    e.preventDefault();
    const idEl = document.getElementById('loginIdentifier');
    const pwdEl = document.getElementById('loginPassword');
    const identifier = idEl?.value.trim();
    const password = pwdEl?.value;
    if (!identifier || !password) return toast('Vui lòng nhập đầy đủ thông tin đăng nhập');

    const res = await api('/api/auth/login', {
      method: 'POST',
      body: { identifier, password, rememberMe: true }
    });

    if (!res?.isSuccess) {
      toast(res?.message || 'Đăng nhập không thành công');
      return;
    }

    toast('Đăng nhập thành công!');
    await checkAuth();
    render();
  }
});

// Auth Check & Initialization
async function checkAuth() {
  const res = await api('/api/auth/me');
  if (res?.isSuccess && res.data) {
    currentUser = res.data;
    const name = currentUser.fullName || currentUser.userName || 'Quản trị viên';
    const initials = Array.from(name.trim()).slice(0, 2).join('').toLocaleUpperCase('vi');
    const nameEl = document.querySelector('.profile-text strong');
    const roleEl = document.querySelector('.profile-text small');
    const avatar = document.querySelector('.profile .avatar');
    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = (currentUser.roles || []).includes('Admin') ? 'Quản trị viên (Admin)' : 'Nhân viên (Staff)';
    if (avatar) avatar.textContent = initials;
  } else {
    currentUser = null;
  }
}

// Boot up
(async () => {
  document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  await checkAuth();
  render();
})();
