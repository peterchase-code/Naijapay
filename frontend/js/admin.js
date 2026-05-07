async function loadAdminDashboard() {
  try {
    const res = await api.getAdminStats();
    const data = res.data || {};
    
    document.getElementById('totalUsers').textContent = data.users?.total || 0;
    document.getElementById('activeUsers').textContent = data.users?.active || 0;
    document.getElementById('totalWithdrawals').textContent = data.withdrawals?.count || 0;
    document.getElementById('withdrawalAmount').textContent = formatCurrency(data.withdrawals?.totalAmount || 0);
    document.getElementById('pendingWithdrawals').textContent = data.withdrawals?.pendingCount || 0;
    document.getElementById('activeCredentials').textContent = data.credentials?.active || 0;
    document.getElementById('totalReferrals').textContent = data.referrals?.total || 0;
    
    // Try to load pending proofs count
    try {
      const proofRes = await api.getAllPaymentProofs('pending', 1, 1);
      document.getElementById('pendingProofs').textContent = proofRes.data?.total || 0;
    } catch (e) {
      document.getElementById('pendingProofs').textContent = 0;
    }
    
    loadRecentProofs();
    loadRecentWithdrawals();
  } catch (error) {
    console.error('Admin dashboard error:', error);
    showToast('Failed to load admin stats', 'danger');
  }
}

async function loadRecentProofs() {
  try {
    const res = await api.getAllPaymentProofs('pending', 1, 5);
    const proofs = res.data?.proofs || [];
    const container = document.getElementById('recentProofs');
    if (proofs.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-inbox"></i></div><h3>No Pending Proofs</h3></div>`;
      return;
    }
    container.innerHTML = `<div style="display:flex;flex-direction:column;gap:var(--space-sm)">${proofs.map(p => `
      <div class="activity-item">
        <div class="activity-icon" style="background:var(--warning);color:white"><i class="fas fa-file-image"></i></div>
        <div class="activity-content">
          <div class="activity-text">${p.user?.fullName || 'Unknown'} - ${p.originalCurrency ? p.originalCurrency + ' ' + p.originalAmount : formatCurrency(p.amount)}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">${p.serviceName || '--'} | ${p.credentialValue || '--'} | ${formatDate(p.createdAt)}</div>
        </div>
        <span class="badge badge-warning">pending</span>
      </div>
    `).join('')}</div>`;
  } catch (error) { console.error(error); }
}

