import { z } from 'zod';

export const settingsSchema = z.object({
  attendanceThreshold: z.number().min(50).max(100).optional(),
  timezone: z.string().optional(),
  workingDays: z.array(z.string()).optional()
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().optional(),
  address: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string()
  }).optional()
});
