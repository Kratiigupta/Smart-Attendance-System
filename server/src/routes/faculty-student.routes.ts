import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { ClassSession } from '../models/ClassSession.js';
import { Attendance } from '../models/Attendance.js';
import { Course } from '../models/Course.js';
const router = Router();
router.use(authenticate);

router.get('/faculty/students', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    // Fetch students from the Users collection in this college with student role
    const studentUsers = await User.find({ collegeId: new Types.ObjectId(collegeId), role: 'student' });

    // Format them for the faculty roster view.
    const formattedStudents = await Promise.all(studentUsers.map(async (s) => {
      // Find total sessions for courses the student is enrolled in
      const enrolledCourses = (s as any).enrolledCourses || [];
      const totalClasses = await ClassSession.countDocuments({
        collegeId: new Types.ObjectId(collegeId),
        courseId: { $in: enrolledCourses },
        status: 'completed'
      });

      const classesAttended = await Attendance.countDocuments({
        collegeId: new Types.ObjectId(collegeId),
        studentId: s._id,
        status: 'present'
      });

      const attendance = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 100) : 0;
      
      let courseName = 'Not Enrolled';
      if (enrolledCourses.length > 0) {
        const course = await Course.findById(enrolledCourses[0]);
        if (course) courseName = course.title;
      }
      
      return {
        id: s._id,
        name: s.name,
        email: s.email,
        rollNo: (s as any).rollNumber || 'N/A',
        course: courseName,
        attendance,
        classesAttended,
        totalClasses,
        phone: s.phone || 'N/A'
      };
    }));

    res.status(200).json({ success: true, data: formattedStudents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
