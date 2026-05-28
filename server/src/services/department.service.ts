import { Department } from '../models/Department.js';
import { User } from '../models/User.js';

export interface DepartmentInput {
  name: string;
  code: string;
  hodId?: string | null;
}

export const createDepartmentData = async (collegeId: string, body: DepartmentInput) => {
  const { name, code, hodId } = body;

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
  return dept;
};

export const getDepartmentsList = async (collegeId: string) => {
  return Department.find({ collegeId })
    .populate('hodId', 'name email phone')
    .sort({ name: 1 });
};

export const getDepartmentDetails = async (collegeId: string, id: string) => {
  const dept = await Department.findOne({ _id: id, collegeId }).populate('hodId', 'name email phone');
  if (!dept) {
    throw { status: 404, message: 'Department not found.' };
  }
  return dept;
};

export const updateDepartmentData = async (collegeId: string, id: string, body: DepartmentInput) => {
  const { name, code, hodId } = body;

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

  return dept;
};

export const deleteDepartmentData = async (collegeId: string, id: string) => {
  const dept = await Department.findOneAndDelete({ _id: id, collegeId });
  if (!dept) {
    throw { status: 404, message: 'Department not found.' };
  }
  return dept;
};
