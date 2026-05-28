import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { io } from '../server.js';

export const sendNotification = async (
  collegeId: string,
  recipientId: string,
  title: string,
  message: string,
  category: 'Attendance' | 'Fees' | 'Timetable' | 'Academic' = 'Academic',
  priority: 'low' | 'medium' | 'high' = 'low'
) => {
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw { status: 404, message: 'Recipient not found.' };
  }

  const notification = new Notification({
    collegeId,
    recipient: recipientId,
    title,
    message,
    category,
    priority,
    isRead: false
  });

  await notification.save();

  // Emit realtime popup via Socket.io
  io.emit('notification:new', {
    id: notification._id,
    recipient: recipientId,
    title,
    message,
    category,
    priority,
    isRead: false,
    timestamp: 'Just now'
  });

  return notification;
};

export const getUserNotifications = async (collegeId: string, recipientId: string) => {
  const notifications = await Notification.find({ collegeId, recipient: recipientId })
    .sort({ createdAt: -1 });

  // Format to match frontend NotificationItem interface
  return notifications.map(n => {
    const timeDiff = Date.now() - new Date(n.createdAt).getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    let timestamp = 'Just now';
    if (days > 0) timestamp = `${days} day${days > 1 ? 's' : ''} ago`;
    else if (hours > 0) timestamp = `${hours} hour${hours > 1 ? 's' : ''} ago`;

    return {
      id: n._id,
      title: n.title,
      message: n.message,
      category: n.category || 'Academic',
      priority: n.priority || 'low',
      read: n.isRead,
      timestamp
    };
  });
};

export const markNotificationAsRead = async (collegeId: string, recipientId: string, notificationId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, collegeId, recipient: recipientId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw { status: 404, message: 'Notification not found.' };
  }

  return notification;
};

export const markAllNotificationsAsRead = async (collegeId: string, recipientId: string) => {
  await Notification.updateMany(
    { collegeId, recipient: recipientId, isRead: false },
    { $set: { isRead: true } }
  );
};

export const deleteNotificationData = async (collegeId: string, recipientId: string, notificationId: string) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    collegeId,
    recipient: recipientId
  });

  if (!notification) {
    throw { status: 404, message: 'Notification not found.' };
  }

  return notification;
};

export const sendAttendanceWarning = async (collegeId: string, studentId: string) => {
  const student = await User.findById(studentId);
  if (!student) {
    throw { status: 404, message: 'Student not found.' };
  }

  return sendNotification(
    collegeId,
    studentId,
    'Attendance Shortage Alert',
    `Your overall attendance rate is currently below the required 75% limit. Please attend upcoming lectures to avoid shortage penalties.`,
    'Attendance',
    'high'
  );
};

export const sendFeeReminder = async (collegeId: string, studentId: string) => {
  const student = await User.findById(studentId);
  if (!student) {
    throw { status: 404, message: 'Student not found.' };
  }

  return sendNotification(
    collegeId,
    studentId,
    'Semester Fee Reminder',
    `Hostel charges and semester tuition fees are due soon. Please clear pending balances to prevent late fee charges.`,
    'Fees',
    'medium'
  );
};
