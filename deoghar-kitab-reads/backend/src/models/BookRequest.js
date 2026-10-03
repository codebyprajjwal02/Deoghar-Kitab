const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  bookTitle: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Deoghar'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'reserved', 'cancelled'],
    default: 'pending'
  },
  responses: [{
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    shopName: {
      type: String
    },
    reply: {
      type: String,
      enum: ['Available Tomorrow', 'Available in 3 Days', 'Can Arrange', 'Out of Stock']
    },
    price: {
      type: Number
    },
    repliedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('BookRequest', bookRequestSchema);
