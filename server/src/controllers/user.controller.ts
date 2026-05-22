import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, Student, Faculty } from '../models/User.js';
import { Department } from '../models/Department.js';
import { AuthRequest } from '../middleware/auth.js';

// Schemas for input validation
const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['college_admin', 'hod', 'faculty', 'student']),
  phone: z.string().optional(),
  tempPassword: z.string().min(6),
  
  // Student fields
  rollNumber: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  
  // Faculty fields
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  
  // Shared structural link
  departmentId: z.string().optional()
});

const bulkInviteSchema = z.object({
  users: z.array(inviteSchema)
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
  rollNumber: z.string().optional(),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  maxHoursPerWeek: z.number().optional(),
  specializations: z.array(z.string()).optional()
});

export const inviteUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID is required.' };
    }

    // Support single or array input
    const isBulk = Array.isArray(req.body.users);
    const usersToCreate = isBulk 
      ? bulkInviteSchema.parse(req.body).users 
      : [inviteSchema.parse(req.body)];

    const createdUsers = [];

    for (const userData of usersToCreate) {
      // Check duplicate email in same college
      const duplicate = await User.findOne({ collegeId, email: userData.email.toLowerCase() });
      if (duplicate) {
        if (!isBulk) {
          throw { status: 400, message: `Email ${userData.email} is already in use by this college.` };
        }
        continue; // skip duplicate in bulk
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.tempPassword, 12);

      let newUser;
      const baseFields = {
        collegeId,
        name: userData.name,
        email: userData.email.toLowerCase(),
        passwordHash,
        role: userData.role,
        phone: userData.phone,
        isActive: true
      };

      if (userData.role === 'student') {
        newUser = new Student({
          ...baseFields,
          rollNumber: userData.rollNumber,
          departmentId: userData.departmentId,
          semester: userData.semester || 1,
          enrolledCourses: []
        });
      } else if (userData.role === 'faculty' || userData.role === 'hod') {
        newUser = new Faculty({
          ...baseFields,
          employeeId: userData.employeeId,
          departmentId: userData.departmentId,
          designation: userData.designation,
          assignedCourses: [],
          maxHoursPerWeek: 18,
          specializations: []
        });
      } else {
        // Standard user / admin
        newUser = new User(baseFields);
      }

      await newUser.save();
      createdUsers.push({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
    }

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
    
    // Extract query parameters
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const role = req.query.role as string;
    const departmentId = req.query.departmentId as string;
    const isActive = req.query.isActive as string;
    const search = req.query.search as string;

    // Build filter query
    const filterQuery: any = { collegeId };

    if (role) filterQuery.role = role;
    if (isActive !== undefined) filterQuery.isActive = isActive === 'true';
    
    // Multi-tenant safe search
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Load and filter discriminators values
    let usersQuery;
    if (role === 'student') {
      if (departmentId) filterQuery.departmentId = departmentId;
      usersQuery = Student.find(filterQuery);
    } else if (role === 'faculty' || role === 'hod') {
      if (departmentId) filterQuery.departmentId = departmentId;
      usersQuery = Faculty.find(filterQuery);
    } else {
      usersQuery = User.find(filterQuery);
    }

    const [users, total] = await Promise.all([
      usersQuery
        .populate('departmentId', 'name code')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filterQuery)
    ]);

    // Clean up passwords from return structure
    const cleanedUsers = users.map((u: any) => {
      const { passwordHash, ...rest } = u;
      return { id: u._id, ...rest };
    });

    return res.status(200).json({
      success: true,
      data: {
        users: cleanedUsers,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { id } = req.params;

    const user = await User.findOne({ _id: id, collegeId });
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    // Populate and structure response safely
    let detailData: any = user.toObject();
    delete detailData.passwordHash;

    if (user.role === 'student') {
      const student = await Student.findOne({ _id: id, collegeId }).populate('departmentId').populate('enrolledCourses');
      detailData = student?.toObject();
      if (detailData) delete detailData.passwordHash;
    } else if (user.role === 'faculty' || user.role === 'hod') {
      const faculty = await Faculty.findOne({ _id: id, collegeId }).populate('departmentId').populate('assignedCourses');
      detailData = faculty?.toObject();
      if (detailData) delete detailData.passwordHash;
    }

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
    const updateBody = updateUserSchema.parse(req.body);

    const user = await User.findOne({ _id: id, collegeId });
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    // Separate fields based on schema discriminators
    const baseFields: any = {};
    if (updateBody.name !== undefined) baseFields.name = updateBody.name;
    if (updateBody.phone !== undefined) baseFields.phone = updateBody.phone;
    if (updateBody.avatar !== undefined) baseFields.avatar = updateBody.avatar;
    if (updateBody.isActive !== undefined) baseFields.isActive = updateBody.isActive;

    let updatedUser;
    if (user.role === 'student') {
      const studentFields: any = { ...baseFields };
      if (updateBody.departmentId !== undefined) studentFields.departmentId = updateBody.departmentId;
      if (updateBody.semester !== undefined) studentFields.semester = updateBody.semester;
      if (updateBody.rollNumber !== undefined) studentFields.rollNumber = updateBody.rollNumber;
      
      updatedUser = await Student.findOneAndUpdate(
        { _id: id, collegeId },
        { $set: studentFields },
        { new: true, runValidators: true }
      );
    } else if (user.role === 'faculty' || user.role === 'hod') {
      const facultyFields: any = { ...baseFields };
      if (updateBody.departmentId !== undefined) facultyFields.departmentId = updateBody.departmentId;
      if (updateBody.employeeId !== undefined) facultyFields.employeeId = updateBody.employeeId;
      if (updateBody.designation !== undefined) facultyFields.designation = updateBody.designation;
      if (updateBody.maxHoursPerWeek !== undefined) facultyFields.maxHoursPerWeek = updateBody.maxHoursPerWeek;
      if (updateBody.specializations !== undefined) facultyFields.specializations = updateBody.specializations;

      updatedUser = await Faculty.findOneAndUpdate(
        { _id: id, collegeId },
        { $set: facultyFields },
        { new: true, runValidators: true }
      );
    } else {
      updatedUser = await User.findOneAndUpdate(
        { _id: id, collegeId },
        { $set: baseFields },
        { new: true, runValidators: true }
      );
    }

    if (!updatedUser) {
      throw { status: 404, message: 'Failed to update user.' };
    }

    const cleanResult = updatedUser.toObject() as any;
    delete cleanResult.passwordHash;

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

    // Do soft deletion
    const user = await User.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    return res.status(200).json({
      success: true,
      message: 'User account deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
