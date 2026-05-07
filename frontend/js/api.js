/**
 * Dynamic API Base URL
 * Detects the current host:port so it works from:
 * - localhost (dev)
 * - 192.168.x.x (local network)
 * - Any IP on same Wi-Fi (mobile phones, tablets)
 * - Production domain
 *
 * Usage: Set window.API_HOST in your HTML if backend is on a different host.
 * Example for phone testing: <script>window.API_HOST = 'http://192.168.1.5:5000';</script>
 */
const API_BASE_URL = (typeof window !== 'undefined' && window.API_HOST)
  ? `${window.API_HOST}/api`
  : `http://${window.location.hostname || 'localhost'}:5000/api`;

class API {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}, json = true) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    // For FormData (file uploads), let browser set Content-Type
    if (!json && options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  login(login, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updatePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  forgotPassword(email, frontendUrl) {
    return this.request('/password-reset/forgot', {
      method: 'POST',
      body: JSON.stringify({ email, frontendUrl })
    });
  }

  verifyResetToken(token, email) {
    return this.request(`/password-reset/verify?token=${token}&email=${encodeURIComponent(email)}`);
  }

  resetPassword(token, email, newPassword) {
    return this.request('/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify({ token, email, password: newPassword })
    });
  }

  // Broadcasts (admin only)
  createBroadcast(title, message, target = 'all') {
    return this.request('/broadcasts', {
      method: 'POST',
      body: JSON.stringify({ title, message, target })
    });
  }

  getBroadcasts(page = 1, limit = 20) {
    return this.request(`/broadcasts?page=${page}&limit=${limit}`);
  }

  getBroadcast(id) {
    return this.request(`/broadcasts/${id}`);
  }

  deleteBroadcast(id) {
    return this.request(`/broadcasts/${id}`, { method: 'DELETE' });
  }

  // Currency / Service Rates
  getExchangeRates() {
    return this.request('/currency/rates');
  }

  getServiceRate(serviceId) {
    return this.request(`/currency/rates/${serviceId}`);
  }

  convertCurrency(amount, serviceId) {
    return this.request('/currency/convert', {
      method: 'POST',
      body: JSON.stringify({ amount, serviceId })
    });
  }

  // Admin - Service Rates
  setServiceRate(serviceId, rate) {
    return this.request('/currency/rates', {
      method: 'PUT',
      body: JSON.stringify({ serviceId, rate })
    });
  }

  // Gift Cards
  getGiftCards() {
    return this.request('/gift-cards');
  }

  // User
  updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  updateBankDetails(bankDetails) {
    return this.request('/users/bank-details', {
      method: 'PUT',
      body: JSON.stringify(bankDetails)
    });
  }

  getBankDetails() {
    return this.request('/users/bank-details');
  }

  updateNotificationPreferences(prefs) {
    return this.request('/users/notifications', {
      method: 'PUT',
      body: JSON.stringify(prefs)
    });
  }

  getMyCredentials() {
    return this.request('/users/credentials');
  }

  // Transactions
  getMyTransactions(type, status, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    return this.request(`/transactions/my?${params}`);
  }

  // Withdrawals
  createWithdrawal(data) {
    return this.request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getMyWithdrawals(page = 1, limit = 20) {
    return this.request(`/withdrawals/my?page=${page}&limit=${limit}`);
  }

  // Notifications
  getNotifications(unreadOnly = false, page = 1, limit = 20) {
    return this.request(`/notifications?unreadOnly=${unreadOnly}&page=${page}&limit=${limit}`);
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  deleteNotification(id) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // Referrals
  getMyReferrals() {
    return this.request('/referrals/my');
  }

  // Payment Proofs
  uploadPaymentProof(formData) {
    return this.request('/payment-proofs', {
      method: 'POST',
      body: formData
    }, false);
  }

  getMyPaymentProofs(page = 1, limit = 20) {
    return this.request(`/payment-proofs/my?page=${page}&limit=${limit}`);
  }

  getAllPaymentProofs(status = '', page = 1, limit = 20) {
    return this.request(`/payment-proofs/all?status=${status}&page=${page}&limit=${limit}`);
  }

  updateProofStatus(id, status, note) {
    return this.request(`/payment-proofs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    });
  }

  // Settings (public)
  getPublicSettings() {
    return this.request('/settings/public');
  }

  // Services
  getServices() {
    return this.request('/services');
  }

  // Admin
  getAdminStats() {
    return this.request('/admin/dashboard');
  }

  getAdminUsers(query = '') {
    return this.request(`/admin/users?${query}`);
  }

  getAdminUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  updateAdminUser(id, data) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  banUser(id) {
    return this.request(`/admin/users/${id}/ban`, { method: 'PUT' });
  }

  unbanUser(id) {
    return this.request(`/admin/users/${id}/unban`, { method: 'PUT' });
  }

  adjustBalance(id, amount, type, reason) {
    return this.request(`/admin/users/${id}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ amount, type, reason })
    });
  }

  getAllWithdrawals(query = '') {
    return this.request(`/withdrawals/all?${query}`);
  }

  updateWithdrawalStatus(id, status, note) {
    return this.request(`/withdrawals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    });
  }

  getAllTransactions(query = '') {
    return this.request(`/transactions/all?${query}`);
  }

  confirmDeposit(id) {
    return this.request(`/transactions/${id}/confirm`, { method: 'PUT' });
  }

  getAllCredentials(query = '') {
    return this.request(`/credentials?${query}`);
  }

  createCredential(data) {
    return this.request('/credentials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateCredential(id, data) {
    return this.request(`/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  assignCredential(id, userId) {
    return this.request(`/credentials/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ userId })
    });
  }

  unassignCredential(id) {
    return this.request(`/credentials/${id}/unassign`, { method: 'PUT' });
  }

  deleteCredential(id) {
    return this.request(`/credentials/${id}`, { method: 'DELETE' });
  }

  assignBulkCredentials(credentialId, userIds) {
    return this.request('/credentials/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ credentialId, userIds })
    });
  }

  getAllServices() {
    return this.request('/services');
  }

  createService(data) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateService(id, data) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteService(id) {
    return this.request(`/services/${id}`, { method: 'DELETE' });
  }

  toggleService(id) {
    return this.request(`/services/${id}/toggle`, { method: 'PUT' });
  }

  getAllReferrals() {
    return this.request('/referrals/all');
  }

  getAllSettings() {
    return this.request('/settings');
  }

  updateSetting(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  updateMultipleSettings(settings) {
    return this.request('/settings/batch', {
      method: 'PUT',
      body: JSON.stringify({ settings })
    });
  }
}

const api = new API();
