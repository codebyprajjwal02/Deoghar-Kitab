const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  // Backwards-compatible seller request object
  sellerRequest: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: {
      type: Date,
      default: null
    },
    approved: {
      type: Boolean,
      default: false
    },
    approvedAt: {
      type: Date,
      default: null
    }
  },
  // New fields for seller approval workflow
  isSellerApproved: {
    type: Boolean,
    default: true
  },
  sellerRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'approved'
  },
  sellerInfo: {
    name: String,
    phone: String,
    location: String,
    bio: String,
    showPhone: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);