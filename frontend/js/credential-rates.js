/**
 * Credential Rates Module
 * Fetches service rates from the backend and displays them on credential cards
 * Each service has a rate set by the admin (e.g., Cash App = 1500 NGN per unit)
 */

let _cachedRates = null;
let _ratesPromise = null;
const CACHE_DURATION = 60000; // 1 minute

const currencySymbols = {
  USD: '$',
  GBP: '\u00A3',
  EUR: '\u20AC',
  NGN: '\u20A6'
};

/**
 * Fetch all service rates from backend
 */
async function fetchAllRates() {
  if (_cachedRates) return _cachedRates;
  if (_ratesPromise) return _ratesPromise;

  _ratesPromise = api.getExchangeRates()
    .then(res => {
      const ratesArray = res.data || [];
      const ratesMap = {};
      for (const s of ratesArray) {
        ratesMap[s.serviceId || s.name] = {
          serviceId: s.serviceId,
          name: s.name,
          displayName: s.displayName,
          icon: s.icon,
          color: s.color,
          rate: s.rate,
          hasRate: s.hasRate
        };
      }
      _cachedRates = ratesMap;
      setTimeout(() => { _cachedRates = null; }, CACHE_DURATION);
      return ratesMap;
    })
    .catch(err => {
      console.error('Failed to fetch service rates:', err);
      _ratesPromise = null;
      return {};
    });

  return _ratesPromise;
}

/**
 * Get rate for a specific service
 */
function getServiceRate(serviceName) {
  if (!_cachedRates) return null;
  // Match by name (case-insensitive)
  const key = Object.keys(_cachedRates).find(
    k => k.toLowerCase() === (serviceName || '').toLowerCase()
  );
  return key ? _cachedRates[key] : null;
}

/**
 * Format rate display string
 */
function formatRate(rate, displayName) {
  if (!rate || rate <= 0) return 'Rate not set';
  return `\u20A6${parseFloat(rate).toLocaleString('en-NG')}/${displayName || 'unit'}`;
}

/**
 * Generate exchange rate HTML badge for credential cards
 */
function createRateBadgeHTML(serviceName) {
  const serviceData = getServiceRate(serviceName);
  const hasRate = serviceData && serviceData.hasRate;
  const rateText = hasRate
    ? formatRate(serviceData.rate, serviceData.displayName || serviceName)
    : 'Rate not set';

  return `
    <div class="cred-rate-badge ${hasRate ? 'has-rate' : 'no-rate'}" data-service="${serviceName || ''}">
      <div class="cred-rate-icon"><i class="fas fa-chart-line"></i></div>
      <div class="cred-rate-info">
        <div class="cred-rate-label">Service Rate</div>
        <div class="cred-rate-value">${rateText}</div>
      </div>
    </div>
  `;
}

/**
 * Update all rate badges on the page
 */
function updateAllRateBadges() {
  document.querySelectorAll('.cred-rate-badge[data-service]').forEach(badge => {
    const serviceName = badge.dataset.service;
    const serviceData = getServiceRate(serviceName);
    const rateValue = badge.querySelector('.cred-rate-value');
    if (rateValue && serviceData) {
      if (serviceData.hasRate) {
        rateValue.textContent = formatRate(serviceData.rate, serviceData.displayName || serviceName);
        badge.classList.add('has-rate');
        badge.classList.remove('no-rate');
      } else {
        rateValue.textContent = 'Rate not set';
        badge.classList.remove('has-rate');
        badge.classList.add('no-rate');
      }
    }
  });
}

/**
 * Convert amount to NGN using service rate
 */
function convertToNGNPreview(amount, serviceName) {
  const serviceData = getServiceRate(serviceName);
  if (!serviceData || !serviceData.rate || !amount) return null;
  return Math.round(parseFloat(amount) * serviceData.rate);
}

/**
 * Initialize: preload rates for instant display
 */
async function preloadRates() {
  return fetchAllRates();
}
