import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { TimetableSlot } from '../models/TimetableSlot.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

// POST /optimize - Generate draft preview (Does NOT save to DB)
router.post('/optimize', authenticate, authorize('college_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID context missing.' };
    }

    const courses = await Course.find({ collegeId });
    const teachers = await User.find({ collegeId, role: { $in: ['faculty', 'hod'] } });
    const dbRooms = await Room.find({ collegeId, status: { $ne: 'maintenance' } });

    if (courses.length === 0 || teachers.length === 0) {
      throw { status: 400, message: 'Ensure courses and teachers are registered in the system before running optimizer.' };
    }

    // Default Rooms if DB is empty
    let rooms = dbRooms.map(r => ({ id: r._id.toString(), name: r.name, capacity: r.capacity }));
    if (rooms.length === 0) {
       rooms = [
        { id: 'r1', name: 'LH-101', capacity: 60 },
        { id: 'r2', name: 'LH-102', capacity: 60 },
        { id: 'r3', name: 'LH-301', capacity: 80 },
        { id: 'r4', name: 'LH-401', capacity: 80 },
        { id: 'r5', name: 'Lab-A', capacity: 40 },
        { id: 'r6', name: 'Lab-B', capacity: 40 }
      ];
    }

    const slots = [
      'Mon-09:00', 'Mon-10:00', 'Mon-11:00', 'Mon-12:00', 'Mon-14:00',
      'Tue-09:00', 'Tue-10:00', 'Tue-11:00', 'Tue-12:00', 'Tue-14:00',
      'Wed-09:00', 'Wed-10:00', 'Wed-11:00', 'Wed-12:00', 'Wed-14:00',
      'Thu-09:00', 'Thu-10:00', 'Thu-11:00', 'Thu-12:00', 'Thu-14:00',
      'Fri-09:00', 'Fri-10:00', 'Fri-11:00', 'Fri-12:00', 'Fri-14:00'
    ];

    const defaultTeacherId = teachers[0]._id.toString();

    const solverCourses = courses.map(c => {
      let teacherId = defaultTeacherId;
      const matchingFaculty = teachers.find(t => 
        (t as any).assignedCourses?.some((acId: any) => acId.toString() === c._id.toString())
      );
      if (matchingFaculty) {
        teacherId = matchingFaculty._id.toString();
      }

      return {
        id: c._id.toString(),
        title: c.title,
        teacher_id: teacherId,
        credits: c.credits || 3
      };
    });

    const solverTeachers = teachers.map(t => ({
      id: t._id.toString(),
      name: t.name
    }));

    try {
      const solverRes = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses: solverCourses,
          rooms,
          slots,
          teachers: solverTeachers
        })
      });

      const solverData = await solverRes.json();

      return res.status(200).json({
        success: true,
        message: 'Draft timetable generated successfully. Review before publishing.',
        data: solverData
      });
    } catch (fetchErr) {
      console.warn('⚠️ Python Timetable Solver is offline. Returning simulated solver response.');
      
      const simulatedTimetable = courses.slice(0, 8).map((c, idx) => {
        const room = rooms[idx % rooms.length];
        const slot = slots[idx % slots.length];
        const teacher = teachers[idx % teachers.length];
        
        const [dayStr, timeStr] = slot.split('-');
        let dayFull = 'Monday';
        if (dayStr === 'Tue') dayFull = 'Tuesday';
        else if (dayStr === 'Wed') dayFull = 'Wednesday';
        else if (dayStr === 'Thu') dayFull = 'Thursday';
        else if (dayStr === 'Fri') dayFull = 'Friday';

        return {
          course_id: c._id,
          course_title: c.title,
          room_id: room.id,
          room_name: room.name,
          teacher_id: teacher._id,
          teacher_name: teacher.name,
          slot,
          day: dayFull,
          startTime: timeStr
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Draft timetable generated (Simulated Preview). Review before publishing.',
        data: {
          status: 'optimized',
          timetable: simulatedTimetable
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /publish - Save drafted timetable to database
router.post('/publish', authenticate, authorize('college_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'College ID context missing.' };
    }
    const { timetableData, academicYear, semester } = req.body;
    
    if (!timetableData || !Array.isArray(timetableData)) {
       throw { status: 400, message: 'Invalid timetable data provided.' };
    }

    const sem = semester || 1;
    const year = academicYear || '2025-2026';
    
    const timeToSlotNum: Record<string, number> = {
      '09:00': 1, '10:00': 2, '11:00': 3, '12:00': 4,
      '14:00': 6, '15:00': 7, '16:00': 8
    };

    const slotsToInsert = timetableData.map(slot => {
      const [dayStr, timeStr] = slot.slot.split('-');
      
      let dayFull = 'Monday';
      if (dayStr === 'Tue') dayFull = 'Tuesday';
      else if (dayStr === 'Wed') dayFull = 'Wednesday';
      else if (dayStr === 'Thu') dayFull = 'Thursday';
      else if (dayStr === 'Fri') dayFull = 'Friday';

      const slotNumber = timeToSlotNum[timeStr] || 1;
      
      // Calculate end time
      let endTimeStr = '09:50';
      if (timeStr === '09:00') endTimeStr = '09:50';
      else if (timeStr === '10:00') endTimeStr = '10:50';
      else if (timeStr === '11:00') endTimeStr = '11:50';
      else if (timeStr === '12:00') endTimeStr = '12:50';
      else if (timeStr === '14:00') endTimeStr = '14:50';
      else if (timeStr === '15:00') endTimeStr = '15:50';
      else if (timeStr === '16:00') endTimeStr = '16:50';

      return {
        collegeId,
        courseId: slot.course_id,
        facultyId: slot.teacher_id,
        roomId: slot.room_id.startsWith('r') ? null : slot.room_id, // Handle fallback mock room IDs gracefully
        day: dayFull,
        slotNumber,
        startTime: timeStr,
        endTime: endTimeStr,
        type: 'Lecture', // Defaulting to Lecture for now
        semester: sem,
        academicYear: year,
        isPublished: true
      };
    }).filter(s => s.courseId && s.facultyId);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await TimetableSlot.deleteMany({ collegeId, semester: sem, academicYear: year }, { session });

      if(slotsToInsert.length > 0) {
         await TimetableSlot.insertMany(slotsToInsert, { session });
      }

      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ success: true, message: 'Timetable published successfully.' });
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (error) {
    next(error);
  }
});

// GET /admin - Fetch all published timetable slots for college
router.get('/admin', authenticate, authorize('college_admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collegeId = req.user?.collegeId;
    const slots = await TimetableSlot.find({ collegeId, isPublished: true })
      .populate('courseId', 'title code')
      .populate('facultyId', 'name')
      .populate('roomId', 'name');

    const formatted = slots.map(s => ({
      id: s._id,
      courseName: (s.courseId as any)?.title || 'Unknown',
      courseCode: (s.courseId as any)?.code || 'N/A',
      faculty: (s.facultyId as any)?.name || 'Unknown',
      room: (s.roomId as any)?.name || 'Unassigned',
      type: s.type,
      day: s.day,
      slotNumber: s.slotNumber,
      time: `${s.startTime} - ${s.endTime}`
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// GET /student - Fetch timetable for enrolled courses
router.get('/student', authenticate, authorize('student'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const collegeId = req.user?.collegeId;
    
    const student = await User.findById(userId);
    if (!student) throw { status: 404, message: 'Student not found.' };

    const enrolledCourseIds = (student as any).enrolledCourses || [];
    
    if (enrolledCourseIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const slots = await TimetableSlot.find({ 
      collegeId, 
      isPublished: true, 
      courseId: { $in: enrolledCourseIds } 
    })
      .populate('courseId', 'title code')
      .populate('facultyId', 'name')
      .populate('roomId', 'name');

    const formatted = slots.map(s => ({
      id: s._id,
      courseName: (s.courseId as any)?.title || 'Unknown',
      courseCode: (s.courseId as any)?.code || 'N/A',
      faculty: (s.facultyId as any)?.name || 'Unknown',
      room: (s.roomId as any)?.name || 'Unassigned',
      type: s.type,
      day: s.day,
      slotNumber: s.slotNumber,
      time: `${s.startTime} - ${s.endTime}`
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

// GET /faculty - Fetch timetable for a faculty member
router.get('/faculty', authenticate, authorize('faculty', 'hod'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const collegeId = req.user?.collegeId;
    
    const slots = await TimetableSlot.find({ 
      collegeId, 
      isPublished: true, 
      facultyId: userId 
    })
      .populate('courseId', 'title code')
      .populate('roomId', 'name');

    const formatted = slots.map(s => ({
      id: s._id,
      courseName: (s.courseId as any)?.title || 'Unknown',
      courseCode: (s.courseId as any)?.code || 'N/A',
      type: s.type,
      room: (s.roomId as any)?.name || 'Unassigned',
      batch: 'All', // We don't have batch level details yet
      time: `${s.startTime} - ${s.endTime}`,
      day: s.day,
      slotNumber: s.slotNumber
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
});

export default router;
