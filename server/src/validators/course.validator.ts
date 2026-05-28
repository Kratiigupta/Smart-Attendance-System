import { z } from 'zod';

export const courseSchema = z.object({
  departmentId: z.string(),
  code: z.string().min(2).toUpperCase(),
  title: z.string().min(2),
  credits: z.number().min(1).max(12),
  type: z.enum(['DSC', 'Minor', 'MDC', 'AEC', 'SEC', 'VAC', 'Research', 'Internship']),
  ltp: z.object({
    lecture: z.number().min(0),
    tutorial: z.number().min(0),
    practical: z.number().min(0)
  }),
  semester: z.number().min(1).max(8),
  programmeType: z.enum(['FYUP', 'ITEP', 'PG']).default('FYUP'),
  maxStudents: z.number().optional(),
  isElective: z.boolean().default(false),
  prerequisites: z.array(z.string()).default([])
});
