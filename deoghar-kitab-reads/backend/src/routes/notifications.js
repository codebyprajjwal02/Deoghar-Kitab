const express = require('express');
const router = express.Router();
const { notificationController } = require('../controllers');
const { protect } = require('../middleware');

// GET /api/notifications → list user notifications
router.get('/', protect, notificationController.getNotifications);

// PUT /api/notifications/:id/read → mark read
router.put('/:id/read', protect, notificationController.markRead);

module.exports = router;
