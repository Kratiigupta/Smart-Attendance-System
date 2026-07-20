import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Lesson } from '../models/Lesson.js';
const router = Router();
router.use(authenticate);

router.get('/learn/lessons', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const data = await Lesson.find({ collegeId: new Types.ObjectId(collegeId) });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
