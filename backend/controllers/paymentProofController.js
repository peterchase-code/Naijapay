const paymentProofService = require('../services/paymentProofService');
const responseHandler = require('../utils/responseHandler');

const uploadProof = async (req, res, next) => {
  try {
    const { service, serviceName, credential, credentialValue, amount, currency, giftCardType, note } = req.body;
    
    if (!req.file) {
      return responseHandler.error(res, 'Screenshot upload is required', 400);
    }

    const proof = await paymentProofService.createPaymentProof(
      req.user._id,
      { 
        service, 
        serviceName, 
        credential, 
        credentialValue, 
        amount: parseFloat(amount), 
        originalCurrency: currency,
        giftCardType,
        note 
      },
      req.file
    );

    responseHandler.success(res, proof, 'Payment proof submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getMyProofs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await paymentProofService.getUserPaymentProofs(
      req.user._id,
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    responseHandler.success(res, result, 'Payment proofs retrieved');
  } catch (error) {
    next(error);
  }
};

const getAllProofs = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await paymentProofService.getAllPaymentProofs(
      { status },
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    responseHandler.success(res, result, 'All payment proofs retrieved');
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const proof = await paymentProofService.updateProofStatus(req.params.id, status, req.user._id, note);
    responseHandler.success(res, proof, `Payment proof ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadProof, getMyProofs, getAllProofs, updateStatus };
