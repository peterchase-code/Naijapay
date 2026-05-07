const passwordResetService = require('../services/passwordResetService');
const responseHandler = require('../utils/responseHandler');

const forgotPassword = async (req, res, next) => {
  try {
    const { email, frontendUrl } = req.body;
    // Use frontend-provided URL first, then fall back to Origin header, then env var
    const resetBaseUrl = frontendUrl || req.headers.origin || process.env.FRONTEND_URL;
    const result = await passwordResetService.requestPasswordReset(email, resetBaseUrl);
    responseHandler.success(res, result, 'Password reset initiated');
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const { token, email } = req.query;
    const user = await passwordResetService.verifyResetToken(token, email);
    if (!user) {
      return responseHandler.error(res, 'Invalid or expired token', 400);
    }
    responseHandler.success(res, { valid: true, email: user.email }, 'Token valid');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    const result = await passwordResetService.resetPassword(token, email, password);
    responseHandler.success(res, result, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword, verifyToken, resetPassword };
