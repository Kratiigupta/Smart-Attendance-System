import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { College } from '../models/College.js';
import { User, Student, Faculty, Parent } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

// IN-MEMORY DATABASE FALLBACK FOR DEVELOPER PREVIEW
export const mockColleges: any[] = [];
export const mockUsers: any[] = [];

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
  if (mongoose.connection.readyState !== 1) {
    return handleMockRegister(body);
  }

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
  if (mongoose.connection.readyState !== 1) {
    return handleMockLogin(body);
  }

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
  if (mongoose.connection.readyState !== 1) {
    return handleMockRefreshToken(token);
  }

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
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  if (token) {
    await RefreshToken.deleteOne({ token });
  }
};

export const getCurrentUser = async (userId: string) => {
  if (mongoose.connection.readyState !== 1) {
    return handleMockGetMe(userId);
  }

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

// --- MOCK IMPLEMENTATIONS ---
const handleMockRegister = async (body: RegisterInput) => {
  const { role, collegeCode, name, email, password, phone } = body;

  let college: any;
  let userRecord;

  const passwordHash = await bcrypt.hash(password, 12);

  if (role === 'college_admin') {
    if (!body.collegeName) {
      throw { status: 400, message: 'College name is required for institution registration.' };
    }

    const existingCollege = mockColleges.find((c) => c.code === collegeCode);
    if (existingCollege) {
      throw { status: 400, message: `College code ${collegeCode} is already registered.` };
    }

    college = {
      _id: new mongoose.Types.ObjectId(),
      name: body.collegeName,
      code: collegeCode
    };
    mockColleges.push(college);

    userRecord = {
      _id: new mongoose.Types.ObjectId(),
      collegeId: college._id,
      name,
      email,
      passwordHash,
      role: 'college_admin',
      phone,
      isActive: true
    };
    mockUsers.push(userRecord);
  } else {
    college = mockColleges.find((c) => c.code === collegeCode);
    if (!college) {
      throw { status: 404, message: `College with code ${collegeCode} does not exist.` };
    }

    const existingUser = mockUsers.find((u) => u.collegeId.toString() === college._id.toString() && u.email === email);
    if (existingUser) {
      throw { status: 400, message: `Email ${email} is already registered under college ${collegeCode}.` };
    }

    if (role === 'student') {
      userRecord = {
        _id: new mongoose.Types.ObjectId(),
        collegeId: college._id,
        name,
        email,
        passwordHash,
        role: 'student',
        phone,
        isActive: true,
        rollNumber: body.rollNumber || 'CSE-2023-045',
        semester: body.semester || 3
      };
    } else if (role === 'faculty') {
      userRecord = {
        _id: new mongoose.Types.ObjectId(),
        collegeId: college._id,
        name,
        email,
        passwordHash,
        role: 'faculty',
        phone,
        isActive: true,
        employeeId: body.employeeId || 'FAC-1002'
      };
    } else {
      userRecord = {
        _id: new mongoose.Types.ObjectId(),
        collegeId: college._id,
        name,
        email,
        passwordHash,
        role: 'parent',
        phone,
        isActive: true,
        studentRollNumber: body.studentRollNumber || 'CSE-2023-045'
      };
    }
    mockUsers.push(userRecord);
  }

  const accessToken = generateAccessToken({
    userId: userRecord._id.toString(),
    collegeId: college._id.toString(),
    role: userRecord.role,
    email: userRecord.email
  });

  const refreshToken = generateRefreshToken({
    userId: userRecord._id.toString(),
    collegeId: college._id.toString(),
    role: userRecord.role,
    email: userRecord.email
  });

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
};

const handleMockLogin = async (body: LoginInput) => {
  const { email, password, collegeCode } = body;

  const college = mockColleges.find((c) => c.code === collegeCode);
  if (!college) {
    throw { status: 401, message: 'Invalid credentials or college code.' };
  }

  const user = mockUsers.find((u) => u.email === email && u.collegeId.toString() === college._id.toString());
  if (!user || !user.isActive) {
    throw { status: 401, message: 'Invalid credentials or inactive account.' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials.' };
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    collegeId: college._id.toString(),
    role: user.role,
    email: user.email
  });

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    collegeId: college._id.toString(),
    role: user.role,
    email: user.email
  });

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

const handleMockGetMe = async (userId: string) => {
  const user = mockUsers.find((u) => u._id.toString() === userId);
  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  const college = mockColleges.find((c) => c._id.toString() === user.collegeId.toString());

  const profile: any = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    collegeName: college?.name || 'SmartEdu Campus',
    collegeCode: college?.code || 'IITD',
    phone: user.phone
  };

  if (user.role === 'student') {
    profile.studentData = {
      rollNumber: user.rollNumber || 'CSE-2023-045',
      semester: user.semester || 3,
      department: { _id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
      enrolledCourses: [],
      hasFaceEncoding: false
    };
  } else if (user.role === 'faculty' || user.role === 'hod') {
    profile.facultyData = {
      employeeId: user.employeeId || 'FAC-1002',
      designation: 'Assistant Professor',
      department: { _id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
      assignedCourses: [],
      maxHoursPerWeek: 18,
      specializations: []
    };
  }

  return profile;
};

const handleMockRefreshToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw { status: 401, message: 'Invalid or expired refresh token.' };
  }

  const user = mockUsers.find((u) => u._id.toString() === decoded.userId);
  if (!user) {
    throw { status: 401, message: 'User not found.' };
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    collegeId: decoded.collegeId,
    role: user.role,
    email: user.email
  });

  const newRefreshToken = generateRefreshToken({
    userId: user._id.toString(),
    collegeId: decoded.collegeId,
    role: user.role,
    email: user.email
  });

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
};
