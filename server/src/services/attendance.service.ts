import { ClassSession } from '../models/ClassSession.js';
import { Attendance } from '../models/Attendance.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { SecurityLog } from '../models/SecurityLog.js';
import { io } from '../server.js';
import mongoose from 'mongoose';

// Memory stores to support realtime security watchdog rules without schema changes
export const previousOtpsMap = new Map<string, string[]>();
export const failedAttemptsMap = new Map<string, number>();

// Helper to generate a random 6-digit OTP code
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createSession = async (
  collegeId: string,
  facultyId: string,
  courseId: string,
  durationMinutes: number,
  roomName?: string
) => {
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

  // Emit session:start event globally
  io.emit('session:start', {
    sessionId: session._id,
    courseId: session.courseId,
    facultyId: session.facultyId,
    startTime: session.startTime,
    endTime: session.endTime,
    roomName: session.roomName,
    status: session.status
  });

  return session;
};

export const getFacultySessions = async (collegeId: string, facultyId: string) => {
  return ClassSession.find({ collegeId, facultyId })
    .populate('courseId', 'title code')
    .sort({ createdAt: -1 });
};

export const fetchAndProcessActiveSession = async (collegeId: string, sessionId: string) => {
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
      // Archive current OTP before rotating
      const sessIdStr = session._id.toString();
      const history = previousOtpsMap.get(sessIdStr) || [];
      if (session.otp && !history.includes(session.otp)) {
        history.push(session.otp);
        previousOtpsMap.set(sessIdStr, history.slice(-5)); // Keep only last 5 rotated OTPs
      }

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

  return {
    session,
    attendances
  };
};

export const manuallyEndSession = async (collegeId: string, sessionId: string) => {
  const session = await ClassSession.findOne({ _id: sessionId, collegeId });
  if (!session) {
    throw { status: 404, message: 'Class session not found.' };
  }

  session.status = 'completed';
  session.otp = '';
  await session.save();

  // Broadcast completion to listeners
  io.to(`session_${session._id}`).emit('session-ended');

  return session;
};

