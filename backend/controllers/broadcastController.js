const broadcastService = require('../services/broadcastService');
const responseHandler = require('../utils/responseHandler');

const createBroadcast = async (req, res, next) => {
  try {
    const { title, message, target } = req.body;

    if (!title || !title.trim()) {
      return responseHandler.error(res, 'Title is required', 400);
    }
    if (!message || !message.trim()) {
      return responseHandler.error(res, 'Message is required', 400);
    }

    const adminName = req.user?.fullName || 'Admin';
    const result = await broadcastService.createBroadcast(
      req.user._id,
      adminName,
      { title: title.trim(), message: message.trim(), target: target || 'all' }
    );

    responseHandler.success(res, {
      broadcast: result.broadcast,
      stats: result.stats
    }, `Broadcast sent to ${result.stats.totalTargeted} user(s)`, 201);
  } catch (error) {
    next(error);
  }
};

const getAllBroadcasts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await broadcastService.getAllBroadcasts(page, limit);
    responseHandler.success(res, result, 'Broadcasts retrieved');
  } catch (error) {
    next(error);
  }
};

const getBroadcast = async (req, res, next) => {
  try {
    const broadcast = await broadcastService.getBroadcastById(req.params.id);
    responseHandler.success(res, broadcast, 'Broadcast retrieved');
  } catch (error) {
    next(error);
  }
};

const deleteBroadcast = async (req, res, next) => {
  try {
    const result = await broadcastService.deleteBroadcast(req.params.id);
    responseHandler.success(res, result, 'Broadcast deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBroadcast,
  getAllBroadcasts,
  getBroadcast,
  deleteBroadcast
};
