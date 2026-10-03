const { Reservation, Book, User, Notification } = require('../models');

// Helper to generate a clean alphanumeric Reservation ID
const generateReservationId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = 'DK-RES-';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

// Check and expire pending reservations whose time limit has elapsed
const checkAndExpireReservations = async () => {
  try {
    const expiredReservations = await Reservation.find({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    }).populate('book');

    for (const resv of expiredReservations) {
      resv.status = 'expired';
      await resv.save();

      // Restore book status and stock
      if (resv.book) {
        resv.book.stock += 1;
        resv.book.status = 'available';
        await resv.book.save();
      }

      // Notify Buyer
      await Notification.create({
        user: resv.buyer,
        type: 'reservation_expired',
        payload: {
          message: `Your reservation for "${resv.book ? resv.book.title : 'Book'}" has expired.`,
          reservationId: resv.reservationId
        }
      });

      // Notify Seller
      await Notification.create({
        user: resv.seller,
        type: 'reservation_expired',
        payload: {
          message: `Reservation ${resv.reservationId} for "${resv.book ? resv.book.title : 'Book'}" has expired. The book is back in stock.`,
          reservationId: resv.reservationId
        }
      });
    }
  } catch (err) {
    console.error('Error running reservation expiry check:', err);
  }
};

// Create a reservation
const createReservation = async (req, res) => {
  try {
    await checkAndExpireReservations();

    const { bookId, durationHours = 24 } = req.body;
    const buyerId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.stock <= 0 || book.status === 'sold') {
      return res.status(400).json({ message: 'Book is out of stock or sold' });
    }

    // Decrement stock and mark reserved
    book.stock -= 1;
    if (book.stock <= 0) {
      book.status = 'reserved';
    }
    await book.save();

    const reservationId = generateReservationId();
    // Simulate simple QR code data URL (or text representation that client renders)
    const qrCode = `DEOGHAR-KITAB-RESERVATION:${reservationId}`;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + Number(durationHours));

    const reservation = new Reservation({
      book: bookId,
      buyer: buyerId,
      seller: book.seller,
      reservationId,
      qrCode,
      status: 'pending',
      expiresAt,
      price: book.price
    });

    const savedReservation = await reservation.save();

    // Create Notification for Buyer
    await Notification.create({
      user: buyerId,
      type: 'reservation_created',
      payload: {
        message: `You reserved "${book.title}" successfully. Pickup code: ${reservationId}.`,
        reservationId,
        expiresAt
      }
    });

    // Create Notification for Seller (Shopkeeper)
    await Notification.create({
      user: book.seller,
      type: 'reservation_created',
      payload: {
        message: `Book "${book.title}" has been reserved by a student. Code: ${reservationId}.`,
        reservationId,
        expiresAt
      }
    });

    res.status(201).json(savedReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user's reservations (both buyer and seller views)
const getUserReservations = async (req, res) => {
  try {
    await checkAndExpireReservations();

    const userId = req.user._id;
    // Find where user is buyer or seller
    const reservations = await Reservation.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('book')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ reservedAt: -1 });

    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Complete/Verify a reservation (Shopkeeper redeems QR code/ID)
const completeReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;
    const sellerId = req.user._id;

    const reservation = await Reservation.findOne({ reservationId }).populate('book');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: `Reservation is already ${reservation.status}` });
    }

    // Verify current user is the seller of the reserved book
    if (reservation.seller.toString() !== sellerId.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to verify this reservation' });
    }

    reservation.status = 'completed';
    reservation.pickupTime = new Date();
    await reservation.save();

    if (reservation.book) {
      // If stock is 0, mark as sold permanently.
      if (reservation.book.stock <= 0) {
        reservation.book.status = 'sold';
      } else {
        reservation.book.status = 'available';
      }
      await reservation.book.save();
    }

    // Notify Buyer
    await Notification.create({
      user: reservation.buyer,
      type: 'reservation_completed',
      payload: {
        message: `Your pickup for "${reservation.book ? reservation.book.title : 'Book'}" was verified and completed. Thank you!`,
        reservationId
      }
    });

    res.json({ message: 'Reservation verified and completed successfully', reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Cancel a reservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reservation = await Reservation.findById(id).populate('book');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel a reservation that is ${reservation.status}` });
    }

    // Buyer or Seller can cancel
    if (
      reservation.buyer.toString() !== userId.toString() &&
      reservation.seller.toString() !== userId.toString() &&
      req.user.userType !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Restore book stock and status
    if (reservation.book) {
      reservation.book.stock += 1;
      reservation.book.status = 'available';
      await reservation.book.save();
    }

    // Notify other party
    const notifyPartyId = reservation.buyer.toString() === userId.toString() ? reservation.seller : reservation.buyer;
    await Notification.create({
      user: notifyPartyId,
      type: 'reservation_cancelled',
      payload: {
        message: `Reservation ${reservation.reservationId} has been cancelled.`,
        reservationId: reservation.reservationId
      }
    });

    res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  completeReservation,
  cancelReservation,
  checkAndExpireReservations
};
