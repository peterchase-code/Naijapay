/**
 * Live Currency Converter Module
 * Provides real-time NGN conversion preview on payment proof form
 * Uses per-service rates set by the admin
 */

let _serviceRates = {};  // Keyed by serviceId for reliable lookup
let _ratesLoaded = false;
let _debounceTimer = null;

/**
 * Initialize the live converter on the payment proof form
 */
function initLiveConverter() {
  insertPreviewContainer();
  insertRateInfo();
  preloadRatesForConverter();

  const amountInput = document.getElementById('proofAmount');
  const credentialSelect = document.getElementById('credentialSelect');

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => updateConversionPreview(), 80);
    });
  }

  if (credentialSelect) {
    credentialSelect.addEventListener('change', () => {
      updateConversionPreview();
      updateRateInfo();
    });
  }
}

/**
 * Insert the conversion preview container directly after the amount input
 */
function insertPreviewContainer() {
  const amountInput = document.getElementById('proofAmount');
  if (!amountInput || document.getElementById('conversionPreview')) return;

  const previewHTML = `
    <div id="conversionPreview" class="conversion-preview" style="display:none">
      <div class="conversion-preview-inner">
        <div class="conversion-row">
          <span class="conversion-original" id="previewOriginal">--</span>
          <span class="conversion-multiply">\u00D7</span>
          <span class="conversion-rate" id="previewRate">--</span>
          <span class="conversion-equals">=</span>
          <span class="conversion-result" id="previewResult">--</span>
        </div>
        <div class="conversion-note" id="previewNote">Estimated NGN amount based on service rate.</div>
      </div>
    </div>
  `;
  amountInput.insertAdjacentHTML('afterend', previewHTML);
}

/**
 * Insert rate info display after currency select
 */
function insertRateInfo() {
  const currencySelect = document.getElementById('currencySelect');
  if (!currencySelect || document.getElementById('rateInfoBadge')) return;

  const rateInfoHTML = `
    <div id="rateInfoBadge" class="rate-info-badge" style="display:none">
      <i class="fas fa-sync-alt"></i>
      <span id="rateInfoText">Loading service rates...</span>
    </div>
  `;
  const parent = currencySelect.closest('.form-group');
  if (parent) parent.insertAdjacentHTML('beforeend', rateInfoHTML);
}

/**
 * Preload service rates from backend.
 * Keys the cache by serviceId (not name) for reliable lookup.
 */
async function preloadRatesForConverter() {
  try {
    const res = await api.getExchangeRates();
    const services = res.data || [];
    for (const s of services) {
      // Key by serviceId so we can match via data-service attribute
      const key = s.serviceId || s.name;
      _serviceRates[key] = {
        serviceId: s.serviceId,
        name: s.name,
        displayName: s.displayName || s.name,
        rate: s.rate,
        hasRate: s.hasRate
      };
    }
    _ratesLoaded = true;
    updateRateInfo();
    const amountInput = document.getElementById('proofAmount');
    if (amountInput && amountInput.value) updateConversionPreview();
  } catch (err) {
    console.error('Failed to preload service rates:', err);
    _ratesLoaded = false;
    const badge = document.getElementById('rateInfoBadge');
    const text = document.getElementById('rateInfoText');
    if (badge && text) {
      text.textContent = 'Rates unavailable - admin has not set rates';
      badge.style.display = 'flex';
      badge.classList.remove('active');
    }
  }
}

/**
 * Get the selected credential's service ID from the dropdown.
 * The option's data-service attribute holds the service ObjectId.
 */
function getSelectedServiceId() {
  const credentialSelect = document.getElementById('credentialSelect');
  if (!credentialSelect || !credentialSelect.value) return null;
  const option = credentialSelect.options[credentialSelect.selectedIndex];
  return option?.dataset?.service || null;
}

/**
 * Get rate data for the selected credential's service.
 * Looks up by serviceId (not display name) for reliable matching.
 */
function getSelectedServiceRate() {
  const serviceId = getSelectedServiceId();
  if (!serviceId || !_serviceRates[serviceId]) return null;
  return _serviceRates[serviceId];
}

