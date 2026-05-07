const { getEmailBase, formatNGN } = require('./emailBaseTemplate');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Withdrawal Emails ────────────────────────────

const withdrawalRequestUser = (userName, amount) => getEmailBase({
  title: 'Withdrawal Request Received',
  headline: 'Withdrawal Request Submitted',
  accentColor: '#2979FF',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your withdrawal request of <strong style="color:#1a1a2e;">${formatNGN(amount)}</strong> has been received and is currently under review.</p>
    <table role="presentation" style="width:100%;background:#f8fafc;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Amount</p>
        <p style="color:#1a1a2e;font-size:18px;font-weight:700;margin:0;font-family:'Courier New',monospace;">${formatNGN(amount)}</p>
      </td></tr>
    </table>
    <p style="margin:0;">We will notify you once the payment has been processed. Processing typically takes 1-2 business days.</p>
  `,
  ctaText: 'View Withdrawals',
  ctaUrl: `${FRONTEND_URL}/withdrawal.html`,
  noteHtml: '<strong>Status:</strong> Pending Review &nbsp;|&nbsp; <strong>Expected:</strong> 1-2 business days'
});

const withdrawalRequestAdmin = (userName, userEmail, amount) => getEmailBase({
  title: 'New Withdrawal Request',
  headline: 'New Withdrawal Request',
  accentColor: '#FF6D00',
  bodyHtml: `
    <p style="margin-bottom:16px;">A new withdrawal request has been submitted and requires your review.</p>
    <table role="presentation" style="width:100%;background:#f8fafc;border-radius:10px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">User</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${userName}</p></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">Email</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${userEmail}</p></td></tr>
      <tr><td style="padding:14px 18px;"><span style="color:#64748b;font-size:12px;">Amount</span><p style="color:#1a1a2e;font-size:18px;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${formatNGN(amount)}</p></td></tr>
    </table>
  `,
  ctaText: 'Review in Admin',
  ctaUrl: `${FRONTEND_URL}/admin-withdrawals.html`
});

const withdrawalApproved = (userName, amount) => getEmailBase({
  title: 'Withdrawal Approved',
  headline: 'Withdrawal Approved',
  accentColor: '#00C853',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your withdrawal request of <strong style="color:#1a1a2e;">${formatNGN(amount)}</strong> has been approved and payment is being processed.</p>
    <table role="presentation" style="width:100%;background:#f0fdf4;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#166534;font-size:12px;margin:0 0 4px;"><i style="font-style:normal;">&#10003;</i> Approved Amount</p>
        <p style="color:#00C853;font-size:22px;font-weight:800;margin:0;font-family:'Courier New',monospace;">${formatNGN(amount)}</p>
      </td></tr>
    </table>
    <p style="margin:0;">The funds will be transferred to your registered bank account within 24 hours.</p>
  `,
  ctaText: 'View Status',
  ctaUrl: `${FRONTEND_URL}/withdrawal.html`,
  noteHtml: '<strong>Status:</strong> Approved & Processing &nbsp;|&nbsp; Funds will reach your bank within 24 hours'
});

const withdrawalRejected = (userName, amount, reason) => getEmailBase({
  title: 'Withdrawal Rejected',
  headline: 'Withdrawal Request Rejected',
  accentColor: '#FF1744',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your withdrawal request of <strong style="color:#1a1a2e;">${formatNGN(amount)}</strong> has been rejected.</p>
    <table role="presentation" style="width:100%;background:#fef2f2;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#991b1b;font-size:12px;margin:0 0 4px;">Rejection Reason</p>
        <p style="color:#FF1744;font-weight:600;margin:0;">${reason || 'No reason provided. Please contact support for details.'}</p>
      </td></tr>
    </table>
    <p style="margin:0;">The amount has been refunded to your wallet balance. You may submit a new withdrawal request at any time.</p>
  `,
  ctaText: 'View Wallet',
  ctaUrl: `${FRONTEND_URL}/dashboard.html`,
  noteHtml: '<strong>Amount refunded to wallet.</strong> Contact support if you need assistance.'
});

// ─── Payment Proof Emails ─────────────────────────

const paymentProofSubmittedUser = (userName, serviceName, amount, currency) => getEmailBase({
  title: 'Payment Proof Submitted',
  headline: 'Payment Proof Received',
  accentColor: '#2979FF',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your payment proof for <strong>${serviceName}</strong> has been submitted successfully and is pending review.</p>
    <table role="presentation" style="width:100%;background:#f8fafc;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">Service</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${serviceName}</p></td></tr>
      <tr><td style="padding:14px 18px;"><span style="color:#64748b;font-size:12px;">Amount Submitted</span><p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${currency} ${amount}</p></td></tr>
    </table>
    <p style="margin:0;">Our team will review your submission and credit your wallet once verified. You will receive an email notification upon approval.</p>
  `,
  ctaText: 'View Submissions',
  ctaUrl: `${FRONTEND_URL}/payment-proof.html`,
  noteHtml: '<strong>Status:</strong> Pending Review &nbsp;|&nbsp; Typical review time: 15 minutes - 2 hours'
});

