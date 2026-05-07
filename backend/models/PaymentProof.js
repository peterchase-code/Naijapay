const mongoose = require('mongoose');

const paymentProofSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  credential: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential',
    required: true
  },
  credentialValue: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  originalCurrency: {
    type: String,
    default: 'USD',
    trim: true,
    uppercase: true
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  convertedAmount: {
    type: Number,
    default: null
  },
  exchangeRate: {
    type: Number,
    default: null
  },
  giftCardType: {
    type: String,
    trim: true,
    default: null
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  screenshotUrl: {
    type: String,
    required: [true, 'Screenshot is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  adminNote: {
    type: String,
    trim: true,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

paymentProofSchema.index({ status: 1, createdAt: -1 });
paymentProofSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('PaymentProof', paymentProofSchema);
