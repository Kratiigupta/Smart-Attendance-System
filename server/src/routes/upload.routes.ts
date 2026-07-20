import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, Word documents, text, and zip files are allowed.'));
    }
  }
});

// Avatar upload route
router.post('/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!(req as any).file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const avatarUrl = `/uploads/${(req as any).file.filename}`;

    // Update user avatar in the DB
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl, profileImage: avatarUrl });

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: { avatarUrl }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Document/Assignment upload route
router.post('/document', authenticate, upload.single('document'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const documentUrl = `/uploads/${(req as any).file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: { documentUrl, originalName: (req as any).file.originalname }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Face descriptor enrollment route (for face-api.js)
router.post('/face-descriptor', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { descriptor } = req.body;
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ success: false, message: 'Invalid face descriptor. Must be a 128-dimensional array.' });
    }

    // Store the descriptor on the student user model
    await User.findByIdAndUpdate(userId, { faceDescriptor: descriptor });

    return res.status(200).json({
      success: true,
      message: 'Face descriptor enrolled successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get face descriptor for matching
router.get('/face-descriptor', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('faceDescriptor');
    if (!user || !(user as any).faceDescriptor || (user as any).faceDescriptor.length === 0) {
      return res.status(200).json({ success: true, data: { enrolled: false, descriptor: null } });
    }

    return res.status(200).json({
      success: true,
      data: { enrolled: true, descriptor: (user as any).faceDescriptor }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
