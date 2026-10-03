// Controllers index file
const userController = require('./userController');
const bookController = require('./bookController');
const chatController = require('./chatController');
const notificationController = require('./notificationController');
const reservationController = require('./reservationController');
const analyticsController = require('./analyticsController');
const bookRequestController = require('./bookRequestController');

module.exports = {
  userController,
  bookController,
  chatController,
  notificationController,
  reservationController,
  analyticsController,
  bookRequestController
};