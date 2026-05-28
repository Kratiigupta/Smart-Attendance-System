import { Response, NextFunction } from 'express';
import { settingsSchema, profileSchema } from '../validators/college.validator.js';
import {
  getDashboardStatsData,
  getCollegeProfileData,
  updateCollegeSettingsData,
  updateCollegeProfileData
} from '../services/college.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const stats = await getDashboardStatsData(collegeId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getCollegeProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const college = await getCollegeProfileData(collegeId);

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
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const updateData = settingsSchema.parse(req.body);
    const college = await updateCollegeSettingsData(collegeId, updateData);

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
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const updateData = profileSchema.parse(req.body);
    const college = await updateCollegeProfileData(collegeId, updateData);

    return res.status(200).json({
      success: true,
      message: 'College profile updated successfully.',
      data: college
    });
  } catch (error) {
    next(error);
  }
};
