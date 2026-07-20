import { Student, Faculty, User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { ClassSession } from '../models/ClassSession.js';
import { Attendance } from '../models/Attendance.js';
import { Department } from '../models/Department.js';
import { FeeItem } from '../models/Fee.js';
import { HostelRoom } from '../models/Hostel.js';
import mongoose from 'mongoose';

export const getStudentAnalytics = async (collegeId: string, studentId: string) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw { status: 404, message: 'Student not found.' };
  }

  // Count overall completed class sessions of student's enrolled courses
  const totalClasses = await ClassSession.countDocuments({
    collegeId,
    courseId: { $in: student.enrolledCourses },
    status: 'completed'
  });

  const totalAttended = await Attendance.countDocuments({
    collegeId,
    studentId,
    status: 'present'
  });

  const totalAbsent = Math.max(0, totalClasses - totalAttended);
  const overallPct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Weekly Trend calculation (Past 8 Weeks)
  const weeklyTrend = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

    const completedInWeek = await ClassSession.countDocuments({
      collegeId,
      courseId: { $in: student.enrolledCourses },
      status: 'completed',
      startTime: { $gte: weekStart, $lte: weekEnd }
    });

    const attendedInWeek = await Attendance.countDocuments({
      collegeId,
      studentId,
      status: 'present',
      date: { $gte: weekStart, $lte: weekEnd }
    });

    const rate = completedInWeek > 0 ? Math.round((attendedInWeek / completedInWeek) * 100) : 0;
    weeklyTrend.push({
      name: `W${8 - i}`,
      rate
    });
  }

  // Low Attendance Prediction
  let lowAttendancePrediction = '';
  if (totalClasses === 0) {
    lowAttendancePrediction = 'No sessions have been conducted yet.';
  } else if (overallPct < 75) {
    const classesNeeded = Math.ceil((0.75 * totalClasses - totalAttended) / 0.25);
    lowAttendancePrediction = `Shortage Warning: You need to attend the next ${classesNeeded} lectures consecutively to reach 75%.`;
  } else {
    const safeMiss = Math.floor((totalAttended - 0.75 * totalClasses) / 0.75);
    lowAttendancePrediction = safeMiss > 0
      ? `Safe Standing: You can afford to miss up to ${safeMiss} lectures while remaining above 75%.`
      : `Safe Standing: Your attendance is currently at ${overallPct}%, close to the 75% limit. Do not skip classes.`;
  }

  // Streak Calculation
  const attendances = await Attendance.find({ collegeId, studentId, status: 'present' })
    .select('date')
    .sort({ date: -1 });

  let streak = 0;
  if (attendances.length > 0) {
    streak = 1;
    let prevDate = new Date(attendances[0].date);
    prevDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < attendances.length; i++) {
      const currDate = new Date(attendances[i].date);
      currDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        prevDate = currDate;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
  }

  // Course-wise stand
  const enrolledCourses = await Course.find({ _id: { $in: student.enrolledCourses } });
  const coursesBreakdown = [];

  const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#14b8a6', '#8b5cf6', '#06b6d4'];
  let colorIdx = 0;

  for (const course of enrolledCourses) {
    const total = await ClassSession.countDocuments({
      collegeId,
      courseId: course._id,
      status: 'completed'
    });

    const attended = await Attendance.countDocuments({
      collegeId,
      studentId,
      courseId: course._id,
      status: 'present'
    });

    const courseFaculty = await Faculty.findOne({ assignedCourses: course._id });
    const facultyName = courseFaculty ? courseFaculty.name : 'Not Assigned';

    coursesBreakdown.push({
      code: course.code,
      name: course.title,
      faculty: facultyName,
      attended,
      total,
      type: course.type || 'DSC',
      color: COLORS[colorIdx++ % COLORS.length]
    });
  }

  return {
    overallPct,
    totalAttended,
    totalAbsent,
    totalClasses,
    weeklyTrend,
    lowAttendancePrediction,
    streak,
    courses: coursesBreakdown
  };
};

