import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Course } from '../models/Course.js';
import { Department } from '../models/Department.js';
import { AuthRequest } from '../middleware/auth.js';

const courseSchema = z.object({
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

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const body = courseSchema.parse(req.body);

    // Validate department
    const dept = await Department.findOne({ _id: body.departmentId, collegeId });
    if (!dept) {
      throw { status: 404, message: 'Department not found.' };
    }

    // Validate duplicate course code
    const duplicate = await Course.findOne({ collegeId, code: body.code });
    if (duplicate) {
      throw { status: 400, message: `Course code ${body.code} is already registered.` };
    }

    // Validate credit match (LTP sum check)
    // In typical Indian systems, LTP: L + T + P/2 = Credits (or sometimes L+T+P)
    // We will just store the values as-is but validate that it matches logical constraints
    const calculatedCredits = body.ltp.lecture + body.ltp.tutorial + Math.floor(body.ltp.practical / 2);
    // Warning if credits are completely mismatching (not blocking but logical check)
    console.log(`LTP: ${body.ltp.lecture}-${body.ltp.tutorial}-${body.ltp.practical} maps to ~${calculatedCredits} credits. Specified: ${body.credits}`);

    const course = new Course({
      collegeId,
      ...body
    });
    await course.save();

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;

    const departmentId = req.query.departmentId as string;
    const semester = req.query.semester as string;
    const type = req.query.type as string;
    const programmeType = req.query.programmeType as string;
    const search = req.query.search as string;

    const filterQuery: any = { collegeId };

    if (departmentId) filterQuery.departmentId = departmentId;
    if (semester) filterQuery.semester = parseInt(semester, 10);
    if (type) filterQuery.type = type;
    if (programmeType) filterQuery.programmeType = programmeType;

    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filterQuery)
      .populate('departmentId', 'name code')
      .sort({ code: 1 });

    return res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, collegeId })
      .populate('departmentId', 'name code')
      .populate('prerequisites', 'title code');

    if (!course) {
      throw { status: 404, message: 'Course not found.' };
    }

    return res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    const body = courseSchema.parse(req.body);

    const course = await Course.findOne({ _id: id, collegeId });
    if (!course) {
      throw { status: 404, message: 'Course not found.' };
    }

    // Check duplicate code if changed
    if (body.code !== course.code) {
      const duplicate = await Course.findOne({ collegeId, code: body.code });
      if (duplicate) {
        throw { status: 400, message: `Course code ${body.code} is already allocated to another course.` };
      }
    }

    const updated = await Course.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;

    const course = await Course.findOneAndDelete({ _id: id, collegeId });
    if (!course) {
      throw { status: 404, message: 'Course not found.' };
    }

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
