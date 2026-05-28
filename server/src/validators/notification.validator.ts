import { z } from 'zod';

export const createNotificationSchema = z.object({
  recipientId: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  category: z.enum(['Attendance', 'Fees', 'Timetable', 'Academic']).default('Academic'),
  priority: z.enum(['low', 'medium', 'high']).default('low')
});
