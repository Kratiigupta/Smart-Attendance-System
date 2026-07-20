import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { FeeItem, Transaction } from '../models/Fee.js';
const router = Router();
router.use(authenticate);

router.get('/fees/ledger', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const data = await FeeItem.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/fees/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const data = await Transaction.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/fees/pay', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    const { method, amount } = req.body;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    // Mark outstanding fees as paid
    await FeeItem.updateMany(
      { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), status: 'Unpaid' }, 
      { status: 'Paid' }
    );

    // Create a transaction
    const newTxn = new Transaction({
      collegeId: new Types.ObjectId(collegeId),
      studentId: new Types.ObjectId(userId),
      transactionId: `TXN${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: amount || 0,
      method: method || 'UPI / NetBanking',
      date: new Date().toISOString().split('T')[0],
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Success'
    });

    await newTxn.save();

    res.status(200).json({ success: true, message: 'Payment processed successfully', data: newTxn });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
