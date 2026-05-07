const validateCurrency = (currency, fieldName = 'currency') => {
  if (!currency) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof currency !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  const clean = currency.trim().toUpperCase();
  if (clean.length < 2 || clean.length > 5) {
    throw new Error(`${fieldName} must be a valid 2-5 character currency code`);
  }
  return clean;
};

const validateAmount = (amount, fieldName = 'amount') => {
  const num = parseFloat(amount);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (num <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return num;
};

const safeToUpperCase = (value, fallback = '') => {
  if (!value || typeof value !== 'string') return fallback;
  return value.trim().toUpperCase();
};

module.exports = { validateCurrency, validateAmount, safeToUpperCase };
