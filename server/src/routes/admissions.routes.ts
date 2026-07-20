import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AdmissionApplication } from '../models/Admission.js';
const router = Router();
router.use(authenticate);

router.get('/admissions', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const data = await AdmissionApplication.find({ collegeId: new Types.ObjectId(collegeId) }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admissions', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const { name, email, programme, marks } = req.body;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const newApp = new AdmissionApplication({
      collegeId: new Types.ObjectId(collegeId),
      name,
      email,
      programme,
      marks: marks.includes('%') ? marks : `${marks}%`,
      date: new Date().toISOString().split('T')[0],
      status: 'applied'
    });

    await newApp.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: newApp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
