const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  additionalInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

credentialSchema.index({ assignedTo: 1, service: 1 });
credentialSchema.index({ isActive: 1 });

module.exports = mongoose.model('Credential', credentialSchema);
