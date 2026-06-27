const express = require('express');
const router = express.Router();

const usersRouter = require('./users');
const booksRouter = require('./books');
const chatRouter = require('./chat');
const notificationsRouter = require('./notifications');

router.use('/users', usersRouter);
router.use('/books', booksRouter);
router.use('/chat', chatRouter);
router.use('/chats', chatRouter);
router.use('/notifications', notificationsRouter);

module.exports = router;
