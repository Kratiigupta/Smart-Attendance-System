import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboardOverview,
  getAdminDashboardCharts,
  getAdminDashboardActivity
} from '../controllers/analytics.controller.js';

const router = Router();

router.get('/student', authenticate, authorize('student'), getStudentDashboard);
router.get('/faculty', authenticate, authorize('faculty', 'hod'), getFacultyDashboard);

router.get('/admin/overview', authenticate, authorize('college_admin'), getAdminDashboardOverview);
router.get('/admin/charts', authenticate, authorize('college_admin'), getAdminDashboardCharts);
router.get('/admin/activity', authenticate, authorize('college_admin'), getAdminDashboardActivity);

export default router;
