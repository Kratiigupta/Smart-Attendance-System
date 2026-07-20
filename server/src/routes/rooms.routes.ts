import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Room } from '../models/Room.js';
const router = Router();
router.use(authenticate);

router.get('/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const data = await Room.find({ collegeId: new Types.ObjectId(collegeId) });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const newRoom = new Room({
      collegeId: new Types.ObjectId(collegeId),
      ...req.body
    });

    await newRoom.save();
    res.status(201).json({ success: true, message: 'Room created successfully', data: newRoom });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
