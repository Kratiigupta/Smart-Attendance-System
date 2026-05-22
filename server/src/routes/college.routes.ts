import { Router } from 'express';
import { getDashboardStats, getCollegeProfile, updateCollegeSettings, updateCollegeProfile } from '../controllers/college.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize('college_admin', 'super_admin'), getDashboardStats);
router.get('/profile', getCollegeProfile);
router.put('/settings', authorize('college_admin'), updateCollegeSettings);
router.put('/profile', authorize('college_admin'), updateCollegeProfile);

export default router;
