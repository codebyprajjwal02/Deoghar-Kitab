const express = require('express');
const router = express.Router();
const { bookRequestController } = require('../controllers');
const { protect } = require('../middleware');

// GET /api/book-requests - Get all out-of-stock requests (PROTECTED)
router.get('/', protect, bookRequestController.getBookRequests);

// POST /api/book-requests - Create a book request (PROTECTED)
router.post('/', protect, bookRequestController.createBookRequest);

// POST /api/book-requests/reply - Reply to a request (PROTECTED - shopkeeper)
router.post('/reply', protect, bookRequestController.replyToBookRequest);

module.exports = router;
