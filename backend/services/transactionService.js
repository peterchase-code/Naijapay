const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const helpers = require('../utils/helpers');

const getUserTransactions = async (userId, filters = {}, page = 1, limit = 20) => {
  const query = { user: userId };
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;

  const skip = (page - 1) * limit;
  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  return { transactions, total, page, pages: Math.ceil(total / limit) };
};

const getAllTransactions = async (filters = {}, page = 1, limit = 20) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.user = filters.userId;

  const skip = (page - 1) * limit;
  const transactions = await Transaction.find(query)
    .populate('user', 'fullName username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  return { transactions, total, page, pages: Math.ceil(total / limit) };
};

const createDeposit = async (userId, amount, description = '', service = '', credentialId = null) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const reference = helpers.generateReference();

  const transaction = await Transaction.create({
    user: userId,
    type: 'deposit',
    amount,
    description: description || `Deposit of ${amount}`,
    status: 'pending',
    service,
    credentialUsed: credentialId,
    reference
  });

  return transaction;
};

const confirmDeposit = async (transactionId, adminId) => {
  const transaction = await Transaction.findById(transactionId).populate('user');
  if (!transaction) throw new Error('Transaction not found');
  if (transaction.type !== 'deposit') throw new Error('Not a deposit transaction');

  transaction.status = 'completed';
  await transaction.save();

  const user = await User.findById(transaction.user._id);
  user.balance += transaction.amount;
  await user.save();

  await Notification.create({
    user: transaction.user._id,
    title: 'Balance Updated',
    message: `Your balance has been updated with ${transaction.amount}. New balance: ${user.balance}`,
    type: 'balance'
  });

  return transaction;
};

const adjustBalance = async (userId, amount, type, reason = '', adminId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (type === 'increase') {
    user.balance += amount;
  } else if (type === 'decrease') {
    if (user.balance < amount) throw new Error('Insufficient balance to decrease');
    user.balance -= amount;
  } else {
    throw new Error('Invalid adjustment type');
  }

  await user.save();

  const transaction = await Transaction.create({
    user: userId,
    type: 'adjustment',
    amount: type === 'increase' ? amount : -amount,
    description: `Admin ${type}: ${reason || 'Balance adjustment'}`,
    status: 'completed',
    metadata: { adjustedBy: adminId, adjustmentType: type }
  });

  await Notification.create({
    user: userId,
    title: 'Balance Adjusted',
    message: `Your balance has been ${type}d by ${amount}. New balance: ${user.balance}`,
    type: 'balance'
  });

  return { user, transaction };
};

module.exports = {
  getUserTransactions,
  getAllTransactions,
  createDeposit,
  confirmDeposit,
  adjustBalance
};
