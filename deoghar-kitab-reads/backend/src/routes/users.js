const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, requireAdmin } = require('../middleware');

/**
 * PUBLIC ROUTES
 */

// POST /api/users/register  → Create new user (PUBLIC)
router.post('/register', userController.createUser);

// POST /api/users/login → Login user (PUBLIC)
router.post('/login', userController.loginUser);

/**
 * PROTECTED USER ROUTES
 */

// GET /api/users/:id → Get user by ID (PROTECTED)
router.get('/:id', protect, userController.getUserById);

// PUT /api/users/:id/request-seller → Request to become seller (PROTECTED USER)
router.put('/:id/request-seller', protect, userController.requestSeller);

// PUT /api/users/:id/cancel-seller-request → Cancel seller request (PROTECTED USER)
router.put('/:id/cancel-seller-request', protect, userController.cancelSellerRequest);

/**
 * ADMIN ROUTES (PROTECTED + ADMIN ONLY)
 */

// GET /api/users → Get all users (ADMIN only)
router.get('/', protect, requireAdmin, userController.getAllUsers);

// PUT /api/users/:id → Update user (ADMIN only)
router.put('/:id', protect, requireAdmin, userController.updateUser);

// PUT /api/users/:id/approve-seller → Approve seller request (ADMIN only)
router.put('/:id/approve-seller', protect, requireAdmin, userController.approveSeller);

// PUT /api/users/:id/reject-seller → Reject seller request (ADMIN only)
router.put('/:id/reject-seller', protect, requireAdmin, userController.rejectSeller);

// DELETE /api/users/:id → Delete user (ADMIN only)
router.delete('/:id', protect, requireAdmin, userController.deleteUser);

module.exports = router;

