const User = require('../models/User');
const responseHandler = require('../utils/responseHandler');

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, country } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phoneNumber, country },
      { new: true, runValidators: true }
    ).select('-password');

    responseHandler.success(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateBankDetails = async (req, res, next) => {
  try {
    const { bankName, accountName, accountNumber, country, currency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
          country: country || 'Nigeria',
          currency: currency || 'NGN'
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    responseHandler.success(res, user.bankDetails, 'Bank details saved successfully');
  } catch (error) {
    next(error);
  }
};

const getBankDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('bankDetails');
    responseHandler.success(res, user.bankDetails || null, 'Bank details retrieved');
  } catch (error) {
    next(error);
  }
};

const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { email, withdrawalUpdates, balanceUpdates, systemUpdates } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        notificationPreferences: {
          email: email !== undefined ? email : true,
          withdrawalUpdates: withdrawalUpdates !== undefined ? withdrawalUpdates : true,
          balanceUpdates: balanceUpdates !== undefined ? balanceUpdates : true,
          systemUpdates: systemUpdates !== undefined ? systemUpdates : true
        }
      },
      { new: true }
    ).select('-password');

    responseHandler.success(res, user.notificationPreferences, 'Notification preferences updated');
  } catch (error) {
    next(error);
  }
};

const getMyCredentials = async (req, res, next) => {
  try {
    const credentialService = require('../services/credentialService');
    const credentials = await credentialService.getUserCredentials(req.user._id);
    responseHandler.success(res, credentials, 'Credentials retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  updateBankDetails,
  getBankDetails,
  updateNotificationPreferences,
  getMyCredentials
};
