const express = require('express');
const router = express.Router();
const { reservationController } = require('../controllers');
const { protect } = require('../middleware');

// GET /api/reservations - Get reservations involving user (PROTECTED)
router.get('/', protect, reservationController.getUserReservations);

// POST /api/reservations - Create a reservation (PROTECTED)
router.post('/', protect, reservationController.createReservation);

// POST /api/reservations/verify - Verify and complete reservation (PROTECTED - shopkeeper)
router.post('/verify', protect, reservationController.completeReservation);

// DELETE /api/reservations/:id - Cancel a reservation (PROTECTED)
router.delete('/:id', protect, reservationController.cancelReservation);

module.exports = router;
