import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { College } from '../models/College.js';
import { User, Student, Faculty, Parent } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { Lesson } from '../models/Lesson.js';
import { Exam } from '../models/Exam.js';
import { FeeItem, Transaction } from '../models/Fee.js';
import { AdmissionApplication } from '../models/Admission.js';
import { Room } from '../models/Room.js';
import { HostelBlock, HostelRoom } from '../models/Hostel.js';
import { LeaveApplication } from '../models/Leave.js';
import { Notification } from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📡 Connected to MongoDB for seeding');

    // 1. Find or create a demo college
    let college = await College.findOne({ code: 'DEMO101' });
    if (!college) {
      college = new College({
        name: 'Demo SmartEdu University',
        code: 'DEMO101',
        domain: 'demo.smartedu.edu',
        settings: {
          attendanceThreshold: 75,
          timezone: 'Asia/Kolkata',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      });
      await college.save();
      console.log('🏫 Created Demo College');
    }

    // 2. Create demo users (Student, Faculty, Parent)
    const collegeId = college._id;

    let student = await User.findOne({ collegeId, role: 'student', email: 'student@demo.com' });
    if (!student) {
      student = new Student({
        collegeId,
        name: 'Abhishek Singh',
        email: 'student@demo.com',
        passwordHash: '$2a$12$Kk6Ym395o.9.31nJjT7u7uR3W4vC3wL48vXgH.s8FvE8tW.g48aae', // password123
        role: 'student',
        phone: '+91 98765 43210',
        rollNumber: 'CSE-2023-045',
        semester: 3,
        enrolledCourses: []
      });
      await student.save();
      console.log('🎓 Created Demo Student');
    }

    let faculty = await User.findOne({ collegeId, role: 'faculty', email: 'faculty@demo.com' });
    if (!faculty) {
      faculty = new Faculty({
        collegeId,
        name: 'Dr. Rajesh Kumar',
        email: 'faculty@demo.com',
        passwordHash: '$2a$12$Kk6Ym395o.9.31nJjT7u7uR3W4vC3wL48vXgH.s8FvE8tW.g48aae', // password123
        role: 'faculty',
        phone: '+91 98765 11111',
        employeeId: 'EMP-CSE-002',
        designation: 'Associate Professor',
        assignedCourses: [],
        maxHoursPerWeek: 18,
        specializations: ['Data Structures', 'Database Systems']
      });
      await faculty.save();
      console.log('👨‍🏫 Created Demo Faculty');
    }

    let parent = await User.findOne({ collegeId, role: 'parent', email: 'parent@demo.com' });
    if (!parent) {
      parent = new Parent({
        collegeId,
        name: 'Suresh Singh',
        email: 'parent@demo.com',
        passwordHash: '$2a$12$Kk6Ym395o.9.31nJjT7u7uR3W4vC3wL48vXgH.s8FvE8tW.g48aae', // password123
        role: 'parent',
        phone: '+91 98765 22222',
        studentRollNumber: 'CSE-2023-045'
      });
      await parent.save();
      console.log('👪 Created Demo Parent');
    }

    // Clear existing mock data to ensure clean seed
    await Promise.all([
      Assignment.deleteMany({ collegeId }),
      Lesson.deleteMany({ collegeId }),
      Exam.deleteMany({ collegeId }),
      FeeItem.deleteMany({ collegeId }),
      Transaction.deleteMany({ $or: [{ collegeId }, { transactionId: 'TXN88294710' }] }),
      AdmissionApplication.deleteMany({ collegeId }),
      Room.deleteMany({ collegeId }),
      HostelBlock.deleteMany({ collegeId }),
      HostelRoom.deleteMany({ collegeId }),
      LeaveApplication.deleteMany({ collegeId }),
      Notification.deleteMany({ collegeId })
    ]);

    // Seed assignments
    const assignments = [
      { 
        collegeId, 
        studentId: student._id, 
        course: 'Data Structures', 
        code: 'CSC-201', 
        title: 'Binary Tree Operations Assignment', 
        due: '2026-06-05', 
        status: 'pending', 
        points: '100 points' 
      },
      { 
        collegeId, 
        studentId: student._id, 
        course: 'DBMS', 
        code: 'CSC-305', 
        title: 'SQL Queries & Joins Practice Sheet', 
        due: '2026-06-08', 
        status: 'submitted', 
        points: '50 points' 
      },
      { 
        collegeId, 
        studentId: student._id, 
        course: 'Digital Electronics', 
        code: 'ECE-301', 
        title: 'Logic Gates & K-Maps Lab Worksheet', 
        due: '2026-05-24', 
        status: 'graded', 
        points: '20 points', 
        grade: 'A+' 
      },
      { 
        collegeId, 
        studentId: student._id, 
        course: 'Engineering Math III', 
        code: 'MAT-301', 
        title: 'Fourier Series & Laplace Transforms HW', 
        due: '2026-06-12', 
        status: 'pending', 
        points: '100 points' 
      }
    ];
    await Assignment.insertMany(assignments);
    console.log('📝 Seeded Assignments');

    // Seed lessons
    const lessons = [
      {
        collegeId,
        title: 'Introduction to Arrays & Strings',
        subject: 'Data Structures',
        type: 'Video',
        language: 'English',
        duration: '15 mins',
        size: '42 MB',
        description: 'Learn memory layout, address calculations, and fundamental operations on contiguous linear data structures.',
        downloaded: true,
        videoUrl: 'simulated-video-stream-1'
      },
      {
        collegeId,
        title: 'सॉर्टिंग एल्गोरिदम (Bubble & Selection Sort)',
        subject: 'Data Structures',
        type: 'Video',
        language: 'Hindi',
        duration: '22 mins',
        size: '58 MB',
        description: 'बबल और सिलेक्शन सॉर्टिंग एल्गोरिदम के कार्य सिद्धांत, विज़ुअलाइज़ेशन और समय जटिलता का विस्तृत विश्लेषण।',
        downloaded: false,
        videoUrl: 'simulated-video-stream-2'
      },
      {
        collegeId,
        title: 'ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ (Binary Search Trees)',
        subject: 'Data Structures',
        type: 'Document',
        language: 'Punjabi',
        duration: '10 pages',
        size: '3.4 MB',
        description: 'ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ ਦੇ ਗੁਣਾਂ, ਖੋਜਣ, ਜੋੜਨ, ਅਤੇ ਹਟਾਉਣ ਦੇ ਕਾਰਜਾਂ ਬਾਰੇ ਵਿਸਥਾਰਪੂਰਵਕ ਨੋਟਸ ਅਤੇ ਡਾਇਗ੍ਰਾਮ।',
        downloaded: true,
        contentBody: 'ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ (BST) ਇੱਕ ਨੋਡ-ਅਧਾਰਿਤ ਬਾਈਨਰੀ ਰੁੱਖ ਡੇਟਾ ਬਣਤਰ ਹੈ ਜਿਸ ਵਿੱਚ ਹੇਠ ਲਿਖੀਆਂ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਹੁੰਦੀਆਂ ਹਨ: (1) ਇੱਕ ਨੋਡ ਦੇ ਖੱਬੇ ਸਬ-ਟ੍ਰੀ ਵਿੱਚ ਸਿਰਫ਼ ਉਹ ਨੋਡ ਹੁੰਦੇ ਹਨ ਜਿਨ੍ਹਾਂ ਦੀਆਂ ਕੁੰਜੀਆਂ ਨੋਡ ਦੀ ਕੁੰਜੀ ਤੋਂ ਘੱਟ ਹੁੰਦੀਆਂ ਹਨ। (2) ਇੱਕ ਨੋਡ ਦੇ ਸੱਜੇ ਸਬ-ਟ੍ਰੀ ਵਿੱਚ ਸਿਰਫ਼ ਉਹ ਨੋਡ ਹੁੰਦੇ ਹਨ ਜਿਨ੍ਹਾਂ ਦੀਆਂ ਕੁੰਜੀਆਂ ਨੋਡ ਦੀ ਕੁੰਜੀ ਤੋਂ ਵੱਧ ਹੁੰਦੀਆਂ ਹਨ। (3) ਖੱਬਾ ਅਤੇ ਸੱਜਾ ਸਬ-ਟ੍ਰੀ ਵੀ ਹਰੇਕ ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।'
      }
    ];
    await Lesson.insertMany(lessons);
    console.log('📚 Seeded Lessons');

    // Seed exams
    const exams = [
      { collegeId, studentId: student._id, subject: 'Data Structures', code: 'CSC-201', date: '2026-06-15', time: '10:00 AM - 01:00 PM', room: 'Exam Hall A', seat: 'Row 4, Seat 23' },
      { collegeId, studentId: student._id, subject: 'DBMS', code: 'CSC-305', date: '2026-06-17', time: '10:00 AM - 01:00 PM', room: 'Exam Hall A', seat: 'Row 4, Seat 23' },
      { collegeId, studentId: student._id, subject: 'Digital Electronics', code: 'ECE-301', date: '2026-06-19', time: '02:00 PM - 05:00 PM', room: 'Drawing Hall B', seat: 'Row 2, Seat 12' },
      { collegeId, studentId: student._id, subject: 'Engineering Math III', code: 'MAT-301', date: '2026-06-22', time: '10:00 AM - 01:00 PM', room: 'Exam Hall A', seat: 'Row 4, Seat 23' }
    ];
    await Exam.insertMany(exams);
    console.log('🏫 Seeded Exams');

    // Seed fees
    const feeItems = [
      { collegeId, studentId: student._id, name: 'Tuition Fee (Semester 3)', category: 'Academic', amount: 40000, status: 'Paid', dueDate: '2026-04-15' },
      { collegeId, studentId: student._id, name: 'Library Fee', category: 'Facilities', amount: 2000, status: 'Paid', dueDate: '2026-04-15' },
      { collegeId, studentId: student._id, name: 'Computer Lab Fee', category: 'Facilities', amount: 6000, status: 'Paid', dueDate: '2026-04-15' },
      { collegeId, studentId: student._id, name: 'Exam Fee (Semester 3)', category: 'Academic', amount: 2500, status: 'Unpaid', dueDate: '2026-06-15' },
      { collegeId, studentId: student._id, name: 'Hostel & Mess Charges (Semester 3)', category: 'Hostel', amount: 22000, status: 'Unpaid', dueDate: '2026-06-15' }
    ];
    await FeeItem.insertMany(feeItems);

    const txns = [
      { collegeId, studentId: student._id, transactionId: 'TXN88294710', amount: 48000, method: 'UPI / NetBanking', date: '2026-04-10', receiptNo: 'REC-2026-0921', status: 'Success' }
    ];
    await Transaction.insertMany(txns);
    console.log('💰 Seeded Fees & Transactions');

    // Seed admissions
    const admissions = [
      { collegeId, name: 'Rahul Sharma', email: 'rahul@email.com', programme: 'B.Tech CSE (FYUP)', date: '2026-05-18', status: 'applied', marks: '89.4%' },
      { collegeId, name: 'Priya Singh', email: 'priya@email.com', programme: 'B.Tech ECE (FYUP)', date: '2026-05-17', status: 'reviewing', marks: '92.1%' },
      { collegeId, name: 'Amandeep Kaur', email: 'aman@email.com', programme: 'B.Ed. (ITEP)', date: '2026-05-16', status: 'accepted', marks: '78.5%' },
      { collegeId, name: 'Vikash Kumar', email: 'vikash@email.com', programme: 'B.Tech ME (FYUP)', date: '2026-05-15', status: 'enrolled', marks: '85.2%' },
      { collegeId, name: 'Anjali Verma', email: 'anjali@email.com', programme: 'B.Tech CSE (FYUP)', date: '2026-05-19', status: 'applied', marks: '91.8%' },
      { collegeId, name: 'Mohit Yadav', email: 'mohit@email.com', programme: 'B.Tech CE (FYUP)', date: '2026-05-14', status: 'rejected', marks: '58.3%' }
    ];
    await AdmissionApplication.insertMany(admissions);
    console.log('📑 Seeded Admissions');

    // Seed hostels
    const blocks = [
      { collegeId, name: 'Block A (Boys)', totalRooms: 50, occupiedRooms: 42, type: 'Boys', floors: 4 },
      { collegeId, name: 'Block B (Boys)', totalRooms: 60, occupiedRooms: 55, type: 'Boys', floors: 5 },
      { collegeId, name: 'Block C (Girls)', totalRooms: 40, occupiedRooms: 38, type: 'Girls', floors: 4 },
      { collegeId, name: 'Block D (Girls)', totalRooms: 45, occupiedRooms: 40, type: 'Girls', floors: 4 }
    ];
    await HostelBlock.insertMany(blocks);

    const hostelRooms = [
      { collegeId, blockName: 'Block A (Boys)', roomName: 'A-101', floor: 'Ground', capacity: 3, occupants: ['Amit Kumar', 'Rahul Singh', 'Vikash Yadav'], status: 'full' },
      { collegeId, blockName: 'Block A (Boys)', roomName: 'A-102', floor: 'Ground', capacity: 3, occupants: ['Deepak Verma', 'Sandeep Singh'], status: 'partial' },
      { collegeId, blockName: 'Block A (Boys)', roomName: 'A-103', floor: 'Ground', capacity: 3, occupants: [], status: 'empty' },
      { collegeId, blockName: 'Block A (Boys)', roomName: 'A-104', floor: 'Ground', capacity: 2, occupants: ['Ravi Kumar', 'Mohit Yadav'], status: 'full' },
      { collegeId, blockName: 'Block A (Boys)', roomName: 'A-105', floor: 'Ground', capacity: 2, occupants: ['Gaurav Sharma'], status: 'partial' },
      { collegeId, blockName: 'Block A (Boys)', roomName: 'A-106', floor: 'Ground', capacity: 3, occupants: [], status: 'maintenance' }
    ];
    await HostelRoom.insertMany(hostelRooms);
    console.log('🏨 Seeded Hostels & Rooms');

    // Seed classrooms
    const classrooms = [
      { collegeId, name: 'LH-101', building: 'Main Block', floor: 'Ground', capacity: 60, type: 'Lecture Hall', status: 'occupied', currentClass: 'Eng. Math III', occupancy: 55, hasWifi: true, hasProjector: true },
      { collegeId, name: 'LH-102', building: 'Main Block', floor: 'Ground', capacity: 60, type: 'Lecture Hall', status: 'available', currentClass: null, occupancy: 0, hasWifi: true, hasProjector: true },
      { collegeId, name: 'LH-201', building: 'Main Block', floor: '1st', capacity: 80, type: 'Lecture Hall', status: 'occupied', currentClass: 'Digital Electronics', occupancy: 42, hasWifi: true, hasProjector: true },
      { collegeId, name: 'LH-301', building: 'Main Block', floor: '2nd', capacity: 50, type: 'Lecture Hall', status: 'occupied', currentClass: 'Data Structures', occupancy: 45, hasWifi: true, hasProjector: true },
      { collegeId, name: 'LH-401', building: 'Science Block', floor: '3rd', capacity: 50, type: 'Lecture Hall', status: 'maintenance', currentClass: null, occupancy: 0, hasWifi: false, hasProjector: true }
    ];
    await Room.insertMany(classrooms);
    console.log('🏛️ Seeded Classroom Rooms');

    // Seed leaves
    const leaves = [
      { collegeId, facultyId: faculty._id, leaveType: 'Casual Leave', startDate: '2026-06-02', endDate: '2026-06-03', reason: 'Personal family business in Delhi.', proxyFaculty: 'Dr. Amit Sharma', status: 'Approved', appliedDate: '2026-05-15' },
      { collegeId, facultyId: faculty._id, leaveType: 'Sick Leave', startDate: '2026-05-10', endDate: '2026-05-11', reason: 'Viral fever, doctor advised bed rest.', proxyFaculty: 'Dr. Sunita Verma', status: 'Approved', appliedDate: '2026-05-09' },
      { collegeId, facultyId: faculty._id, leaveType: 'Duty Leave', startDate: '2026-05-28', endDate: '2026-05-28', reason: 'Attending National Seminar on AI in Education.', proxyFaculty: 'Prof. Vikram Malhotra', status: 'Pending', appliedDate: '2026-05-20' }
    ];
    await LeaveApplication.insertMany(leaves);
    console.log('🍃 Seeded Leaves');

    // Seed notifications
    const notifications = [
      { collegeId, recipient: student._id, title: 'Fee Payment Reminder', message: 'Semester 3 fee is due by June 15, 2026', category: 'Fees', priority: 'medium', isRead: false },
      { collegeId, recipient: student._id, title: 'Attendance Alert', message: 'Current overall attendance is 78%', category: 'Attendance', priority: 'high', isRead: false },
      { collegeId, recipient: student._id, title: 'Exam Schedule Released', message: 'Mid-semester exams start from July 1', category: 'Academic', priority: 'low', isRead: true }
    ];
    await Notification.insertMany(notifications);
    console.log('📢 Seeded Notifications');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('💥 Seeding failed:', err);
    process.exit(1);
  }
};

seed();
