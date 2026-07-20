import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User, Student, Faculty } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Department } from '../models/Department.js';
import { Assignment } from '../models/Assignment.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const collegeId = req.user?.collegeId;
    const role = req.user?.role;
    const userId = req.user?.userId;

    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });
    if (!q || typeof q !== 'string') {
      return res.status(200).json({ success: true, data: { courses: [], students: [], links: [] } });
    }

    const regex = new RegExp(q, 'i');
    const cid = new Types.ObjectId(collegeId);

    const results: any = {
      courses: [],
      students: [],
      departments: [],
      assignments: [],
      links: []
    };

    // 1. Match Navigation Links based on role
    const allLinks = [
      { title: 'Dashboard', path: `/${role}/dashboard`, roles: ['student', 'faculty', 'hod', 'college_admin', 'parent'] },
      { title: 'Mark Attendance', path: '/student/mark-attendance', roles: ['student'] },
      { title: 'Attendance Analytics', path: '/student/analytics', roles: ['student'] },
      { title: 'Fee Payments', path: '/student/fees', roles: ['student'] },
      { title: 'Learning Hub', path: '/student/learn', roles: ['student'] },
      { title: 'Assignments', path: '/student/assignments', roles: ['student'] },
      { title: 'Faculty Attendance Portal', path: '/faculty/attendance', roles: ['faculty', 'hod'] },
      { title: 'Leave Application', path: '/faculty/leave', roles: ['faculty'] },
      { title: 'Hostel Block Details', path: '/admin/hostel', roles: ['college_admin'] },
      { title: 'Classrooms Manager', path: '/admin/rooms', roles: ['college_admin'] },
      { title: 'Admissions Applications', path: '/admin/admissions', roles: ['college_admin'] },
      { title: 'Analytics Center', path: '/admin/analytics', roles: ['college_admin'] }
    ];

    results.links = allLinks.filter(l => l.roles.includes(role || '') && regex.test(l.title));

    // 2. Query Courses
    if (role === 'student') {
      const student = await Student.findById(userId);
      if (student) {
        results.courses = await Course.find({
          _id: { $in: student.enrolledCourses },
          collegeId: cid,
          $or: [{ title: regex }, { code: regex }]
        }).limit(5);

        results.assignments = await Assignment.find({
          studentId: new Types.ObjectId(userId),
          collegeId: cid,
          title: regex
        }).limit(5);
      }
    } else if (role === 'faculty' || role === 'hod') {
      const faculty = await Faculty.findById(userId);
      if (faculty) {
        results.courses = await Course.find({
          _id: { $in: faculty.assignedCourses },
          collegeId: cid,
          $or: [{ title: regex }, { code: regex }]
        }).limit(5);

        // Search students enrolled in faculty's courses
        results.students = await Student.find({
          collegeId: cid,
          role: 'student',
          enrolledCourses: { $in: faculty.assignedCourses },
          name: regex
        }).select('name rollNumber email').limit(5);
      }
    } else if (role === 'college_admin') {
      results.courses = await Course.find({
        collegeId: cid,
        $or: [{ title: regex }, { code: regex }]
      }).limit(5);

      results.students = await Student.find({
        collegeId: cid,
        role: 'student',
        $or: [{ name: regex }, { rollNumber: regex }]
      }).select('name rollNumber email').limit(5);

      results.departments = await Department.find({
        collegeId: cid,
        $or: [{ name: regex }, { code: regex }]
      }).limit(5);
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
