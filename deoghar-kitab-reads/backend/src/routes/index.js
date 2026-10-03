const express = require('express');
const router = express.Router();

const usersRouter = require('./users');
const booksRouter = require('./books');
const chatRouter = require('./chat');
const notificationsRouter = require('./notifications');
const reservationsRouter = require('./reservations');
const analyticsRouter = require('./analytics');
const bookRequestsRouter = require('./bookRequests');

router.use('/users', usersRouter);
router.use('/books', booksRouter);
router.use('/chat', chatRouter);
router.use('/chats', chatRouter);
router.use('/notifications', notificationsRouter);
router.use('/reservations', reservationsRouter);
router.use('/analytics', analyticsRouter);
router.use('/book-requests', bookRequestsRouter);

module.exports = router;
