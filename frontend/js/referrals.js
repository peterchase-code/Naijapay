async function loadReferrals() {
  try {
    const res = await api.getMyReferrals();
    const data = res.data || {};
    const referrals = data.referrals || [];
    const stats = data.stats || {};

    document.getElementById('refCode').textContent = stats.referralCode || '--';
    document.getElementById('refCodeDisplay').textContent = stats.referralCode || '--';
    document.getElementById('totalReferrals').textContent = stats.totalReferrals || 0;
    document.getElementById('totalEarnings').textContent = formatCurrency(stats.totalEarnings || 0);

    const container = document.getElementById('referralsContainer');
    if (referrals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-users"></i></div>
          <h3>No Referrals Yet</h3>
          <p>Share your code to start earning.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>User</th><th>Date</th><th>Commission</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${referrals.map(r => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-sm)">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:var(--text-xs)">${getInitials(r.referred?.fullName)}</div>
                    <span style="font-size:var(--text-sm)">${r.referred?.fullName || 'Unknown'}</span>
                  </div>
                </td>
                <td style="font-size:var(--text-sm);color:var(--text-muted)">${formatDate(r.createdAt)}</td>
                <td style="font-weight:600;color:var(--success)">${formatCurrency(r.commission || 0)}</td>
                <td><span class="badge badge-${r.status === 'paid' ? 'success' : r.status === 'completed' ? 'info' : 'warning'}">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Referrals error:', error);
  }
}
