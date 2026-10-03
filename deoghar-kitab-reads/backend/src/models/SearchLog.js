const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Deoghar'
  },
  college: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  searchedAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('SearchLog', searchLogSchema);
