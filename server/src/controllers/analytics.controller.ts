import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getStudentAnalytics,
  getFacultyAnalytics,
  getAdminOverview,
  getAdminCharts,
  getAdminActivity
} from '../services/analytics.service.js';

export const getStudentDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const studentId = req.user?.userId;
    if (!collegeId || !studentId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const data = await getStudentAnalytics(collegeId, studentId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const facultyId = req.user?.userId;
    if (!collegeId || !facultyId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const data = await getFacultyAnalytics(collegeId, facultyId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) throw { status: 400, message: 'College context is missing.' };

    const data = await getAdminOverview(collegeId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardCharts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) throw { status: 400, message: 'College context is missing.' };

    const data = await getAdminCharts(collegeId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) throw { status: 400, message: 'College context is missing.' };

    const data = await getAdminActivity(collegeId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
