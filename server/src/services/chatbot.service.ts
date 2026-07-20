import mongoose from 'mongoose';
import { Student } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { ClassSession } from '../models/ClassSession.js';
import { FeeItem } from '../models/Fee.js';
import { TimetableSlot } from '../models/TimetableSlot.js';
import { HostelRoom } from '../models/Hostel.js';
import { Faculty } from '../models/User.js';
import { AdmissionApplication } from '../models/Admission.js';

export class ChatbotService {
  async processMessage(
    userId: string,
    role: string,
    collegeId: string,
    message: string
  ): Promise<string> {
    const query = message.toLowerCase();
    const cid = new mongoose.Types.ObjectId(collegeId);

    if (role === 'student') {
      if (query.includes('attendance')) {
        // Calculate real attendance percentage
        const student = await Student.findById(userId);
        if (!student) return 'I could not find your student record.';
        
        const attended = await Attendance.countDocuments({ studentId: userId, status: 'present' });
        // Total possible attendance might be tricky without complex joins, but let's approximate based on enrolled courses
        // or just count total attendance records for this student
        const totalRecords = await Attendance.countDocuments({ studentId: userId });
        
        if (totalRecords === 0) return 'You do not have any attendance records yet.';
        const percentage = Math.round((attended / totalRecords) * 100);
        return `Your overall attendance is ${percentage}%.`;
      }
      
      if (query.includes('fee')) {
        // Calculate pending fees
        const fees = await FeeItem.find({ studentId: userId, status: 'Unpaid' });
        if (fees.length === 0) return 'Great news! You have no pending fees.';
        
        const totalPending = fees.reduce((sum, f) => sum + f.amount, 0);
        return `You have ₹${totalPending.toLocaleString('en-IN')} in pending fees.`;
      }

      if (query.includes('class') || query.includes('today')) {
        // Fetch today's schedule
        const student = await Student.findById(userId);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = daysOfWeek[new Date().getDay()];
        
        const slots = await TimetableSlot.find({ 
          collegeId: cid, 
          isPublished: true, 
          day: today 
        }).populate('courseId', 'title code').sort('slotNumber');

        // Filter slots where student is enrolled in the course
        const studentCourses = student?.enrolledCourses.map(id => id.toString()) || [];
        const studentSlots = slots.filter(s => s.courseId && studentCourses.includes(s.courseId._id.toString()));

        if (studentSlots.length === 0) return `You have no classes scheduled for today (${today}).`;
        
        const scheduleStr = studentSlots.map(s => {
          const course = s.courseId as any;
          return `- ${course.title} (${s.startTime} - ${s.endTime}) in Room ${s.roomId}`;
        }).join('\n');
        
        return `Here is your schedule for today:\n${scheduleStr}`;
      }
    } else if (role === 'faculty' || role === 'hod') {
      if (query.includes('class') || query.includes('today')) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = daysOfWeek[new Date().getDay()];
        
        const slots = await TimetableSlot.find({ 
          facultyId: userId,
          isPublished: true, 
          day: today 
        }).populate('courseId', 'title code').sort('slotNumber');

        if (slots.length === 0) return `You have no classes scheduled to teach today (${today}).`;
        
        const scheduleStr = slots.map(s => {
          const course = s.courseId as any;
          return `- ${course.title} (${s.startTime} - ${s.endTime}) in Room ${s.roomId}`;
        }).join('\n');
        
        return `Here is your teaching schedule for today:\n${scheduleStr}`;
      }

      if (query.includes('attendance') && (query.includes('below') || query.includes('threshold') || query.includes('weak'))) {
        // Real aggregation for weak students
        const faculty = await Faculty.findById(userId);
        if (!faculty) return 'I could not find your faculty record.';
        
        const students = await Student.find({ collegeId: cid, role: 'student', enrolledCourses: { $in: faculty.assignedCourses } });
        let weakCount = 0;
        for (const s of students) {
          const total = await ClassSession.countDocuments({ collegeId: cid, courseId: { $in: s.enrolledCourses }, status: 'completed' });
          const attended = await Attendance.countDocuments({ collegeId: cid, studentId: s._id, status: 'present' });
          const rate = total > 0 ? Math.round((attended / total) * 100) : 100;
          if (rate < 75) weakCount++;
        }
        return `Based on current data, ${weakCount} student(s) in your assigned courses are below the 75% attendance threshold.`;
      }
    } else if (role === 'college_admin') {
      if (query.includes('student') && (query.includes('total') || query.includes('active'))) {
        const count = await Student.countDocuments({ collegeId: cid, role: 'student' });
        return `There are currently ${count} active students enrolled in the college.`;
      }

      if (query.includes('hostel') || query.includes('occupancy')) {
        const hostelStats = await HostelRoom.aggregate([
          { $match: { collegeId: cid } },
          { $group: { _id: null, totalCapacity: { $sum: '$capacity' }, totalOccupants: { $sum: { $cond: { if: { $isArray: '$occupants' }, then: { $size: '$occupants' }, else: 0 } } } } }
        ]);
        const capacity = hostelStats[0]?.totalCapacity || 0;
        const occupied = hostelStats[0]?.totalOccupants || 0;
        const rate = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
        
        return `Hostel occupancy is currently at ${rate}%. (${occupied} out of ${capacity} beds occupied).`;
      }

      if (query.includes('admission') || query.includes('pending')) {
        const pendingCount = await AdmissionApplication.countDocuments({ collegeId: cid, status: 'applied' });
        return `There are ${pendingCount} pending admission requests that require administrative review.`;
      }
    }

    return "I'm sorry, I couldn't understand your request or don't have access to that information yet. Try asking about your attendance, fees, or today's classes.";
  }
}
