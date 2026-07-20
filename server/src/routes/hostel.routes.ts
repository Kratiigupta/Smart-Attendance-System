import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { HostelBlock, HostelRoom } from '../models/Hostel.js';
const router = Router();
router.use(authenticate);

router.get('/hostels', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const data = await HostelBlock.find({ collegeId: new Types.ObjectId(collegeId) });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/hostels/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const { blockName } = req.query;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });
    if (!blockName) return res.status(400).json({ success: false, message: 'Block name query param required' });

    const data = await HostelRoom.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      blockName: String(blockName) 
    }).sort({ roomName: 1 });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/hostels/allocate', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const { blockName, roomName, studentName } = req.body;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });
    if (!blockName || !roomName || !studentName) {
      return res.status(400).json({ success: false, message: 'Block, room, and student name required' });
    }

    const room = await HostelRoom.findOne({ 
      collegeId: new Types.ObjectId(collegeId), 
      blockName, 
      roomName 
    });

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.status === 'full') return res.status(400).json({ success: false, message: 'Room is already fully occupied' });
    if (room.status === 'maintenance') return res.status(400).json({ success: false, message: 'Room is currently under maintenance' });

    room.occupants.push(studentName);
    
    if (room.occupants.length >= room.capacity) {
      room.status = 'full';
    } else {
      room.status = 'partial';
    }

    await room.save();

    // Increment occupiedRooms in Block
    await HostelBlock.findOneAndUpdate(
      { collegeId: new Types.ObjectId(collegeId), name: blockName },
      { $inc: { occupiedRooms: 1 } }
    );

    res.status(200).json({ success: true, message: 'Room allocated successfully', data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
