'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineSparkles,
  HiOutlineArrowDownTray,
  HiOutlineSquares2X2,
  HiOutlineQueueList,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import Link from 'next/link';

interface StudentSlot {
  id: string;
  courseName: string;
  courseCode: string;
  type: 'Lecture' | 'Practical' | 'Tutorial';
  room: string;
  faculty: string;
  time: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  slotNumber: number;
}

const timeSlots = [
  '09:00 - 09:50',
  '10:00 - 10:50',
  '11:00 - 11:50',
  '12:00 - 12:50',
  '01:30 - 02:20',
  '02:30 - 03:20',
  '03:30 - 04:20',
  '04:30 - 05:20',
];

const mockStudentTimetable: StudentSlot[] = [
  // Monday
  { id: '1', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', faculty: 'Dr. Rajesh Kumar', time: '10:00 - 10:50', day: 'Monday', slotNumber: 2 },
  { id: '2', courseName: 'Data Structures Lab', courseCode: 'CSC-201P', type: 'Practical', room: 'Lab-101', faculty: 'Dr. Rajesh Kumar', time: '11:00 - 11:50', day: 'Monday', slotNumber: 3 },
  { id: '3', courseName: 'Operating Systems', courseCode: 'CSC-202', type: 'Lecture', room: 'LH-303', faculty: 'Dr. Amit Sharma', time: '01:30 - 02:20', day: 'Monday', slotNumber: 5 },
  
  // Tuesday
  { id: '4', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Tutorial', room: 'LH-301', faculty: 'Dr. Rajesh Kumar', time: '03:30 - 04:20', day: 'Tuesday', slotNumber: 7 },
  { id: '5', courseName: 'Operating Systems', courseCode: 'CSC-202', type: 'Lecture', room: 'LH-303', faculty: 'Dr. Amit Sharma', time: '01:30 - 02:20', day: 'Tuesday', slotNumber: 5 },
  { id: '6', courseName: 'Discrete Mathematics', courseCode: 'MTH-201', type: 'Lecture', room: 'LH-202', faculty: 'Dr. Sunita Verma', time: '09:00 - 09:50', day: 'Tuesday', slotNumber: 1 },

  // Wednesday
  { id: '7', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', faculty: 'Dr. Rajesh Kumar', time: '10:00 - 10:50', day: 'Wednesday', slotNumber: 2 },
  { id: '8', courseName: 'Data Structures Lab', courseCode: 'CSC-201P', type: 'Practical', room: 'Lab-101', faculty: 'Dr. Rajesh Kumar', time: '11:00 - 11:50', day: 'Wednesday', slotNumber: 3 },
  { id: '9', courseName: 'Discrete Mathematics', courseCode: 'MTH-201', type: 'Lecture', room: 'LH-202', faculty: 'Dr. Sunita Verma', time: '01:30 - 02:20', day: 'Wednesday', slotNumber: 5 },

  // Thursday
  { id: '10', courseName: 'Operating Systems Lab', courseCode: 'CSC-202P', type: 'Practical', room: 'Lab-103', faculty: 'Dr. Amit Sharma', time: '02:30 - 03:20', day: 'Thursday', slotNumber: 6 },
  { id: '11', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', faculty: 'Dr. Rajesh Kumar', time: '10:00 - 10:50', day: 'Thursday', slotNumber: 2 },

  // Friday
  { id: '12', courseName: 'Operating Systems Lab', courseCode: 'CSC-202P', type: 'Practical', room: 'Lab-103', faculty: 'Dr. Amit Sharma', time: '09:00 - 09:50', day: 'Friday', slotNumber: 1 },
  { id: '13', courseName: 'Operating Systems Lab', courseCode: 'CSC-202P', type: 'Practical', room: 'Lab-103', faculty: 'Dr. Amit Sharma', time: '10:00 - 10:50', day: 'Friday', slotNumber: 2 },
  { id: '14', courseName: 'Operating Systems', courseCode: 'CSC-202', type: 'Lecture', room: 'LH-303', faculty: 'Dr. Amit Sharma', time: '01:30 - 02:20', day: 'Friday', slotNumber: 5 },
  
  // Saturday
  { id: '15', courseName: 'Discrete Mathematics', courseCode: 'MTH-201', type: 'Lecture', room: 'LH-202', faculty: 'Dr. Sunita Verma', time: '09:00 - 09:50', day: 'Saturday', slotNumber: 1 },
  { id: '16', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', faculty: 'Dr. Rajesh Kumar', time: '10:00 - 10:50', day: 'Saturday', slotNumber: 2 },
];

const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const typeBadgeVariants = {
  Lecture: 'primary' as const,
  Practical: 'success' as const,
  Tutorial: 'warning' as const,
};

const cellColorClasses = {
  Lecture: 'bg-primary/10 text-primary-light border-primary/20 hover:bg-primary/20',
  Practical: 'bg-success/10 text-success-light border-success/20 hover:bg-success/20',
  Tutorial: 'bg-warning/10 text-warning-light border-warning/20 hover:bg-warning/20',
};

export default function StudentTimetable() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSlot, setSelectedSlot] = useState<StudentSlot | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getSlot = (day: string, slotNumber: number) => {
    return mockStudentTimetable.find(
      (s) => s.day === day && s.slotNumber === slotNumber
    );
  };

  const handleSlotClick = (slot: StudentSlot) => {
    setSelectedSlot(slot);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">My Timetable</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Your registered semester timetable and active classroom schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<HiOutlineArrowDownTray className="w-4 h-4" />}>
            Export PDF
          </Button>
          <div className="flex bg-bg-elevated border border-border/40 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary/20 text-primary-light'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid View"
            >
              <HiOutlineSquares2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary/20 text-primary-light'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="List View"
            >
              <HiOutlineQueueList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Free Period Productivity Suggestion Card */}
      <div className="gradient-primary-glow border border-primary/20 rounded-2xl p-5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="xs" icon={<HiOutlineSparkles className="w-3 h-3 text-primary-light" />}>
              AI Recommendation
            </Badge>
            <span className="text-[10px] text-primary-light font-bold">FREE PERIOD COMING UP</span>
          </div>
          <h3 className="text-sm font-heading font-bold text-text-primary">
            You have a 1-hour break between 11:50 AM and 01:30 PM.
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your attendance in <strong className="text-text-primary">Data Structures Lab</strong> is currently at 83%. We recommend studying the <strong className="text-text-primary">Binary Search Trees</strong> module in the Learn Section during your break to boost performance.
          </p>
        </div>
        <Link href="/student/learn">
          <Button variant="primary" size="sm" iconRight={<HiOutlineArrowRight className="w-3.5 h-3.5" />}>
            Go to Learn
          </Button>
        </Link>
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Timetable View */}
      {viewMode === 'grid' ? (
        <div className="overflow-x-auto rounded-2xl border border-border/30 shadow-xl bg-bg-secondary">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-border/35 bg-bg-elevated/40">
                <th className="py-3.5 px-4 text-left text-xs font-bold text-text-primary w-28 border-r border-border/15">
                  Day / Slot
                </th>
                {timeSlots.map((time, idx) => (
                  <th key={idx} className="py-3 px-2 text-center text-xs font-bold text-text-primary border-r border-border/15 last:border-r-0">
                    <div className="text-[10px] text-text-muted font-normal">Slot {idx + 1}</div>
                    <div className="text-[9px] text-text-dim font-mono">{time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b border-border/20 last:border-b-0 hover:bg-bg-hover/5 transition-colors">
                  <td className="py-4 px-4 text-xs font-bold text-text-primary bg-bg-elevated/10 border-r border-border/15">
                    {day}
                  </td>
                  {Array.from({ length: 8 }).map((_, sIdx) => {
                    const slotNum = sIdx + 1;
                    const slot = getSlot(day, slotNum);
                    
                    return (
                      <td key={sIdx} className="p-2 border-r border-border/15 last:border-r-0 text-center align-middle h-24 w-[12%]">
                        {slot ? (
                          <div
                            onClick={() => handleSlotClick(slot)}
                            className={`p-2 rounded-xl border text-left h-full flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${cellColorClasses[slot.type]}`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-black tracking-tight">{slot.courseCode}</span>
                                <Badge variant={typeBadgeVariants[slot.type]} size="xs">{slot.type.charAt(0)}</Badge>
                              </div>
                              <p className="text-[9px] font-medium text-text-primary leading-tight mt-1 truncate">{slot.courseName}</p>
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-text-muted mt-1.5">
                              <span className="flex items-center gap-0.5 truncate max-w-[55%]">
                                <HiOutlineBuildingOffice2 className="w-2.5 h-2.5 shrink-0" />
                                {slot.room}
                              </span>
                              <span className="flex items-center gap-0.5 truncate max-w-[45%]">
                                <HiOutlineUser className="w-2.5 h-2.5 shrink-0" />
                                {slot.faculty.split(' ').pop()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[9px] text-text-dim/40 italic font-mono">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockStudentTimetable.map((slot) => (
            <Card
              key={slot.id}
              className="hover:scale-[1.01] transition-transform cursor-pointer border-l-4"
              style={{ borderLeftColor: slot.type === 'Lecture' ? '#6366f1' : slot.type === 'Practical' ? '#10b981' : '#f59e0b' }}
              onClick={() => handleSlotClick(slot)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-text-primary">{slot.courseCode}</span>
                    <Badge variant={typeBadgeVariants[slot.type]} size="xs">{slot.type}</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mt-1">{slot.courseName}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/15 text-[10px]">
                <div className="flex items-center gap-2 text-text-muted">
                  <HiOutlineCalendarDays className="w-4 h-4 text-text-dim" />
                  <span>{slot.day}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <HiOutlineClock className="w-4 h-4 text-text-dim" />
                  <span>{slot.time}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <HiOutlineBuildingOffice2 className="w-4 h-4 text-text-dim" />
                  <span>{slot.room}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <HiOutlineUser className="w-4 h-4 text-text-dim" />
                  <span>{slot.faculty}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Class Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Class Session Details"
      >
        {selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-border/20 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-text-primary">{selectedSlot.courseCode}</span>
                  <Badge variant={typeBadgeVariants[selectedSlot.type]} size="xs">{selectedSlot.type}</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mt-1">{selectedSlot.courseName}</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-text-muted font-medium">Day</span>
                <span className="text-text-primary font-bold">{selectedSlot.day}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-text-muted font-medium">Time Slot</span>
                <span className="text-text-primary font-bold font-mono">{selectedSlot.time} (Slot {selectedSlot.slotNumber})</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-text-muted font-medium">Classroom / Lab</span>
                <span className="text-text-primary font-bold">{selectedSlot.room}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-text-muted font-medium">Instructor</span>
                <span className="text-text-primary font-bold">{selectedSlot.faculty}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/20 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
