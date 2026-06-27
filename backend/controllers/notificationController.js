const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in employee
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findForEmployee(req.user.employee_id);
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.markAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    // Ensure it belongs to the user
    if (notification.employee_id !== req.user.employee_id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this notification' });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const notifications = await Notification.markAllAsRead(req.user.employee_id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
