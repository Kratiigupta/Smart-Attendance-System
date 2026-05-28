import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { createNotificationSchema } from '../validators/notification.validator.js';
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationData,
  sendAttendanceWarning,
  sendFeeReminder
} from '../services/notification.service.js';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const notifications = await getUserNotifications(collegeId, userId);

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!collegeId || !userId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const notification = await markNotificationAsRead(collegeId, userId, id);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    await markAllNotificationsAsRead(collegeId, userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!collegeId || !userId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    await deleteNotificationData(collegeId, userId, id);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const triggerAttendanceWarning = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { studentId } = req.body;
    if (!collegeId) {
      throw { status: 400, message: 'College context is missing.' };
    }
    if (!studentId) {
      throw { status: 400, message: 'Student ID is required.' };
    }

    const notif = await sendAttendanceWarning(collegeId, studentId);

    return res.status(201).json({
      success: true,
      message: 'Attendance warning notification sent successfully.',
      data: notif
    });
  } catch (error) {
    next(error);
  }
};

export const triggerFeeReminder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { studentId } = req.body;
    if (!collegeId) {
      throw { status: 400, message: 'College context is missing.' };
    }
    if (!studentId) {
      throw { status: 400, message: 'Student ID is required.' };
    }

    const notif = await sendFeeReminder(collegeId, studentId);

    return res.status(201).json({
      success: true,
      message: 'Semester fee reminder notification sent successfully.',
      data: notif
    });
  } catch (error) {
    next(error);
  }
};

export const createDirectNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College context is missing.' };
    }

    const { recipientId, title, message, category, priority } = createNotificationSchema.parse(req.body);
    const notif = await sendNotification(collegeId, recipientId, title, message, category, priority);

    return res.status(201).json({
      success: true,
      message: 'Notification sent successfully.',
      data: notif
    });
  } catch (error) {
    next(error);
  }
};
