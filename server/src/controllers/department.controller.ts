import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const departmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  hodId: z.string().optional().nullable()
});

export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { name, code, hodId } = departmentSchema.parse(req.body);

    // Validate duplicate code
    const duplicate = await Department.findOne({ collegeId, code });
    if (duplicate) {
      throw { status: 400, message: `Department code ${code} already exists in this college.` };
    }

    // Validate HOD if provided
    if (hodId) {
      const hod = await User.findOne({ _id: hodId, collegeId });
      if (!hod) {
        throw { status: 404, message: 'Designated HOD user not found.' };
      }
    }

    const dept = new Department({
      collegeId,
      name,
      code,
      hodId: hodId || undefined
    });
    await dept.save();

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
    const depts = await Department.find({ collegeId })
      .populate('hodId', 'name email phone')
      .sort({ name: 1 });

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

    const dept = await Department.findOne({ _id: id, collegeId }).populate('hodId', 'name email phone');
    if (!dept) {
      throw { status: 404, message: 'Department not found.' };
    }

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
    const { name, code, hodId } = departmentSchema.parse(req.body);

    // Check duplicate code excluding current department
    if (code) {
      const duplicate = await Department.findOne({ collegeId, code, _id: { $ne: id } });
      if (duplicate) {
        throw { status: 400, message: `Department code ${code} is already allocated to another department.` };
      }
    }

    // Validate HOD if provided
    if (hodId) {
      const hod = await User.findOne({ _id: hodId, collegeId });
      if (!hod) {
        throw { status: 404, message: 'Designated HOD user not found.' };
      }
    }

    const dept = await Department.findOneAndUpdate(
      { _id: id, collegeId },
      { 
        $set: { 
          name, 
          code, 
          hodId: hodId || undefined 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!dept) {
      throw { status: 404, message: 'Department not found.' };
    }

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

    const dept = await Department.findOneAndDelete({ _id: id, collegeId });
    if (!dept) {
      throw { status: 404, message: 'Department not found.' };
    }

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
