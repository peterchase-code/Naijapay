const GiftCard = require('../models/GiftCard');
const responseHandler = require('../utils/responseHandler');

const getAll = async (req, res, next) => {
  try {
    const cards = await GiftCard.find({ isActive: true }).sort({ order: 1 });
    responseHandler.success(res, cards, 'Gift cards retrieved');
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const card = await GiftCard.create(req.body);
    responseHandler.success(res, card, 'Gift card created', 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const card = await GiftCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return responseHandler.error(res, 'Gift card not found', 404);
    responseHandler.success(res, card, 'Gift card updated');
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await GiftCard.findByIdAndDelete(req.params.id);
    responseHandler.success(res, { message: 'Gift card deleted' }, 'Deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
