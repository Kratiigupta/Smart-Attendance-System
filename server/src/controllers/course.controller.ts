import { Response, NextFunction } from 'express';
import { courseSchema } from '../validators/course.validator.js';
import {
  createCourseData,
  getCoursesFiltered,
  getCourseDetails,
  updateCourseData,
  deleteCourseData
} from '../services/course.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const body = courseSchema.parse(req.body);
    const course = await createCourseData(collegeId, body);

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
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const filter = {
      departmentId: req.query.departmentId as string,
      semester: req.query.semester as string,
      type: req.query.type as string,
      programmeType: req.query.programmeType as string,
      search: req.query.search as string
    };

    const courses = await getCoursesFiltered(collegeId, filter);

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
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const course = await getCourseDetails(collegeId, id);

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
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const body = courseSchema.parse(req.body);
    const updated = await updateCourseData(collegeId, id, body);

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
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    await deleteCourseData(collegeId, id);

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
