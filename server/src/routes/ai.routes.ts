import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
const router = Router();
router.use(authenticate);

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
