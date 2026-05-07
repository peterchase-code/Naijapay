const Notification = require('../models/Notification');
const responseHandler = require('../utils/responseHandler');

const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const query = { user: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page || 1) - 1) * parseInt(limit || 20))
      .limit(parseInt(limit || 20));

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    responseHandler.success(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return responseHandler.error(res, 'Notification not found', 404);
    responseHandler.success(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    responseHandler.success(res, { message: 'All notifications marked as read' }, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) return responseHandler.error(res, 'Notification not found', 404);
    responseHandler.success(res, { message: 'Notification deleted' }, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
