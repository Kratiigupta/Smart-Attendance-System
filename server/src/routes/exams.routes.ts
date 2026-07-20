import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Exam } from '../models/Exam.js';
const router = Router();
router.use(authenticate);

router.get('/exams', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const data = await Exam.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
