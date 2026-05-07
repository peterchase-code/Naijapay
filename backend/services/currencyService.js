const Service = require('../models/Service');

/**
 * Get rate for a service by its ID
 */
const getServiceRate = async (serviceId) => {
  const service = await Service.findById(serviceId).select('rate name displayName');
  if (!service) return null;
  return {
    rate: service.rate || 0,
    serviceName: service.displayName || service.name,
    hasRate: !!(service.rate && service.rate > 0)
  };
};

/**
 * Convert amount to NGN using the service's rate
 * Simple: amount * serviceRate = NGN
 */
const convertToNGN = async (amount, serviceId) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Valid amount is required');
  }

  const serviceData = await getServiceRate(serviceId);
  if (!serviceData) {
    return { rate: null, converted: null, serviceName: null };
  }

  if (!serviceData.hasRate) {
    return { rate: null, converted: null, serviceName: serviceData.serviceName };
  }

  return {
    rate: serviceData.rate,
    converted: Math.round(numAmount * serviceData.rate),
    serviceName: serviceData.serviceName
  };
};

/**
 * Get rates for all active services (for frontend display)
 */
const getAllServiceRates = async () => {
  const services = await Service.find({ isActive: true })
    .select('name displayName icon color rate')
    .sort({ order: 1, createdAt: -1 });

  return services.map(s => ({
    serviceId: s._id,
    name: s.name,
    displayName: s.displayName,
    icon: s.icon,
    color: s.color,
    rate: s.rate || 0,
    hasRate: !!(s.rate && s.rate > 0)
  }));
};

/**
 * Set/update rate for a service (admin only)
 */
const setServiceRate = async (serviceId, rate) => {
  const numRate = parseFloat(rate);
  if (isNaN(numRate) || numRate <= 0) {
    throw new Error('Valid rate is required');
  }

  const service = await Service.findByIdAndUpdate(
    serviceId,
    { rate: numRate },
    { new: true, runValidators: true }
  );

  if (!service) throw new Error('Service not found');
  return service;
};

module.exports = {
  getServiceRate,
  convertToNGN,
  getAllServiceRates,
  setServiceRate
};
