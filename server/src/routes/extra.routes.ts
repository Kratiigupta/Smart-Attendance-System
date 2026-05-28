import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Assignment } from '../models/Assignment.js';
import { Lesson } from '../models/Lesson.js';
import { Exam } from '../models/Exam.js';
import { FeeItem, Transaction } from '../models/Fee.js';
import { AdmissionApplication } from '../models/Admission.js';
import { User } from '../models/User.js';

const router = Router();

router.use(authenticate);

// ==========================================
// ASSIGNMENTS
// ==========================================
router.get('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    let data = await Assignment.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    });

    // Seed default assignments if none exist
    if (data.length === 0) {
      const defaultAssignments = [
        { 
          collegeId: new Types.ObjectId(collegeId), 
          studentId: new Types.ObjectId(userId), 
          course: 'Data Structures', 
          code: 'CSC-201', 
          title: 'Binary Tree Operations Assignment', 
          due: '2026-06-05', 
          status: 'pending' as const, 
          points: '100 points' 
        },
        { 
          collegeId: new Types.ObjectId(collegeId), 
          studentId: new Types.ObjectId(userId), 
          course: 'DBMS', 
          code: 'CSC-305', 
          title: 'SQL Queries & Joins Practice Sheet', 
          due: '2026-06-08', 
          status: 'submitted' as const, 
          points: '50 points' 
        },
        { 
          collegeId: new Types.ObjectId(collegeId), 
          studentId: new Types.ObjectId(userId), 
          course: 'Digital Electronics', 
          code: 'ECE-301', 
          title: 'Logic Gates & K-Maps Lab Worksheet', 
          due: '2026-05-24', 
          status: 'graded' as const, 
          points: '20 points', 
          grade: 'A+' 
        },
        { 
          collegeId: new Types.ObjectId(collegeId), 
          studentId: new Types.ObjectId(userId), 
          course: 'Engineering Math III', 
          code: 'MAT-301', 
          title: 'Fourier Series & Laplace Transforms HW', 
          due: '2026-06-12', 
          status: 'pending' as const, 
          points: '100 points' 
        }
      ];
      data = await Assignment.insertMany(defaultAssignments);
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assignments/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    const updated = await Assignment.findOneAndUpdate(
      { 
        _id: id, 
        studentId: new Types.ObjectId(userId), 
        collegeId: new Types.ObjectId(collegeId) 
      },
      { status: 'submitted' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Assignment not found' });

    res.status(200).json({ success: true, message: 'Assignment submitted successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// LEARNING LESSONS
// ==========================================
router.get('/learn/lessons', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    let data = await Lesson.find({ collegeId: new Types.ObjectId(collegeId) });

    if (data.length === 0) {
      const defaultLessons = [
        {
          collegeId: new Types.ObjectId(collegeId),
          title: 'Introduction to Arrays & Strings',
          subject: 'Data Structures',
          type: 'Video' as const,
          language: 'English' as const,
          duration: '15 mins',
          size: '42 MB',
          description: 'Learn memory layout, address calculations, and fundamental operations on contiguous linear data structures.',
          downloaded: true,
          videoUrl: 'simulated-video-stream-1'
        },
        {
          collegeId: new Types.ObjectId(collegeId),
          title: 'सॉर्टिंग एल्गोरिदम (Bubble & Selection Sort)',
          subject: 'Data Structures',
          type: 'Video' as const,
          language: 'Hindi' as const,
          duration: '22 mins',
          size: '58 MB',
          description: 'बबल और सिलेक्शन सॉर्टिंग एल्गोरिदम के कार्य सिद्धांत, विज़ुअलाइज़ेशन और समय जटिलता का विस्तृत विश्लेषण।',
          downloaded: false,
          videoUrl: 'simulated-video-stream-2'
        },
        {
          collegeId: new Types.ObjectId(collegeId),
          title: 'ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ (Binary Search Trees)',
          subject: 'Data Structures',
          type: 'Document' as const,
          language: 'Punjabi' as const,
          duration: '10 pages',
          size: '3.4 MB',
          description: 'ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ ਦੇ ਗੁਣਾਂ, ਖੋਜਣ, ਜੋੜਨ, ਅਤੇ ਹਟਾਉਣ ਦੇ ਕਾਰਜਾਂ ਬਾਰੇ ਵਿਸਥਾਰਪੂਰਵਕ ਨੋਟਸ ਅਤੇ ਡਾਇਗ੍ਰਾਮ।',
          downloaded: true,
          contentBody: 'ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ (BST) ਇੱਕ ਨੋਡ-ਅਧਾਰਿਤ ਬਾਈਨਰੀ ਰੁੱਖ ਡੇਟਾ ਬਣਤਰ ਹੈ ਜਿਸ ਵਿੱਚ ਹੇਠ ਲਿਖੀਆਂ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਹੁੰਦੀਆਂ ਹਨ: (1) ਇੱਕ ਨੋਡ ਦੇ ਖੱਬੇ ਸਬ-ਟ੍ਰੀ ਵਿੱਚ ਸਿਰਫ਼ ਉਹ ਨੋਡ ਹੁੰਦੇ ਹਨ ਜਿਨ੍ਹਾਂ ਦੀਆਂ ਕੁੰਜੀਆਂ ਨੋਡ ਦੀ ਕੁੰਜੀ ਤੋਂ ਘੱਟ ਹੁੰਦੀਆਂ ਹਨ। (2) ਇੱਕ ਨੋਡ ਦੇ ਸੱਜੇ ਸਬ-ਟ੍ਰੀ ਵਿੱਚ ਸਿਰਫ਼ ਉਹ ਨੋਡ ਹੁੰਦੇ ਹਨ ਜਿਨ੍ਹਾਂ ਦੀਆਂ ਕੁੰਜੀਆਂ ਨੋਡ ਦੀ ਕੁੰਜੀ ਤੋਂ ਵੱਧ ਹੁੰਦੀਆਂ ਹਨ। (3) ਖੱਬਾ ਅਤੇ ਸੱਜਾ ਸਬ-ਟ੍ਰੀ ਵੀ ਹਰੇਕ ਬਾਈਨਰੀ ਖੋਜ ਰੁੱਖ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।'
        },
        {
          collegeId: new Types.ObjectId(collegeId),
          title: 'HTTP Protocol and REST APIs',
          subject: 'Web Development',
          type: 'Video' as const,
          language: 'English' as const,
          duration: '18 mins',
          size: '48 MB',
          description: 'Understand request-response lifecycles, HTTP methods, headers, status codes, and design patterns for robust RESTful APIs.',
          downloaded: false,
          videoUrl: 'simulated-video-stream-4'
        },
        {
          collegeId: new Types.ObjectId(collegeId),
          title: 'HTML & CSS ਬੁਨਿਆਦੀ ਢਾਂਚਾ',
          subject: 'Web Development',
          type: 'Document' as const,
          language: 'Punjabi' as const,
          duration: '15 pages',
          size: '4.2 MB',
          description: 'ਵੈੱਬ ਪੰਨੇ ਬਣਾਉਣ ਲਈ HTML5 ਟੈਗਸ, ਸਿਮੈਂਟਿਕਸ, CSS3 ਫਲੈਕਸਬਾਕਸ, ਅਤੇ ਗਰਿੱਡ ਲੇਆਉਟ ਦੀ ਮੁਢਲੀ ਸਿਖਲਾਈ।',
          downloaded: false,
          contentBody: 'HTML ਵੈੱਬ ਪੰਨਿਆਂ ਦਾ ਢਾਂਚਾ ਬਣਾਉਣ ਲਈ ਮਿਆਰੀ ਮਾਰਕਅੱਪ ਭਾਸ਼ਾ ਹੈ। CSS ਵੈੱਬ ਪੰਨਿਆਂ ਦੀ ਸ਼ੈਲੀ ਅਤੇ ਪੇਸ਼ਕਾਰੀ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਨ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ। CSS3 ਦੀ ਵਰਤੋਂ ਨਾਲ ਵੈੱਬਸਾਈਟਾਂ ਨੂੰ ਵੱਖ-ਵੱਖ ਸਕ੍ਰੀਨ ਅਕਾਰਾਂ (ਰੇਸਪੌਂਸਿਵ ਡਿਜ਼ਾਈਨ) ਦੇ ਅਨੁਕੂਲ ਬਣਾਇਆ ਜਾ ਸਕਦਾ ਹੈ।'
        },
        {
          collegeId: new Types.ObjectId(collegeId),
          title: 'क्लाउड स्टोरेज और कंप्यूट बेसिक्स',
          subject: 'Cloud Computing',
          type: 'Document' as const,
          language: 'Hindi' as const,
          duration: '8 pages',
          size: '2.1 MB',
          description: 'क्लाउड कंप्यूटिंग के बुनियादी सिद्धांत: IaaS, PaaS, SaaS, और एडब्ल्यूएस/अज़ूर पर बुनियादी स्टोरेज बकेट सेटअप।',
          downloaded: true,
          contentBody: 'क्लाउड कंप्यूटिंग इंटरनेट पर सर्वर, स्टोरेज, डेटाबेस, netਵਰਕਿੰਗ, ਸੌਫਟਵੇਅਰ ਅਤੇ ਐਨਾਲਿਟਿਕਸ ਸਮੇਤ ਕੰਪਿਊਟਿੰਗ ਸੇਵਾਵਾਂ ਦੀ ਆਨ-ਡਿਮਾਂਡ ਡਿਲੀਵਰੀ ਹੈ। IaaS (Infrastructure as a Service) ਵਰਚੁਅਲ ਮਸ਼ੀਨ ਅਤੇ ਸਟੋਰੇਜ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। PaaS (Platform as a Service) ਵਿਕਾਸ ਵਾਤਾਵਰਣ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। SaaS (Software as a Service) ਐਂਡ-ਯੂਜ਼ਰ ਐਪਲੀਕੇਸ਼ਨ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।'
        }
      ];
      data = await Lesson.insertMany(defaultLessons);
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// EXAMS
// ==========================================
router.get('/exams', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    let data = await Exam.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    });

    if (data.length === 0) {
      const defaultExams = [
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), subject: 'Data Structures', code: 'CSC-201', date: '2026-06-15', time: '10:00 AM - 01:00 PM', room: 'Exam Hall A', seat: 'Row 4, Seat 23' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), subject: 'DBMS', code: 'CSC-305', date: '2026-06-17', time: '10:00 AM - 01:00 PM', room: 'Exam Hall A', seat: 'Row 4, Seat 23' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), subject: 'Digital Electronics', code: 'ECE-301', date: '2026-06-19', time: '02:00 PM - 05:00 PM', room: 'Drawing Hall B', seat: 'Row 2, Seat 12' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), subject: 'Engineering Math III', code: 'MAT-301', date: '2026-06-22', time: '10:00 AM - 01:00 PM', room: 'Exam Hall A', seat: 'Row 4, Seat 23' }
      ];
      data = await Exam.insertMany(defaultExams);
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FEES & TRANSACTIONS
// ==========================================
router.get('/fees/ledger', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    let data = await FeeItem.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    });

    if (data.length === 0) {
      const defaultFees = [
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), name: 'Tuition Fee (Semester 3)', category: 'Academic' as const, amount: 40000, status: 'Paid' as const, dueDate: '2026-04-15' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), name: 'Library Fee', category: 'Facilities' as const, amount: 2000, status: 'Paid' as const, dueDate: '2026-04-15' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), name: 'Computer Lab Fee', category: 'Facilities' as const, amount: 6000, status: 'Paid' as const, dueDate: '2026-04-15' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), name: 'Exam Fee (Semester 3)', category: 'Academic' as const, amount: 2500, status: 'Unpaid' as const, dueDate: '2026-06-15' },
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), name: 'Hostel & Mess Charges (Semester 3)', category: 'Hostel' as const, amount: 22000, status: 'Unpaid' as const, dueDate: '2026-06-15' }
      ];
      data = await FeeItem.insertMany(defaultFees);
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/fees/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    let data = await Transaction.find({ 
      collegeId: new Types.ObjectId(collegeId), 
      studentId: new Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    if (data.length === 0) {
      const defaultTxns = [
        { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), transactionId: 'TXN88294710', amount: 48000, method: 'UPI / NetBanking', date: '2026-04-10', receiptNo: 'REC-2026-0921', status: 'Success' as const }
      ];
      data = await Transaction.insertMany(defaultTxns);
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/fees/pay', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const userId = req.user?.userId;
    const { method, amount } = req.body;
    if (!collegeId || !userId) return res.status(400).json({ success: false, message: 'Auth context missing' });

    // Mark outstanding fees as paid
    await FeeItem.updateMany(
      { collegeId: new Types.ObjectId(collegeId), studentId: new Types.ObjectId(userId), status: 'Unpaid' }, 
      { status: 'Paid' }
    );

    // Create a transaction
    const newTxn = new Transaction({
      collegeId: new Types.ObjectId(collegeId),
      studentId: new Types.ObjectId(userId),
      transactionId: `TXN${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: amount || 0,
      method: method || 'UPI / NetBanking',
      date: new Date().toISOString().split('T')[0],
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Success'
    });

    await newTxn.save();

    res.status(200).json({ success: true, message: 'Payment processed successfully', data: newTxn });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ADMISSIONS
// ==========================================
router.get('/admissions', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    let data = await AdmissionApplication.find({ collegeId: new Types.ObjectId(collegeId) }).sort({ createdAt: -1 });

    if (data.length === 0) {
      const defaultApplications = [
        { collegeId: new Types.ObjectId(collegeId), name: 'Rahul Sharma', email: 'rahul@email.com', programme: 'B.Tech CSE (FYUP)', date: '2026-05-18', status: 'applied' as const, marks: '89.4%' },
        { collegeId: new Types.ObjectId(collegeId), name: 'Priya Singh', email: 'priya@email.com', programme: 'B.Tech ECE (FYUP)', date: '2026-05-17', status: 'reviewing' as const, marks: '92.1%' },
        { collegeId: new Types.ObjectId(collegeId), name: 'Amandeep Kaur', email: 'aman@email.com', programme: 'B.Ed. (ITEP)', date: '2026-05-16', status: 'accepted' as const, marks: '78.5%' },
        { collegeId: new Types.ObjectId(collegeId), name: 'Vikash Kumar', email: 'vikash@email.com', programme: 'B.Tech ME (FYUP)', date: '2026-05-15', status: 'enrolled' as const, marks: '85.2%' },
        { collegeId: new Types.ObjectId(collegeId), name: 'Anjali Verma', email: 'anjali@email.com', programme: 'B.Tech CSE (FYUP)', date: '2026-05-19', status: 'applied' as const, marks: '91.8%' },
        { collegeId: new Types.ObjectId(collegeId), name: 'Mohit Yadav', email: 'mohit@email.com', programme: 'B.Tech CE (FYUP)', date: '2026-05-14', status: 'rejected' as const, marks: '58.3%' }
      ];
      data = await AdmissionApplication.insertMany(defaultApplications);
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admissions', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    const { name, email, programme, marks } = req.body;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    const newApp = new AdmissionApplication({
      collegeId: new Types.ObjectId(collegeId),
      name,
      email,
      programme,
      marks: marks.includes('%') ? marks : `${marks}%`,
      date: new Date().toISOString().split('T')[0],
      status: 'applied'
    });

    await newApp.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: newApp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FACULTY STUDENTS
// ==========================================
router.get('/faculty/students', async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = req.user?.collegeId;
    if (!collegeId) return res.status(400).json({ success: false, message: 'College context missing' });

    // Fetch students from the Users collection in this college with student role
    const studentUsers = await User.find({ collegeId: new Types.ObjectId(collegeId), role: 'student' });

    // Format them for the faculty roster view.
    const formattedStudents = studentUsers.map((s, idx) => {
      // Generate some realistic class counts based on index to avoid empty data
      const totalClasses = 20 + (idx % 6);
      const classesAttended = Math.max(10, totalClasses - (idx % 8));
      const attendance = Math.round((classesAttended / totalClasses) * 100);
      
      return {
        id: s._id,
        name: s.name,
        email: s.email,
        rollNo: (s as any).rollNumber || `CSE-2022-0${idx + 1}`,
        course: idx % 3 === 0 ? 'Data Structures' : idx % 3 === 1 ? 'Data Structures Lab' : 'Algorithm Design',
        attendance,
        classesAttended,
        totalClasses,
        phone: s.phone || '+91 98765 43210'
      };
    });

    res.status(200).json({ success: true, data: formattedStudents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// AI CHATBOT ASSISTANT
// ==========================================
router.post('/ai/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    const q = query.toLowerCase();
    const role = req.user?.role || 'guest';
    const userId = req.user?.userId;

    let name = 'User';
    if (userId) {
      const userObj = await User.findById(new Types.ObjectId(userId));
      if (userObj) {
        name = userObj.name;
      }
    }

    let reply = '';

    if (q.includes('what is') || q.includes('smartedu') || q.includes('ecosystem')) {
      reply = `🏫 **SmartEdu Campus** is a comprehensive, modern campus automation and learning platform.\n\nIt features: \n1. **Smart Attendance**: Rotating dynamic QR verification.\n2. **AI Timetable Generator**: Conflict-free schedule allocation via constraint solver algorithms.\n3. **Unified ERP & Finance**: Digital student ledgers, hostel lists, and fees gateways.\n4. **Rural Sync**: Offline PWA storage for low-bandwidth environments.`;
    } else if (q.includes('attendance') || q.includes('qr') || q.includes('demo')) {
      reply = `📲 **Smart Attendance System:**\n\n- Eliminates proxy attendance with rotating QR codes refreshed every 30s.\n- Supports device fingerprint verification to prevent scanning for absent peers.\n- Facewise snapshot verification can be configured by institutions.`;
    } else if (q.includes('schedule') || q.includes('timetable') || q.includes('ai')) {
      reply = `📅 **AI Constraint Timetable Roster:**\n\n- Solves the complex academic timetabling task in seconds using Google OR-Tools.\n- Automatically balances teacher hours, student workload constraints, classroom availability, and elective slots.`;
    } else if (role === 'student' && (q.includes('attendance') || q.includes('stats') || q.includes('shortage') || q.includes('kitna'))) {
      reply = `📊 **Aapki Attendance Report (Overall: 86%):**\n\n- **Total Attended:** 93 classes\n- **Total Absent:** 15 classes\n- **Status:** Safe limit (Threshold: 75%)\n\n*Course-wise Standing:*\n- CSC-201 (Data Structures): 90% (18/20)\n- CSC-305 (DBMS): 80% (16/20)\n- ECE-301 (Digital Electronics): 85% (17/20)\n- MAT-301 (Math): 95% (19/20)`;
    } else if (role === 'student' && (q.includes('timetable') || q.includes('class') || q.includes('schedule') || q.includes('kal की') || q.includes('kal ki'))) {
      reply = `📅 **Kal ki Classes Schedule (Tomorrow):**\n\n1. **10:00 AM:** Data Structures (CSC-201) — Room LH-301\n2. **11:00 AM:** DBMS (CSC-305) — Room LH-401\n3. **01:30 PM:** Digital Electronics (ECE-301) — Room LH-302\n\n*Baki kal doopehr me aapka free period rahega!*`;
    } else if (role === 'student' && (q.includes('notes') || q.includes('dsa'))) {
      reply = `📚 **Here are your Data Structures & Algorithms notes summary:**\n\n- **Topic 1: Linked Lists**: Singly, Doubly, and Circular. Key ops: insertion, deletion, and reversal.\n- **Topic 2: Trees & Graphs**: Binary Search Trees, BFS/DFS traversal, and Dijkstra algorithm.\n\n*Aap study material and full notes read karne ke liye [Learning Hub](/student/learn) par ja sakte hain.*`;
    } else if (role === 'student' && (q.includes('free period') || q.includes('padhu'))) {
      reply = `💡 **AI Recommendation (Free Period Activities):**\n\n1. 🎥 **Watch DSA Video**: Trees & Graphs implementation guide.\n2. 📝 **Practice Quiz**: SQL Normalization (First, Second, and Third Normal Form).\n3. 💼 **Resume Building**: Update your project details and experience keywords.`;
    } else if (role === 'faculty' && (q.includes('timetable') || q.includes('class') || q.includes('schedule') || q.includes('today'))) {
      reply = `📅 **Dr. ${name.split(' ').pop()}, here is your Lecture Schedule today:**\n\n- **10:00 AM - 10:50 AM:** Data Structures (CSC-201) — Room LH-301 *(Completed — 45/48 present)*\n- **11:00 AM - 11:50 AM:** DS Lab (CSC-201P) — Room Lab-101 *(Completed — 22/24 present)*\n- **01:30 PM - 02:20 PM:** Algorithm Design (CSC-401) — Room LH-302 *(Upcoming)*`;
    } else {
      reply = `Hello ${name}. I am your SmartEdu Assistant. Ask me anything about your timetable, classes, syllabus, attendance ledger, or pending fee collections!`;
    }

    res.status(200).json({ success: true, data: { reply } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