const paymentProofSubmittedAdmin = (userName, userEmail, serviceName, amount, currency) => getEmailBase({
  title: 'New Payment Proof',
  headline: 'New Payment Proof Upload',
  accentColor: '#FF6D00',
  bodyHtml: `
    <p style="margin-bottom:16px;">A new payment proof has been uploaded and requires your review.</p>
    <table role="presentation" style="width:100%;background:#f8fafc;border-radius:10px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">User</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${userName} &mdash; ${userEmail}</p></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">Service</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${serviceName}</p></td></tr>
      <tr><td style="padding:14px 18px;"><span style="color:#64748b;font-size:12px;">Amount</span><p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${currency} ${amount}</p></td></tr>
    </table>
  `,
  ctaText: 'Review Proof',
  ctaUrl: `${FRONTEND_URL}/admin-payment-proofs.html`
});

const paymentProofApproved = (userName, originalAmount, originalCurrency, ngnAmount, newBalance, serviceName) => getEmailBase({
  title: 'Payment Verified',
  headline: 'Payment Proof Approved',
  accentColor: '#00C853',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your payment proof has been reviewed and <strong style="color:#00C853;">approved</strong>. Your wallet has been credited.</p>
    <table role="presentation" style="width:100%;background:#f0fdf4;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #bbf7d0;">
        <span style="color:#166534;font-size:12px;">Original Amount</span>
        <p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${originalCurrency} ${originalAmount}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid #bbf7d0;">
        <span style="color:#166534;font-size:12px;">Converted to NGN</span>
        <p style="color:#00C853;font-size:20px;font-weight:800;margin:2px 0 0;font-family:'Courier New',monospace;">${formatNGN(ngnAmount)}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;">
        <span style="color:#166534;font-size:12px;">New Wallet Balance</span>
        <p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${formatNGN(newBalance)}</p>
      </td></tr>
    </table>
    <p style="margin:0;">Thank you for using ${serviceName || 'our service'}. You can now withdraw your funds or use them for future transactions.</p>
  `,
  ctaText: 'Go to Dashboard',
  ctaUrl: `${FRONTEND_URL}/dashboard.html`,
  noteHtml: '<strong>&#10003; Wallet credited successfully.</strong> Funds are available for immediate withdrawal.'
});

const paymentProofRejected = (userName, serviceName, reason) => getEmailBase({
  title: 'Payment Proof Rejected',
  headline: 'Payment Proof Not Approved',
  accentColor: '#FF1744',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your submitted payment proof for <strong>${serviceName || 'payment verification'}</strong> was not approved.</p>
    <table role="presentation" style="width:100%;background:#fef2f2;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#991b1b;font-size:12px;margin:0 0 4px;">Reason</p>
        <p style="color:#FF1744;font-weight:600;margin:0;">${reason || 'The submitted proof did not meet our verification requirements.'}</p>
      </td></tr>
    </table>
    <p style="margin:0;">Please upload a clear, valid screenshot showing the complete payment details. If you need help, contact our support team.</p>
  `,
  ctaText: 'Resubmit Proof',
  ctaUrl: `${FRONTEND_URL}/payment-proof.html`,
  noteHtml: 'Make sure the screenshot clearly shows the payment amount, date, and recipient details.'
});

// ─── Transaction Emails ───────────────────────────

