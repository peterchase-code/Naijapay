const Service = require('../models/Service');
const responseHandler = require('../utils/responseHandler');

const getAllServices = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const services = await Service.find(query).sort({ order: 1, createdAt: -1 });
    responseHandler.success(res, services, 'Services retrieved');
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    responseHandler.success(res, service, 'Service created', 201);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return responseHandler.error(res, 'Service not found', 404);
    responseHandler.success(res, service, 'Service updated');
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return responseHandler.error(res, 'Service not found', 404);
    responseHandler.success(res, { message: 'Service deleted' }, 'Service deleted');
  } catch (error) {
    next(error);
  }
};

const toggleService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return responseHandler.error(res, 'Service not found', 404);
    service.isActive = !service.isActive;
    await service.save();
    responseHandler.success(res, service, `Service ${service.isActive ? 'enabled' : 'disabled'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  createService,
  updateService,
  deleteService,
  toggleService
};
