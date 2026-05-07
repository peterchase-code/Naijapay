async function loadCredentialsPage() {
  const container = document.getElementById('credentialsContainer');
  const countBadge = document.getElementById('credCount');
  if (!container) return;

  try {
    const res = await api.getMyCredentials();
    const credentials = res.data || [];

    if (countBadge) {
      countBadge.textContent = `${credentials.length} Active`;
      countBadge.style.display = credentials.length > 0 ? 'inline-flex' : 'none';
    }

    if (credentials.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-id-card"></i></div>
          <h3>No Credentials Assigned</h3>
          <p>An admin will assign payment credentials to your account soon. Check back later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="cred-grid">
        ${credentials.map(c => renderCredentialCard(c)).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Credentials error:', error);
    if (countBadge) countBadge.style.display = 'none';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="fas fa-exclamation-circle" style="color:var(--danger)"></i></div>
        <h3>Failed to Load Credentials</h3>
        <p>${error.message || 'Please refresh the page to try again.'}</p>
        <button class="btn btn-primary btn-sm" onclick="loadCredentialsPage()" style="margin-top:var(--space-md)"><i class="fas fa-sync-alt"></i> Retry</button>
      </div>
    `;
  }
}

function renderCredentialCard(c) {
  const serviceName = c.serviceName || c.service?.displayName || 'Service';
  const serviceRate = c.service?.rate || 0;
  const hasRate = serviceRate > 0;
  const rateText = hasRate
    ? `\u20A6${parseFloat(serviceRate).toLocaleString('en-NG')}/unit`
    : 'Rate not set';

  return `
    <div class="cred-card">
      <div class="cred-header">
        <div class="cred-icon-wrap" style="background: ${c.service?.color || 'var(--primary)'}20; color: ${c.service?.color || 'var(--primary)'};">
          <i class="fas ${c.service?.icon || 'fa-money-bill'}"></i>
        </div>
        <div>
          <div class="cred-title">${serviceName}</div>
          <div class="cred-type">${c.type || 'Credential'}</div>
        </div>
      </div>

      <div class="cred-rate-badge ${hasRate ? 'has-rate' : 'no-rate'}">
        <div class="cred-rate-icon"><i class="fas fa-chart-line"></i></div>
        <div class="cred-rate-info">
          <div class="cred-rate-label">Service Rate</div>
          <div class="cred-rate-value">${rateText}</div>
        </div>
      </div>

      <div class="cred-status">
        <span class="cred-status-dot"></span>
        <span class="badge badge-success">Active</span>
      </div>

      <div class="cred-value-box">
        <span class="cred-value-text">${c.value}</span>
        <button class="cred-copy-btn" onclick="copyToClipboard('${c.value}', this)" title="Copy">
          <i class="fas fa-copy"></i>
        </button>
      </div>

      ${c.additionalInfo?.instructions || c.service?.instructions ? `
        <div class="cred-instructions">
          <i class="fas fa-info-circle" style="color:var(--primary);margin-right:6px"></i>
          ${c.additionalInfo?.instructions || c.service?.instructions}
        </div>
      ` : ''}

      <a href="payment-proof.html?credential=${c._id}&service=${c.service?._id || ''}&serviceName=${encodeURIComponent(serviceName)}&value=${encodeURIComponent(c.value)}" class="btn btn-primary cred-upload-btn">
        <i class="fas fa-upload"></i> Submit Payment Proof
      </a>
    </div>
  `;
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="fas fa-check" style="color:var(--success)"></i>';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
  });
}
