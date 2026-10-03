const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Admin email (can also be set via environment)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sprajjwalsingh230@gmail.com';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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
      isSellerApproved: true,
      sellerRequestStatus: 'approved'
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
      isSellerApproved: true,
      sellerRequestStatus: 'approved',
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
        isSellerApproved: true,
        sellerRequestStatus: 'approved'
      });
      const saved = await newUser.save();
      return res.json({
        _id: saved._id,
        id: saved._id,
        name: saved.name,
        email: saved.email,
        userType: saved.userType,
        isSellerApproved: true,
        sellerRequestStatus: 'approved',
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
      isSellerApproved: true,
      sellerRequestStatus: 'approved',
      createdAt: user.createdAt,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Request to become a seller (Mocked - always succeeds)
const requestSeller = async (req, res) => {
  res.json({ message: 'Seller request approved successfully' });
};

// Approve a seller request (Mocked - always succeeds)
const approveSeller = async (req, res) => {
  res.json({ message: 'Seller request approved successfully' });
};

// Reject a seller request (Mocked - always succeeds)
const rejectSeller = async (req, res) => {
  res.json({ message: 'Seller request rejected' });
};

// Cancel a seller request (Mocked - always succeeds)
const cancelSellerRequest = async (req, res) => {
  res.json({ message: 'Seller request cancelled successfully' });
};

// Sync a Firebase-authenticated user with MongoDB (find or create)
const syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, name, userType } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: 'firebaseUid and email are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const displayName = name || normalizedEmail.split('@')[0];

    // 1) Find by firebaseUid first
    let user = await User.findOne({ firebaseUid });

    // 2) Otherwise find by email (legacy user that previously signed up with password)
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
      if (user && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    // 3) Otherwise create a brand new user (Firebase-only, no password)
    if (!user) {
      let finalUserType = 'buyer';
      if (userType && String(userType).toLowerCase() === 'seller') finalUserType = 'seller';
      if (userType && String(userType).toLowerCase() === 'admin') finalUserType = 'admin';

      user = new User({
        name: displayName,
        email: normalizedEmail,
        firebaseUid,
        userType: finalUserType,
        isSellerApproved: true,
        sellerRequestStatus: 'approved',
      });
      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      isSellerApproved: user.isSellerApproved !== false,
      sellerRequestStatus: user.sellerRequestStatus || 'approved',
      sellerRequest: user.sellerRequest || { requested: false, requestedAt: null, approved: false, approvedAt: null },
      createdAt: user.createdAt,
      token,
    });
  } catch (error) {
    console.error('syncFirebaseUser error:', error);
    return res.status(500).json({ message: 'Server Error' });
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
  syncFirebaseUser,
  requestSeller,
  approveSeller,
  rejectSeller,
  cancelSellerRequest
};