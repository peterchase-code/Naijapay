const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const Credential = require('../models/Credential');
const Service = require('../models/Service');
const Referral = require('../models/Referral');
const responseHandler = require('../utils/responseHandler');

const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, isBanned, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    responseHandler.success(res, { users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return responseHandler.error(res, 'User not found', 404);

    const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
    const withdrawals = await Withdrawal.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);

    responseHandler.success(res, { user, transactions, withdrawals }, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, country, isBanned, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phoneNumber, country, isBanned, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return responseHandler.error(res, 'User not found', 404);
    responseHandler.success(res, user, 'User updated');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return responseHandler.error(res, 'User not found', 404);
    responseHandler.success(res, { message: 'User deleted successfully' }, 'User deleted');
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    ).select('-password');
    if (!user) return responseHandler.error(res, 'User not found', 404);
    responseHandler.success(res, user, 'User banned');
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false },
      { new: true }
    ).select('-password');
    if (!user) return responseHandler.error(res, 'User not found', 404);
    responseHandler.success(res, user, 'User unbanned');
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true, isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'completed' });
    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const paidWithdrawals = await Withdrawal.countDocuments({ status: 'paid' });
    const totalCredentials = await Credential.countDocuments();
    const activeCredentials = await Credential.countDocuments({ isActive: true, assignedTo: { $ne: null } });
    const totalReferrals = await Referral.countDocuments();
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });

    const depositAmounts = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const withdrawalAmounts = await Withdrawal.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    responseHandler.success(res, {
      users: { total: totalUsers, active: activeUsers, banned: bannedUsers },
      deposits: { count: totalDeposits, totalAmount: depositAmounts[0]?.total || 0 },
      withdrawals: { count: totalWithdrawals, paidCount: paidWithdrawals, pendingCount: pendingWithdrawals, totalAmount: withdrawalAmounts[0]?.total || 0 },
      credentials: { total: totalCredentials, active: activeCredentials },
      referrals: { total: totalReferrals },
      services: { total: totalServices, active: activeServices }
    }, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};

const adjustBalance = async (req, res, next) => {
  try {
    const transactionService = require('../services/transactionService');
    const { amount, type, reason } = req.body;
    const result = await transactionService.adjustBalance(req.params.id, parseFloat(amount), type, reason, req.user._id);
    responseHandler.success(res, result, `Balance ${type}d successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  getDashboardStats,
  adjustBalance
};
