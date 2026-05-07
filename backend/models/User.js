const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  bankName: { type: String, trim: true },
  accountName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  country: { type: String, trim: true },
  currency: { type: String, trim: true, default: 'NGN' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  bankDetails: {
    type: bankDetailsSchema,
    default: null
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    withdrawalUpdates: { type: Boolean, default: true },
    balanceUpdates: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ referralCode: 1 });

module.exports = mongoose.model('User', userSchema);
