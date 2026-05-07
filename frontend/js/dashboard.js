async function loadDashboard() {
  try {
    const cachedUser = getUser();
    if (!cachedUser) return;

    // Show skeleton loaders immediately for perceived performance
    const credContainer = document.getElementById('credentialsContainer');
    const txContainer = document.getElementById('transactionsContainer');
    const statsContainer = document.getElementById('statsContainer');
    if (credContainer) credContainer.innerHTML = `<div class="credentials-grid" style="display:flex;flex-direction:column;gap:var(--space-md)">${skeletonCards(3)}</div>`;
    if (txContainer) txContainer.innerHTML = skeletonRows(5, 4);
    if (statsContainer) statsContainer.innerHTML = skeletonCards(4);

    // Show cached balance instantly (no flicker)
    document.getElementById('balanceValue').textContent = formatCurrency(cachedUser.balance || 0);

    // Load credentials
    loadCredentials();
    // Load recent transactions
    loadRecentTransactions();
    // Load stats
    loadStats();
    // Load notifications count
    loadNotificationCount();

    // THEN: Fetch fresh user data from server and update balance
    // This ensures the balance reflects any admin actions (approvals, etc.)
    const freshRes = await api.getMe();
    const freshUser = freshRes.data;
    if (freshUser) {
      // Update the displayed balance with fresh server data
      document.getElementById('balanceValue').textContent = formatCurrency(freshUser.balance || 0);
      // Update localStorage so next page load has the latest data
      cachedUser.balance = freshUser.balance;
      cachedUser.pendingBalance = freshUser.pendingBalance;
      cachedUser.totalReceived = freshUser.totalReceived;
      cachedUser.totalWithdrawn = freshUser.totalWithdrawn;
      localStorage.setItem('user', JSON.stringify(cachedUser));
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

async function loadCredentials() {
  const container = document.getElementById('credentialsContainer');
  if (!container) return;

  try {
    const res = await api.getMyCredentials();
    const credentials = res.data || [];

    if (credentials.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-id-card"></i></div>
          <h3>No Credentials Assigned</h3>
          <p>Admin will assign payment credentials to your account soon.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="credentials-grid" style="display:flex;flex-direction:column;gap:var(--space-md)">
        ${credentials.map(c => {
          const serviceName = c.serviceName || c.service?.displayName || 'Service';
          const serviceRate = c.service?.rate || 0;
          const hasRate = serviceRate > 0;
          const rateText = hasRate
            ? `\u20A6${parseFloat(serviceRate).toLocaleString('en-NG')}/unit`
            : 'Rate not set';

          return `
          <div class="credential-card">
            <div class="credential-header">
              <div class="credential-icon" style="background: ${c.service?.color || 'var(--primary)'}20; color: ${c.service?.color || 'var(--primary)'}">
                <i class="fas ${c.service?.icon || 'fa-money-bill'}"></i>
              </div>
              <div>
                <div class="credential-name">${serviceName}</div>
                <div class="credential-type">${c.type || 'Credential'}</div>
              </div>
            </div>
            <div class="cred-rate-badge ${hasRate ? 'has-rate' : 'no-rate'}">
              <div class="cred-rate-icon"><i class="fas fa-chart-line"></i></div>
              <div class="cred-rate-info">
                <div class="cred-rate-label">Service Rate</div>
                <div class="cred-rate-value">${rateText}</div>
              </div>
            </div>
            <div class="credential-value">
              <span>${c.value}</span>
              <button onclick="copyToClipboard('${c.value}', this)" title="Copy"><i class="fas fa-copy"></i></button>
            </div>
            ${c.additionalInfo?.instructions || c.service?.instructions ? `
              <div class="credential-instructions">${c.additionalInfo?.instructions || c.service?.instructions}</div>
            ` : ''}
          </div>
        `}).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Credentials error:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-exclamation-circle" style="color:var(--danger)"></i></div>
        <h3>Failed to Load Credentials</h3>
        <p>${error.message || 'Please refresh the page to try again.'}</p>
        <button class="btn btn-primary btn-sm" onclick="loadCredentials()" style="margin-top:var(--space-md)"><i class="fas fa-sync-alt"></i> Retry</button>
      </div>
    `;
  }
}

async function loadRecentTransactions() {
  try {
    const res = await api.getMyTransactions('', '', 1, 5);
    const container = document.getElementById('transactionsContainer');
    const { transactions = [] } = res.data || {};

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-exchange-alt"></i></div>
          <h3>No Transactions</h3>
          <p>Your transaction history will appear here.</p>
        </div>
      `;
      return;
    }

    const typeIcons = {
      deposit: 'fa-arrow-down',
      withdrawal: 'fa-arrow-up',
      referral_bonus: 'fa-gift',
      adjustment: 'fa-sliders-h'
    };

    const typeColors = {
      deposit: 'var(--success)',
      withdrawal: 'var(--danger)',
      referral_bonus: 'var(--accent)',
      adjustment: 'var(--info)'
    };

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        ${transactions.map(t => `
          <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md);background:var(--bg-card);border-radius:var(--radius-md)">
            <div style="width:40px;height:40px;border-radius:50%;background:${typeColors[t.type] || 'var(--primary)'}15;display:flex;align-items:center;justify-content:center;color:${typeColors[t.type] || 'var(--primary)'};flex-shrink:0">
              <i class="fas ${typeIcons[t.type] || 'fa-circle'}"></i>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.description || t.type}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted)">${formatDate(t.createdAt)}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-weight:700;font-size:var(--text-sm);color:${t.type === 'withdrawal' || t.amount < 0 ? 'var(--danger)' : 'var(--success)'}">
                ${t.type === 'withdrawal' || t.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(t.amount))}
              </div>
              <span class="badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}">${t.status}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Transactions error:', error);
  }
}

async function loadStats() {
  try {
    // Get user for current balance
    const res = await api.getMe();
    const user = res.data;
    
    // Get all transactions
    const txRes = await api.getMyTransactions('', '', 1, 100);
    const { transactions = [] } = txRes.data || {};
    
    const adjustments = transactions.filter(t => (t.type === 'adjustment' || t.type === 'referral_bonus') && t.status === 'completed');
    const withdrawals = transactions.filter(t => t.type === 'withdrawal');
    const pending = transactions.filter(t => t.status === 'pending');

    const totalReceivedAmount = adjustments.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) + (user.balance || 0);
    const totalWithdrawalAmount = withdrawals.filter(t => t.status === 'completed' || t.status === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0);

    document.getElementById('totalReceived').textContent = formatCurrency(totalReceivedAmount);
    document.getElementById('totalWithdrawals').textContent = formatCurrency(totalWithdrawalAmount);
    document.getElementById('pendingCount').textContent = pending.length;

    // Referrals
    try {
      const refRes = await api.getMyReferrals();
      const stats = refRes.data?.stats || {};
      document.getElementById('referralCount').textContent = stats.totalReferrals || 0;
    } catch (e) {
      document.getElementById('referralCount').textContent = '0';
    }
  } catch (error) {
    console.error('Stats error:', error);
  }
}

async function loadNotificationCount() {
  try {
    const res = await api.getNotifications(true, 1, 1);
    const unreadCount = res.data?.unreadCount || 0;
    
    const notifBadge = document.getElementById('notifBadge');
    const headerBadge = document.getElementById('headerNotifBadge');
    
    if (notifBadge) {
      notifBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      notifBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
    if (headerBadge) {
      headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      headerBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
  } catch (error) {
    console.error('Notification count error:', error);
  }
}
