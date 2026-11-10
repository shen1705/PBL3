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

  async function loadOverview() {
    try {
      // 1. Load pending metrics in parallel
      const [ownersRes, listingsRes, disputesRes, usersRes] = await Promise.allSettled([
        fetch('/api/admin/owners/metrics').then(r => r.json()),
        fetch('/api/admin/listings/metrics').then(r => r.json()),
        fetch('/api/admin/disputes/metrics').then(r => r.json()),
        fetch('/api/admin/users/metrics').then(r => r.json())
      ]);

      const pendingOwners = (ownersRes.status === 'fulfilled' && ownersRes.value?.data?.pendingApprovalCount) || 0;
      const pendingListings = (listingsRes.status === 'fulfilled' && listingsRes.value?.data?.pendingCount) || 0;
      const openDisputes = (disputesRes.status === 'fulfilled' && disputesRes.value?.data?.openDisputes) || 0;
      const highPriorityDisputes = (disputesRes.status === 'fulfilled' && disputesRes.value?.data?.highPriorityDisputes) || 0;
      const totalUsers = (usersRes.status === 'fulfilled' && usersRes.value?.data?.totalUsers) || 0;

      // Update task items
      const taskPill = document.querySelector('.section-heading__title .pill--blue');
      const totalTasks = pendingOwners + pendingListings + openDisputes;
      if (taskPill) taskPill.textContent = totalTasks;

      const requestsTabBadge = document.querySelector('#overview-tab-requests span');
      if (requestsTabBadge) requestsTabBadge.textContent = totalTasks;

      const taskItems = document.querySelectorAll('.task-grid .task-item');
      if (taskItems.length >= 3) {
        // Owner task
        const ownerStrong = taskItems[0].querySelector('strong');
        if (ownerStrong) ownerStrong.textContent = pendingOwners;

        // Listing task
        const listingStrong = taskItems[1].querySelector('strong');
        if (listingStrong) listingStrong.textContent = pendingListings;

        // Dispute task
        const disputeStrong = taskItems[2].querySelector('strong');
        if (disputeStrong) disputeStrong.textContent = openDisputes;
        const disputeSmall = taskItems[2].querySelector('small');
        if (disputeSmall) disputeSmall.textContent = `Ưu tiên: ${highPriorityDisputes}`;
      }

      // Update user count
      const statCards = document.querySelectorAll('.stats-grid .stat-card');
      if (statCards.length >= 4) {
        const userStrong = statCards[3].querySelector('strong');
        if (userStrong && totalUsers > 0) userStrong.textContent = totalUsers.toLocaleString('vi-VN');
      }

      // 2. Load revenue if Admin
      try {
        const revRes = await fetch('/api/admin/revenue');
        if (revRes.ok) {
          const revData = await revRes.json();
          if (revData.isSuccess && revData.data && statCards.length >= 3) {
            const d = revData.data;
            const gmvStrong = statCards[0].querySelector('strong');
            if (gmvStrong) gmvStrong.textContent = formatMoney(d.totalGmv);

            const revStrong = statCards[1].querySelector('strong');
            if (revStrong) revStrong.textContent = formatMoney(d.totalPlatformRevenue);

            const tripsStrong = statCards[2].querySelector('strong');
            if (tripsStrong) tripsStrong.textContent = d.completedBookingsCount.toLocaleString('vi-VN');
          }
        }
      } catch {}

    } catch (err) {
      console.warn('Overview load error:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', loadOverview);
})();
