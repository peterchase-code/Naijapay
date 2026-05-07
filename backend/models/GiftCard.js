const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'fa-gift'
  },
  color: {
    type: String,
    default: '#FF6D00'
  },
  supportedCurrencies: {
    type: [String],
    default: ['USD', 'GBP', 'EUR']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GiftCard', giftCardSchema);
