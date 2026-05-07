const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true,
    default: 'fa-money-bill'
  },
  color: {
    type: String,
    trim: true,
    default: '#00C853'
  },
  credentialType: {
    type: String,
    enum: ['tag', 'email', 'phone', 'username', 'details', 'link'],
    required: true
  },
  credentialLabel: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rate: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Exchange rate per unit in NGN. Set by admin.'
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
