const authService = require('../services/authService');
const responseHandler = require('../utils/responseHandler');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    responseHandler.success(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    responseHandler.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    responseHandler.success(res, user, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.updatePassword(req.user._id, currentPassword, newPassword);
    responseHandler.success(res, result, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const passwordResetService = require('../services/passwordResetService');
    const result = await passwordResetService.requestPasswordReset(req.body.email, req.headers.origin || process.env.FRONTEND_URL);
    responseHandler.success(res, result, 'Password reset initiated');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePassword, forgotPassword };
