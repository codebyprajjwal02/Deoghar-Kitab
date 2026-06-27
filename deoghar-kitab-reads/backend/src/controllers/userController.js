const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Admin email (can also be set via environment)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sprajjwalsingh230@gmail.com';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'deoghar_kitab_secret_key', {
    expiresIn: '30d',
  });
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Normalize userType: support legacy 'user' -> 'buyer'
    let finalUserType = 'buyer';
    if (userType && userType.toLowerCase() === 'seller') finalUserType = 'seller';
    if (userType && userType.toLowerCase() === 'admin') finalUserType = 'admin';

    // Create new user (password is automatically hashed by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      userType: finalUserType,
      isSellerApproved: false,
      sellerRequestStatus: 'none'
    });

    const savedUser = await user.save();

    // Generate Token
    const token = generateToken(savedUser._id);

    res.status(201).json({
      _id: savedUser._id,
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      userType: savedUser.userType,
      isSellerApproved: savedUser.isSellerApproved,
      sellerRequestStatus: savedUser.sellerRequestStatus,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user by ID (for admin use)
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete user by ID (for admin use)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });

    // If user does not exist but matches the configured admin email, create an admin user
    if (!user && email === ADMIN_EMAIL) {
      const newUser = new User({
        name: 'Admin',
        email,
        password,
        userType: 'admin',
        isSellerApproved: false,
        sellerRequestStatus: 'none'
      });
      const saved = await newUser.save();
      return res.json({
        _id: saved._id,
        id: saved._id,
        name: saved.name,
        email: saved.email,
        userType: saved.userType,
        isSellerApproved: saved.isSellerApproved || false,
        sellerRequestStatus: saved.sellerRequestStatus || 'none',
        sellerRequest: saved.sellerRequest,
        createdAt: saved.createdAt,
        token: generateToken(saved._id)
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // If this email is the configured admin email, ensure userType is admin
    if (email === ADMIN_EMAIL && user.userType !== 'admin') {
      user.userType = 'admin';
      await user.save();
    }

    // Return user data (including token, without password)
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      isSellerApproved: user.isSellerApproved || false,
      sellerRequestStatus: user.sellerRequestStatus || (user.sellerRequest && user.sellerRequest.requested ? 'pending' : 'none'),
      sellerRequest: user.sellerRequest,
      createdAt: user.createdAt,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Request to become a seller
const requestSeller = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, location, bio } = req.body;
    
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has a pending request or is already a seller
    if (user.userType === 'seller' && user.isSellerApproved) {
      return res.status(400).json({ message: 'You are already an approved seller' });
    }

    if (user.sellerRequestStatus === 'pending') {
      return res.status(400).json({ message: 'You already have a pending seller request' });
    }

    // Update the user with seller request information
    user.sellerRequest = user.sellerRequest || {};
    user.sellerRequest.requested = true;
    user.sellerRequest.requestedAt = new Date();
    user.sellerRequest.approved = false;
    user.sellerRequest.approvedAt = null;
    user.sellerInfo = {
      name: name,
      phone: phone,
      location: location,
      bio: bio
    };
    user.sellerRequestStatus = 'pending';
    user.isSellerApproved = false;
    
    const updatedUser = await user.save();
    
    res.json({
      message: 'Seller request submitted successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        sellerRequestStatus: updatedUser.sellerRequestStatus,
        isSellerApproved: updatedUser.isSellerApproved
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Approve a seller request
const approveSeller = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has a pending request
    if (user.sellerRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending seller request found or already processed' });
    }

    // Update the user to approve the seller request
    user.userType = 'seller';
    user.isSellerApproved = true;
    user.sellerRequest.approved = true;
    user.sellerRequest.approvedAt = new Date();
    user.sellerRequestStatus = 'approved';

    const updatedUser = await user.save();

    res.json({
      message: 'Seller request approved successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        isSellerApproved: updatedUser.isSellerApproved,
        sellerRequestStatus: updatedUser.sellerRequestStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reject a seller request
const rejectSeller = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has a pending request
    if (user.sellerRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending seller request found or already processed' });
    }

    // Update the user to reject the seller request
    user.sellerRequest.requested = false;
    user.sellerRequest.requestedAt = null;
    user.isSellerApproved = false;
    user.sellerRequestStatus = 'rejected';

    const updatedUser = await user.save();

    res.json({
      message: 'Seller request rejected',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        isSellerApproved: updatedUser.isSellerApproved,
        sellerRequestStatus: updatedUser.sellerRequestStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Cancel a seller request
const cancelSellerRequest = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has a pending request
    if (user.sellerRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending seller request to cancel or already processed' });
    }

    // Update the user to cancel the seller request
    user.sellerRequest.requested = false;
    user.sellerRequest.requestedAt = null;
    user.sellerRequestStatus = 'none';
    user.isSellerApproved = false;

    const updatedUser = await user.save();

    res.json({
      message: 'Seller request cancelled successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        sellerRequestStatus: updatedUser.sellerRequestStatus,
        isSellerApproved: updatedUser.isSellerApproved
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all users (for admin use)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Don't return passwords
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  loginUser,
  requestSeller,
  approveSeller,
  rejectSeller,
  cancelSellerRequest
};