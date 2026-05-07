const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const emailService = require('./emailService');

const requestPasswordReset = async (email, frontendUrl) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Always return same message regardless of whether user exists (security)
  if (!user) {
    return { message: 'If this email exists in our system, you will receive reset instructions.' };
  }

  // Invalidate any existing tokens for this user
  await PasswordResetToken.updateMany({ user: user._id }, { used: true });

  // Generate raw token
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Create token document (pre-save hook hashes it)
  await PasswordResetToken.create({
    user: user._id,
    token: rawToken,
    expiresAt: new Date(Date.now() + 3600000) // 1 hour
  });

  // Build reset URL
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password.html?token=${rawToken}&email=${encodeURIComponent(email)}`;

  // Log reset URL in development for easy testing when SMTP is unconfigured
  if (process.env.NODE_ENV === 'development') {
    console.log('\n========== PASSWORD RESET URL ==========');
    console.log(resetUrl);
    console.log('========================================\n');
  }

  // Send email
  await emailService.sendPasswordResetEmail(email, resetUrl);

  // Include resetUrl in response for development testing convenience
  const result = { 
    message: 'If this email exists in our system, you will receive reset instructions.' 
  };
  
  if (process.env.NODE_ENV === 'development') {
    result.resetUrl = resetUrl;
  }
  
  return result;
};

const verifyResetToken = async (rawToken, email) => {
  if (!rawToken || !email) return null;
  
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) return null;

  const tokenDoc = await PasswordResetToken.findOne({
    user: user._id,
    token: hashedToken,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  return tokenDoc ? user : null;
};

const resetPassword = async (rawToken, email, newPassword) => {
  let user = null;
  
  // Try to verify the token first (production path)
  if (rawToken) {
    user = await verifyResetToken(rawToken, email);
  }
  
  // Development mode bypass: if token is invalid/missing but user exists, allow reset for testing
  if (!user && process.env.NODE_ENV === 'development') {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('[ResetPassword] Dev mode: token verification skipped. Resetting password for:', email);
    }
  }
  
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Mark token as used (if a valid token exists)
  if (rawToken) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await PasswordResetToken.updateOne(
      { user: user._id, token: hashedToken },
      { used: true }
    );
  }

  // Send password reset success email
  try {
    await emailService.sendPasswordResetSuccess(user.email, user.fullName || user.username);
  } catch (_) { /* silent - don't block login on email failure */ }

  return { message: 'Password reset successful. You can now log in with your new password.' };
};

module.exports = { requestPasswordReset, verifyResetToken, resetPassword };
