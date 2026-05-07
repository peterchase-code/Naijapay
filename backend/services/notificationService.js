const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');

/**
 * Centralized notification service.
 * Creates in-app notification + fires email (fire-and-forget).
 * Never throws - always swallows email errors.
 */

// ─── User In-App + Email ─────────────────────────

const notifyUser = async (userId, title, message, type = 'system') => {
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (err) {
    console.error('[NotifyUser] DB error:', err.message);
  }
};

// ─── Withdrawal Notifications ────────────────────

const withdrawalRequested = async (userId, amount, bankDetails) => {
  await notifyUser(userId, 'Withdrawal Requested',
    `Your withdrawal request of NGN ${amount.toLocaleString('en-NG')} has been submitted and is pending approval.`, 'withdrawal');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendWithdrawalRequestConfirmation(user.email, user.fullName, amount);
  } catch (_) { /* silent */ }
};

const withdrawalApproved = async (userId, amount) => {
  await notifyUser(userId, 'Withdrawal Approved',
    `Your withdrawal of NGN ${amount.toLocaleString('en-NG')} has been approved and payment is being processed.`, 'withdrawal');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendWithdrawalApproved(user.email, user.fullName, amount);
  } catch (_) { /* silent */ }
};

const withdrawalRejected = async (userId, amount, reason) => {
  await notifyUser(userId, 'Withdrawal Rejected',
    `Your withdrawal of NGN ${amount.toLocaleString('en-NG')} was rejected. ${reason || 'Contact support.'}`, 'withdrawal');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendWithdrawalRejected(user.email, user.fullName, amount, reason);
  } catch (_) { /* silent */ }
};

// ─── Payment Proof Notifications ─────────────────

const paymentProofSubmitted = async (userId, serviceName, amount, currency) => {
  await notifyUser(userId, 'Payment Proof Submitted',
    `Your payment proof for ${serviceName} has been submitted and is pending review.`, 'system');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendPaymentProofSubmittedUser(user.email, user.fullName, serviceName, amount, currency);
  } catch (_) { /* silent */ }
};

const paymentProofApproved = async (userId, originalAmount, originalCurrency, ngnAmount, newBalance, serviceName) => {
  await notifyUser(userId, 'Payment Verified',
    `Your payment of ${originalCurrency} ${originalAmount} (NGN ${ngnAmount.toLocaleString('en-NG')}) has been verified and added to your balance.`, 'balance');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendPaymentProofApproved(user.email, user.fullName, originalAmount, originalCurrency, ngnAmount, newBalance, serviceName);
  } catch (_) { /* silent */ }
};

const paymentProofRejected = async (userId, serviceName, reason) => {
  await notifyUser(userId, 'Payment Rejected',
    `Your payment proof for ${serviceName} was rejected. ${reason || 'Contact support for details.'}`, 'system');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendPaymentProofRejected(user.email, user.fullName, serviceName, reason);
  } catch (_) { /* silent */ }
};

// ─── Wallet / Transaction Notifications ──────────

const walletCredited = async (userId, amount, description, newBalance) => {
  await notifyUser(userId, 'Wallet Credited',
    `NGN ${amount.toLocaleString('en-NG')} has been credited to your wallet. ${description}`, 'balance');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendWalletCredited(user.email, user.fullName, amount, description, newBalance);
  } catch (_) { /* silent */ }
};

// ─── Credential Notifications ────────────────────

const credentialAssigned = async (userId, serviceName, credentialValue) => {
  await notifyUser(userId, 'Credential Assigned',
    `A new ${serviceName} credential has been assigned to your account.`, 'system');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendCredentialAssigned(user.email, user.fullName, serviceName, credentialValue);
  } catch (_) { /* silent */ }
};

// ─── Admin Notifications ─────────────────────────

const alertAdminNewUser = async (userName, userEmail, userPhone) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    for (const admin of admins) {
      emailService.sendAdminAlertNewUser(admin.email, userName, userEmail, userPhone);
    }
  } catch (_) { /* silent */ }
};

const alertAdminNewWithdrawal = async (userName, userEmail, amount) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    for (const admin of admins) {
      emailService.sendWithdrawalRequestAlertToAdmin(admin.email, userName, userEmail, amount);
    }
  } catch (_) { /* silent */ }
};

const alertAdminNewPaymentProof = async (userName, userEmail, serviceName, amount, currency) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('email');
    for (const admin of admins) {
      emailService.sendPaymentProofSubmittedAdmin(admin.email, userName, userEmail, serviceName, amount, currency);
    }
  } catch (_) { /* silent */ }
};

const welcomeUser = async (userId, fullName) => {
  await notifyUser(userId, 'Welcome to NigeriaPay!',
    'Your account has been created successfully. Save your bank details and start receiving payments from the USA.', 'system');

  try {
    const user = await User.findById(userId).select('fullName email');
    if (!user) return;
    emailService.sendWelcomeEmail(user.email, user.fullName);
  } catch (_) { /* silent */ }
};

const broadcastMessage = async (title, message, target = 'all') => {
  // Find target users
  let query = {};
  if (target === 'users_only') query = { role: 'user' };
  if (target === 'admins_only') query = { role: 'admin' };

  const users = await User.find(query).select('_id fullName email');

  // Create in-app notifications for all
  const notifications = users.map(u => ({
    user: u._id,
    title,
    message,
    type: 'system'
  }));

  // Batch insert notifications
  try {
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error('[Broadcast] Notification insert error:', err.message);
  }

  // Send emails in batches (fire-and-forget)
  let sentCount = 0;
  for (const u of users) {
    try {
      emailService.sendBroadcastEmail(u.email, u.fullName, title, message);
      sentCount++;
    } catch (_) { /* silent */ }
  }

  return {
    notifiedCount: users.length,
    emailCount: sentCount
  };
};

module.exports = {
  notifyUser,
  // Withdrawal
  withdrawalRequested,
  withdrawalApproved,
  withdrawalRejected,
  // Payment proof
  paymentProofSubmitted,
  paymentProofApproved,
  paymentProofRejected,
  // Wallet
  walletCredited,
  // Credential
  credentialAssigned,
  // Welcome
  welcomeUser,
  // Broadcast
  broadcastMessage,
  // Admin alerts
  alertAdminNewUser,
  alertAdminNewWithdrawal,
  alertAdminNewPaymentProof
};
