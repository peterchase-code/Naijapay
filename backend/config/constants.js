module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES || '30d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },
  WITHDRAWAL_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PAID: 'paid',
    REJECTED: 'rejected'
  },
  TRANSACTION_TYPES: {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    REFERRAL_BONUS: 'referral_bonus',
    ADJUSTMENT: 'adjustment'
  },
  DEFAULT_LIMITS: {
    MIN_DEPOSIT: 10,
    MAX_DEPOSIT: 10000,
    MIN_WITHDRAWAL: 10,
    MAX_WITHDRAWAL: 5000
  },
  REFERRAL_COMMISSION: 5
};
