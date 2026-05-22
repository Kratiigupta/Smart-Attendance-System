import { Router } from 'express';
import { inviteUsers as invite, getUsers as list, getUserById as detail, updateUser as update, deleteUser as remove } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/invite', authorize('college_admin', 'hod'), invite);
router.get('/', authorize('college_admin', 'hod', 'faculty'), list);
router.get('/:id', detail);
router.put('/:id', authorize('college_admin', 'hod'), update);
router.delete('/:id', authorize('college_admin'), remove);

export default router;
