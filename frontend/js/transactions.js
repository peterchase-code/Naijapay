let currentTxPage = 1;

function initTransactionsPage() {
  loadTransactions();
  
  document.getElementById('typeFilter')?.addEventListener('change', () => {
    currentTxPage = 1;
    loadTransactions();
  });
  
  document.getElementById('statusFilter')?.addEventListener('change', () => {
    currentTxPage = 1;
    loadTransactions();
  });
}

async function loadTransactions(page = 1) {
  try {
    currentTxPage = page;
    const type = document.getElementById('typeFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    const res = await api.getMyTransactions(type, status, page, 15);
    const { transactions = [], total = 0, pages = 1 } = res.data || {};
    const container = document.getElementById('transactionsContainer');
    
    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-exchange-alt"></i></div>
          <h3>No Transactions</h3>
          <p>Your transaction history will appear here.</p>
        </div>
      `;
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    const typeIcons = {
      deposit: 'fa-arrow-down',
      withdrawal: 'fa-arrow-up',
      referral_bonus: 'fa-gift',
      adjustment: 'fa-sliders-h'
    };
    
    const typeLabels = {
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      referral_bonus: 'Referral Bonus',
      adjustment: 'Adjustment'
    };
    
    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:var(--space-sm)">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);color:var(--primary)">
                      <i class="fas ${typeIcons[t.type] || 'fa-circle'}"></i>
                    </div>
                    <span style="font-size:var(--text-sm);font-weight:500">${typeLabels[t.type] || t.type}</span>
                  </div>
                </td>
                <td style="font-size:var(--text-sm);color:var(--text-secondary)">${t.description || '--'}</td>
                <td style="font-weight:700;font-size:var(--text-sm);color:${t.type === 'withdrawal' || t.amount < 0 ? 'var(--danger)' : 'var(--success)'}">
                  ${t.type === 'withdrawal' || t.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(t.amount))}
                </td>
                <td><span class="badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}">${t.status}</span></td>
                <td style="color:var(--text-muted);font-size:var(--text-xs);white-space:nowrap">${formatDate(t.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    renderPagination(document.getElementById('pagination'), page, pages, loadTransactions);
  } catch (error) {
    console.error('Transactions error:', error);
  }
}
