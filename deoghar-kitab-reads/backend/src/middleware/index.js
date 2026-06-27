// Middleware index file
const errorHandler = require('./errorHandler');
const { protect } = require('./auth');
const { adminAuth, requireAdmin, requireApprovedSeller } = require('./adminAuth');

module.exports = {
  errorHandler,
  protect,
  adminAuth,
  requireAdmin
  ,requireApprovedSeller
};