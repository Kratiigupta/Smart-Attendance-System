import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { processChatMessage } from '../controllers/chatbot.controller.js';

const router = Router();

router.post('/message', authenticate, processChatMessage);

export default router;
