const currencyService = require('../services/currencyService');
const responseHandler = require('../utils/responseHandler');

/**
 * Get all service rates (public)
 */
const getAllRates = async (req, res, next) => {
  try {
    const rates = await currencyService.getAllServiceRates();
    responseHandler.success(res, rates, 'Service rates retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Convert amount to NGN using a service's rate (authenticated)
 * Body: { amount, serviceId }
 */
const convertCurrency = async (req, res, next) => {
  try {
    const { amount, serviceId } = req.body;

    if (!amount || !serviceId) {
      return responseHandler.error(res, 'Amount and serviceId are required', 400);
    }

    const result = await currencyService.convertToNGN(amount, serviceId);
    if (!result.rate) {
      return responseHandler.error(res, `Rate not set for this service. Contact admin.`, 400);
    }
    responseHandler.success(res, result, 'Conversion successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Set/update rate for a service (admin only)
 * Body: { serviceId, rate }
 */
const setRate = async (req, res, next) => {
  try {
    const { serviceId, rate } = req.body;
    if (!serviceId || !rate) {
      return responseHandler.error(res, 'serviceId and rate are required', 400);
    }
    const updated = await currencyService.setServiceRate(serviceId, rate);
    responseHandler.success(res, updated, 'Service rate updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get rate for a specific service (public)
 */
const getServiceRate = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    if (!serviceId) {
      return responseHandler.error(res, 'serviceId is required', 400);
    }
    const result = await currencyService.getServiceRate(serviceId);
    if (!result) {
      return responseHandler.error(res, 'Service not found', 404);
    }
    responseHandler.success(res, result, 'Service rate retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRates, convertCurrency, setRate, getServiceRate };
