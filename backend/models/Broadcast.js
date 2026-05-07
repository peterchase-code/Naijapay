const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  target: {
    type: String,
    enum: ['all', 'users_only', 'admins_only'],
    default: 'all'
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentByName: {
    type: String,
    trim: true,
    default: 'Admin'
  },
  notifiedCount: {
    type: Number,
    default: 0
  },
  emailCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

broadcastSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