export const getFacultyAnalytics = async (collegeId: string, facultyId: string) => {
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw { status: 404, message: 'Faculty not found.' };
  }

  // Query all students in the college
  const students = await Student.find({ collegeId });
  const weakStudents = [];

  for (const student of students) {
    // Check if enrolled in one of faculty's courses
    const isEnrolled = student.enrolledCourses.some(cId => 
      faculty.assignedCourses.some(faId => faId.toString() === cId.toString())
    );

    if (isEnrolled) {
      const total = await ClassSession.countDocuments({
        collegeId,
        courseId: { $in: student.enrolledCourses },
        status: 'completed'
      });

      const attended = await Attendance.countDocuments({
        collegeId,
        studentId: student._id,
        status: 'present'
      });

      const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

      if (rate < 75) {
        weakStudents.push({
          name: student.name,
          rollNo: student.rollNumber || 'N/A',
          attendance: rate,
          email: student.email
        });
      }
    }
  }

  // Course Stats (Student distribution by course code)
  const courseStats = [];
  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'];
  let colorIdx = 0;

  const facultyCourses = await Course.find({ _id: { $in: faculty.assignedCourses } });
  for (const course of facultyCourses) {
    const count = await Student.countDocuments({
      collegeId,
      enrolledCourses: course._id
    });

    courseStats.push({
      name: course.code,
      value: count,
      color: COLORS[colorIdx++ % COLORS.length]
    });
  }

  // Live session stats
  const activeSession = await ClassSession.findOne({ collegeId, facultyId, status: 'active' });
  let liveSessionStats;
  if (activeSession) {
    const totalEnrolled = await Student.countDocuments({ collegeId, enrolledCourses: activeSession.courseId });
    liveSessionStats = {
      sessionId: activeSession._id,
      active: true,
      courseCode: (await Course.findById(activeSession.courseId))?.code || 'N/A',
      present: await Attendance.countDocuments({ classSessionId: activeSession._id, status: 'present' }),
      total: totalEnrolled
    };
  } else {
    liveSessionStats = { active: false };
  }

  // Overall Avg Attendance
  const completedSessions = await ClassSession.find({ collegeId, facultyId, status: 'completed' });
  let totalEnrolled = 0;
  let totalPresent = 0;

  for (const session of completedSessions) {
    const enrolledCount = await Student.countDocuments({ collegeId, enrolledCourses: session.courseId });
    const presentCount = await Attendance.countDocuments({ classSessionId: session._id, status: 'present' });
    totalEnrolled += enrolledCount;
    totalPresent += presentCount;
  }

  const avgAttendance = totalEnrolled > 0
    ? `${Math.round((totalPresent / totalEnrolled) * 100)}%`
    : '0%';

  // Daily attendance rates of the past 6 weekdays (Mon-Sat) for this faculty member's sessions
  const weeklyAttendanceData = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayName = daysOfWeek[dayDate.getDay()];
    
    // Find all completed sessions on this day by this faculty member
    const sessionsOnDay = await ClassSession.find({
      collegeId,
      facultyId,
      status: 'completed',
      startTime: { $gte: dayStart, $lte: dayEnd }
    });

    let rate = 0;
    if (sessionsOnDay.length > 0) {
      let enrolledSum = 0;
      const sessionIds = sessionsOnDay.map(s => s._id);
      for (const session of sessionsOnDay) {
        const enrolledCount = await Student.countDocuments({ collegeId, enrolledCourses: session.courseId });
        enrolledSum += enrolledCount;
      }
      const attendsCount = await Attendance.countDocuments({
        collegeId,
        classSessionId: { $in: sessionIds },
        status: 'present'
      });
      rate = enrolledSum > 0 ? Math.round((attendsCount / enrolledSum) * 100) : 0;
      if (rate > 100) rate = 100;
    }

    weeklyAttendanceData.push({
      name: dayName,
      rate
    });
  }

  const totalStudentsCount = courseStats.reduce((sum, c) => sum + c.value, 0);

  const engagementStats = [];
  for (const course of facultyCourses) {
    // Generate derived real stat
    const courseEnrolled = await Student.countDocuments({ collegeId, enrolledCourses: course._id });
    const courseAttends = await Attendance.countDocuments({ collegeId, courseId: course._id, status: 'present' });
    const courseTotalAttends = await ClassSession.countDocuments({ collegeId, courseId: course._id, status: 'completed' }) * courseEnrolled;
    const rate = courseTotalAttends > 0 ? Math.round((courseAttends / courseTotalAttends) * 100) : 0;
    
    engagementStats.push({
      course: course.title || course.code,
      rate,
      status: rate > 85 ? 'High' : rate > 75 ? 'Good' : 'Average'
    });
  }

  return {
    totalCourses: faculty.assignedCourses.length,
    totalStudents: totalStudentsCount,
    avgAttendance,
    weakStudents,
    courseStats,
    liveSessionStats,
    engagementStats,
    engagementScore: totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0,
    weeklyAttendanceData
  };
};

