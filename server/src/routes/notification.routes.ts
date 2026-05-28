import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  triggerAttendanceWarning,
  triggerFeeReminder,
  createDirectNotification
} from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/mark-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markRead);
router.delete('/:id', authenticate, deleteNotification);

// Roles specific actions
router.post('/alert-attendance', authenticate, authorize('faculty', 'hod', 'college_admin'), triggerAttendanceWarning);
router.post('/alert-fee', authenticate, authorize('college_admin'), triggerFeeReminder);
router.post('/send', authenticate, authorize('college_admin', 'faculty', 'hod'), createDirectNotification);

export default router;
