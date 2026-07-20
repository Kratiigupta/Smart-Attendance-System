import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
const router = Router();
router.use(authenticate);

router.get('/student/settings', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      data: user.preferences || {
        pushNotif: true,
        emailNotif: false,
        alertShortage: true,
        lang: 'English',
        shareLocation: true,
        profileSearchable: true
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/student/settings', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const updated = await User.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: { preferences: req.body } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'Preferences updated successfully', data: updated.preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
