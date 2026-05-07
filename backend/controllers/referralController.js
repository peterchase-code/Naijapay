const referralService = require('../services/referralService');
const responseHandler = require('../utils/responseHandler');

const getMyReferrals = async (req, res, next) => {
  try {
    const result = await referralService.getUserReferrals(req.user._id);
    responseHandler.success(res, result, 'Referrals retrieved');
  } catch (error) {
    next(error);
  }
};

const getAllReferrals = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await referralService.getAllReferrals(parseInt(page) || 1, parseInt(limit) || 20);
    responseHandler.success(res, result, 'All referrals retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyReferrals, getAllReferrals };
