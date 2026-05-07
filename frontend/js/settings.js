async function initSettingsPage() {
  await loadProfile();
  await loadBankDetailsSettings();
  await loadNotificationPreferences();
  
  document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
  document.getElementById('bankForm')?.addEventListener('submit', handleBankUpdate);
  document.getElementById('passwordForm')?.addEventListener('submit', handlePasswordUpdate);
  document.getElementById('notifForm')?.addEventListener('submit', handleNotifUpdate);
}

async function loadProfile() {
  try {
    const res = await api.getMe();
    const user = res.data;
    document.getElementById('fullName').value = user.fullName || '';
    document.getElementById('phoneNumber').value = user.phoneNumber || '';
    document.getElementById('country').value = user.country || 'Nigeria';
  } catch (error) {
    console.error('Profile load error:', error);
  }
}

async function loadBankDetailsSettings() {
  try {
    const res = await api.getBankDetails();
    const bank = res.data;
    if (bank) {
      document.getElementById('bankName').value = bank.bankName || '';
      document.getElementById('accountName').value = bank.accountName || '';
      document.getElementById('accountNumber').value = bank.accountNumber || '';
      document.getElementById('bankCountry').value = bank.country || 'Nigeria';
      document.getElementById('bankCurrency').value = bank.currency || 'NGN';
    }
  } catch (error) {
    console.error('Bank details load error:', error);
  }
}

async function loadNotificationPreferences() {
  try {
    const res = await api.getMe();
    const prefs = res.data?.notificationPreferences || {};
    document.getElementById('emailNotif').checked = prefs.email !== false;
    document.getElementById('withdrawalNotif').checked = prefs.withdrawalUpdates !== false;
    document.getElementById('balanceNotif').checked = prefs.balanceUpdates !== false;
    document.getElementById('systemNotif').checked = prefs.systemUpdates !== false;
  } catch (error) {
    console.error('Notification prefs error:', error);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('profileBtn');
  setLoading(btn, true);
  
  try {
    await api.updateProfile({
      fullName: document.getElementById('fullName').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      country: document.getElementById('country').value
    });
    showAlert('profileAlert', 'Profile updated successfully!', 'success');
    const user = getUser();
    if (user) {
      user.fullName = document.getElementById('fullName').value.trim();
      localStorage.setItem('user', JSON.stringify(user));
      updateUserHeader();
    }
  } catch (error) {
    showAlert('profileAlert', error.message || 'Update failed', 'danger');
  } finally {
    setLoading(btn, false);
  }
}

async function handleBankUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('bankBtn');
  setLoading(btn, true);
  
  try {
    await api.updateBankDetails({
      bankName: document.getElementById('bankName').value.trim(),
      accountName: document.getElementById('accountName').value.trim(),
      accountNumber: document.getElementById('accountNumber').value.trim(),
      country: document.getElementById('bankCountry').value.trim(),
      currency: document.getElementById('bankCurrency').value
    });
    showAlert('bankAlert', 'Bank details saved successfully!', 'success');
  } catch (error) {
    showAlert('bankAlert', error.message || 'Failed to save bank details', 'danger');
  } finally {
    setLoading(btn, false);
  }
}

async function handlePasswordUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('passwordBtn');
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (newPassword.length < 6) {
    showAlert('securityAlert', 'New password must be at least 6 characters', 'warning');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showAlert('securityAlert', 'Passwords do not match', 'danger');
    return;
  }
  
  setLoading(btn, true);
  
  try {
    await api.updatePassword(currentPassword, newPassword);
    showAlert('securityAlert', 'Password updated successfully!', 'success');
    document.getElementById('passwordForm').reset();
  } catch (error) {
    showAlert('securityAlert', error.message || 'Password update failed', 'danger');
  } finally {
    setLoading(btn, false);
  }
}

async function handleNotifUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('notifBtn');
  setLoading(btn, true);
  
  try {
    await api.updateNotificationPreferences({
      email: document.getElementById('emailNotif').checked,
      withdrawalUpdates: document.getElementById('withdrawalNotif').checked,
      balanceUpdates: document.getElementById('balanceNotif').checked,
      systemUpdates: document.getElementById('systemNotif').checked
    });
    showAlert('notifAlert', 'Notification preferences saved!', 'success');
  } catch (error) {
    showAlert('notifAlert', error.message || 'Failed to save preferences', 'danger');
  } finally {
    setLoading(btn, false);
  }
}
