const Credential = require('../models/Credential');
const Service = require('../models/Service');
const User = require('../models/User');
const notificationService = require('./notificationService');
const mongoose = require('mongoose');

const getUserCredentials = async (userId) => {
  const credentials = await Credential.find({ assignedTo: userId, isActive: true })
    .populate('service', 'name displayName icon color instructions rate')
    .sort({ createdAt: -1 });
  return credentials;
};

const getAllCredentials = async (filters = {}) => {
  const query = {};
  if (filters.service) query.service = filters.service;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const credentials = await Credential.find(query)
    .populate('service', 'name displayName icon color')
    .populate('assignedTo', 'fullName username email')
    .sort({ createdAt: -1 });
  return credentials;
};

const createCredential = async (data) => {
  const service = await Service.findById(data.service);
  if (!service) throw new Error('Service not found');

  const credential = await Credential.create({
    ...data,
    serviceName: service.displayName || service.name
  });

  return credential;
};

const assignCredentialToUser = async (credentialId, userId) => {
  const credential = await Credential.findByIdAndUpdate(
    credentialId,
    { assignedTo: userId },
    { new: true }
  ).populate('service', 'name displayName icon color');

  if (!credential) throw new Error('Credential not found');

  // Notify user + send email
  try {
    const user = await User.findById(userId).select('fullName email');
    if (user) {
      const serviceName = credential.service?.displayName || credential.service?.name || 'Payment';
      notificationService.credentialAssigned(
        userId,
        serviceName,
        credential.value
      );
    }
  } catch (_) { /* silent */ }

  return credential;
};

const removeCredentialAssignment = async (credentialId) => {
  const credential = await Credential.findByIdAndUpdate(
    credentialId,
    { assignedTo: null },
    { new: true }
  );
  if (!credential) throw new Error('Credential not found');
  return credential;
};

const updateCredential = async (credentialId, data) => {
  const credential = await Credential.findByIdAndUpdate(credentialId, data, { new: true });
  if (!credential) throw new Error('Credential not found');
  return credential;
};

const deleteCredential = async (credentialId) => {
  const credential = await Credential.findByIdAndDelete(credentialId);
  if (!credential) throw new Error('Credential not found');
  return { message: 'Credential deleted successfully' };
};

const assignBulkCredentials = async (credentialId, userIds) => {
  // Validate inputs
  if (!credentialId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('Invalid request: credentialId and userIds array required');
  }

  // Validate credentialId
  if (!mongoose.Types.ObjectId.isValid(credentialId)) {
    throw new Error('Invalid credential ID');
  }

  // Validate all userIds
  const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  if (validUserIds.length === 0) {
    throw new Error('No valid user IDs provided');
  }

  // Get the credential first
  const credential = await Credential.findById(credentialId).populate('service', 'name displayName icon color');
  if (!credential) throw new Error('Credential not found');

  const serviceName = credential.service?.displayName || credential.service?.name || 'Payment';

  // Unassign from current user if assigned
  await Credential.findByIdAndUpdate(credentialId, { assignedTo: null });

  // Create duplicates for each selected user (sequential, no transaction - works on standalone MongoDB)
  const createdCredentials = [];
  const failedUsers = [];

  for (const userId of validUserIds) {
    try {
      // Verify user exists
      const user = await User.findById(userId).select('fullName email');
      if (!user) {
        failedUsers.push({ userId, reason: 'User not found' });
        continue;
      }

      // Create a new credential entry for this user
      const newCredential = await Credential.create({
        service: credential.service?._id || credential.service,
        serviceName: credential.serviceName,
        type: credential.type,
        value: credential.value,
        additionalInfo: credential.additionalInfo || {},
        assignedTo: userId,
        isActive: credential.isActive
      });

      createdCredentials.push(newCredential);

      // Notify user (fire-and-forget, don't let email failure break the loop)
      try {
        notificationService.credentialAssigned(userId, serviceName, credential.value);
      } catch (_) { /* silent */ }
    } catch (err) {
      failedUsers.push({ userId, reason: err.message });
    }
  }

  if (createdCredentials.length === 0) {
    throw new Error(`Failed to assign credential to any user. ${failedUsers.length} failure(s).`);
  }

  return {
    credential: credential.value,
    serviceName,
    assignedCount: createdCredentials.length,
    failedCount: failedUsers.length,
    assignedTo: createdCredentials.map(c => ({
      credentialId: c._id,
      userId: c.assignedTo
    }))
  };
};

module.exports = {
  getUserCredentials,
  getAllCredentials,
  createCredential,
  assignCredentialToUser,
  removeCredentialAssignment,
  updateCredential,
  deleteCredential,
  assignBulkCredentials
};