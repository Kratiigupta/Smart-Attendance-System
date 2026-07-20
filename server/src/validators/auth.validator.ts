import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['college_admin', 'student', 'faculty', 'parent']).default('college_admin'),
  collegeCode: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  
  // Institution Admin specific
  collegeName: z.string().optional(),
  
  // Student specific
  rollNumber: z.string().optional(),
  semester: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(1).max(8).optional()),
  
  // Faculty specific
  employeeId: z.string().optional(),
  
  // Parent specific
  studentRollNumber: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  collegeCode: z.string().toUpperCase()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  collegeCode: z.string().toUpperCase()
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(6)
});