async function loadRecentWithdrawals() {
  try {
    const res = await api.getAllWithdrawals('page=1&limit=5');
    const withdrawals = res.data?.withdrawals || [];
    const container = document.getElementById('recentWithdrawals');
    
    if (withdrawals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
          <h3>No Recent Withdrawals</h3>
        </div>
      `;
      return;
    }
    
    const statusColors = { pending: 'warning', processing: 'info', paid: 'success', rejected: 'danger' };
    
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
        ${withdrawals.map(w => `
          <div class="activity-item">
            <div class="activity-icon" style="background:${statusColors[w.status] || 'var(--primary)'}15;color:${statusColors[w.status] || 'var(--primary)'}">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">${w.user?.fullName || 'Unknown'} - ${formatCurrency(w.amount)}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted)">${w.bankDetails?.bankName || '--'} | ${formatDate(w.createdAt)}</div>
            </div>
            <span class="badge badge-${statusColors[w.status] || 'neutral'}">${w.status}</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error(error);
  }
}

async function loadRecentUsers() {
  try {
    const res = await api.getAdminUsers('page=1&limit=5');
    const users = res.data?.users || [];
    const container = document.getElementById('recentUsers');
    
    if (users.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-user-plus"></i></div>
          <h3>No Recent Users</h3>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
        ${users.map(u => `
          <div class="activity-item">
            <div class="activity-icon" style="background:var(--primary);color:white">
              ${getInitials(u.fullName)}
            </div>
            <div class="activity-content">
              <div class="activity-text">${u.fullName}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted)">${u.email} | Balance: ${formatCurrency(u.balance || 0)}</div>
            </div>
            ${u.isBanned ? '<span class="badge badge-danger">Banned</span>' : '<span class="badge badge-success">Active</span>'}
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error(error);
  }
}

// Generic admin table render helpers
function renderUserActions(user) {
  return `
    <div class="table-actions">
      <button class="table-action-btn view" onclick="viewUser('${user._id}')" title="View"><i class="fas fa-eye"></i></button>
      <button class="table-action-btn edit" onclick="editUser('${user._id}')" title="Edit"><i class="fas fa-edit"></i></button>
      ${user.isBanned 
        ? `<button class="table-action-btn" onclick="unbanUserAction('${user._id}')" title="Unban"><i class="fas fa-check"></i></button>`
        : `<button class="table-action-btn ban" onclick="banUserAction('${user._id}')" title="Ban"><i class="fas fa-ban"></i></button>`
      }
      <button class="table-action-btn delete" onclick="deleteUserAction('${user._id}')" title="Delete"><i class="fas fa-trash"></i></button>
    </div>
  `;
}

/* ========== USERS ========== */
let currentUserPage = 1;

function initAdminUsers() {
  loadAdminUsers();
  document.getElementById('searchInput')?.addEventListener('input', debounce(() => { currentUserPage = 1; loadAdminUsers(); }, 500));
  document.getElementById('roleFilter')?.addEventListener('change', () => { currentUserPage = 1; loadAdminUsers(); });
  document.getElementById('statusFilter')?.addEventListener('change', () => { currentUserPage = 1; loadAdminUsers(); });
  document.getElementById('balanceForm')?.addEventListener('submit', handleBalanceAdjustment);
}

async function loadAdminUsers(page = 1) {
  try {
    currentUserPage = page;
    const search = document.getElementById('searchInput')?.value || '';
    const role = document.getElementById('roleFilter')?.value || '';
    const isBanned = document.getElementById('statusFilter')?.value || '';
    
    let query = `page=${page}&limit=15`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (role) query += `&role=${role}`;
    if (isBanned !== '') query += `&isBanned=${isBanned}`;
    
    const res = await api.getAdminUsers(query);
    const { users = [], total = 0, pages = 1 } = res.data || {};
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);color:var(--text-muted)">No users found</td></tr>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-sm)">
            <div class="user-avatar" style="width:32px;height:32px;font-size:var(--text-xs)">${getInitials(u.fullName)}</div>
            <div>
              <div style="font-weight:600;font-size:var(--text-sm)">${u.fullName}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted)">@${u.username}</div>
            </div>
          </div>
        </td>
        <td style="font-size:var(--text-sm);color:var(--text-secondary)">${u.email}</td>
        <td style="font-weight:600;font-size:var(--text-sm)">${formatCurrency(u.balance || 0)}</td>
        <td><span class="badge badge-${u.role === 'admin' ? 'info' : 'neutral'}">${u.role}</span></td>
        <td>${u.isBanned ? '<span class="badge badge-danger">Banned</span>' : '<span class="badge badge-success">Active</span>'}</td>
        <td style="font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap">${formatDate(u.createdAt)}</td>
        <td>${renderUserActions(u)}</td>
      </tr>
    `).join('');
    
    renderPagination(document.getElementById('pagination'), page, pages, loadAdminUsers);
  } catch (error) {
    console.error('Users error:', error);
  }
}

async function viewUser(id) {
  try {
    const res = await api.getAdminUser(id);
    const data = res.data || {};
    const user = data.user || {};
    const content = document.getElementById('userModalContent');
    
    content.innerHTML = `
      <div class="user-detail-section">
        <div class="user-detail-grid">
          <div class="user-detail-item"><div class="user-detail-label">Full Name</div><div class="user-detail-value">${user.fullName}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Username</div><div class="user-detail-value">@${user.username}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Email</div><div class="user-detail-value">${user.email}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Phone</div><div class="user-detail-value">${user.phoneNumber}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Country</div><div class="user-detail-value">${user.country}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Balance</div><div class="user-detail-value">${formatCurrency(user.balance || 0)}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Referral Code</div><div class="user-detail-value">${user.referralCode || '--'}</div></div>
          <div class="user-detail-item"><div class="user-detail-label">Joined</div><div class="user-detail-value">${formatDate(user.createdAt)}</div></div>
        </div>
      </div>
      <div class="user-detail-section">
        <div class="user-detail-title">Bank Details</div>
        ${user.bankDetails?.bankName ? `
          <div class="user-detail-grid">
            <div class="user-detail-item"><div class="user-detail-label">Bank</div><div class="user-detail-value">${user.bankDetails.bankName}</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Account Name</div><div class="user-detail-value">${user.bankDetails.accountName}</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Account Number</div><div class="user-detail-value">${user.bankDetails.accountNumber}</div></div>
            <div class="user-detail-item"><div class="user-detail-label">Country/Currency</div><div class="user-detail-value">${user.bankDetails.country || '--'} / ${user.bankDetails.currency || 'NGN'}</div></div>
          </div>
        ` : '<p style="color:var(--text-muted);font-size:var(--text-sm)">No bank details saved.</p>'}
      </div>
      <div style="display:flex;gap:var(--space-md);margin-top:var(--space-lg)">
        <button class="btn btn-primary" onclick="openBalanceModal('${user._id}')"><i class="fas fa-wallet"></i> Adjust Balance</button>
        <button class="btn btn-secondary" onclick="closeModal('userModal')">Close</button>
      </div>
    `;
    openModal('userModal');
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

function openBalanceModal(userId) {
  closeModal('userModal');
  document.getElementById('balanceUserId').value = userId;
  openModal('balanceModal');
}

async function handleBalanceAdjustment(e) {
  e.preventDefault();
  const userId = document.getElementById('balanceUserId').value;
  const type = document.getElementById('balanceType').value;
  const amount = parseFloat(document.getElementById('balanceAmount').value);
  const reason = document.getElementById('balanceReason').value;
  
  try {
    await api.adjustBalance(userId, amount, type, reason);
    showToast(`Balance ${type}d successfully`, 'success');
    closeModal('balanceModal');
    loadAdminUsers(currentUserPage);
  } catch (error) {
    showToast(error.message || 'Adjustment failed', 'danger');
  }
}

async function editUser(id) { showToast('Edit feature: use the API or update via database', 'info'); }
async function banUserAction(id) {
  if (!confirm('Ban this user?')) return;
  try { await api.banUser(id); showToast('User banned', 'success'); loadAdminUsers(currentUserPage); } catch (e) { showToast(e.message, 'danger'); }
}
async function unbanUserAction(id) {
  if (!confirm('Unban this user?')) return;
  try { await api.unbanUser(id); showToast('User unbanned', 'success'); loadAdminUsers(currentUserPage); } catch (e) { showToast(e.message, 'danger'); }
}
async function deleteUserAction(id) {
  if (!confirm('Delete this user permanently?')) return;
  try { await api.deleteAdminUser(id); showToast('User deleted', 'success'); loadAdminUsers(currentUserPage); } catch (e) { showToast(e.message, 'danger'); }
}

/* ========== WITHDRAWALS ========== */
let currentAdminWithdrawalPage = 1;

function initAdminWithdrawals() {
  loadAdminWithdrawals();
  document.getElementById('searchInput')?.addEventListener('input', debounce(() => { currentAdminWithdrawalPage = 1; loadAdminWithdrawals(); }, 500));
  document.getElementById('statusFilter')?.addEventListener('change', () => { currentAdminWithdrawalPage = 1; loadAdminWithdrawals(); });
  document.getElementById('statusForm')?.addEventListener('submit', handleStatusUpdate);
}

async function loadAdminWithdrawals(page = 1) {
  try {
    currentAdminWithdrawalPage = page;
    const search = document.getElementById('searchInput')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    let query = `page=${page}&limit=15`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (status) query += `&status=${status}`;
    
    const res = await api.getAllWithdrawals(query);
    const { withdrawals = [], pages = 1 } = res.data || {};
    const tbody = document.getElementById('withdrawalsTableBody');
    
    if (withdrawals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-xl);color:var(--text-muted)">No withdrawals found</td></tr>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    const statusColors = { pending: 'warning', processing: 'info', paid: 'success', rejected: 'danger' };
    
    tbody.innerHTML = withdrawals.map(w => `
      <tr>
        <td>
          <div style="font-weight:600;font-size:var(--text-sm)">${w.user?.fullName || 'Unknown'}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">${w.user?.email || '--'}</div>
        </td>
        <td style="font-weight:700">${formatCurrency(w.amount)}</td>
        <td style="font-size:var(--text-sm)">
          <div>${w.bankDetails?.bankName || '--'}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">${w.bankDetails?.accountName || '--'} | ${w.bankDetails?.accountNumber || '--'}</div>
          <div style="font-size:var(--text-xs);color:var(--text-muted)">${w.bankDetails?.country || '--'} / ${w.bankDetails?.currency || 'NGN'}</div>
        </td>
        <td><span class="badge badge-${statusColors[w.status] || 'neutral'}">${w.status}</span></td>
        <td style="font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap">${formatDate(w.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn view" onclick="viewWithdrawal('${w._id}')" title="View"><i class="fas fa-eye"></i></button>
            ${w.status === 'pending' ? `<button class="table-action-btn edit" onclick="openStatusModal('${w._id}')" title="Update"><i class="fas fa-edit"></i></button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
    
    renderPagination(document.getElementById('pagination'), page, pages, loadAdminWithdrawals);
  } catch (error) {
    console.error('Withdrawals error:', error);
  }
}

async function viewWithdrawal(id) {
  try {
    const res = await api.getAllWithdrawals(`search=${id}&limit=1`);
    const w = res.data?.withdrawals?.[0];
    if (!w) return;
    const content = document.getElementById('withdrawalModalContent');
    content.innerHTML = `
      <div class="user-detail-grid">
        <div class="user-detail-item"><div class="user-detail-label">User</div><div class="user-detail-value">${w.user?.fullName || '--'}</div></div>
        <div class="user-detail-item"><div class="user-detail-label">Amount</div><div class="user-detail-value">${formatCurrency(w.amount)}</div></div>
        <div class="user-detail-item"><div class="user-detail-label">Bank</div><div class="user-detail-value">${w.bankDetails?.bankName || '--'}</div></div>
        <div class="user-detail-item"><div class="user-detail-label">Account Name</div><div class="user-detail-value">${w.bankDetails?.accountName || '--'}</div></div>
        <div class="user-detail-item"><div class="user-detail-label">Account Number</div><div class="user-detail-value">${w.bankDetails?.accountNumber || '--'}</div></div>
        <div class="user-detail-item"><div class="user-detail-label">Country/Currency</div><div class="user-detail-value">${w.bankDetails?.country || '--'} / ${w.bankDetails?.currency || 'NGN'}</div></div>
        <div class="user-detail-item"><div class="user-detail-label">Status</div><div class="user-detail-value"><span class="badge badge-${w.status === 'pending' ? 'warning' : w.status === 'paid' ? 'success' : w.status === 'rejected' ? 'danger' : 'info'}">${w.status}</span></div></div>
        <div class="user-detail-item"><div class="user-detail-label">Date</div><div class="user-detail-value">${formatDate(w.createdAt)}</div></div>
        ${w.adminNote ? `<div class="user-detail-item" style="grid-column:1/-1"><div class="user-detail-label">Admin Note</div><div class="user-detail-value">${w.adminNote}</div></div>` : ''}
      </div>
      <div style="margin-top:var(--space-lg)">
        <button class="btn btn-secondary" onclick="closeModal('withdrawalModal')">Close</button>
      </div>
    `;
    openModal('withdrawalModal');
  } catch (e) { console.error(e); }
}

function openStatusModal(id) {
  document.getElementById('statusWithdrawalId').value = id;
  openModal('statusModal');
}

async function handleStatusUpdate(e) {
  e.preventDefault();
  const id = document.getElementById('statusWithdrawalId').value;
  const status = document.getElementById('newStatus').value;
  const note = document.getElementById('adminNote').value;
  
  try {
    await api.updateWithdrawalStatus(id, status, note);
    showToast(`Status updated to ${status}`, 'success');
    closeModal('statusModal');
    loadAdminWithdrawals(currentAdminWithdrawalPage);
  } catch (error) {
    showToast(error.message || 'Update failed', 'danger');
  }
}

/* ========== SERVICES ========== */
function initAdminServices() {
  loadAdminServices();
  document.getElementById('serviceForm')?.addEventListener('submit', handleServiceSubmit);
}

async function loadAdminServices() {
  try {
    const res = await api.getAllServices();
    const services = res.data || [];
    const grid = document.getElementById('servicesGrid');
    
    if (services.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon"><i class="fas fa-cogs"></i></div><h3>No Services</h3></div>`;
      return;
    }
    
    grid.innerHTML = services.map(s => `
      <div class="service-admin-card">
        <div class="service-admin-icon" style="background:${s.color}20;color:${s.color}"><i class="fas ${s.icon || 'fa-money-bill'}"></i></div>
        <div class="service-admin-info">
          <div class="service-admin-name">${s.displayName}</div>
          <div class="service-admin-meta">${s.credentialLabel} | ${s.isActive ? 'Active' : 'Inactive'}</div>
          <div class="service-admin-meta" style="color:var(--primary);font-weight:600">${s.rate ? `\u20A6${parseFloat(s.rate).toLocaleString('en-NG')}/unit` : '<span style="color:var(--danger)">Rate not set</span>'}</div>
        </div>
        <div class="service-admin-actions">
          <button class="table-action-btn edit" onclick="editService('${s._id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="table-action-btn ${s.isActive ? 'ban' : ''}" onclick="toggleServiceAction('${s._id}')" title="${s.isActive ? 'Disable' : 'Enable'}"><i class="fas ${s.isActive ? 'fa-pause' : 'fa-play'}"></i></button>
          <button class="table-action-btn delete" onclick="deleteServiceAction('${s._id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Services error:', error);
  }
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('serviceId').value;
  const data = {
    name: document.getElementById('svcName').value.trim(),
    displayName: document.getElementById('svcDisplay').value.trim(),
    description: document.getElementById('svcDesc').value.trim(),
    credentialType: document.getElementById('svcCredentialType').value,
    credentialLabel: document.getElementById('svcLabel').value.trim(),
    instructions: document.getElementById('svcInstructions').value.trim(),
    icon: document.getElementById('svcIcon').value.trim(),
    color: document.getElementById('svcColor').value.trim(),
    rate: parseFloat(document.getElementById('svcRate').value) || 0,
    order: parseInt(document.getElementById('svcOrder').value) || 0
  };
  
  try {
    if (id) {
      await api.updateService(id, data);
      showToast('Service updated', 'success');
    } else {
      await api.createService(data);
      showToast('Service created', 'success');
    }
    closeModal('serviceModal');
    loadAdminServices();
  } catch (error) {
    showToast(error.message || 'Save failed', 'danger');
  }
}

async function editService(id) {
  try {
    const res = await api.getAllServices();
    const s = res.data?.find(x => x._id === id);
    if (!s) return;
    document.getElementById('serviceId').value = s._id;
    document.getElementById('svcName').value = s.name;
    document.getElementById('svcDisplay').value = s.displayName;
    document.getElementById('svcDesc').value = s.description || '';
    document.getElementById('svcCredentialType').value = s.credentialType;
    document.getElementById('svcLabel').value = s.credentialLabel;
    document.getElementById('svcInstructions').value = s.instructions || '';
    document.getElementById('svcIcon').value = s.icon;
    document.getElementById('svcColor').value = s.color;
    document.getElementById('svcRate').value = s.rate || '';
    document.getElementById('svcOrder').value = s.order;
    document.getElementById('serviceModalTitle').textContent = 'Edit Service';
    openModal('serviceModal');
  } catch (e) { console.error(e); }
}

async function toggleServiceAction(id) {
  try { await api.toggleService(id); showToast('Service status toggled', 'success'); loadAdminServices(); } catch (e) { showToast(e.message, 'danger'); }
}
async function deleteServiceAction(id) {
  if (!confirm('Delete this service?')) return;
  try { await api.deleteService(id); showToast('Service deleted', 'success'); loadAdminServices(); } catch (e) { showToast(e.message, 'danger'); }
}

/* ========== CREDENTIALS ========== */
let currentCredPage = 1;
let allServices = [];
let allUsers = [];
let selectedCredentialIds = [];

function initAdminCredentials() {
  loadAdminCredentials();
  loadServicesForSelect();
  loadUsersForSelectBulk();
  document.getElementById('serviceFilter')?.addEventListener('change', () => { currentCredPage = 1; loadAdminCredentials(); });
  document.getElementById('assignmentFilter')?.addEventListener('change', () => { currentCredPage = 1; loadAdminCredentials(); });
  document.getElementById('credentialForm')?.addEventListener('submit', handleCredentialSubmit);
  document.getElementById('assignForm')?.addEventListener('submit', handleAssignSubmit);
}

// Checkbox handlers for bulk assignment
function toggleSelectAllCreds() {
  const selectAllCheckbox = document.getElementById('selectAllCreds');
  const checkboxes = document.querySelectorAll('.cred-select-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = selectAllCheckbox.checked;
    const credId = cb.dataset.id;
    if (selectAllCheckbox.checked) {
      if (!selectedCredentialIds.includes(credId)) selectedCredentialIds.push(credId);
    } else {
      selectedCredentialIds = selectedCredentialIds.filter(id => id !== credId);
    }
  });
  updateBulkAssignButton();
}

function toggleCredSelection(credId) {
  const checkbox = document.querySelector(`.cred-select-checkbox[data-id="${credId}"]`);
  if (checkbox.checked) {
    if (!selectedCredentialIds.includes(credId)) selectedCredentialIds.push(credId);
  } else {
    selectedCredentialIds = selectedCredentialIds.filter(id => id !== credId);
    document.getElementById('selectAllCreds').checked = false;
  }
  updateBulkAssignButton();
}

function updateBulkAssignButton() {
  const btn = document.getElementById('bulkAssignBtn');
  if (btn) {
    btn.disabled = selectedCredentialIds.length === 0;
    btn.innerHTML = selectedCredentialIds.length > 0
      ? `<i class="fas fa-users-cog"></i> Bulk Assign (${selectedCredentialIds.length})`
      : `<i class="fas fa-users-cog"></i> Bulk Assign`;
  }
}

// Load users for bulk assignment panel
async function loadUsersForSelectBulk() {
  const bulkList = document.getElementById('bulkAssignUserList');
  if (!bulkList) return;

  // Show loading state
  bulkList.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:var(--space-lg)"><i class="fas fa-spinner fa-spin"></i> Loading users...</div>';

  try {
    const res = await api.getAdminUsers('limit=1000&isBanned=false');
    allUsers = res.data?.users || [];

    // Also populate the single-assign dropdown
    const singleSel = document.getElementById('assignUserId');
    if (singleSel) singleSel.innerHTML = allUsers.map(u => `<option value="${u._id}">${u.fullName} (@${u.username})</option>`).join('');

    // Populate the bulk assign user list
    if (allUsers.length === 0) {
      bulkList.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:var(--space-lg)"><i class="fas fa-user-slash"></i><br>No active users found</div>';
      return;
    }

    bulkList.innerHTML = allUsers.map((u, idx) => `
      <div class="bulk-user-item" id="bulk-user-${idx}" onclick="toggleBulkUserCheckbox(${idx})" style="display:flex;align-items:center;gap:var(--space-sm);padding:10px 12px;border-radius:var(--radius-sm);cursor:pointer;border:1px solid transparent;">
        <input type="checkbox" class="bulk-user-checkbox" id="bulk-user-cb-${idx}" value="${u._id}" data-name="${u.fullName}" onchange="updateBulkUserCount()" onclick="event.stopPropagation()" style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:var(--space-sm);flex:1;pointer-events:none;">
          <div class="user-avatar" style="width:28px;height:28px;font-size:var(--text-xs);flex-shrink:0">${getInitials(u.fullName)}</div>
          <div style="min-width:0">
            <div style="font-weight:600;font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.fullName}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">@${u.username}</div>
          </div>
        </div>
        <span style="font-size:var(--text-xs);color:var(--text-muted);flex-shrink:0;font-family:var(--font-mono)">${formatCurrency(u.balance || 0)}</span>
      </div>
    `).join('');

    // Apply initial selected styles
    updateBulkUserCount();

  } catch (e) {
    console.error('Failed to load users for bulk assign:', e);
    bulkList.innerHTML = '<div style="text-align:center;color:var(--danger);padding:var(--space-lg)"><i class="fas fa-exclamation-circle"></i><br>Failed to load users<br><small style="color:var(--text-muted)">' + (e.message || 'Check console') + '</small></div>';
  }
}

function toggleBulkUserCheckbox(idx) {
  const cb = document.getElementById('bulk-user-cb-' + idx);
  if (!cb) return;
  cb.checked = !cb.checked;
  updateBulkUserCount();
}

function updateBulkUserCount() {
  const checkboxes = document.querySelectorAll('.bulk-user-checkbox');
  const countSpan = document.getElementById('bulkSelectedCount');
  const submitBtn = document.getElementById('bulkAssignSubmit');
  let checkedCount = 0;

  checkboxes.forEach(cb => {
    const item = cb.closest('.bulk-user-item');
    if (cb.checked) {
      checkedCount++;
      if (item) {
        item.style.background = 'rgba(0, 200, 83, 0.08)';
        item.style.borderColor = 'rgba(0, 200, 83, 0.3)';
      }
    } else {
      if (item) {
        item.style.background = 'transparent';
        item.style.borderColor = 'transparent';
      }
    }
  });

  if (countSpan) countSpan.textContent = checkedCount;
  if (submitBtn) submitBtn.disabled = checkedCount === 0;
}

// Bulk assign modal
function openBulkAssignModal() {
  if (selectedCredentialIds.length === 0) {
    showToast('Please select at least one credential', 'warning');
    return;
  }

  // Show selected credential badges
  const listContainer = document.getElementById('bulkAssignSelectedList');
  if (listContainer) {
    listContainer.innerHTML = selectedCredentialIds.map(id => {
      const checkbox = document.querySelector(`.cred-select-checkbox[data-id="${id}"]`);
      const row = checkbox?.closest('tr');
      const serviceName = row?.querySelector('td:nth-child(2) span')?.textContent || 'Credential';
      const value = row?.querySelector('td:nth-child(4)')?.textContent || '--';
      return `<span class="badge badge-info" style="font-size:var(--text-xs);padding:4px 10px;">${serviceName}: ${value}</span>`;
    }).join('');
  }

  // Reset user selections
  document.querySelectorAll('.bulk-user-checkbox').forEach(cb => cb.checked = false);
  updateBulkUserCount();

  openModal('bulkAssignModal');
}

async function handleBulkAssignSubmit() {
  const checkedUsers = document.querySelectorAll('.bulk-user-checkbox:checked');
  if (checkedUsers.length === 0) {
    showToast('Please select at least one user', 'warning');
    return;
  }

  const userIds = Array.from(checkedUsers).map(cb => cb.value);
  const submitBtn = document.getElementById('bulkAssignSubmit');

  setLoading(submitBtn, true);
  let successCount = 0;
  let failCount = 0;

  // Process each credential sequentially for better error handling
  for (const credId of selectedCredentialIds) {
    try {
      await api.assignBulkCredentials(credId, userIds);
      successCount++;
    } catch (error) {
      console.error(`Failed to bulk assign credential ${credId}:`, error);
      failCount++;
    }
  }

  setLoading(submitBtn, false);
  closeModal('bulkAssignModal');

  // Clear selections
  selectedCredentialIds = [];
  document.querySelectorAll('.cred-select-checkbox').forEach(cb => cb.checked = false);
  document.getElementById('selectAllCreds').checked = false;
  updateBulkAssignButton();

  if (failCount === 0) {
    showToast(`Successfully assigned ${successCount} credential(s) to ${userIds.length} user(s)`, 'success');
  } else {
    showToast(`${successCount} succeeded, ${failCount} failed. Check console for details.`, 'warning');
  }

  loadAdminCredentials();
}

async function loadServicesForSelect() {
  try {
    const res = await api.getAllServices();
    allServices = res.data || [];
    const selects = [document.getElementById('credService'), document.getElementById('serviceFilter')];
    selects.forEach(sel => {
      if (!sel) return;
      const current = sel.value;
      sel.innerHTML = '<option value="">All Services</option>' + allServices.map(s => `<option value="${s._id}">${s.displayName}</option>`).join('');
      sel.value = current;
    });
  } catch (e) { console.error(e); }
}

async function loadUsersForSelect() {
  try {
    const res = await api.getAdminUsers('limit=1000');
    allUsers = res.data?.users || [];
    const sel = document.getElementById('assignUserId');
    if (sel) sel.innerHTML = allUsers.map(u => `<option value="${u._id}">${u.fullName} (@${u.username})</option>`).join('');
  } catch (e) { console.error(e); }
}

async function loadAdminCredentials(page = 1) {
  try {
    currentCredPage = page;
    const service = document.getElementById('serviceFilter')?.value || '';
    const assignment = document.getElementById('assignmentFilter')?.value || '';
    
    let query = `page=${page}&limit=15`;
    if (service) query += `&service=${service}`;
    if (assignment === 'assigned') query += '&assignedTo=true';
    if (assignment === 'unassigned') query += '&assignedTo=false';
    
    const res = await api.getAllCredentials(query);
    const credentials = res.data || [];
    const tbody = document.getElementById('credentialsTableBody');
    
    if (credentials.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);color:var(--text-muted)">No credentials found</td></tr>`;
      return;
    }
    
    tbody.innerHTML = credentials.map(c => {
      const isSelected = selectedCredentialIds.includes(c._id);
      return `
      <tr>
        <td style="text-align:center">
          <input type="checkbox" class="cred-select-checkbox" data-id="${c._id}" ${isSelected ? 'checked' : ''} onchange="toggleCredSelection('${c._id}')" style="cursor:pointer">
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-sm)">
            <div style="width:32px;height:32px;border-radius:var(--radius-md);background:${c.service?.color || 'var(--primary)'}20;display:flex;align-items:center;justify-content:center;color:${c.service?.color || 'var(--primary)'};font-size:var(--text-sm)">
              <i class="fas ${c.service?.icon || 'fa-money-bill'}"></i>
            </div>
            <span style="font-weight:600;font-size:var(--text-sm)">${c.serviceName || c.service?.displayName || '--'}</span>
          </div>
        </td>
        <td style="font-size:var(--text-sm)">${c.type}</td>
        <td style="font-family:var(--font-mono);font-size:var(--text-sm)">${c.value}</td>
        <td style="font-size:var(--text-sm)">${c.assignedTo ? (c.assignedTo.fullName || c.assignedTo.username || 'User') : '<span style="color:var(--text-muted)">Unassigned</span>'}</td>
        <td>${c.isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-neutral">Inactive</span>'}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn edit" onclick="editCredential('${c._id}')" title="Edit"><i class="fas fa-edit"></i></button>
            ${c.assignedTo ? 
              `<button class="table-action-btn ban" onclick="unassignCredentialAction('${c._id}')" title="Unassign"><i class="fas fa-user-minus"></i></button>` :
              `<button class="table-action-btn view" onclick="openAssignModal('${c._id}')" title="Assign"><i class="fas fa-user-plus"></i></button>`
            }
            <button class="table-action-btn delete" onclick="deleteCredentialAction('${c._id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `}).join('');
  } catch (error) {
    console.error('Credentials error:', error);
  }
}

async function handleCredentialSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('credentialId').value;
  const data = {
    service: document.getElementById('credService').value,
    type: document.getElementById('credType').value.trim(),
    value: document.getElementById('credValue').value.trim(),
    additionalInfo: document.getElementById('credAdditional').value ? JSON.parse(document.getElementById('credAdditional').value) : {}
  };
  
  try {
    if (id) {
      await api.updateCredential(id, data);
      showToast('Credential updated', 'success');
    } else {
      await api.createCredential(data);
      showToast('Credential created', 'success');
    }
    closeModal('credentialModal');
    loadAdminCredentials();
  } catch (error) {
    showToast(error.message || 'Save failed', 'danger');
  }
}

async function editCredential(id) {
  try {
    const res = await api.getAllCredentials(`limit=1000`);
    const c = res.data?.find(x => x._id === id);
    if (!c) return;
    document.getElementById('credentialId').value = c._id;
    document.getElementById('credService').value = c.service?._id || c.service;
    document.getElementById('credType').value = c.type;
    document.getElementById('credValue').value = c.value;
    document.getElementById('credAdditional').value = c.additionalInfo ? JSON.stringify(c.additionalInfo) : '';
    document.getElementById('credentialModalTitle').textContent = 'Edit Credential';
    openModal('credentialModal');
  } catch (e) { console.error(e); }
}

function openAssignModal(id) {
  document.getElementById('assignCredentialId').value = id;
  openModal('assignModal');
}

async function handleAssignSubmit(e) {
  e.preventDefault();
  const credId = document.getElementById('assignCredentialId').value;
  const userId = document.getElementById('assignUserId').value;
  
  try {
    await api.assignCredential(credId, userId);
    showToast('Credential assigned', 'success');
    closeModal('assignModal');
    loadAdminCredentials();
  } catch (error) {
    showToast(error.message || 'Assignment failed', 'danger');
  }
}

async function unassignCredentialAction(id) {
  if (!confirm('Unassign this credential?')) return;
  try { await api.unassignCredential(id); showToast('Credential unassigned', 'success'); loadAdminCredentials(); } catch (e) { showToast(e.message, 'danger'); }
}
async function deleteCredentialAction(id) {
  if (!confirm('Delete this credential?')) return;
  try { await api.deleteCredential(id); showToast('Credential deleted', 'success'); loadAdminCredentials(); } catch (e) { showToast(e.message, 'danger'); }
}

/* ========== TRANSACTIONS ========== */
let currentAdminTxPage = 1;

function initAdminTransactions() {
  loadAdminTransactions();
  document.getElementById('typeFilter')?.addEventListener('change', () => { currentAdminTxPage = 1; loadAdminTransactions(); });
  document.getElementById('statusFilter')?.addEventListener('change', () => { currentAdminTxPage = 1; loadAdminTransactions(); });
}

async function loadAdminTransactions(page = 1) {
  try {
    currentAdminTxPage = page;
    const type = document.getElementById('typeFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    let query = `page=${page}&limit=15`;
    if (type) query += `&type=${type}`;
    if (status) query += `&status=${status}`;
    
    const res = await api.getAllTransactions(query);
    const { transactions = [], pages = 1 } = res.data || {};
    const tbody = document.getElementById('transactionsTableBody');
    
    if (transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:var(--space-xl);color:var(--text-muted)">No transactions found</td></tr>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    const typeLabels = { deposit: 'Deposit', withdrawal: 'Withdrawal', referral_bonus: 'Referral', adjustment: 'Adjustment' };
    
    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td style="font-size:var(--text-sm)">${t.user?.fullName || 'Unknown'}<br><span style="font-size:var(--text-xs);color:var(--text-muted)">${t.user?.email || '--'}</span></td>
        <td><span class="badge badge-${t.type === 'deposit' ? 'success' : t.type === 'withdrawal' ? 'warning' : 'info'}">${typeLabels[t.type] || t.type}</span></td>
        <td style="font-size:var(--text-sm);color:var(--text-secondary)">${t.description || '--'}</td>
        <td style="font-weight:700;font-size:var(--text-sm);color:${t.amount < 0 ? 'var(--danger)' : 'var(--success)'}">${t.amount < 0 ? '' : '+'}${formatCurrency(Math.abs(t.amount))}</td>
        <td><span class="badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}">${t.status}</span></td>
        <td style="font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap">${formatDate(t.createdAt)}</td>
        <td>
          <div class="table-actions">
            ${t.type === 'deposit' && t.status === 'pending' ? `<button class="table-action-btn edit" onclick="confirmDepositAction('${t._id}')" title="Confirm"><i class="fas fa-check"></i></button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
    
    renderPagination(document.getElementById('pagination'), page, pages, loadAdminTransactions);
  } catch (error) {
    console.error('Transactions error:', error);
  }
}

async function confirmDepositAction(id) {
  if (!confirm('Confirm this deposit?')) return;
  try { await api.confirmDeposit(id); showToast('Deposit confirmed', 'success'); loadAdminTransactions(currentAdminTxPage); } catch (e) { showToast(e.message, 'danger'); }
}

/* ========== SETTINGS ========== */
function initAdminSettings() {
  loadAdminSettings();
  document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsSave);
}

async function loadAdminSettings() {
  try {
    const res = await api.getAllSettings();
    const settings = res.data || {};
    if (settings.minDeposit !== undefined) document.getElementById('minDeposit').value = settings.minDeposit;
    if (settings.maxDeposit !== undefined) document.getElementById('maxDeposit').value = settings.maxDeposit;
    if (settings.minWithdrawal !== undefined) document.getElementById('minWithdrawal').value = settings.minWithdrawal;
    if (settings.maxWithdrawal !== undefined) document.getElementById('maxWithdrawal').value = settings.maxWithdrawal;
    if (settings.referralCommission !== undefined) document.getElementById('referralCommission').value = settings.referralCommission;
  } catch (error) {
    console.error('Settings error:', error);
  }
}

async function handleSettingsSave(e) {
  e.preventDefault();
  const btn = document.getElementById('settingsBtn');
  setLoading(btn, true);
  
  const settings = [
    { key: 'minDeposit', value: document.getElementById('minDeposit').value, label: 'Minimum Deposit', description: 'Lowest deposit amount' },
    { key: 'maxDeposit', value: document.getElementById('maxDeposit').value, label: 'Maximum Deposit', description: 'Highest deposit amount' },
    { key: 'minWithdrawal', value: document.getElementById('minWithdrawal').value, label: 'Minimum Withdrawal', description: 'Lowest withdrawal amount' },
    { key: 'maxWithdrawal', value: document.getElementById('maxWithdrawal').value, label: 'Maximum Withdrawal', description: 'Highest withdrawal amount' },
    { key: 'referralCommission', value: document.getElementById('referralCommission').value, label: 'Referral Commission', description: 'Commission per referral' }
  ];
  
  try {
    await api.updateMultipleSettings(settings);
    showAlert('settingsAlert', 'Settings saved successfully!', 'success');
  } catch (error) {
    showAlert('settingsAlert', error.message || 'Save failed', 'danger');
  } finally {
    setLoading(btn, false);
  }
}

/* ========== PAYMENT PROOFS ========== */
let currentProofPage = 1;

function initAdminPaymentProofs() {
  loadAdminPaymentProofs();
  document.getElementById('searchInput')?.addEventListener('input', debounce(() => { currentProofPage = 1; loadAdminPaymentProofs(); }, 500));
  document.getElementById('statusFilter')?.addEventListener('change', () => { currentProofPage = 1; loadAdminPaymentProofs(); });
}

async function loadAdminPaymentProofs(page = 1) {
  try {
    currentProofPage = page;
    const status = document.getElementById('statusFilter')?.value || '';
    const res = await api.getAllPaymentProofs(status, page, 10);
    const { proofs = [], pages = 1 } = res.data || {};
    const container = document.getElementById('proofsContainer');

    if (proofs.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-file-image"></i></div><h3>No Payment Proofs Found</h3></div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    const statusColors = { pending: 'warning', approved: 'success', rejected: 'danger' };

    container.innerHTML = proofs.map(p => `
      <div class="proof-review-card">
        <img src="${API_BASE_URL.replace('/api', '')}${p.screenshotUrl}" class="proof-review-img" alt="Payment Proof" onclick="window.open('${API_BASE_URL.replace('/api', '')}${p.screenshotUrl}', '_blank')">
        <div class="proof-review-body">
          <div class="proof-review-grid">
            <div class="proof-review-item"><div class="proof-review-label">User</div><div class="proof-review-value">${p.user?.fullName || 'Unknown'}</div></div>
            <div class="proof-review-item"><div class="proof-review-label">Service</div><div class="proof-review-value">${p.serviceName || 'Unknown'}</div></div>
            <div class="proof-review-item"><div class="proof-review-label">Credential</div><div class="proof-review-value" style="font-family:var(--font-mono)">${p.credentialValue || '--'}</div></div>
            <div class="proof-review-item"><div class="proof-review-label">Original Amount</div><div class="proof-review-value" style="color:var(--primary)">${p.originalCurrency ? p.originalCurrency + ' ' + p.originalAmount : formatCurrency(p.amount)}</div></div>
            ${p.exchangeRate ? `<div class="proof-review-item"><div class="proof-review-label">Exchange Rate</div><div class="proof-review-value">1 ${p.originalCurrency} = ${p.exchangeRate} NGN</div></div>` : ''}
            ${p.convertedAmount ? `<div class="proof-review-item"><div class="proof-review-label">Converted (NGN)</div><div class="proof-review-value" style="color:var(--success);font-weight:700">${formatCurrency(p.convertedAmount)}</div></div>` : ''}
            ${p.giftCardType ? `<div class="proof-review-item"><div class="proof-review-label">Gift Card</div><div class="proof-review-value"><i class="fas fa-gift"></i> ${p.giftCardType}</div></div>` : ''}
            <div class="proof-review-item"><div class="proof-review-label">Status</div><div class="proof-review-value"><span class="badge badge-${statusColors[p.status] || 'neutral'}">${p.status}</span></div></div>
            <div class="proof-review-item"><div class="proof-review-label">Date</div><div class="proof-review-value">${formatDate(p.createdAt)}</div></div>
          </div>
          ${p.note ? `<div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:var(--space-md);padding:var(--space-sm);background:var(--bg-card);border-radius:var(--radius-md)"><i class="fas fa-comment" style="margin-right:6px"></i>${p.note}</div>` : ''}
          ${p.status === 'pending' ? `
            <div class="proof-review-actions">
              <button class="btn btn-primary" onclick="openReviewModal('${p._id}', '${p.amount}', '${p.originalAmount || p.amount}', '${p.originalCurrency || 'NGN'}', '${p.convertedAmount || p.amount}', '${p.exchangeRate || ''}', '${p.user?.fullName || ''}', '${p.serviceName || ''}', '${p.credentialValue || ''}', '${p.giftCardType || ''}')">
                <i class="fas fa-gavel"></i> Review
              </button>
            </div>
          ` : `<div style="font-size:var(--text-xs);color:var(--text-muted)">Reviewed by ${p.reviewedBy?.fullName || 'Admin'} on ${formatDate(p.reviewedAt)}${p.adminNote ? ' - ' + p.adminNote : ''}</div>`}
        </div>
      </div>
    `).join('');

    renderPagination(document.getElementById('pagination'), page, pages, loadAdminPaymentProofs);
  } catch (error) {
    console.error('Payment proofs error:', error);
  }
}

function openReviewModal(id, amount, originalAmount, originalCurrency, convertedAmount, exchangeRate, userName, serviceName, credentialValue, giftCardType) {
  const content = document.getElementById('reviewModalContent');
  content.innerHTML = `
    <div class="proof-review-grid" style="margin-bottom:var(--space-lg)">
      <div class="proof-review-item"><div class="proof-review-label">User</div><div class="proof-review-value">${userName}</div></div>
      <div class="proof-review-item"><div class="proof-review-label">Original Amount</div><div class="proof-review-value">${originalCurrency} ${originalAmount}</div></div>
      ${exchangeRate ? `<div class="proof-review-item"><div class="proof-review-label">Exchange Rate</div><div class="proof-review-value">1 ${originalCurrency} = ${exchangeRate} NGN</div></div>` : ''}
      ${convertedAmount ? `<div class="proof-review-item"><div class="proof-review-label">Converted (NGN)</div><div class="proof-review-value" style="color:var(--success);font-weight:700">${formatCurrency(parseFloat(convertedAmount) || 0)}</div></div>` : ''}
      <div class="proof-review-item"><div class="proof-review-label">Service</div><div class="proof-review-value">${serviceName}</div></div>
      <div class="proof-review-item"><div class="proof-review-label">Credential</div><div class="proof-review-value">${credentialValue}</div></div>
      ${giftCardType ? `<div class="proof-review-item"><div class="proof-review-label">Gift Card</div><div class="proof-review-value"><i class="fas fa-gift"></i> ${giftCardType}</div></div>` : ''}
    </div>
    <form id="reviewForm" data-id="${id}">
      <div class="form-group">
        <label class="form-label">Decision</label>
        <select class="form-select" id="reviewDecision" required>
          <option value="">Select...</option>
          <option value="approved">Approve - Add ${convertedAmount ? formatCurrency(parseFloat(convertedAmount)||0) : formatCurrency(parseFloat(amount)||0)} to Balance</option>
          <option value="rejected">Reject</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Note (optional for approval, required for rejection)</label>
        <textarea class="form-input" id="reviewNote" rows="2" placeholder="Reason or note..."></textarea>
      </div>
      <div style="display:flex;gap:var(--space-md)">
        <button type="submit" class="btn btn-primary btn-block">Submit Decision</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('reviewModal')">Cancel</button>
      </div>
    </form>
  `;
  document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
  openModal('reviewModal');
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  const id = e.target.dataset.id;
  const status = document.getElementById('reviewDecision').value;
  const note = document.getElementById('reviewNote').value;
  if (!status) { showToast('Please select a decision', 'warning'); return; }
  try {
    await api.updateProofStatus(id, status, note);
    showToast(`Payment proof ${status}`, 'success');
    closeModal('reviewModal');
    loadAdminPaymentProofs(currentProofPage);
  } catch (error) {
    showToast(error.message || 'Review failed', 'danger');
  }
}

/* ========== REFERRALS ========== */
let currentAdminRefPage = 1;

function initAdminReferrals() {
  loadAdminReferrals();
}

async function loadAdminReferrals(page = 1) {
  try {
    currentAdminRefPage = page;
    const res = await api.getAllReferrals(page, 20);
    const { referrals = [], pages = 1 } = res.data || {};
    const tbody = document.getElementById('referralsTableBody');
    
    if (referrals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-xl);color:var(--text-muted)">No referrals found</td></tr>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    tbody.innerHTML = referrals.map(r => `
      <tr>
        <td style="font-size:var(--text-sm)">${r.referrer?.fullName || 'Unknown'}<br><span style="font-size:var(--text-xs);color:var(--text-muted)">${r.referrer?.email || '--'}</span></td>
        <td style="font-size:var(--text-sm)">${r.referred?.fullName || 'Unknown'}<br><span style="font-size:var(--text-xs);color:var(--text-muted)">${r.referred?.email || '--'}</span></td>
        <td style="font-family:var(--font-mono);font-size:var(--text-sm)">${r.code}</td>
        <td style="font-weight:600;color:var(--success)">${formatCurrency(r.commission || 0)}</td>
        <td><span class="badge badge-${r.status === 'paid' ? 'success' : r.status === 'completed' ? 'info' : 'warning'}">${r.status}</span></td>
        <td style="font-size:var(--text-xs);color:var(--text-muted)">${formatDate(r.createdAt)}</td>
      </tr>
    `).join('');
    
    renderPagination(document.getElementById('pagination'), page, pages, loadAdminReferrals);
  } catch (error) {
    console.error('Referrals error:', error);
  }
}

/* ========== MODAL HELPERS ========== */
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

/* ========== BROADCAST MESSAGES ========== */
let currentBroadcastPage = 1;

function initAdminBroadcast() {
  loadBroadcasts();
  document.getElementById('broadcastForm')?.addEventListener('submit', handleBroadcastSubmit);
}

async function loadBroadcasts(page = 1) {
  currentBroadcastPage = page;
  try {
    const res = await api.getBroadcasts(page, 15);
    const broadcasts = res.data?.broadcasts || [];
    const total = res.data?.total || 0;
    const pages = res.data?.pages || 1;

    const tbody = document.getElementById('broadcastTableBody');
    if (!tbody) return;

    if (broadcasts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-xl);color:var(--text-muted)">No broadcasts yet. Create your first one above.</td></tr>`;
      renderPagination(document.getElementById('pagination'), page, pages, loadBroadcasts);
      return;
    }

    tbody.innerHTML = broadcasts.map(b => `
      <tr>
        <td style="font-weight:600;font-size:var(--text-sm)">${b.title}</td>
        <td style="font-size:var(--text-sm);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.message}</td>
        <td><span class="badge badge-${b.target === 'all' ? 'primary' : b.target === 'users_only' ? 'success' : 'warning'}">${b.target.replace('_', ' ')}</span></td>
        <td style="font-size:var(--text-sm)">
          <span style="color:var(--success);font-weight:600">${b.notifiedCount}</span> notified<br>
          <span style="color:var(--primary);font-size:var(--text-xs)">${b.emailCount} emailed</span>
        </td>
        <td style="font-size:var(--text-xs);color:var(--text-muted)">${b.sentByName || 'Admin'}<br>${formatDate(b.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn view" onclick="viewBroadcast('${b._id}')" title="View"><i class="fas fa-eye"></i></button>
            <button class="table-action-btn delete" onclick="deleteBroadcastAction('${b._id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(document.getElementById('pagination'), page, pages, loadBroadcasts);
  } catch (error) {
    console.error('Broadcast load error:', error);
    showToast('Failed to load broadcasts', 'error');
  }
}

async function handleBroadcastSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('broadcastTitle').value.trim();
  const message = document.getElementById('broadcastMessage').value.trim();
  const target = document.getElementById('broadcastTarget').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!title || !message) {
    showToast('Title and message are required', 'warning');
    return;
  }

  setLoading(submitBtn, true);
  try {
    const res = await api.createBroadcast(title, message, target);
    showToast(`Broadcast sent to ${res.data?.stats?.totalTargeted || 0} user(s)`, 'success');
    document.getElementById('broadcastForm').reset();
    loadBroadcasts(1);
  } catch (error) {
    console.error('Broadcast error:', error);
    showToast(error.message || 'Failed to send broadcast', 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

async function viewBroadcast(id) {
  try {
    const res = await api.getBroadcast(id);
    const b = res.data;
    document.getElementById('viewBroadcastTitle').textContent = b.title;
    document.getElementById('viewBroadcastMessage').textContent = b.message;
    document.getElementById('viewBroadcastTarget').textContent = b.target.replace(/_/g, ' ').toUpperCase();
    document.getElementById('viewBroadcastStats').textContent = `${b.notifiedCount} notified / ${b.emailCount} emailed`;
    document.getElementById('viewBroadcastSender').textContent = b.sentByName || 'Admin';
    document.getElementById('viewBroadcastDate').textContent = formatDate(b.createdAt);
    openModal('viewBroadcastModal');
  } catch (error) {
    console.error(error);
    showToast('Failed to load broadcast details', 'error');
  }
}

async function deleteBroadcastAction(id) {
  if (!confirm('Delete this broadcast? This will not remove notifications already sent.')) return;
  try {
    await api.deleteBroadcast(id);
    showToast('Broadcast deleted', 'success');
    loadBroadcasts(currentBroadcastPage);
  } catch (error) {
    console.error(error);
    showToast('Failed to delete broadcast', 'error');
  }
}