export const getAdminOverview = async (collegeId: string) => {
  const [totalStudents, totalFaculty, activeSessionsCount] = await Promise.all([
    Student.countDocuments({ collegeId: new mongoose.Types.ObjectId(collegeId), role: 'student' }),
    Faculty.countDocuments({ collegeId: new mongoose.Types.ObjectId(collegeId), role: { $in: ['faculty', 'hod'] } }),
    ClassSession.countDocuments({ collegeId: new mongoose.Types.ObjectId(collegeId), status: 'active' })
  ]);

  const feeItems = await FeeItem.aggregate([
    { $match: { collegeId: new mongoose.Types.ObjectId(collegeId) } },
    { $group: { _id: '$status', total: { $sum: '$amount' } } }
  ]);
  const paidAmount = feeItems.find(f => f._id === 'Paid')?.total || 0;
  const unpaidAmount = feeItems.find(f => f._id === 'Unpaid')?.total || 0;

  const formattedCollected = `₹${(paidAmount / 100000).toFixed(1)}L`;
  const formattedPending = `₹${(unpaidAmount / 100000).toFixed(1)}L`;

  const hostelStats = await HostelRoom.aggregate([
    { $match: { collegeId: new mongoose.Types.ObjectId(collegeId) } },
    { $group: { _id: null, totalCapacity: { $sum: '$capacity' }, totalOccupants: { $sum: { $cond: { if: { $isArray: '$occupants' }, then: { $size: '$occupants' }, else: 0 } } } } }
  ]);
  const hostelTotal = hostelStats[0]?.totalCapacity || 0;
  const hostelOccupied = hostelStats[0]?.totalOccupants || 0;
  const hostelOccupancyRate = hostelTotal > 0 ? Math.round((hostelOccupied / hostelTotal) * 100) : 0;

  const depts = await Department.find({ collegeId: new mongoose.Types.ObjectId(collegeId) }).select('name code');
  const departmentBreakdown = await Promise.all(depts.map(async (d) => {
    const sCount = await Student.countDocuments({ collegeId: new mongoose.Types.ObjectId(collegeId), departmentId: d._id });
    const fCount = await Faculty.countDocuments({ collegeId: new mongoose.Types.ObjectId(collegeId), departmentId: d._id });
    return { name: d.code, students: sCount, faculty: fCount };
  }));

  const activeSessions = await ClassSession.find({ collegeId: new mongoose.Types.ObjectId(collegeId), status: 'active' })
    .populate('courseId', 'title code')
    .populate('facultyId', 'name');
  const liveClasses = await Promise.all(activeSessions.map(async (s) => {
    const present = await Attendance.countDocuments({ classSessionId: s._id, status: 'present' });
    const totalEnrolled = await Student.countDocuments({ collegeId: new mongoose.Types.ObjectId(collegeId), enrolledCourses: s.courseId });
    return {
      course: s.courseId ? (s.courseId as any).title : 'Lecture Session',
      code: s.courseId ? (s.courseId as any).code : 'N/A',
      faculty: s.facultyId ? (s.facultyId as any).name : 'Faculty Instructor',
      room: s.roomName || 'LH-301',
      present,
      total: totalEnrolled,
      status: 'active'
    };
  }));

  return {
    totalStudents,
    totalFaculty,
    activeSessionsCount,
    feeStatus: { collected: formattedCollected, pending: formattedPending },
    hostelOccupancy: { rate: `${hostelOccupancyRate}%`, occupied: hostelOccupied, total: hostelTotal },
    departmentBreakdown,
    liveClasses
  };
};

