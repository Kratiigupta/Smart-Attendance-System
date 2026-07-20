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
import chatbotRoutes from './chatbot.routes.js';
import uploadRoutes from './upload.routes.js';
import searchRoutes from './search.routes.js';

import assignmentsRoutes from './assignments.routes.js';
import lessonsRoutes from './lessons.routes.js';
import examsRoutes from './exams.routes.js';
import feesRoutes from './fees.routes.js';
import admissionsRoutes from './admissions.routes.js';
import facultyStudentRoutes from './faculty-student.routes.js';
import aiRoutes from './ai.routes.js';
import hostelRoutes from './hostel.routes.js';
import roomsRoutes from './rooms.routes.js';
import leavesRoutes from './leaves.routes.js';
import parentRoutes from './parent.routes.js';
import studentSettingsRoutes from './student-settings.routes.js';

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
router.use('/chatbot', chatbotRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);

// Modular extra routes
router.use('/', assignmentsRoutes);
router.use('/', lessonsRoutes);
router.use('/', examsRoutes);
router.use('/', feesRoutes);
router.use('/', admissionsRoutes);
router.use('/', facultyStudentRoutes);
router.use('/', aiRoutes);
router.use('/', hostelRoutes);
router.use('/', roomsRoutes);
router.use('/', leavesRoutes);
router.use('/', parentRoutes);
router.use('/', studentSettingsRoutes);

export default router;
