import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Assignment } from '../models/Assignment.js';
const router = Router();
router.use(authenticate);

router.get('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const data = await Assignment.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assignments/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const updated = await Assignment.findOneAndUpdate(
      { 
        _id: id, 
        studentId: new Types.ObjectId(userId), 
        collegeId: new Types.ObjectId(collegeId) 
      },
      { status: 'submitted' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Assignment not found' });

    res.status(200).json({ success: true, message: 'Assignment submitted successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
