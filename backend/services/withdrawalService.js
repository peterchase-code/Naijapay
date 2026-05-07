const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const notificationService = require('./notificationService');

const createWithdrawalRequest = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!user.bankDetails || !user.bankDetails.bankName) {
    throw new Error('Please save your bank details in settings before requesting a withdrawal');
  }

  const minWithdrawalSetting = await Settings.findOne({ key: 'minWithdrawal' });
  const maxWithdrawalSetting = await Settings.findOne({ key: 'maxWithdrawal' });
  const minWithdrawal = minWithdrawalSetting ? parseFloat(minWithdrawalSetting.value) : 1000;
  const maxWithdrawal = maxWithdrawalSetting ? parseFloat(maxWithdrawalSetting.value) : 10000000;

  if (data.amount < minWithdrawal) {
    throw new Error(`Minimum withdrawal amount is ${minWithdrawal}`);
  }
  if (data.amount > maxWithdrawal) {
    throw new Error(`Maximum withdrawal amount is ${maxWithdrawal}`);
  }

  // Check total pending withdrawals to prevent over-requesting
  const pendingWithdrawals = await Withdrawal.find({
    user: userId,
    status: { $in: ['pending', 'processing'] }
  });
  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  if (data.amount > user.balance) {
    throw new Error('Insufficient balance for this withdrawal');
  }
  if ((totalPending + data.amount) > user.balance) {
    throw new Error(`You have NGN ${totalPending.toLocaleString('en-NG')} in pending withdrawals. Available: NGN ${(user.balance - totalPending).toLocaleString('en-NG')}`);
  }

  const bankDetails = data.useSavedBank && user.bankDetails
    ? user.bankDetails
    : {
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        country: data.country || user.country || 'Nigeria',
        currency: data.currency || 'NGN'
      };

  const withdrawal = await Withdrawal.create({
    user: userId,
    amount: data.amount,
    bankDetails,
    status: 'pending',
    balanceDeducted: false
  });

  // Do NOT deduct balance here - only when admin approves
  await Transaction.create({
    user: userId,
    type: 'withdrawal',
    amount: data.amount,
    description: `Withdrawal request of NGN ${data.amount.toLocaleString('en-NG')} - awaiting admin review`,
    status: 'pending',
    metadata: { withdrawalId: withdrawal._id }
  });

  // Notify user + email + alert admins
  notificationService.withdrawalRequested(userId, data.amount, bankDetails);
  notificationService.alertAdminNewWithdrawal(
    user.fullName || user.username,
    user.email,
    data.amount
  );

  return withdrawal;
};

const getUserWithdrawals = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const withdrawals = await Withdrawal.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Withdrawal.countDocuments({ user: userId });
  return { withdrawals, total, page, pages: Math.ceil(total / limit) };
};

const getAllWithdrawals = async (filters = {}, page = 1, limit = 20) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.user = filters.userId;
  if (filters.search) {
    const users = await User.find({
      $or: [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ]
    }).select('_id');
    query.user = { $in: users.map(u => u._id) };
  }

  const skip = (page - 1) * limit;
  const withdrawals = await Withdrawal.find(query)
    .populate('user', 'fullName username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Withdrawal.countDocuments(query);
  return { withdrawals, total, page, pages: Math.ceil(total / limit) };
};

const updateWithdrawalStatus = async (withdrawalId, status, adminId, note = '') => {
  const withdrawal = await Withdrawal.findById(withdrawalId).populate('user');
  if (!withdrawal) throw new Error('Withdrawal not found');

  const oldStatus = withdrawal.status;

  // Prevent re-processing already processed withdrawals
  if (oldStatus === 'paid' || oldStatus === 'rejected') {
    throw new Error(`Cannot change status: withdrawal is already ${oldStatus}`);
  }

  withdrawal.status = status;
  withdrawal.processedBy = adminId;
  withdrawal.adminNote = note;

  if (status === 'paid' || status === 'rejected') {
    withdrawal.processedAt = new Date();
  }

  const user = await User.findById(withdrawal.user._id);

  // Deduct balance when admin approves (processing or paid)
  // Only deduct if not already deducted
  const isApproval = (status === 'processing' || status === 'paid');
  if (isApproval && !withdrawal.balanceDeducted) {
    if (withdrawal.amount > user.balance) {
      throw new Error('User has insufficient balance to process this withdrawal');
    }
    user.balance -= withdrawal.amount;
    withdrawal.balanceDeducted = true;
    await user.save();

    // Update the linked transaction
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      {
        status: status === 'paid' ? 'completed' : 'pending',
        description: `Withdrawal of NGN ${withdrawal.amount.toLocaleString('en-NG')} - ${status}`,
        $set: {
          'metadata.adminNote': note || '',
          'metadata.processedAt': new Date()
        }
      }
    );
  }

  // If moving from processing -> paid (balance already deducted), just update the transaction
  if (status === 'paid' && withdrawal.balanceDeducted) {
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      {
        status: 'completed',
        description: `Withdrawal of NGN ${withdrawal.amount.toLocaleString('en-NG')} - paid`,
        $set: {
          'metadata.adminNote': note || '',
          'metadata.processedAt': new Date()
        }
      }
    );
  }

  // Refund balance if rejected and balance was already deducted
  if (status === 'rejected' && withdrawal.balanceDeducted) {
    user.balance += withdrawal.amount;
    withdrawal.balanceDeducted = false;
    await user.save();

    await Transaction.create({
      user: withdrawal.user._id,
      type: 'withdrawal',
      amount: withdrawal.amount,
      description: `Withdrawal rejected - balance refunded. ${note || 'No reason provided'}`,
      status: 'failed',
      metadata: { withdrawalId: withdrawal._id, refunded: true }
    });

    // Also update the original transaction
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id, status: { $ne: 'failed' } },
      {
        status: 'failed',
        description: `Withdrawal rejected - ${note || 'No reason provided'}`,
        $set: {
          'metadata.adminNote': note || '',
          'metadata.processedAt': new Date()
        }
      }
    );
  }

  // If rejected but balance was never deducted (rejected from pending), just update transaction
  if (status === 'rejected' && !withdrawal.balanceDeducted) {
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      {
        status: 'failed',
        description: `Withdrawal rejected - ${note || 'No reason provided'}`,
        $set: {
          'metadata.adminNote': note || '',
          'metadata.processedAt': new Date()
        }
      }
    );
  }

  await withdrawal.save();

  // Send status-specific notifications + emails
  if (status === 'processing' || status === 'paid') {
    notificationService.withdrawalApproved(
      withdrawal.user._id,
      withdrawal.amount
    );
  } else if (status === 'rejected') {
    notificationService.withdrawalRejected(
      withdrawal.user._id,
      withdrawal.amount,
      note
    );
  }

  return withdrawal;
};

module.exports = {
  createWithdrawalRequest,
  getUserWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus
};
