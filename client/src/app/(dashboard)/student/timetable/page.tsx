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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { jsPDF } from 'jspdf';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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
  const { user } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSlot, setSelectedSlot] = useState<StudentSlot | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch timetable from API
  const { data: timetableData = [], isLoading } = useQuery<StudentSlot[]>({
    queryKey: ['studentTimetable'],
    queryFn: async () => {
      const res = await api.get('/timetable/student');
      if (!res.success) throw new Error(res.message || 'Failed to fetch timetable');
      return res.data || [];
    }
  });

  const getSlot = (day: string, slotNumber: number) => {
    return timetableData.find(
      (s) => s.day === day && s.slotNumber === slotNumber
    );
  };

  const handleSlotClick = (slot: StudentSlot) => {
    setSelectedSlot(slot);
    setIsDetailModalOpen(true);
  };

  const exportTimetablePDF = () => {
    if (timetableData.length === 0) {
      showToast('No timetable data available to export.', 'warning');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(user?.collegeName || 'SmartEdu Campus', 105, 25, { align: 'center' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Student Semester Timetable', 105, 32, { align: 'center' });
    
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 38, 195, 38);
    
    // Student Info
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${user?.name || 'Student'}`, 15, 47);
    doc.text(`Roll Number: ${user?.studentData?.rollNumber || 'N/A'}`, 195, 47, { align: 'right' });
    doc.text(`Department: ${user?.studentData?.department?.name || 'N/A'}`, 15, 54);
    doc.text(`Semester: Semester ${user?.studentData?.semester || 'N/A'}`, 195, 54, { align: 'right' });
    
    doc.line(15, 60, 195, 60);
    
    // Table Headers
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Day', 15, 68);
    doc.text('Time Slot', 40, 68);
    doc.text('Subject Details', 85, 68);
    doc.text('Classroom', 160, 68);
    doc.text('Type', 182, 68);
    
    doc.line(15, 73, 195, 73);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    let y = 80;
    timetableData.forEach((slot) => {
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
      doc.text(slot.day, 15, y);
      doc.text(slot.time, 40, y);
      doc.text(`${slot.courseName} (${slot.courseCode}) - ${slot.faculty}`, 85, y);
      doc.text(slot.room, 160, y);
      doc.text(slot.type, 182, y);
      y += 8;
    });
    
    doc.line(15, y + 2, 195, y + 2);
    
    y += 10;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.text('GENERATED SECURELY VIA SMARTEDU PORTAL', 105, y, { align: 'center' });
    
    doc.save('Student_Timetable.pdf');
    showToast('Weekly timetable exported as PDF successfully!', 'success');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-bg-secondary animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-bg-secondary animate-pulse rounded-lg" />
        </div>
        <div className="h-16 bg-bg-secondary animate-pulse rounded-2xl" />
        <div className="h-96 bg-bg-secondary animate-pulse rounded-2xl" />
      </div>
    );
  }

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
          <Button variant="outline" size="sm" icon={<HiOutlineArrowDownTray className="w-4 h-4" />} onClick={exportTimetablePDF}>
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

      {/* Empty State */}
      {timetableData.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HiOutlineCalendarDays className="w-8 h-8 text-primary-light" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">No Timetable Available</h3>
            <p className="text-xs text-text-muted max-w-xs">
              Your semester timetable has not been generated yet. Please check back once the administration publishes the schedule.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Free Period Productivity Suggestion Card */}
          <div className="gradient-primary-glow border border-primary/20 rounded-2xl p-5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5 z-10 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="xs" icon={<HiOutlineSparkles className="w-3 h-3 text-primary-light" />}>
                  AI Recommendation
                </Badge>
              </div>
              <h3 className="text-sm font-heading font-bold text-text-primary">
                Check your free periods and study recommendations in the Learning Hub.
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Explore study materials and practice quizzes for your enrolled courses during breaks.
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
              {timetableData.map((slot) => (
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
        </>
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
