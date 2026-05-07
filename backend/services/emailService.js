const { createTransporter } = require('../config/mail');
const { getResetPasswordTemplate } = require('../templates/resetPasswordTemplate');
const templates = require('../templates/notificationTemplates');

/**
 * Send an email using the configured SMTP transporter
 * @param {Object} options - Email options (to, subject, text, html)
 * @returns {Promise<Object|null>} - Nodemailer info object or null on error
 */
const sendEmail = async (options) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP not configured. Would send to:', options.to, '| Subject:', options.subject);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] ========== CONTENT ==========');
      console.log('  To:', options.to);
      console.log('  Subject:', options.subject);
      console.log('  Text:', options.text || '(no text content)');
      console.log('=====================================');
      return { messageId: 'dev-mode', preview: true };
    }
    return null;
  }

  try {
    const transporter = createTransporter();
    const message = {
      from: `${process.env.FROM_NAME || 'NigeriaPay'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    const info = await transporter.sendMail(message);
    console.log('[Email] Sent to', options.to, '| MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Email] Failed to send to', options.to, ':', error.message);
    if (process.env.NODE_ENV === 'development') console.error('[Email] Full error:', error);
    return null;
  }
};

/**
 * Fire-and-forget helper: triggers email without blocking or crashing
 * Use this for all non-critical notification emails.
 */
const sendEmailAsync = (options) => {
  sendEmail(options).catch(err => console.error('[EmailAsync] Unhandled:', err.message));
};

// ─── Password Reset ──────────────────────────────

const sendPasswordResetEmail = async (email, resetUrl, expiryMinutes = 60) => {
  return sendEmail({
    to: email,
    subject: 'NigeriaPay - Reset Your Password',
    text: `You requested a password reset. Click this link (expires in ${expiryMinutes} minutes): ${resetUrl}`,
    html: getResetPasswordTemplate(resetUrl, expiryMinutes)
  });
};

// ─── Withdrawal Emails ───────────────────────────

const sendWithdrawalRequestConfirmation = (userEmail, userName, amount) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Withdrawal Request Received',
    text: `Hi ${userName}, your withdrawal request of NGN ${amount} has been received and is under review.`,
    html: templates.withdrawalRequestUser(userName, amount)
  });
};

const sendWithdrawalRequestAlertToAdmin = (adminEmail, userName, userEmail, amount) => {
  sendEmailAsync({
    to: adminEmail,
    subject: '[Admin] New Withdrawal Request - NigeriaPay',
    text: `New withdrawal: ${userName} (${userEmail}) requested NGN ${amount}.`,
    html: templates.withdrawalRequestAdmin(userName, userEmail, amount)
  });
};

const sendWithdrawalApproved = (userEmail, userName, amount) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Withdrawal Approved',
    text: `Hi ${userName}, your withdrawal of NGN ${amount} has been approved and is being processed.`,
    html: templates.withdrawalApproved(userName, amount)
  });
};

const sendWithdrawalRejected = (userEmail, userName, amount, reason) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Withdrawal Request Rejected',
    text: `Hi ${userName}, your withdrawal of NGN ${amount} was rejected. ${reason || ''}`,
    html: templates.withdrawalRejected(userName, amount, reason)
  });
};

// ─── Payment Proof Emails ────────────────────────

const sendPaymentProofSubmittedUser = (userEmail, userName, serviceName, amount, currency) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Payment Proof Submitted',
    text: `Hi ${userName}, your payment proof for ${serviceName} (${currency} ${amount}) has been submitted and is pending review.`,
    html: templates.paymentProofSubmittedUser(userName, serviceName, amount, currency)
  });
};

const sendPaymentProofSubmittedAdmin = (adminEmail, userName, userEmail, serviceName, amount, currency) => {
  sendEmailAsync({
    to: adminEmail,
    subject: '[Admin] New Payment Proof - NigeriaPay',
    text: `${userName} (${userEmail}) submitted a payment proof for ${serviceName}: ${currency} ${amount}.`,
    html: templates.paymentProofSubmittedAdmin(userName, userEmail, serviceName, amount, currency)
  });
};

const sendPaymentProofApproved = (userEmail, userName, originalAmount, originalCurrency, ngnAmount, newBalance, serviceName) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Payment Proof Approved',
    text: `Hi ${userName}, your payment proof has been approved. ${originalCurrency} ${originalAmount} = NGN ${ngnAmount} credited to your wallet.`,
    html: templates.paymentProofApproved(userName, originalAmount, originalCurrency, ngnAmount, newBalance, serviceName)
  });
};

const sendPaymentProofRejected = (userEmail, userName, serviceName, reason) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Payment Proof Not Approved',
    text: `Hi ${userName}, your payment proof for ${serviceName} was rejected. ${reason || ''}`,
    html: templates.paymentProofRejected(userName, serviceName, reason)
  });
};

// ─── Transaction Emails ──────────────────────────

const sendWalletCredited = (userEmail, userName, amount, description, newBalance) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Wallet Credited',
    text: `Hi ${userName}, your wallet has been credited with NGN ${amount}. New balance: NGN ${newBalance}.`,
    html: templates.walletCredited(userName, amount, description, newBalance)
  });
};

const sendTransactionNotification = (userEmail, userName, type, amount, description, status) => {
  sendEmailAsync({
    to: userEmail,
    subject: `NigeriaPay - Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    text: `Hi ${userName}, your ${type} of NGN ${amount} is now ${status}.`,
    html: templates.transactionNotification(userName, type, amount, description, status)
  });
};

