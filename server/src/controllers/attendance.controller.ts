import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ClassSession } from '../models/ClassSession.js';
import { Attendance } from '../models/Attendance.js';
import { Course } from '../models/Course.js';
import { User, Student } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { io } from '../server.js';

// Schema validations
const startSessionSchema = z.object({
  courseId: z.string(),
  durationMinutes: z.number().min(5).max(180).default(60),
  roomName: z.string().optional()
});

const markAttendanceSchema = z.object({
  classSessionId: z.string(),
  otp: z.string().length(6),
  webcamSnapshot: z.string().optional(), // Base64 snapshot image string
  deviceId: z.string().optional()
});

// Helper to generate a random 6-digit OTP code
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Faculty starts a new lecture class session (dynamic QR code generation)
 */
export const startSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const facultyId = req.user?.userId;
    const { courseId, durationMinutes, roomName } = startSessionSchema.parse(req.body);

    // Validate course exists
    const course = await Course.findOne({ _id: courseId, collegeId });
    if (!course) {
      throw { status: 404, message: 'Course not found.' };
    }

    // Set expiration time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Create session
    const otp = generateOTP();
    const session = new ClassSession({
      collegeId,
      courseId,
      facultyId,
      startTime,
      endTime,
      status: 'active',
      otp,
      otpExpiresAt: new Date(Date.now() + 30 * 1000), // Expiry in 30 seconds for dynamic rotation
      roomName
    });

    await session.save();

    // Populate course details
    await session.populate('courseId', 'title code');

    return res.status(201).json({
      success: true,
      message: 'Lecture session started successfully. QR code active.',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch list of all active or completed sessions for faculty
 */
export const getFacultySessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const facultyId = req.user?.userId;

    const sessions = await ClassSession.find({ collegeId, facultyId })
      .populate('courseId', 'title code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active session status along with real-time checked-in student rosters
 */
export const getActiveSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { sessionId } = req.params;

    const session = await ClassSession.findOne({ _id: sessionId, collegeId })
      .populate('courseId', 'title code');
      
    if (!session) {
      throw { status: 404, message: 'Class session not found.' };
    }

    // Check if session needs OTP rotation (every 30 seconds)
    if (session.status === 'active') {
      const now = new Date();
      const endTimeDate = new Date(session.endTime);
      
      if (now > endTimeDate) {
        session.status = 'completed';
        session.otp = '';
        await session.save();
      } else if (!session.otpExpiresAt || now > new Date(session.otpExpiresAt)) {
        // Rotate OTP!
        session.otp = generateOTP();
        session.otpExpiresAt = new Date(now.getTime() + 30 * 1000);
        await session.save();

        // Broadcast to dynamic listeners
        io.to(`session_${session._id}`).emit('otp-rotated', {
          otp: session.otp,
          expiresAt: session.otpExpiresAt
        });
      }
    }

    // Get all attendances logged for this session
    const attendances = await Attendance.find({ classSessionId: session._id, collegeId })
      .populate('studentId', 'name email rollNumber');

    return res.status(200).json({
      success: true,
      data: {
        session,
        attendances
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually complete a class session early
 */
export const endSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { sessionId } = req.params;

    const session = await ClassSession.findOne({ _id: sessionId, collegeId });
    if (!session) {
      throw { status: 404, message: 'Class session not found.' };
    }

    session.status = 'completed';
    session.otp = '';
    await session.save();

    // Broadcast completion to listeners
    io.to(`session_${session._id}`).emit('session-ended');

    return res.status(200).json({
      success: true,
      message: 'Class session completed.',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student scans dynamic QR, captures webcam snapshot, and logs attendance
 */
export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const studentId = req.user?.userId;
    const { classSessionId, otp, webcamSnapshot, deviceId } = markAttendanceSchema.parse(req.body);

    // Get active session
    const session = await ClassSession.findOne({ _id: classSessionId, collegeId });
    if (!session) {
      throw { status: 404, message: 'Class session not found.' };
    }

    if (session.status !== 'active') {
      throw { status: 400, message: 'This class session is no longer active.' };
    }

    // Validate expiration
    const now = new Date();
    if (now > new Date(session.endTime)) {
      session.status = 'completed';
      session.otp = '';
      await session.save();
      throw { status: 400, message: 'This class session has expired.' };
    }

    // Validate OTP code (rotating check-in pin)
    if (session.otp !== otp) {
      throw { status: 400, message: 'Invalid or expired QR check-in code. Please scan the newly rotated QR.' };
    }

    // Check duplicate check-ins
    const existing = await Attendance.findOne({ classSessionId: session._id, studentId });
    if (existing) {
      throw { status: 400, message: 'Your attendance is already marked for this class session.' };
    }

    // Optional device locking
    if (deviceId) {
      const duplicateDevice = await Attendance.findOne({ classSessionId: session._id, deviceId });
      if (duplicateDevice) {
        throw { status: 400, message: 'This device is already used to mark attendance for another student.' };
      }
    }

    // Save attendance
    const attendance = new Attendance({
      collegeId,
      studentId,
      courseId: session.courseId,
      classSessionId: session._id,
      date: new Date(),
      status: 'present',
      verificationMethod: 'qr',
      webcamSnapshot,
      deviceId
    });

    await attendance.save();

    // Fetch student info for real-time visual emit
    const student = await User.findById(studentId).select('name email rollNumber');

    // Notify faculty in real-time
    io.to(`session_${session._id}`).emit('student-checked-in', {
      attendanceId: attendance._id,
      studentId: student,
      verifiedAt: attendance.verifiedAt,
      status: attendance.status
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all active class sessions in the college for student manual selection
 */
export const getActiveSessionsForStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'User college context missing.' };
    }

    const sessions = await ClassSession.find({ collegeId, status: 'active' })
      .populate('courseId', 'title code')
      .populate('facultyId', 'name')
      .sort({ startTime: -1 });

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch current student's personal attendance history
 */
export const getStudentAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const studentId = req.user?.userId;

    // Fetch all courses in this college
    const courses = await Course.find({ collegeId }).select('title code');

    // Fetch all attendance logged by student
    const attendances = await Attendance.find({ collegeId, studentId })
      .populate('courseId', 'title code')
      .populate('classSessionId', 'startTime endTime roomName')
      .sort({ date: -1 });

    // Fetch total completed sessions per course in this college to calculate overall rate
    const completedSessions = await ClassSession.aggregate([
      { $match: { collegeId: collegeId, status: 'completed' } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]);

    const sessionsMap = completedSessions.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    return res.status(200).json({
      success: true,
      data: {
        courses,
        attendances,
        sessionsMap
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch detailed class logs for admin or HOD reports
 */
export const getClassLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { courseId } = req.query;

    const filter: any = { collegeId };
    if (courseId) {
      filter.courseId = courseId;
    }

    const logs = await Attendance.find(filter)
      .populate('studentId', 'name email rollNumber')
      .populate('courseId', 'title code')
      .populate('classSessionId', 'startTime endTime')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
