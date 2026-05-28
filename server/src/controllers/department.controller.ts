import { Response, NextFunction } from 'express';
import { departmentSchema } from '../validators/department.validator.js';
import {
  createDepartmentData,
  getDepartmentsList,
  getDepartmentDetails,
  updateDepartmentData,
  deleteDepartmentData
} from '../services/department.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const body = departmentSchema.parse(req.body);
    const dept = await createDepartmentData(collegeId, body);

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: dept
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const depts = await getDepartmentsList(collegeId);

    return res.status(200).json({
      success: true,
      data: depts
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const dept = await getDepartmentDetails(collegeId, id);

    return res.status(200).json({
      success: true,
      data: dept
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    const body = departmentSchema.parse(req.body);
    const dept = await updateDepartmentData(collegeId, id, body);

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: dept
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    await deleteDepartmentData(collegeId, id);

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
