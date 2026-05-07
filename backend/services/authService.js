const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const helpers = require('../utils/helpers');
const Settings = require('../models/Settings');
const notificationService = require('./notificationService');

const registerUser = async (userData) => {
  const { fullName, username, email, phoneNumber, country, dateOfBirth, password, referralCode } = userData;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error(existingUser.email === email ? 'Email already registered' : 'Username already taken');
  }

  const referral = helpers.generateReferralCode();
  let referredBy = null;

  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) {
      referredBy = referrer._id;
      referrer.referralCount += 1;
      await referrer.save();
    }
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phoneNumber,
    country,
    dateOfBirth,
    password: hashedPassword,
    referralCode: referral,
    referredBy,
    role: email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'user'
  });

  if (referredBy) {
    const Referral = require('../models/Referral');
    const Transaction = require('../models/Transaction');
    const refSettings = await Settings.findOne({ key: 'referralCommission' });
    const commission = refSettings ? parseFloat(refSettings.value) : 5;

    // Create referral record
    await Referral.create({
      referrer: referredBy,
      referred: user._id,
      code: referralCode.toUpperCase(),
      commission,
      status: 'completed'
    });

    // Credit commission to referrer's balance
    const referrer = await User.findById(referredBy);
    if (referrer) {
      referrer.balance += commission;
      referrer.referralEarnings += commission;
      await referrer.save();

      // Create a transaction record for the referral bonus
      await Transaction.create({
        user: referredBy,
        type: 'referral_bonus',
        amount: commission,
        description: `Referral bonus: ${fullName} signed up using your code. +NGN ${commission.toLocaleString('en-NG')}`,
        status: 'completed',
        metadata: { referredUserId: user._id, referredUserName: fullName, referralCode: referralCode.toUpperCase() }
      });

      // Notify referrer
      try {
        notificationService.walletCredited(
          referredBy,
          commission,
          `Referral bonus: ${fullName} signed up using your code`,
          referrer.balance
        );
      } catch (_) { /* silent */ }
    }
  }

  // Send welcome email + in-app notification to the new user
  notificationService.welcomeUser(user._id, fullName);

  // Alert admins of new registration
  notificationService.alertAdminNewUser(fullName, email.toLowerCase(), phoneNumber);

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      country: user.country,
      balance: user.balance,
      referralCode: user.referralCode,
      role: user.role
    }
  };
};

const loginUser = async (loginData) => {
  const { login, password } = loginData;

  const user = await User.findOne({
    $or: [{ email: login.toLowerCase() }, { username: login.toLowerCase() }]
  }).select('+password');

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }

  if (user.isBanned) {
    throw new Error('Your account has been banned');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      country: user.country,
      balance: user.balance,
      referralCode: user.referralCode,
      role: user.role,
      bankDetails: user.bankDetails,
      notificationPreferences: user.notificationPreferences
    }
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updatePassword
};
