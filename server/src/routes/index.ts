import { Router } from 'express';
import authRoutes from './auth.routes.js';
import collegeRoutes from './college.routes.js';
import userRoutes from './user.routes.js';
import departmentRoutes from './department.routes.js';
import courseRoutes from './course.routes.js';
import attendanceRoutes from './attendance.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';
import timetableRoutes from './timetable.routes.js';
import extraRoutes from './extra.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/college', collegeRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/timetable', timetableRoutes);
router.use('/', extraRoutes);

export default router;
