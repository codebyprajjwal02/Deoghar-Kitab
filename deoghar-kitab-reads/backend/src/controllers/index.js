// Controllers index file
const userController = require('./userController');
const bookController = require('./bookController');
const chatController = require('./chatController');
const notificationController = require('./notificationController');

module.exports = {
  userController,
  bookController,
  chatController,
  notificationController
};