import { Response, NextFunction } from 'express';
import { startSessionSchema, markAttendanceSchema } from '../validators/attendance.validator.js';
import {
  createSession,
  getFacultySessions as getFacultySessionsService,
  fetchAndProcessActiveSession,
  manuallyEndSession,
  registerAttendance,
  getActiveSessionsForStudent as getActiveSessionsForStudentService,
  getStudentAttendanceStats,
  getClassLogsData
} from '../services/attendance.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const startSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const facultyId = req.user?.userId;
    if (!collegeId || !facultyId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const { courseId, durationMinutes, roomName } = startSessionSchema.parse(req.body);
    const session = await createSession(collegeId, facultyId, courseId, durationMinutes, roomName);

    return res.status(201).json({
      success: true,
      message: 'Lecture session started successfully. QR code active.',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultySessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const facultyId = req.user?.userId;
    if (!collegeId || !facultyId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const sessions = await getFacultySessionsService(collegeId, facultyId);

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { sessionId } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College context is missing.' };
    }

    const result = await fetchAndProcessActiveSession(collegeId, sessionId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const endSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const { sessionId } = req.params;
    if (!collegeId) {
      throw { status: 400, message: 'College context is missing.' };
    }

    const session = await manuallyEndSession(collegeId, sessionId);

    return res.status(200).json({
      success: true,
      message: 'Class session completed.',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const studentId = req.user?.userId;
    if (!collegeId || !studentId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const { classSessionId, otp, webcamSnapshot, deviceId } = markAttendanceSchema.parse(req.body);
    const attendance = await registerAttendance(
      collegeId,
      studentId,
      classSessionId,
      otp,
      webcamSnapshot,
      deviceId
    );

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveSessionsForStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'User college context missing.' };
    }

    const sessions = await getActiveSessionsForStudentService(collegeId);

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const studentId = req.user?.userId;
    if (!collegeId || !studentId) {
      throw { status: 400, message: 'User context is missing.' };
    }

    const result = await getStudentAttendanceStats(collegeId, studentId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getClassLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const courseId = req.query.courseId as string | undefined;
    if (!collegeId) {
      throw { status: 400, message: 'College context is missing.' };
    }

    const logs = await getClassLogsData(collegeId, courseId);

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