const walletCredited = (userName, amount, description, newBalance) => getEmailBase({
  title: 'Wallet Credited',
  headline: 'Funds Added to Your Wallet',
  accentColor: '#00C853',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your NigeriaPay wallet has been credited.</p>
    <table role="presentation" style="width:100%;background:#f0fdf4;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #bbf7d0;">
        <span style="color:#166534;font-size:12px;">Amount Credited</span>
        <p style="color:#00C853;font-size:22px;font-weight:800;margin:2px 0 0;font-family:'Courier New',monospace;">${formatNGN(amount)}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid #bbf7d0;">
        <span style="color:#166534;font-size:12px;">Description</span>
        <p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${description}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;">
        <span style="color:#166534;font-size:12px;">New Balance</span>
        <p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${formatNGN(newBalance)}</p>
      </td></tr>
    </table>
  `,
  ctaText: 'View Wallet',
  ctaUrl: `${FRONTEND_URL}/dashboard.html`,
  noteHtml: 'Funds are available for immediate use or withdrawal.'
});

const transactionNotification = (userName, type, amount, description, status) => {
  const colors = { completed: '#00C853', pending: '#FFB300', failed: '#FF1744' };
  const bgColors = { completed: '#f0fdf4', pending: '#fefce8', failed: '#fef2f2' };
  const c = colors[status] || '#2979FF';
  const bg = bgColors[status] || '#f8fafc';
  return getEmailBase({
    title: 'Transaction Update',
    headline: 'Transaction Notification',
    accentColor: c,
    bodyHtml: `
      <p style="margin-bottom:12px;">Hi ${userName},</p>
      <p style="margin-bottom:16px;">Your transaction has been updated.</p>
      <table role="presentation" style="width:100%;background:${bg};border-radius:10px;margin-bottom:16px;">
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.05);"><span style="color:#64748b;font-size:12px;">Type</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;text-transform:capitalize;">${type}</p></td></tr>
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.05);"><span style="color:#64748b;font-size:12px;">Amount</span><p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;">${formatNGN(amount)}</p></td></tr>
        <tr><td style="padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.05);"><span style="color:#64748b;font-size:12px;">Description</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${description}</p></td></tr>
        <tr><td style="padding:14px 18px;"><span style="color:#64748b;font-size:12px;">Status</span><p style="color:${c};font-weight:700;margin:2px 0 0;text-transform:capitalize;">${status}</p></td></tr>
      </table>
    `,
    ctaText: 'View Transactions',
    ctaUrl: `${FRONTEND_URL}/transactions.html`
  });
};

// ─── Credential Emails ────────────────────────────

const credentialAssigned = (userName, serviceName, credentialValue) => getEmailBase({
  title: 'Credential Assigned',
  headline: 'New Payment Credential Assigned',
  accentColor: '#7C3AED',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">An admin has assigned a new payment credential to your account.</p>
    <table role="presentation" style="width:100%;background:#f5f3ff;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #ddd6fe;">
        <span style="color:#5b21b6;font-size:12px;">Service</span>
        <p style="color:#1a1a2e;font-weight:700;margin:2px 0 0;">${serviceName}</p>
      </td></tr>
      <tr><td style="padding:14px 18px;">
        <span style="color:#5b21b6;font-size:12px;">Your Credential / Tag</span>
        <p style="color:#7C3AED;font-size:16px;font-weight:700;margin:2px 0 0;font-family:'Courier New',monospace;letter-spacing:0.5px;">${credentialValue}</p>
      </td></tr>
    </table>
    <p style="margin:0;">Share this credential with your sender to receive payments. You can now submit payment proofs once payments are made.</p>
  `,
  ctaText: 'Submit Payment Proof',
  ctaUrl: `${FRONTEND_URL}/payment-proof.html`,
  noteHtml: '<strong>Never share this credential publicly.</strong> Only share it with trusted senders.'
});

// ─── Admin Alert Emails ───────────────────────────