export const registerAttendance = async (
  collegeId: string,
  studentId: string,
  classSessionId: string,
  otp: string,
  webcamSnapshot?: string,
  deviceId?: string
) => {
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

  // Fetch student info early to use in security logging & socket events
  const student = await User.findById(studentId).select('name email rollNumber');
  const studentName = student?.name || 'Unknown Student';
  const rollNumber = (student as any)?.rollNumber || 'N/A';

  // 1. Duplicate Scans Verification
  const existing = await Attendance.findOne({ classSessionId: session._id, studentId });
  if (existing) {
    const secLog = new SecurityLog({
      collegeId,
      student: studentId,
      alertType: 'duplicate_scan',
      confidence: 0.9
    });
    await secLog.save();

    io.to(`session_${session._id}`).emit('security:alert', {
      sessionId: session._id,
      studentId: studentId,
      studentName,
      rollNumber,
      alertType: 'duplicate_scan',
      message: `Duplicate check-in scan attempt flagged for student ${studentName}.`,
      confidence: 0.9,
      createdAt: secLog.createdAt
    });

    throw { status: 400, message: 'Your attendance is already marked for this class session.' };
  }

  // 2. OTP/QR Code Verification (Current & Expired QR check)
  if (session.otp !== otp) {
    const sessIdStr = session._id.toString();
    const history = previousOtpsMap.get(sessIdStr) || [];
    
    if (history.includes(otp)) {
      // Flag Expired QR Check-in anomaly
      const secLog = new SecurityLog({
        collegeId,
        student: studentId,
        alertType: 'expired_qr',
        confidence: 0.8
      });
      await secLog.save();

      io.to(`session_${session._id}`).emit('security:alert', {
        sessionId: session._id,
        studentId: studentId,
        studentName,
        rollNumber,
        alertType: 'expired_qr',
        message: `Expired QR code scanned: Student ${studentName} scanned a recently rotated QR code (PIN ${otp}).`,
        confidence: 0.8,
        createdAt: secLog.createdAt
      });

      throw { status: 400, message: 'Invalid or expired QR check-in code. Please scan the newly rotated QR.' };
    } else {
      // 3. Multiple Failed Attempts check
      const attemptsKey = `${studentId}_${session._id}`;
      const attempts = (failedAttemptsMap.get(attemptsKey) || 0) + 1;
      failedAttemptsMap.set(attemptsKey, attempts);

      if (attempts >= 3) {
        const secLog = new SecurityLog({
          collegeId,
          student: studentId,
          alertType: 'multiple_failed_attempts',
          confidence: 0.85
        });
        await secLog.save();

        io.to(`session_${session._id}`).emit('security:alert', {
          sessionId: session._id,
          studentId: studentId,
          studentName,
          rollNumber,
          alertType: 'multiple_failed_attempts',
          message: `Multiple failed attempts: Student ${studentName} failed OTP verification ${attempts} times.`,
          confidence: 0.85,
          createdAt: secLog.createdAt
        });
      }

      throw { status: 400, message: 'Invalid check-in code verification.' };
    }
  }

  // 4. Device Locking (Device Collision Verification)
  if (deviceId) {
    const duplicateDevice = await Attendance.findOne({ classSessionId: session._id, deviceId });
    if (duplicateDevice) {
      const secLog = new SecurityLog({
        collegeId,
        student: studentId,
        alertType: 'device_collision',
        confidence: 1.0
      });
      await secLog.save();

      io.to(`session_${session._id}`).emit('security:alert', {
        sessionId: session._id,
        studentId: studentId,
        studentName,
        rollNumber,
        alertType: 'device_collision',
        message: `Device collision flagged: Multiple checkins from device ID ${deviceId}.`,
        confidence: 1.0,
        createdAt: secLog.createdAt
      });

      throw { status: 400, message: 'This device is already used to mark attendance for another student.' };
    }
  }

  // 5. Suspicious Timing check (Check-in late, after 15 mins or 80% through lecture)
  const elapsedMinutes = (now.getTime() - new Date(session.startTime).getTime()) / (60 * 1000);
  const totalDuration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (60 * 1000);
  const isSuspiciousTiming = elapsedMinutes > 15 || (elapsedMinutes / totalDuration) > 0.8;

  if (isSuspiciousTiming) {
    const secLog = new SecurityLog({
      collegeId,
      student: studentId,
      alertType: 'suspicious_timing',
      confidence: 0.7
    });
    await secLog.save();

    io.to(`session_${session._id}`).emit('security:alert', {
      sessionId: session._id,
      studentId: studentId,
      studentName,
      rollNumber,
      alertType: 'suspicious_timing',
      message: `Suspicious timing: Student ${studentName} checked in late (${Math.round(elapsedMinutes)} mins elapsed).`,
      confidence: 0.7,
      createdAt: secLog.createdAt
    });
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

  // Clear failed attempts upon success
  failedAttemptsMap.delete(`${studentId}_${session._id}`);

  // Notify faculty in real-time (legacy and standard sockets)
  io.to(`session_${session._id}`).emit('student-checked-in', {
    attendanceId: attendance._id,
    studentId: student,
    verifiedAt: attendance.verifiedAt,
    status: attendance.status
  });

  io.to(`session_${session._id}`).emit('student:checkedin', {
    sessionId: session._id,
    attendanceId: attendance._id,
    studentId: student,
    verifiedAt: attendance.verifiedAt,
    status: attendance.status
  });

  // Fetch all attendances logged for this session to emit attendance:update
  const allAttendances = await Attendance.find({ classSessionId: session._id, collegeId })
    .populate('studentId', 'name email rollNumber');

  // Emit attendance:update
  io.to(`session_${session._id}`).emit('attendance:update', {
    sessionId: session._id,
    attendances: allAttendances,
    totalCount: allAttendances.length
  });

  return attendance;
};

export const getActiveSessionsForStudent = async (collegeId: string) => {
  return ClassSession.find({ collegeId, status: 'active' })
    .populate('courseId', 'title code')
    .populate('facultyId', 'name')
    .sort({ startTime: -1 });
};

export const getStudentAttendanceStats = async (collegeId: string, studentId: string) => {
  // Fetch all courses in this college
  const courses = await Course.find({ collegeId }).select('title code');

  // Fetch all attendance logged by student
  const attendances = await Attendance.find({ collegeId, studentId })
    .populate('courseId', 'title code')
    .populate('classSessionId', 'startTime endTime roomName')
    .sort({ date: -1 });

  // Fetch total completed sessions per course in this college to calculate overall rate
  const completedSessions = await ClassSession.aggregate([
    { $match: { collegeId: new mongoose.Types.ObjectId(collegeId), status: 'completed' } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } }
  ]);

  const sessionsMap = completedSessions.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  return {
    courses,
    attendances,
    sessionsMap
  };
};

export const getClassLogsData = async (collegeId: string, courseId?: string) => {
  const filter: any = { collegeId };
  if (courseId) {
    filter.courseId = courseId;
  }

  return Attendance.find(filter)
    .populate('studentId', 'name email rollNumber')
    .populate('courseId', 'title code')
    .populate('classSessionId', 'startTime endTime')
    .sort({ date: -1 });
};
