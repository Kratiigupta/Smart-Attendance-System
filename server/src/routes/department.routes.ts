import { Router } from 'express';
import { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } from '../controllers/department.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('college_admin'), createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', authorize('college_admin', 'hod'), updateDepartment);
router.delete('/:id', authorize('college_admin'), deleteDepartment);

export default router;