// ─── Credential Emails ───────────────────────────

const sendCredentialAssigned = (userEmail, userName, serviceName, credentialValue) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - New Payment Credential Assigned',
    text: `Hi ${userName}, a ${serviceName} credential has been assigned to your account: ${credentialValue}.`,
    html: templates.credentialAssigned(userName, serviceName, credentialValue)
  });
};

// ─── Admin Alert Emails ──────────────────────────

const sendAdminAlertNewUser = (adminEmail, userName, userEmail, userPhone) => {
  sendEmailAsync({
    to: adminEmail,
    subject: '[Admin] New User Registration - NigeriaPay',
    text: `New user registered: ${userName} (${userEmail}, ${userPhone}).`,
    html: templates.adminAlertNewUser(userName, userEmail, userPhone)
  });
};

// ─── Password Reset Success ──────────────────────

const sendPasswordResetSuccess = (userEmail, userName) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'NigeriaPay - Password Reset Successful',
    text: `Hi ${userName}, your password has been successfully reset. If you didn't do this, contact support immediately.`,
    html: templates.passwordResetSuccess(userName)
  });
};

const sendWelcomeEmail = (userEmail, userName) => {
  sendEmailAsync({
    to: userEmail,
    subject: 'Welcome to NigeriaPay!',
    text: `Hi ${userName}, welcome to NigeriaPay! Your account is ready. Save your bank details and start receiving payments from the USA.`,
    html: templates.welcomeEmail(userName)
  });
};

const sendBroadcastEmail = (userEmail, userName, subject, message) => {
  sendEmailAsync({
    to: userEmail,
    subject: `NigeriaPay - ${subject}`,
    text: `Hi ${userName},\n\n${message}\n\n- NigeriaPay Team`,
    html: templates.broadcastEmail(userName, subject, message)
  });
};

module.exports = {
  // Core
  sendEmail,
  sendEmailAsync,
  // Password reset
  sendPasswordResetEmail,
  sendPasswordResetSuccess,
  // Withdrawal
  sendWithdrawalRequestConfirmation,
  sendWithdrawalRequestAlertToAdmin,
  sendWithdrawalApproved,
  sendWithdrawalRejected,
  // Payment proof
  sendPaymentProofSubmittedUser,
  sendPaymentProofSubmittedAdmin,
  sendPaymentProofApproved,
  sendPaymentProofRejected,
  // Transaction
  sendWalletCredited,
  sendTransactionNotification,
  // Credential
  sendCredentialAssigned,
  // Welcome
  sendWelcomeEmail,
  // Broadcast
  sendBroadcastEmail,
  // Admin
  sendAdminAlertNewUser
};
