const { Notification } = require('../models');

// Get notifications for the current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mark a notification as read
const markRead = async (req, res) => {
  try {
    const notifId = req.params.id;
    const notif = await Notification.findById(notifId);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    if (String(notif.user) !== String(req.user._id)) return res.status(403).json({ message: 'Access denied' });

    notif.read = true;
    await notif.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getNotifications,
  markRead
};