const adminAlertNewUser = (userName, userEmail, userPhone) => getEmailBase({
  title: 'New User Registration',
  headline: 'New User Registered',
  accentColor: '#7C3AED',
  bodyHtml: `
    <p style="margin-bottom:16px;">A new user has just registered on NigeriaPay.</p>
    <table role="presentation" style="width:100%;background:#f8fafc;border-radius:10px;">
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">Name</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${userName}</p></td></tr>
      <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;"><span style="color:#64748b;font-size:12px;">Email</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${userEmail}</p></td></tr>
      <tr><td style="padding:14px 18px;"><span style="color:#64748b;font-size:12px;">Phone</span><p style="color:#1a1a2e;font-weight:600;margin:2px 0 0;">${userPhone}</p></td></tr>
    </table>
  `,
  ctaText: 'View Users',
  ctaUrl: `${FRONTEND_URL}/admin-users.html`
});

// ─── Welcome Email ────────────────────────────────

const welcomeEmail = (userName) => getEmailBase({
  title: 'Welcome to NigeriaPay',
  headline: 'Welcome to NigeriaPay!',
  accentColor: '#00C853',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Welcome to <strong>NigeriaPay</strong> - the easiest way to receive payments from the USA directly to your Nigerian bank account.</p>
    <table role="presentation" style="width:100%;background:#f0fdf4;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;text-align:center;">
        <p style="color:#00C853;font-size:28px;margin:0;">&#127881;</p>
        <p style="color:#166534;font-weight:600;margin:4px 0 0;">Your account is ready!</p>
      </td></tr>
    </table>
    <p style="margin-bottom:12px;">Here's how to get started:</p>
    <ol style="margin:0 0 16px 20px;padding:0;color:#475569;">
      <li style="margin-bottom:8px;">Save your Nigerian bank details in <strong>Settings</strong></li>
      <li style="margin-bottom:8px;">Wait for admin to assign you payment credentials</li>
      <li style="margin-bottom:8px;">Use those credentials to receive payments from USA</li>
      <li>Submit payment proof and get credited in NGN instantly!</li>
    </ol>
  `,
  ctaText: 'Go to Dashboard',
  ctaUrl: `${FRONTEND_URL}/dashboard.html`,
  noteHtml: 'Need help? Contact our support team anytime.'
});

// ─── Broadcast Email ──────────────────────────────

const broadcastEmail = (userName, subject, message) => getEmailBase({
  title: subject,
  headline: subject,
  accentColor: '#2979FF',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">${message}</p>
    <table role="presentation" style="width:100%;background:#eff6ff;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <p style="color:#1d4ed8;font-size:12px;margin:0 0 4px;">From NigeriaPay Team</p>
        <p style="color:#1e40af;font-weight:600;margin:0;">This is an important announcement for all users.</p>
      </td></tr>
    </table>
  `,
  ctaText: 'Go to Dashboard',
  ctaUrl: `${FRONTEND_URL}/dashboard.html`
});

const passwordResetSuccess = (userName) => getEmailBase({
  title: 'Password Reset Complete',
  headline: 'Password Reset Successful',
  accentColor: '#00C853',
  bodyHtml: `
    <p style="margin-bottom:12px;">Hi ${userName},</p>
    <p style="margin-bottom:16px;">Your NigeriaPay account password has been successfully reset.</p>
    <table role="presentation" style="width:100%;background:#f0fdf4;border-radius:10px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;text-align:center;">
        <p style="color:#00C853;font-size:32px;margin:0;">&#10003;</p>
        <p style="color:#166534;font-weight:600;margin:4px 0 0;">Password updated successfully</p>
      </td></tr>
    </table>
    <p style="margin:0;">If you did not make this change, please contact our support team immediately to secure your account.</p>
  `,
  ctaText: 'Login Now',
  ctaUrl: `${FRONTEND_URL}/login.html`,
  noteHtml: '<strong>Security tip:</strong> Use a strong, unique password and enable two-factor authentication if available.'
});

module.exports = {
  // Withdrawal
  withdrawalRequestUser,
  withdrawalRequestAdmin,
  withdrawalApproved,
  withdrawalRejected,
  // Payment Proof
  paymentProofSubmittedUser,
  paymentProofSubmittedAdmin,
  paymentProofApproved,
  paymentProofRejected,
  // Transaction
  walletCredited,
  transactionNotification,
  // Credential
  credentialAssigned,
  // Admin
  adminAlertNewUser,
  // Password
  passwordResetSuccess,
  // Welcome
  welcomeEmail,
  // Broadcast
  broadcastEmail
};
