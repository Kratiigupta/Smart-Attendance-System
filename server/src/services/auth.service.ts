import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { College } from '../models/College.js';
import { User, Student, Faculty, Parent } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { OTP } from '../models/OTP.js';
import { sendOTPEmail } from './email.service.js';



export interface RegisterInput {
  role: 'college_admin' | 'student' | 'faculty' | 'parent';
  collegeCode: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  collegeName?: string;
  rollNumber?: string;
  semester?: number;
  employeeId?: string;
  studentRollNumber?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  collegeCode: string;
}

export const registerUser = async (body: RegisterInput) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { role, collegeCode, name, email, password, phone } = body;

    let college;
    let userRecord;

    if (role === 'college_admin') {
      if (!body.collegeName) {
        throw { status: 400, message: 'College name is required for institution registration.' };
      }

      // Check if college code already registered
      const existingCollege = await College.findOne({ code: collegeCode }).session(session);
      if (existingCollege) {
        throw { status: 400, message: `College code ${collegeCode} is already registered.` };
      }

      // Create the college
      college = new College({
        name: body.collegeName,
        code: collegeCode,
        subscription: { plan: 'free', validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } // 1 year
      });
      await college.save({ session });

      // Hash admin password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create admin user
      userRecord = new User({
        collegeId: college._id,
        name,
        email,
        passwordHash,
        role: 'college_admin',
        phone
      });
      await userRecord.save({ session });
    } else {
      // Find the college by code
      college = await College.findOne({ code: collegeCode }).session(session);
      if (!college) {
        throw { status: 404, message: `College with code ${collegeCode} does not exist.` };
      }

      // Check if email already exists in this college
      const existingUser = await User.findOne({ collegeId: college._id, email }).session(session);
      if (existingUser) {
        throw { status: 400, message: `Email ${email} is already registered under college ${collegeCode}.` };
      }

      // Hash user password
      const passwordHash = await bcrypt.hash(password, 12);

      if (role === 'student') {
        userRecord = new Student({
          collegeId: college._id,
          name,
          email,
          passwordHash,
          role: 'student',
          phone,
          rollNumber: body.rollNumber,
          semester: body.semester || 1,
          enrolledCourses: []
        });
      } else if (role === 'faculty') {
        userRecord = new Faculty({
          collegeId: college._id,
          name,
          email,
          passwordHash,
          role: 'faculty',
          phone,
          employeeId: body.employeeId,
          assignedCourses: [],
          maxHoursPerWeek: 18,
          specializations: []
        });
      } else {
        // Parent
        userRecord = new Parent({
          collegeId: college._id,
          name,
          email,
          passwordHash,
          role: 'parent',
          phone,
          studentRollNumber: body.studentRollNumber
        });
      }
      await userRecord.save({ session });
    }

    // Generate tokens
    const tokenPayload = {
      userId: userRecord._id.toString(),
      collegeId: college._id.toString(),
      role: userRecord.role,
      email: userRecord.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const rfTokenRecord = new RefreshToken({
      userId: userRecord._id,
      token: refreshToken,
      expiresAt
    });
    await rfTokenRecord.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      accessToken,
      refreshToken,
      user: {
        id: userRecord._id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        collegeId: userRecord.collegeId,
        collegeName: college.name,
        collegeCode: college.code
      }
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const loginUser = async (body: LoginInput) => {

  const { email, password, collegeCode } = body;

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

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      collegeName: college.name,
      collegeCode: college.code
    }
  };
};

export const rotateRefreshToken = async (token: string) => {

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

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

export const logoutUser = async (token: string) => {
  if (token) {
    await RefreshToken.deleteOne({ token });
  }
};

export const getCurrentUser = async (userId: string) => {

  const user = await User.findById(userId);
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

  return profile;
};

export const requestPasswordReset = async (email: string, collegeCode: string) => {
  const college = await College.findOne({ code: collegeCode });
  if (!college) {
    throw { status: 404, message: `College with code ${collegeCode} does not exist.` };
  }

  const user = await User.findOne({ email, collegeId: college._id });
  if (!user) {
    throw { status: 404, message: `User with email ${email} is not registered in this college.` };
  }

  // Generate 6 digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Save/Overwrite OTP
  await OTP.findOneAndUpdate(
    { email, purpose: 'reset_password' },
    { otp: otpCode, createdAt: new Date() },
    { upsert: true, new: true }
  );

  // Send Email
  await sendOTPEmail(email, otpCode, 'Password Reset');
  return { success: true, message: 'OTP sent successfully.' };
};

export const verifyOTPCode = async (email: string, otp: string) => {
  const record = await OTP.findOne({ email, otp, purpose: 'reset_password' });
  if (!record) {
    throw { status: 400, message: 'Invalid or expired OTP code.' };
  }
  return true;
};

export const resetPassword = async (email: string, otp: string, passwordNew: string) => {
  const record = await OTP.findOne({ email, otp, purpose: 'reset_password' });
  if (!record) {
    throw { status: 400, message: 'Invalid or expired OTP code.' };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(passwordNew, 12);
  user.passwordHash = passwordHash;
  await user.save();

  // Delete OTP
  await record.deleteOne();

  return { success: true, message: 'Password has been reset successfully.' };
};



