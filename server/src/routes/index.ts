import { Router } from 'express';
import authRoutes from './auth.routes.js';
import collegeRoutes from './college.routes.js';
import userRoutes from './user.routes.js';
import departmentRoutes from './department.routes.js';
import courseRoutes from './course.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/college', collegeRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);

export default router;
