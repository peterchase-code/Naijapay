const PaymentProof = require('../models/PaymentProof');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const currencyService = require('./currencyService');
const notificationService = require('./notificationService');

const createPaymentProof = async (userId, data, file) => {
  if (!file) {
    throw new Error('Screenshot upload is required');
  }

  const originalCurrency = (data.originalCurrency || 'USD').toUpperCase();
  const originalAmount = parseFloat(data.originalAmount || data.amount);

  if (!data.service) {
    throw new Error('Service is required');
  }

  // Get the service's rate and convert
  const conversion = await currencyService.convertToNGN(originalAmount, data.service);

  if (!conversion.rate) {
    throw new Error(`Rate not set for this service (${conversion.serviceName || 'Unknown'}). Contact admin to set the rate.`);
  }

  const proof = await PaymentProof.create({
    user: userId,
    service: data.service,
    serviceName: data.serviceName,
    credential: data.credential,
    credentialValue: data.credentialValue,
    amount: conversion.converted,
    originalCurrency,
    originalAmount,
    convertedAmount: conversion.converted,
    exchangeRate: conversion.rate,
    giftCardType: data.giftCardType || null,
    note: data.note || '',
    screenshotUrl: `/uploads/payment-proofs/${file.filename}`,
    status: 'pending'
  });

  // Notify user + alert admins
  const user = await User.findById(userId).select('fullName email');
  if (user) {
    notificationService.paymentProofSubmitted(userId, data.serviceName, originalAmount, originalCurrency);
    notificationService.alertAdminNewPaymentProof(
      user.fullName || user.username,
      user.email,
      data.serviceName,
      originalAmount,
      originalCurrency
    );
  }

  return proof;
};

const getUserPaymentProofs = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const proofs = await PaymentProof.find({ user: userId })
    .populate('service', 'name displayName icon color')
    .populate('credential', 'type value')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await PaymentProof.countDocuments({ user: userId });
  return { proofs, total, page, pages: Math.ceil(total / limit) };
};

const getAllPaymentProofs = async (filters = {}, page = 1, limit = 20) => {
  const query = {};
  if (filters.status) query.status = filters.status;

  const skip = (page - 1) * limit;
  const proofs = await PaymentProof.find(query)
    .populate('user', 'fullName username email')
    .populate('service', 'name displayName icon color')
    .populate('credential', 'type value')
    .populate('reviewedBy', 'fullName username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PaymentProof.countDocuments(query);
  return { proofs, total, page, pages: Math.ceil(total / limit) };
};

const updateProofStatus = async (proofId, status, adminId, note = '') => {
  const proof = await PaymentProof.findById(proofId).populate('user');
  if (!proof) throw new Error('Payment proof not found');

  proof.status = status;
  proof.reviewedBy = adminId;
  proof.adminNote = note;
  proof.reviewedAt = new Date();
  await proof.save();

  if (status === 'approved') {
    const user = await User.findById(proof.user._id);
    const ngnAmount = proof.convertedAmount || proof.amount;
    user.balance += ngnAmount;
    await user.save();

    await Transaction.create({
      user: proof.user._id,
      type: 'deposit',
      amount: ngnAmount,
      description: `Payment verified: ${proof.originalAmount} ${proof.originalCurrency} @ ${proof.exchangeRate} = NGN ${ngnAmount.toLocaleString()}`,
      status: 'completed',
      service: proof.serviceName,
      metadata: {
        proofId: proof._id,
        originalAmount: proof.originalAmount,
        originalCurrency: proof.originalCurrency,
        exchangeRate: proof.exchangeRate
      }
    });

    // Notify user: proof approved + wallet credited
    notificationService.paymentProofApproved(
      proof.user._id,
      proof.originalAmount,
      proof.originalCurrency,
      ngnAmount,
      user.balance,
      proof.serviceName
    );

  } else if (status === 'rejected') {
    notificationService.paymentProofRejected(
      proof.user._id,
      proof.serviceName,
      note
    );
  }

  return proof;
};

module.exports = {
  createPaymentProof,
  getUserPaymentProofs,
  getAllPaymentProofs,
  updateProofStatus
};
