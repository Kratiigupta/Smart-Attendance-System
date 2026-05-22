import { Router } from 'express';
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/course.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('college_admin', 'hod'), createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.put('/:id', authorize('college_admin', 'hod'), updateCourse);
router.delete('/:id', authorize('college_admin', 'hod'), deleteCourse);

export default router;
