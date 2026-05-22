import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { College } from '../models/College.js';
import { User, Student, Faculty } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';
import { AuthRequest } from '../middleware/auth.js';

const settingsSchema = z.object({
  attendanceThreshold: z.number().min(50).max(100).optional(),
  timezone: z.string().optional(),
  workingDays: z.array(z.string()).optional()
});

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().optional(),
  address: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string()
  }).optional()
});

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const [studentCount, facultyCount, departmentCount, courseCount] = await Promise.all([
      Student.countDocuments({ collegeId, role: 'student', isActive: true }),
      Faculty.countDocuments({ collegeId, role: { $in: ['faculty', 'hod'] }, isActive: true }),
      Department.countDocuments({ collegeId }),
      Course.countDocuments({ collegeId })
    ]);

    // Let's get department breakdown for visual graphs
    const depts = await Department.find({ collegeId }).select('name code');
    const deptStats = await Promise.all(depts.map(async (dept) => {
      const sCount = await Student.countDocuments({ collegeId, departmentId: dept._id, role: 'student', isActive: true });
      const fCount = await Faculty.countDocuments({ collegeId, departmentId: dept._id, role: { $in: ['faculty', 'hod'] }, isActive: true });
      return {
        name: dept.name,
        code: dept.code,
        students: sCount,
        faculty: fCount
      };
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        totalDepartments: departmentCount,
        totalCourses: courseCount,
        departmentBreakdown: deptStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCollegeProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const college = await College.findById(collegeId);
    if (!college) {
      throw { status: 404, message: 'College not found.' };
    }

    return res.status(200).json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollegeSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const updateData = settingsSchema.parse(req.body);

    const college = await College.findById(collegeId);
    if (!college) {
      throw { status: 404, message: 'College not found.' };
    }

    if (updateData.attendanceThreshold !== undefined) {
      college.settings.attendanceThreshold = updateData.attendanceThreshold;
    }
    if (updateData.timezone !== undefined) {
      college.settings.timezone = updateData.timezone;
    }
    if (updateData.workingDays !== undefined) {
      college.settings.workingDays = updateData.workingDays;
    }

    await college.save();

    return res.status(200).json({
      success: true,
      message: 'College settings updated successfully.',
      data: college
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollegeProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const updateData = profileSchema.parse(req.body);

    const college = await College.findByIdAndUpdate(
      collegeId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!college) {
      throw { status: 404, message: 'College not found.' };
    }

    return res.status(200).json({
      success: true,
      message: 'College profile updated successfully.',
      data: college
    });
  } catch (error) {
    next(error);
  }
};
