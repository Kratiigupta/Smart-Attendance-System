import { z } from 'zod';

export const startSessionSchema = z.object({
  courseId: z.string(),
  durationMinutes: z.number().min(5).max(180).default(60),
  roomName: z.string().optional()
});

export const markAttendanceSchema = z.object({
  classSessionId: z.string(),
  otp: z.string().length(6),
  webcamSnapshot: z.string().optional(),
  deviceId: z.string().optional()
});
