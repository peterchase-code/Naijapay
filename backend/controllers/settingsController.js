const Settings = require('../models/Settings');
const responseHandler = require('../utils/responseHandler');

const getAllSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    responseHandler.success(res, settingsMap, 'Settings retrieved');
  } catch (error) {
    next(error);
  }
};

const getPublicSettings = async (req, res, next) => {
  try {
    const keys = ['minDeposit', 'maxDeposit', 'minWithdrawal', 'maxWithdrawal', 'referralCommission'];
    const settings = await Settings.find({ key: { $in: keys } });
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    responseHandler.success(res, settingsMap, 'Public settings retrieved');
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key, value, label, description } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value, label, description, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    responseHandler.success(res, setting, 'Setting updated');
  } catch (error) {
    next(error);
  }
};

const updateMultipleSettings = async (req, res, next) => {
  try {
    const updates = req.body.settings;
    const results = [];
    for (const item of updates) {
      const setting = await Settings.findOneAndUpdate(
        { key: item.key },
        { key: item.key, value: item.value, label: item.label, description: item.description, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      results.push(setting);
    }
    responseHandler.success(res, results, 'Settings updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSettings, getPublicSettings, updateSetting, updateMultipleSettings };
