import { Response } from 'express';
import { ChatbotService } from '../services/chatbot.service.js';
import { AuthRequest } from '../middleware/auth.js';

const chatbotService = new ChatbotService();

export const processChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId;
    const role = req.user?.role;
    const collegeId = req.user?.collegeId;

    if (!message || !userId || !role || !collegeId) {
      return res.status(400).json({ success: false, message: 'Message and user context are required' });
    }

    const reply = await chatbotService.processMessage(userId as string, role as string, collegeId as string, message);
    
    return res.status(200).json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error: any) {
    console.error('Chatbot Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process message' });
  }
};
