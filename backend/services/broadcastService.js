const Broadcast = require('../models/Broadcast');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('./emailService');

const createBroadcast = async (adminId, adminName, data) => {
  const { title, message, target = 'all' } = data;

  // Build user query based on target
  let userQuery = {};
  if (target === 'users_only') userQuery = { role: 'user' };
  if (target === 'admins_only') userQuery = { role: 'admin' };

  // Count target users
  const targetUsers = await User.find(userQuery).select('_id fullName email');
  const totalUsers = targetUsers.length;

  if (totalUsers === 0) {
    throw new Error('No users found for the selected target audience');
  }

  // Create in-app notifications for all target users (batch insert)
  const notifications = targetUsers.map(u => ({
    user: u._id,
    title,
    message,
    type: 'system'
  }));

  let insertedNotifications = 0;
  try {
    const result = await Notification.insertMany(notifications, { ordered: false });
    insertedNotifications = result.length;
  } catch (err) {
    // partial failure is ok, count what succeeded
    insertedNotifications = err.insertedDocs?.length || 0;
  }

  // Send emails in background (fire-and-forget)
  let emailSentCount = 0;
  for (const u of targetUsers) {
    try {
      emailService.sendBroadcastEmail(u.email, u.fullName, title, message);
      emailSentCount++;
    } catch (_) { /* silent - don't let one email failure stop others */ }
  }

  // Save broadcast record
  const broadcast = await Broadcast.create({
    title,
    message,
    target,
    sentBy: adminId,
    sentByName: adminName,
    notifiedCount: insertedNotifications,
    emailCount: emailSentCount
  });

  return {
    broadcast,
    stats: {
      totalTargeted: totalUsers,
      notified: insertedNotifications,
      emailsSent: emailSentCount
    }
  };
};

const getAllBroadcasts = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const broadcasts = await Broadcast.find()
    .populate('sentBy', 'fullName username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Broadcast.countDocuments();
  return { broadcasts, total, page, pages: Math.ceil(total / limit) };
};

const getBroadcastById = async (id) => {
  const broadcast = await Broadcast.findById(id)
    .populate('sentBy', 'fullName username email');
  if (!broadcast) throw new Error('Broadcast not found');
  return broadcast;
};

const deleteBroadcast = async (id) => {
  const broadcast = await Broadcast.findByIdAndDelete(id);
  if (!broadcast) throw new Error('Broadcast not found');
  return { message: 'Broadcast deleted successfully' };
};

module.exports = {
  createBroadcast,
  getAllBroadcasts,
  getBroadcastById,
  deleteBroadcast
};
