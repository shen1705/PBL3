(function () {
  'use strict';

  function formatMoney(amount) {
    if (amount === undefined || amount === null) return '0 đ';
    const num = Number(amount);
    if (isNaN(num)) return '0 đ';
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2).replace('.', ',') + ' tỷ đ';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.', ',') + ' triệu đ';
    }
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function formatExactMoney(amount) {
    const num = Number(amount || 0);
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function formatDate(dStr) {
    if (!dStr) return '---';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('vi-VN') + ' · ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dStr;
    }
  }

  async function loadRevenueReport() {
    const container = document.getElementById('admin-page');
    if (!container) return;

    try {
      const res = await fetch('/api/admin/revenue', {
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 403) {
        container.innerHTML = `
          <div class="page-heading"><div><h1>Doanh thu</h1><p class="section-lead">Báo cáo tài chính toàn nền tảng</p></div></div>
          <div class="card admin-panel" style="padding: 32px; text-align: center; border-left: 4px solid #ef4444;">
            <div style="font-size: 32px; margin-bottom: 12px;">🔒</div>
            <h3 style="margin-bottom: 8px; color: #1e293b;">Quyền truy cập bị giới hạn</h3>
            <p style="color: #64748b; max-width: 520px; margin: 0 auto 16px;">
              Chỉ Quản trị viên cấp cao (Admin) mới có quyền truy cập báo cáo tài chính và đối soát doanh thu toàn sàn theo quy định phân quyền của AZU Car.
            </p>
            <a href="users.html" class="button button--light">Quay lại trang Người dùng</a>
          </div>
        `;
        return;
      }

      if (!res.ok) {
        throw new Error('Không thể tải báo cáo doanh thu.');
      }

      const resData = await res.json();
      if (!resData.isSuccess || !resData.data) {
        throw new Error(resData.message || 'Lỗi dữ liệu báo cáo.');
      }

      const d = resData.data;

      // Update 4 metric cards
      const metrics = container.querySelectorAll('.admin-metrics .stat-card, .admin-metrics .metric');
      if (metrics.length >= 4) {
        // 0: Tổng GMV
        const gmvVal = metrics[0].querySelector('strong, b, .metric__value');
        if (gmvVal) gmvVal.textContent = formatMoney(d.totalGmv);

        // 1: Doanh thu sàn
        const revVal = metrics[1].querySelector('strong, b, .metric__value');
        if (revVal) revVal.textContent = formatMoney(d.totalPlatformRevenue);

        // 2: Chuyến hoàn tất
        const tripsVal = metrics[2].querySelector('strong, b, .metric__value');
        if (tripsVal) tripsVal.textContent = d.completedBookingsCount.toLocaleString('vi-VN');

        // 3: Tỷ lệ phí / GMV
        const rateVal = metrics[3].querySelector('strong, b, .metric__value');
        if (rateVal) rateVal.textContent = (Number(d.commissionRate || 0.1) * 100).toFixed(1) + '%';
      }

      // Update breakdown: Phí nền tảng & Thực thu
      const feeBreakdown = container.querySelector('.fee-breakdown');
      if (feeBreakdown) {
        feeBreakdown.innerHTML = `
          <div><span>Tổng giá trị giao dịch (GMV)</span><b>${formatExactMoney(d.totalGmv)}</b></div>
          <div><span>Hoa hồng sàn (${(Number(d.commissionRate || 0.1) * 100).toFixed(0)}%)</span><b>${formatExactMoney(d.totalPlatformRevenue)}</b></div>
          <div><span>Phần chi trả chủ xe</span><b>${formatExactMoney(d.totalOwnerPayout)}</b></div>
          <div class="fee-breakdown__total"><span>Thực thu sàn</span><strong>${formatExactMoney(d.totalPlatformRevenue)}</strong></div>
        `;
      }

      // Update settlement box
      const settlementBox = container.querySelector('.totals-row');
      if (settlementBox) {
        settlementBox.innerHTML = `
          <div><small>Đã đối soát cho chủ xe</small><b>${formatMoney(d.totalOwnerPayout)}</b></div>
          <div><small>Tổng chuyến đã quyết toán</small><b class="blue-text">${d.completedBookingsCount} chuyến</b></div>
        `;
      }

      // Update regional breakdown list
      const donutWrap = container.querySelector('.donut-wrap');
      if (donutWrap && d.regionalBreakdown && d.regionalBreakdown.length > 0) {
        const donutText = donutWrap.querySelector('.donut-chart div');
        if (donutText) {
          donutText.innerHTML = `<b>${formatMoney(d.totalGmv)}</b><small>GMV</small>`;
        }
        const ul = donutWrap.querySelector('ul');
        if (ul) {
          ul.innerHTML = d.regionalBreakdown.map(r => `
            <li><span></span>${r.regionName} <b>${r.percentage}% · ${formatMoney(r.gmv)}</b></li>
          `).join('');
        }
      }

      // Update settlements table
      const settlementTableSection = container.querySelector('.card.admin-panel:last-of-type');
      if (settlementTableSection && d.recentSettlements && d.recentSettlements.length > 0) {
        const tableBody = settlementTableSection.querySelector('tbody');
        if (tableBody) {
          tableBody.innerHTML = d.recentSettlements.map(s => `
            <tr>
              <td><strong>#ĐH-${s.bookingId}</strong><br><small style="color: #64748b;">${formatDate(s.settledAt)}</small></td>
              <td><b>${s.ownerName}</b></td>
              <td>${s.vehicleName}</td>
              <td><b>${formatExactMoney(s.totalAmount)}</b></td>
              <td style="color: #2563eb; font-weight: 600;">+${formatExactMoney(s.commissionAmount)}</td>
              <td style="color: #16a34a; font-weight: 600;">${formatExactMoney(s.ownerAmount)}</td>
            </tr>
          `).join('');

          const tableHead = settlementTableSection.querySelector('thead tr');
          if (tableHead) {
            tableHead.innerHTML = `
              <th>ĐƠN THUÊ / THỜI GIAN</th>
              <th>CHỦ XE</th>
              <th>XE CHO THUÊ</th>
              <th>TỔNG GIÁ TRỊ</th>
              <th>HOA HỒNG SÀN</th>
              <th>CHI TRẢ CHỦ XE</th>
            `;
          }
        }
      }

    } catch (err) {
      console.warn('Lỗi tải báo cáo doanh thu:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // delay load slightly to ensure layout and admin-pages have rendered base structure
    setTimeout(loadRevenueReport, 50);
  });
})();