export const getAdminCharts = async (collegeId: string) => {
  const objId = new mongoose.Types.ObjectId(collegeId);

  // 1. Course Distribution (aggregate)
  const courseTypes = await Course.aggregate([
    { $match: { collegeId: objId } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];
  const courseTypeData = courseTypes.map((c, i) => ({
    name: c._id || 'Other',
    value: c.count,
    color: COLORS[i % COLORS.length]
  }));

  // 2. Gender Data (aggregate)
  const genderStats = await Student.aggregate([
    { $match: { collegeId: objId, role: 'student' } },
    { $group: { _id: '$gender', count: { $sum: 1 } } }
  ]);
  const genderData = genderStats.map((g, i) => ({
    name: g._id || 'Unknown',
    value: g.count,
    color: COLORS[i % COLORS.length]
  }));

  // 3. Programme Data (aggregate)
  const progStats = await Student.aggregate([
    { $match: { collegeId: objId, role: 'student' } },
    { $group: { _id: '$program', count: { $sum: 1 } } }
  ]);
  const programmeData = progStats.map(p => ({
    name: p._id || 'Regular',
    students: p.count
  }));

  // 4. Weekly Attendance (aggregate last 6 days)
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  const attStats = await Attendance.aggregate([
    { $match: { collegeId: objId, date: { $gte: sixDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } } } },
    { $sort: { _id: 1 } }
  ]);
  const weeklyAttendance = attStats.map(a => ({
    name: new Date(a._id).toLocaleDateString('en-US', { weekday: 'short' }),
    present: a.present,
    absent: a.absent
  }));

  // 5. Monthly Enrollment (aggregate)
  const monthlyStats = await Student.aggregate([
    { $match: { collegeId: objId, role: 'student' } },
    { $group: { _id: { $month: '$createdAt' }, students: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyEnrollment = monthlyStats.map(m => ({
    name: months[m._id - 1] || 'Unknown',
    students: m.students
  }));

  // 6. Attendance by Month (aggregate)
  const monthlyAttStats = await Attendance.aggregate([
    { $match: { collegeId: objId } },
    { $group: { _id: { $month: '$date' }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } },
    { $sort: { _id: 1 } }
  ]);
  const attendanceByMonth = monthlyAttStats.map(m => ({
    name: months[m._id - 1] || 'Unknown',
    rate: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0
  }));

  // 7. Dept Performance (aggregate)
  const depts = await Department.find({ collegeId: objId }).select('_id code name');
  const deptPerformance = [];
  
  for (const d of depts) {
    const students = await Student.find({ collegeId: objId, departmentId: d._id, role: 'student' }).select('_id');
    const studentIds = students.map(s => s._id);

    if (studentIds.length > 0) {
      // Attendance rate
      const presentCount = await Attendance.countDocuments({ collegeId: objId, studentId: { $in: studentIds }, status: 'present' });
      const totalAttends = await Attendance.countDocuments({ collegeId: objId, studentId: { $in: studentIds } });
      const attendanceRate = totalAttends > 0 ? Math.round((presentCount / totalAttends) * 100) : 0;

      // Fee collection rate
      const feeItems = await FeeItem.aggregate([
        { $match: { collegeId: objId, studentId: { $in: studentIds } } },
        { $group: { _id: '$status', total: { $sum: '$amount' } } }
      ]);
      const paid = feeItems.find(f => f._id === 'Paid')?.total || 0;
      const unpaid = feeItems.find(f => f._id === 'Unpaid')?.total || 0;
      const feeCollectionRate = (paid + unpaid) > 0 ? Math.round((paid / (paid + unpaid)) * 100) : 0;

      deptPerformance.push({
        dept: d.code,
        attendance: attendanceRate,
        feeCollection: feeCollectionRate,
        passRate: 100 // exams not fully modeled yet
      });
    } else {
      deptPerformance.push({
        dept: d.code,
        attendance: 0,
        feeCollection: 0,
        passRate: 100
      });
    }
  }

  const monthlyTrend = attendanceByMonth.map(a => ({
    name: a.name,
    attendance: a.rate,
    fee: 85 // Static average until monthly fees are fully modeled
  }));

  return {
    courseTypeData,
    genderData,
    programmeData,
    weeklyAttendance,
    monthlyEnrollment,
    attendanceByMonth,
    deptPerformance,
    monthlyTrend
  };
};

export const getAdminActivity = async (collegeId: string) => {
  // Aggregate recent events (mocked as simple list since an actual activity log model might not exist, but returning empty array keeps it data-driven)
  return [];
};
