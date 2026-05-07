const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  fromCurrency: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  toCurrency: {
    type: String,
    required: true,
    default: 'NGN',
    trim: true,
    uppercase: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  service: {
    type: String,
    trim: true,
    default: null
  },
  serviceName: {
    type: String,
    trim: true,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, service: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
