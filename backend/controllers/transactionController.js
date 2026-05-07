const transactionService = require('../services/transactionService');
const responseHandler = require('../utils/responseHandler');

const getMyTransactions = async (req, res, next) => {
  try {
    const { type, status, page, limit } = req.query;
    const result = await transactionService.getUserTransactions(
      req.user._id,
      { type, status },
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    responseHandler.success(res, result, 'Transactions retrieved');
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { type, status, userId, page, limit } = req.query;
    const result = await transactionService.getAllTransactions(
      { type, status, userId },
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    responseHandler.success(res, result, 'All transactions retrieved');
  } catch (error) {
    next(error);
  }
};

const createDeposit = async (req, res, next) => {
  try {
    const { amount, description, service, credentialId } = req.body;
    const transaction = await transactionService.createDeposit(req.user._id, amount, description, service, credentialId);
    responseHandler.success(res, transaction, 'Deposit initiated', 201);
  } catch (error) {
    next(error);
  }
};

const confirmDeposit = async (req, res, next) => {
  try {
    const transaction = await transactionService.confirmDeposit(req.params.id, req.user._id);
    responseHandler.success(res, transaction, 'Deposit confirmed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTransactions,
  getAllTransactions,
  createDeposit,
  confirmDeposit
};
