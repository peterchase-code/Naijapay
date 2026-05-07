const withdrawalService = require('../services/withdrawalService');
const responseHandler = require('../utils/responseHandler');

const createWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await withdrawalService.createWithdrawalRequest(req.user._id, req.body);
    responseHandler.success(res, withdrawal, 'Withdrawal request submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getMyWithdrawals = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await withdrawalService.getUserWithdrawals(req.user._id, parseInt(page) || 1, parseInt(limit) || 20);
    responseHandler.success(res, result, 'Withdrawals retrieved');
  } catch (error) {
    next(error);
  }
};

const getAllWithdrawals = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await withdrawalService.getAllWithdrawals({ status, search }, parseInt(page) || 1, parseInt(limit) || 20);
    responseHandler.success(res, result, 'All withdrawals retrieved');
  } catch (error) {
    next(error);
  }
};

const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const withdrawal = await withdrawalService.updateWithdrawalStatus(req.params.id, status, req.user._id, note);
    responseHandler.success(res, withdrawal, `Withdrawal marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus
};
