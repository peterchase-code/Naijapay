let currentNotifPage = 1;

async function loadNotifications(page = 1) {
  try {
    currentNotifPage = page;
    const res = await api.getNotifications(false, page, 30);
    const data = res.data || {};
    const notifications = data.notifications || [];
    const unreadCount = data.unreadCount || 0;
    const container = document.getElementById('notificationsContainer');

    // Update badge on dashboard
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }

    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="text-align:center;padding:var(--space-3xl) 0">
          <div class="empty-state-icon"><i class="fas fa-bell-slash"></i></div>
          <h3>No Notifications</h3>
          <p style="color:var(--text-muted)">You're all caught up!</p>
        </div>
      `;
      return;
    }

    const typeIcons = {
      withdrawal: 'fa-money-bill-wave',
      balance: 'fa-wallet',
      system: 'fa-cog',
      referral: 'fa-users',
      security: 'fa-shield-alt'
    };

    const typeColors = {
      withdrawal: 'var(--warning)',
      balance: 'var(--success)',
      system: 'var(--info)',
      referral: 'var(--accent)',
      security: 'var(--danger)'
    };

    container.innerHTML = notifications.map(n => `
      <div class="notif-card ${n.isRead ? '' : 'unread'}">
        <div class="notif-icon" style="background:${typeColors[n.type] || 'var(--primary)'}15;color:${typeColors[n.type] || 'var(--primary)'}">
          <i class="fas ${typeIcons[n.type] || 'fa-bell'}"></i>
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-message">${n.message}</div>
          <div class="notif-time"><i class="far fa-clock" style="font-size:10px"></i> ${timeAgo(n.createdAt)}</div>
        </div>
        ${!n.isRead ? `
          <div class="notif-actions">
            <button class="notif-read-btn" onclick="markOneRead('${n._id}')" title="Mark as read">
              <i class="fas fa-check"></i>
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');

  } catch (error) {
    console.error('Notifications error:', error);
  }
}

async function markAllRead() {
  try {
    await api.markAllNotificationsRead();
    showToast('All notifications marked as read', 'success');
    loadNotifications();
  } catch (error) {
    showToast(error.message || 'Failed to mark as read', 'danger');
  }
}

async function markOneRead(id) {
  try {
    await api.markNotificationRead(id);
    loadNotifications();
  } catch (error) {
    showToast(error.message || 'Failed', 'danger');
  }
}
