import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboard
} from '../controllers/analytics.controller.js';

const router = Router();

router.get('/student', authenticate, authorize('student'), getStudentDashboard);
router.get('/faculty', authenticate, authorize('faculty', 'hod'), getFacultyDashboard);
router.get('/admin', authenticate, authorize('college_admin'), getAdminDashboard);

export default router;
