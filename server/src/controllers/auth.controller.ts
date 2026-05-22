import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import mongoose from 'mongoose';
import { College } from '../models/College.js';
import { User, Student, Faculty } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

// Input validators
const registerSchema = z.object({
  collegeName: z.string().min(2),
  collegeCode: z.string().min(2).max(10).toUpperCase(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  adminPhone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  collegeCode: z.string().toUpperCase()
});

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { collegeName, collegeCode, adminName, adminEmail, adminPassword, adminPhone } = registerSchema.parse(req.body);

    // Check if college code already registered
    const existingCollege = await College.findOne({ code: collegeCode }).session(session);
    if (existingCollege) {
      throw { status: 400, message: `College code ${collegeCode} is already registered.` };
    }

    // Create the college
    const college = new College({
      name: collegeName,
      code: collegeCode,
      subscription: { plan: 'free', validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } // 1 year
    });
    await college.save({ session });

    // Hash admin password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = new User({
      collegeId: college._id,
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'college_admin',
      phone: adminPhone
    });
    await admin.save({ session });

    // Generate tokens
    const tokenPayload = {
      userId: admin._id.toString(),
      collegeId: college._id.toString(),
      role: admin.role,
      email: admin.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const rfTokenRecord = new RefreshToken({
      userId: admin._id,
      token: refreshToken,
      expiresAt
    });
    await rfTokenRecord.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: envIsProd(),
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'College and admin account registered successfully.',
      data: {
        accessToken,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          collegeId: admin.collegeId,
          collegeName: college.name,
          collegeCode: college.code
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, collegeCode } = loginSchema.parse(req.body);

    const college = await College.findOne({ code: collegeCode });
    if (!college) {
      throw { status: 401, message: 'Invalid credentials or college code.' };
    }

    const user = await User.findOne({ email, collegeId: college._id });
    if (!user || !user.isActive) {
      throw { status: 401, message: 'Invalid credentials or inactive account.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid credentials.' };
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      collegeId: college._id.toString(),
      role: user.role,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const rfTokenRecord = new RefreshToken({
      userId: user._id,
      token: refreshToken,
      expiresAt
    });
    await rfTokenRecord.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: envIsProd(),
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          collegeId: user.collegeId,
          collegeName: college.name,
          collegeCode: college.code
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw { status: 401, message: 'Refresh token missing.' };
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Look up token in DB
    const tokenRecord = await RefreshToken.findOne({ token });
    if (!tokenRecord) {
      throw { status: 401, message: 'Session expired or invalid token.' };
    }

    // Delete old refresh token (token rotation)
    await tokenRecord.deleteOne();

    // Check user existence
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw { status: 401, message: 'User account is deactivated or missing.' };
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id.toString(),
      collegeId: user.collegeId.toString(),
      role: user.role,
      email: user.email
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRecord = new RefreshToken({
      userId: user._id,
      token: newRefreshToken,
      expiresAt
    });
    await newRecord.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: envIsProd(),
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: envIsProd(),
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw { status: 401, message: 'Not authenticated.' };
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    const college = await College.findById(user.collegeId);

    // Build responsive profile
    const profile: any = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      collegeName: college?.name,
      collegeCode: college?.code,
      phone: user.phone,
      avatar: user.avatar
    };

    // Include discriminators values
    if (user.role === 'student') {
      const student = await Student.findById(user._id).populate('departmentId');
      profile.studentData = {
        rollNumber: student?.rollNumber,
        department: student?.departmentId,
        semester: student?.semester,
        enrolledCourses: student?.enrolledCourses,
        hasFaceEncoding: !!student?.faceDescriptor
      };
    } else if (user.role === 'faculty' || user.role === 'hod') {
      const faculty = await Faculty.findById(user._id).populate('departmentId');
      profile.facultyData = {
        employeeId: faculty?.employeeId,
        department: faculty?.departmentId,
        designation: faculty?.designation,
        assignedCourses: faculty?.assignedCourses,
        maxHoursPerWeek: faculty?.maxHoursPerWeek,
        specializations: faculty?.specializations
      };
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

function envIsProd() {
  return process.env.NODE_ENV === 'production';
}
