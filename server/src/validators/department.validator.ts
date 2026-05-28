import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  hodId: z.string().optional().nullable()
});
