import { z } from 'zod';

export const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['college_admin', 'hod', 'faculty', 'student']),
  phone: z.string().optional(),
  tempPassword: z.string().min(6),
  
  // Student fields
  rollNumber: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  
  // Faculty fields
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  
  // Shared structural link
  departmentId: z.string().optional()
});

export const bulkInviteSchema = z.object({
  users: z.array(inviteSchema)
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  rollNumber: z.string().optional(),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  maxHoursPerWeek: z.number().optional(),
  specializations: z.array(z.string()).optional()
});