/**
 * Update the conversion preview display beneath the amount input
 */
function updateConversionPreview() {
  const amountInput = document.getElementById('proofAmount');
  const preview = document.getElementById('conversionPreview');

  if (!amountInput || !preview) return;

  const amount = parseFloat(amountInput.value);

  // Hide if no amount entered
  if (!amount || amount <= 0) {
    preview.style.display = 'none';
    return;
  }

  // If no credential selected
  const credentialSelect = document.getElementById('credentialSelect');
  if (!credentialSelect || !credentialSelect.value) {
    preview.style.display = 'block';
    document.getElementById('previewOriginal').textContent = amount.toLocaleString('en-US');
    document.getElementById('previewRate').textContent = 'N/A';
    document.getElementById('previewResult').textContent = 'Select a credential';
    document.getElementById('previewNote').textContent = 'Please select a credential to see the conversion.';
    return;
  }

  // If rates haven't loaded yet
  if (!_ratesLoaded) {
    preview.style.display = 'block';
    document.getElementById('previewOriginal').textContent = amount.toLocaleString('en-US');
    document.getElementById('previewRate').textContent = '...';
    document.getElementById('previewResult').textContent = 'Loading rates...';
    document.getElementById('previewNote').textContent = 'Fetching service rate...';
    return;
  }

  const serviceData = getSelectedServiceRate();

  // Credential selected but service not found in rates
  if (!serviceData) {
    preview.style.display = 'block';
    document.getElementById('previewOriginal').textContent = amount.toLocaleString('en-US');
    document.getElementById('previewRate').textContent = 'N/A';
    document.getElementById('previewResult').textContent = 'Rate not found';
    document.getElementById('previewNote').textContent = 'Service rate data missing. Contact admin.';
    return;
  }

  if (!serviceData.hasRate) {
    preview.style.display = 'block';
    document.getElementById('previewOriginal').textContent = amount.toLocaleString('en-US');
    document.getElementById('previewRate').textContent = 'Not set';
    document.getElementById('previewResult').textContent = 'Rate unavailable';
    document.getElementById('previewNote').textContent = `Rate for ${serviceData.displayName} has not been set by admin yet.`;
    return;
  }

  // SUCCESS: Show conversion
  const converted = Math.round(amount * serviceData.rate);

  document.getElementById('previewOriginal').textContent = amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  document.getElementById('previewRate').textContent = `\u20A6${serviceData.rate.toLocaleString('en-NG')}`;
  document.getElementById('previewResult').textContent = `\u20A6${converted.toLocaleString('en-NG')}`;
  document.getElementById('previewNote').textContent = `Rate: \u20A6${serviceData.rate.toLocaleString('en-NG')} per unit for ${serviceData.displayName}. Final amount set by admin during review.`;

  preview.style.display = 'block';
}

/**
 * Update the rate info badge below currency select
 */
function updateRateInfo() {
  const badge = document.getElementById('rateInfoBadge');
  const text = document.getElementById('rateInfoText');
  if (!badge || !text) return;

  if (!_ratesLoaded) {
    badge.style.display = 'flex';
    text.textContent = 'Loading service rates...';
    badge.classList.remove('active');
    return;
  }

  const credentialSelect = document.getElementById('credentialSelect');
  if (!credentialSelect || !credentialSelect.value) {
    badge.style.display = 'flex';
    text.textContent = 'Select a credential to see rate';
    badge.classList.remove('active');
    return;
  }

  const serviceData = getSelectedServiceRate();

  if (serviceData && serviceData.hasRate) {
    text.textContent = `Rate: \u20A6${serviceData.rate.toLocaleString('en-NG')} / ${serviceData.displayName}`;
    badge.classList.add('active');
  } else if (serviceData) {
    text.textContent = `Rate not set for ${serviceData.displayName}`;
    badge.classList.remove('active');
  } else {
    text.textContent = 'Service rate data unavailable';
    badge.classList.remove('active');
  }
  badge.style.display = 'flex';
}
