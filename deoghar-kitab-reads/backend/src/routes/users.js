const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, requireAdmin } = require('../middleware');

/**
 * PUBLIC ROUTES
 */

// POST /api/users/register  → Create new user (PUBLIC - legacy password flow)
router.post('/register', userController.createUser);

// POST /api/users/login → Login user (PUBLIC - legacy password flow)
router.post('/login', userController.loginUser);

// POST /api/users/firebase-sync → Sync a Firebase-authenticated user with MongoDB (PUBLIC)
router.post('/firebase-sync', userController.syncFirebaseUser);

/**
 * PROTECTED USER ROUTES
 */

// GET /api/users/:id → Get user by ID (PROTECTED)
router.get('/:id', protect, userController.getUserById);

/**
 * ADMIN ROUTES (PROTECTED + ADMIN ONLY)
 */

// GET /api/users → Get all users (ADMIN only)
router.get('/', protect, requireAdmin, userController.getAllUsers);

// PUT /api/users/:id → Update user (ADMIN only)
router.put('/:id', protect, requireAdmin, userController.updateUser);

// DELETE /api/users/:id → Delete user (ADMIN only)
router.delete('/:id', protect, requireAdmin, userController.deleteUser);

module.exports = router;

