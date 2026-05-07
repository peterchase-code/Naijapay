let selectedFile = null;

function initPaymentProofPage() {
  loadCredentialsSelect().then(() => {
    // Initialize live converter after credentials are loaded
    initLiveConverter();
  });
  loadMyPaymentProofs();
  
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('screenshotInput');
  const preview = document.getElementById('previewContainer');
  let dragCounter = 0;

  // Click to browse
  uploadZone?.addEventListener('click', (e) => {
    // Don't re-trigger if the click came from the file input itself
    if (e.target !== fileInput) fileInput?.click();
  });

  // Drag enter: increment counter, show visual feedback
  uploadZone?.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    uploadZone.classList.add('drag-over');
    uploadZone.classList.add('has-file');
  });

  // Drag over: required to allow dropping
  uploadZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    uploadZone.classList.add('drag-over');
    uploadZone.classList.add('has-file');
  });

  // Drag leave: decrement counter, only remove visual when fully left
  uploadZone?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      uploadZone.classList.remove('drag-over');
      if (!selectedFile) uploadZone.classList.remove('has-file');
    }
  });

  // Drop: handle the dropped files
  uploadZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    uploadZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  });

  // File input change: handles both click-select AND native drop on input
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });

  document.getElementById('proofForm')?.addEventListener('submit', handleProofSubmit);

  // Gift card toggle based on credential selection
  const credentialSelect = document.getElementById('credentialSelect');
  credentialSelect?.addEventListener('change', toggleGiftCardField);
}

function toggleGiftCardField() {
  const credentialSelect = document.getElementById('credentialSelect');
  const giftCardGroup = document.getElementById('giftCardGroup');
  const giftCardSelect = document.getElementById('giftCardSelect');
  if (!credentialSelect || !giftCardGroup) return;

  const option = credentialSelect.options[credentialSelect.selectedIndex];
  const serviceName = (option?.dataset?.servicename || '').toLowerCase();
  
  if (serviceName.includes('gift') || serviceName.includes('card')) {
    giftCardGroup.style.display = 'block';
    giftCardSelect?.setAttribute('required', 'required');
  } else {
    giftCardGroup.style.display = 'none';
    giftCardSelect?.removeAttribute('required');
  }
}

function handleFileSelect(file) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    showToast('Only JPG, JPEG, PNG, and WEBP files are allowed', 'danger');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be under 5MB', 'danger');
    return;
  }
  
  selectedFile = file;
  const uploadZone = document.getElementById('uploadZone');
  uploadZone.classList.add('has-file');
  uploadZone.querySelector('h4').textContent = file.name;
  uploadZone.querySelector('p').textContent = `${(file.size / 1024).toFixed(1)} KB - Click to change`;
  
  const preview = document.getElementById('previewContainer');
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    preview.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

async function loadCredentialsSelect() {
  try {
    const res = await api.getMyCredentials();
    const credentials = res.data || [];
    const select = document.getElementById('credentialSelect');
    if (!select) return;

    // Check URL params for pre-selected credential
    const params = new URLSearchParams(window.location.search);
    const preselectId = params.get('credential');

    if (credentials.length === 0) {
      select.innerHTML = '<option value="">No credentials available</option>';
      return;
    }

    select.innerHTML = credentials.map(c => 
      `<option value="${c._id}" data-service="${c.service?._id || ''}" data-servicename="${c.serviceName || c.service?.displayName || ''}" data-value="${c.value}">${c.serviceName || c.service?.displayName || 'Service'} - ${c.value}</option>`
    ).join('');

    if (preselectId) select.value = preselectId;
  } catch (error) {
    console.error(error);
  }
}

async function handleProofSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const credentialSelect = document.getElementById('credentialSelect');
  const amount = document.getElementById('proofAmount').value;
  const currency = document.getElementById('currencySelect').value;
  const giftCardType = document.getElementById('giftCardSelect')?.value || '';

  if (!selectedFile) {
    showAlert('proofAlert', 'Please upload a payment screenshot', 'danger');
    return;
  }

  if (!credentialSelect.value) {
    showAlert('proofAlert', 'Please select a credential', 'danger');
    return;
  }

  const option = credentialSelect.options[credentialSelect.selectedIndex];
  const formData = new FormData();
  formData.append('screenshot', selectedFile);
  formData.append('service', option.dataset.service);
  formData.append('serviceName', option.dataset.servicename);
  formData.append('credential', credentialSelect.value);
  formData.append('credentialValue', option.dataset.value);
  formData.append('amount', amount);
  formData.append('currency', currency);
  formData.append('giftCardType', giftCardType);
  formData.append('note', document.getElementById('proofNote').value);

  setLoading(btn, true);

  try {
    await api.uploadPaymentProof(formData);
    showAlert('proofAlert', 'Payment proof submitted successfully! Admin will review and convert to NGN shortly.', 'success');
    document.getElementById('proofForm').reset();
    selectedFile = null;
    document.getElementById('uploadZone').classList.remove('has-file');
    document.getElementById('uploadZone').querySelector('h4').textContent = 'Drop screenshot here or click to browse';
    document.getElementById('uploadZone').querySelector('p').textContent = 'JPG, JPEG, PNG, WEBP (Max 5MB)';
    document.getElementById('previewContainer').innerHTML = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('giftCardGroup').style.display = 'none';
    loadMyPaymentProofs();
  } catch (error) {
    showAlert('proofAlert', error.message || 'Upload failed', 'danger');
  } finally {
    setLoading(btn, false);
  }
}

async function loadMyPaymentProofs() {
  try {
    const res = await api.getMyPaymentProofs();
    const proofs = res.data?.proofs || [];
    const container = document.getElementById('myProofsContainer');
    if (!container) return;

    if (proofs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-file-image"></i></div>
          <h3>No Submissions Yet</h3>
          <p>Submit your first payment proof above.</p>
        </div>
      `;
      return;
    }

    const statusColors = { pending: 'warning', approved: 'success', rejected: 'danger' };

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        ${proofs.map(p => `
          <div class="proof-card">
            <img src="${API_BASE_URL.replace('/api', '')}${p.screenshotUrl}" class="proof-thumb" alt="Proof" onclick="window.open('${API_BASE_URL.replace('/api', '')}${p.screenshotUrl}', '_blank')">
            <div class="proof-info">
              <div class="proof-service">${p.serviceName || 'Unknown Service'}</div>
              <div class="proof-amount">
                ${p.originalCurrency && p.originalAmount ? `${p.originalCurrency} ${p.originalAmount}` : formatCurrency(p.amount)}
                ${p.convertedAmount ? `<span style="color:var(--text-muted);font-size:var(--text-sm)"> → ${formatCurrency(p.convertedAmount)}</span>` : ''}
              </div>
              <div class="proof-meta">${p.credentialValue || ''} &bull; ${formatDate(p.createdAt)}</div>
              ${p.giftCardType ? `<div class="proof-meta" style="margin-top:4px"><i class="fas fa-gift" style="margin-right:4px"></i>${p.giftCardType}</div>` : ''}
              ${p.note ? `<div class="proof-meta" style="margin-top:4px"><i class="fas fa-comment" style="margin-right:4px"></i>${p.note}</div>` : ''}
              ${p.adminNote ? `<div class="proof-meta" style="color:var(--danger);margin-top:4px"><i class="fas fa-sticky-note" style="margin-right:4px"></i>${p.adminNote}</div>` : ''}
            </div>
            <span class="badge badge-${statusColors[p.status] || 'neutral'} proof-status-badge">${p.status}</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Proofs error:', error);
  }
}
