import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { LeaveApplication } from '../models/Leave.js';
const router = Router();
router.use(authenticate);

router.get('/leaves', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const data = await LeaveApplication.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      facultyId: new Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leaves', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const newLeave = new LeaveApplication({
      collegeId: new Types.ObjectId(collegeId),
      facultyId: new Types.ObjectId(userId),
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...req.body
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: newLeave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
