let currentWithdrawalPage = 1;

function initWithdrawalPage() {
  loadBalance();
  loadBankDetails();
  loadWithdrawals();
  
  const useSavedCheckbox = document.getElementById('useSavedBank');
  const manualFields = document.getElementById('manualBankFields');
  
  useSavedCheckbox?.addEventListener('change', () => {
    manualFields.style.display = useSavedCheckbox.checked ? 'none' : 'block';
  });
  
  document.getElementById('withdrawalForm')?.addEventListener('submit', handleWithdrawal);
}

async function loadBalance() {
  try {
    const res = await api.getMe();
    const user = res.data;
    document.getElementById('balanceValue').textContent = formatCurrency(user.balance || 0);
  } catch (error) {
    console.error('Balance error:', error);
  }
}

async function loadBankDetails() {
  try {
    const res = await api.getBankDetails();
    const bank = res.data;
    const container = document.getElementById('savedBankInfo');
    
    if (bank && bank.bankName) {
      container.innerHTML = `
        <div class="card" style="background: var(--bg-card)">
          <div style="font-weight:600;margin-bottom:var(--space-sm)"><i class="fas fa-university" style="color:var(--primary);margin-right:var(--space-sm)"></i>Saved Bank Details</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary)">
            <div><strong>Bank:</strong> ${bank.bankName}</div>
            <div><strong>Account:</strong> ${bank.accountName}</div>
            <div><strong>Number:</strong> ${bank.accountNumber}</div>
            <div><strong>Country:</strong> ${bank.country || 'Nigeria'} (${bank.currency || 'NGN'})</div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>No saved bank details. Please <a href="settings.html">save your bank details</a> first or enter them manually.</span>
        </div>
      `;
      document.getElementById('useSavedBank').checked = false;
      document.getElementById('manualBankFields').style.display = 'block';
    }
  } catch (error) {
    console.error('Bank details error:', error);
  }
}

async function handleWithdrawal(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const amount = parseFloat(document.getElementById('amount').value);
  const useSaved = document.getElementById('useSavedBank').checked;
  
  if (!amount || amount <= 0) {
    showAlert('alertContainer', 'Please enter a valid amount', 'warning');
    return;
  }
  
  const data = { amount, useSavedBank: useSaved };
  
  if (!useSaved) {
    const bankName = document.getElementById('bankName').value.trim();
    const accountName = document.getElementById('accountName').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const country = document.getElementById('country').value.trim();
    const currency = document.getElementById('currency').value;
    
    if (!bankName || !accountName || !accountNumber) {
      showAlert('alertContainer', 'Please fill in all bank details', 'warning');
      return;
    }
    
    data.bankName = bankName;
    data.accountName = accountName;
    data.accountNumber = accountNumber;
    data.country = country;
    data.currency = currency;
  }
  
  setLoading(btn, true);
  
  try {
    await api.createWithdrawal(data);
    showAlert('alertContainer', 'Withdrawal request submitted successfully!', 'success');
    document.getElementById('withdrawalForm').reset();
    loadBalance();
    loadWithdrawals();
  } catch (error) {
    showAlert('alertContainer', error.message || 'Withdrawal request failed', 'danger');
  } finally {
    setLoading(btn, false);
  }
}

async function loadWithdrawals(page = 1) {
  try {
    currentWithdrawalPage = page;
    const res = await api.getMyWithdrawals(page, 10);
    const { withdrawals = [], total = 0, pages = 1 } = res.data || {};
    const container = document.getElementById('withdrawalsContainer');
    
    if (withdrawals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-history"></i></div>
          <h3>No Withdrawals</h3>
          <p>Your withdrawal history will appear here.</p>
        </div>
      `;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      paid: 'success',
      rejected: 'danger'
    };
    
    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Amount</th><th>Bank</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            ${withdrawals.map(w => `
              <tr>
                <td style="font-weight:600">${formatCurrency(w.amount)}</td>
                <td>${w.bankDetails?.bankName || '--'}</td>
                <td><span class="badge badge-${statusColors[w.status] || 'neutral'}">${w.status}</span></td>
                <td style="color:var(--text-muted);font-size:var(--text-xs)">${formatDate(w.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    renderPagination(document.getElementById('pagination'), page, pages, loadWithdrawals);
  } catch (error) {
    console.error('Withdrawals error:', error);
  }
}
