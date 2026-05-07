const credentialService = require('../services/credentialService');
const responseHandler = require('../utils/responseHandler');

const getAllCredentials = async (req, res, next) => {
  try {
    const { service, assignedTo, isActive } = req.query;
    const credentials = await credentialService.getAllCredentials({ service, assignedTo, isActive });
    responseHandler.success(res, credentials, 'Credentials retrieved');
  } catch (error) {
    next(error);
  }
};

const createCredential = async (req, res, next) => {
  try {
    const credential = await credentialService.createCredential(req.body);
    responseHandler.success(res, credential, 'Credential created', 201);
  } catch (error) {
    next(error);
  }
};

const updateCredential = async (req, res, next) => {
  try {
    const credential = await credentialService.updateCredential(req.params.id, req.body);
    responseHandler.success(res, credential, 'Credential updated');
  } catch (error) {
    next(error);
  }
};

const assignCredential = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const credential = await credentialService.assignCredentialToUser(req.params.id, userId);
    responseHandler.success(res, credential, 'Credential assigned successfully');
  } catch (error) {
    next(error);
  }
};

const removeAssignment = async (req, res, next) => {
  try {
    const credential = await credentialService.removeCredentialAssignment(req.params.id);
    responseHandler.success(res, credential, 'Credential unassigned');
  } catch (error) {
    next(error);
  }
};

const deleteCredential = async (req, res, next) => {
  try {
    const result = await credentialService.deleteCredential(req.params.id);
    responseHandler.success(res, result, 'Credential deleted');
  } catch (error) {
    next(error);
  }
};

const assignBulk = async (req, res, next) => {
  try {
    const { credentialId, userIds } = req.body;

    if (!credentialId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return responseHandler.error(res, 'credentialId and userIds array are required', 400);
    }

    const result = await credentialService.assignBulkCredentials(credentialId, userIds);
    responseHandler.success(res, result, `Credential assigned to ${result.assignedCount} user(s) successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCredentials,
  createCredential,
  updateCredential,
  assignCredential,
  removeAssignment,
  deleteCredential,
  assignBulk
};
