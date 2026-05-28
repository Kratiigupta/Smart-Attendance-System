import { Response, NextFunction } from 'express';
import { inviteSchema, bulkInviteSchema, updateUserSchema } from '../validators/user.validator.js';
import {
  inviteUsersData,
  getUsersFiltered,
  getUserDetails,
  updateUserData,
  deleteUserData
} from '../services/user.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const inviteUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const isBulk = Array.isArray(req.body.users);
    const usersToCreate = isBulk 
      ? bulkInviteSchema.parse(req.body).users 
      : [inviteSchema.parse(req.body)];

    const createdUsers = await inviteUsersData(collegeId, usersToCreate, isBulk);

    return res.status(201).json({
      success: true,
      message: `Successfully onboarded ${createdUsers.length} user(s).`,
      data: createdUsers
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const filter = {
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 20,
      role: req.query.role as string,
      departmentId: req.query.departmentId as string,
      isActive: req.query.isActive as string,
      search: req.query.search as string
    };

    const result = await getUsersFiltered(collegeId, filter);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const detailData = await getUserDetails(collegeId, id);

    return res.status(200).json({
      success: true,
      data: detailData
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const updateBody = updateUserSchema.parse(req.body);
    const cleanResult = await updateUserData(collegeId, id, updateBody);

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully.',
      data: cleanResult
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    await deleteUserData(collegeId, id);

    return res.status(200).json({
      success: true,
      message: 'User account deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
