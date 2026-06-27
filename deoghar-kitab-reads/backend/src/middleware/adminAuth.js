const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify user is admin and authenticate with JWT directly (if protect is not used first)
const adminAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'deoghar_kitab_secret_key');
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (req.user && req.user.userType === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
      }
    } catch (error) {
      console.error('Admin auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to verify admin access for routes already protected by protect middleware
const requireAdmin = async (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

// Middleware to ensure the user is an approved seller
const requireApprovedSeller = async (req, res, next) => {
  if (req.user && req.user.userType === 'seller' && req.user.isSellerApproved) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Approved seller required' });
  }
};

module.exports = {
  adminAuth,
  requireAdmin,
  requireApprovedSeller
};