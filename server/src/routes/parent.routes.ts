import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User, Student } from '../models/User.js';
import { ClassSession } from '../models/ClassSession.js';
import { Attendance } from '../models/Attendance.js';
import { Course } from '../models/Course.js';
import { FeeItem } from '../models/Fee.js';
import { Notification } from '../models/Notification.js';
const router = Router();
router.use(authenticate);

router.get('/parent/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const parentId = req.user?.userId;
    if (!collegeId || !parentId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const parent = await User.findById(new Types.ObjectId(parentId));
    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Access denied. Parent role required.' });
    }

    const studentRollNumber = (parent as any).studentRollNumber;
    if (!studentRollNumber) {
      return res.status(200).json({
        success: true,
        data: {
          hasStudent: false,
          attendanceRate: 'N/A',
          coursesCount: 0,
          feeStatus: 'N/A',
          notificationsCount: 0,
          attendanceSummary: [],
          notifications: []
        }
      });
    }

    const student = await Student.findOne({ 
      collegeId: new Types.ObjectId(collegeId), 
      rollNumber: studentRollNumber 
    });

    if (!student) {
      return res.status(200).json({
        success: true,
        data: {
          hasStudent: false,
          rollNumber: studentRollNumber,
          attendanceRate: 'N/A',
          coursesCount: 0,
          feeStatus: 'N/A',
          notificationsCount: 0,
          attendanceSummary: [],
          notifications: []
        }
      });
    }

    const enrolledCoursesCount = student.enrolledCourses?.length || 0;
    
    const totalClasses = await ClassSession.countDocuments({
      collegeId: new Types.ObjectId(collegeId),
      courseId: { $in: student.enrolledCourses },
      status: 'completed'
    });

    const totalAttended = await Attendance.countDocuments({
      collegeId: new Types.ObjectId(collegeId),
      studentId: student._id,
      status: 'present'
    });

    const rateVal = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    const courseBreakdown = [];
    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
      const enrolledCourses = await Course.find({ _id: { $in: student.enrolledCourses } });
      for (const course of enrolledCourses) {
        const total = await ClassSession.countDocuments({
          collegeId: new Types.ObjectId(collegeId),
          courseId: course._id,
          status: 'completed'
        });

        const attended = await Attendance.countDocuments({
          collegeId: new Types.ObjectId(collegeId),
          studentId: student._id,
          courseId: course._id,
          status: 'present'
        });

        courseBreakdown.push({
          subject: course.title,
          attended: total > 0 ? attended : 0,
          total: total > 0 ? total : 0
        });
      }
    }

    const unpaidFees = await FeeItem.countDocuments({
      collegeId: new Types.ObjectId(collegeId),
      studentId: student._id,
      status: 'Unpaid'
    });

    const notifications = await Notification.find({
      collegeId: new Types.ObjectId(collegeId),
      recipient: student._id
    }).sort({ createdAt: -1 }).limit(5);

    const formattedNotifications = notifications.map(n => {
      const timeDiff = Date.now() - new Date(n.createdAt).getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      let timeStr = 'Just now';
      if (days > 0) timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
      else if (hours > 0) timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;

      return {
        title: n.title,
        desc: n.message,
        time: timeStr,
        type: n.priority === 'high' ? 'danger' : n.priority === 'medium' ? 'warning' : 'info'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        hasStudent: true,
        studentName: student.name,
        rollNumber: studentRollNumber,
        semester: student.semester || 3,
        attendanceRate: `${rateVal}%`,
        coursesCount: enrolledCoursesCount || 4,
        feeStatus: unpaidFees > 0 ? 'Pending' : 'Paid',
        notificationsCount: 3,
        attendanceSummary: courseBreakdown,
        notifications: formattedNotifications.length > 0 ? formattedNotifications : [
          { title: 'No New Notifications', desc: 'You are all caught up!', time: 'Just now', type: 'info' },
          { title: 'Attendance Alert', desc: rateVal < 75 ? `Your child has below 75% (${rateVal}%)` : `Current overall attendance is ${rateVal}%`, time: '1 day ago', type: rateVal < 75 ? 'danger' : 'info' }
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
