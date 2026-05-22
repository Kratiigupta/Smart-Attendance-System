import { Router } from 'express';
import {
  startSession,
  getFacultySessions,
  getActiveSession,
  endSession,
  markAttendance,
  getStudentAttendance,
  getClassLogs,
  getActiveSessionsForStudent
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Faculty & HOD endpoints
router.post('/start', authorize('faculty', 'hod'), startSession);
router.get('/faculty', authorize('faculty', 'hod'), getFacultySessions);
router.get('/session/:sessionId', authorize('faculty', 'hod', 'college_admin'), getActiveSession);
router.post('/session/:sessionId/end', authorize('faculty', 'hod'), endSession);

// Student endpoints
router.get('/active-sessions', authorize('student'), getActiveSessionsForStudent);
router.post('/mark', authorize('student'), markAttendance);
router.get('/student', authorize('student'), getStudentAttendance);

// Reports & Admin logs
router.get('/logs', authorize('college_admin', 'hod', 'faculty'), getClassLogs);

export default router;
