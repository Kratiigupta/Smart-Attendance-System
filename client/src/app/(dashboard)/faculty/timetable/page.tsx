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
  HiOutlineUserGroup,
  HiOutlineArrowDownTray,
  HiOutlineArrowsUpDown,
  HiOutlineMagnifyingGlass,
  HiOutlineQueueList,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { jsPDF } from 'jspdf';

interface TimetableSlot {
  id: string;
  courseName: string;
  courseCode: string;
  type: 'Lecture' | 'Practical' | 'Tutorial';
  room: string;
  batch: string;
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

const initialTimetableData: TimetableSlot[] = [
  // Monday
  { id: '1', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', batch: 'CSE Sem-3', time: '10:00 - 10:50', day: 'Monday', slotNumber: 2 },
  { id: '2', courseName: 'Data Structures Lab', courseCode: 'CSC-201P', type: 'Practical', room: 'Lab-101', batch: 'CSE Sem-3 A', time: '11:00 - 11:50', day: 'Monday', slotNumber: 3 },
  { id: '3', courseName: 'Algorithm Design', courseCode: 'CSC-401', type: 'Lecture', room: 'LH-302', batch: 'CSE Sem-5', time: '01:30 - 02:20', day: 'Monday', slotNumber: 5 },
  
  // Tuesday
  { id: '4', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Tutorial', room: 'LH-301', batch: 'CSE Sem-3', time: '03:30 - 04:20', day: 'Tuesday', slotNumber: 7 },
  { id: '5', courseName: 'Algorithm Design', courseCode: 'CSC-401', type: 'Lecture', room: 'LH-302', batch: 'CSE Sem-5', time: '01:30 - 02:20', day: 'Tuesday', slotNumber: 5 },
  
  // Wednesday
  { id: '6', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', batch: 'CSE Sem-3', time: '10:00 - 10:50', day: 'Wednesday', slotNumber: 2 },
  { id: '7', courseName: 'Data Structures Lab', courseCode: 'CSC-201P', type: 'Practical', room: 'Lab-101', batch: 'CSE Sem-3 A', time: '11:00 - 11:50', day: 'Wednesday', slotNumber: 3 },
  
  // Thursday
  { id: '8', courseName: 'Algorithm Design', courseCode: 'CSC-401', type: 'Tutorial', room: 'LH-302', batch: 'CSE Sem-5', time: '02:30 - 03:20', day: 'Thursday', slotNumber: 6 },
  { id: '9', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', batch: 'CSE Sem-3', time: '10:00 - 10:50', day: 'Thursday', slotNumber: 2 },
  
  // Friday
  { id: '10', courseName: 'Algorithm Design Lab', courseCode: 'CSC-401P', type: 'Practical', room: 'Lab-102', batch: 'CSE Sem-5 B', time: '09:00 - 09:50', day: 'Friday', slotNumber: 1 },
  { id: '11', courseName: 'Algorithm Design Lab', courseCode: 'CSC-401P', type: 'Practical', room: 'Lab-102', batch: 'CSE Sem-5 B', time: '10:00 - 10:50', day: 'Friday', slotNumber: 2 },
  { id: '12', courseName: 'Algorithm Design', courseCode: 'CSC-401', type: 'Lecture', room: 'LH-302', batch: 'CSE Sem-5', time: '01:30 - 02:20', day: 'Friday', slotNumber: 5 },

  // Saturday
  { id: '13', courseName: 'Data Structures', courseCode: 'CSC-201', type: 'Lecture', room: 'LH-301', batch: 'CSE Sem-3', time: '09:00 - 09:50', day: 'Saturday', slotNumber: 1 },
];

const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const badgeVariants = {
  Lecture: 'primary' as const,
  Practical: 'success' as const,
  Tutorial: 'warning' as const,
};

const typeColors = {
  Lecture: 'bg-primary/10 text-primary-light border-primary/20 hover:bg-primary/20',
  Practical: 'bg-success/10 text-success-light border-success/20 hover:bg-success/20',
  Tutorial: 'bg-warning/10 text-warning-light border-warning/20 hover:bg-warning/20',
};

export default function FacultyTimetable() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState({ date: '', slot: 1, faculty: '' });

  const getSlot = (day: string, slotNumber: number) => {
    return initialTimetableData.find(
      (s) => s.day === day && s.slotNumber === slotNumber
    );
  };

  const filteredSlots = initialTimetableData.filter(
    (slot) =>
      slot.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSlotClick = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsDetailModalOpen(true);
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Swap request submitted for ${selectedSlot?.courseName} on next ${swapTarget.date} (Slot ${swapTarget.slot}) with Dr. ${swapTarget.faculty}`, 'success');
    setIsSwapModalOpen(false);
    setIsDetailModalOpen(false);
  };

  const exportTimetablePDF = () => {
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
    doc.text('Faculty Teaching Timetable', 105, 32, { align: 'center' });
    
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 38, 195, 38);
    
    // Faculty Info
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Lecturer Name: ${user?.name || 'Dr. Rajesh Kumar'}`, 15, 47);
    doc.text(`Employee ID: ${user?.facultyData?.employeeId || 'EMP-2021-09'}`, 195, 47, { align: 'right' });
    doc.text(`Department: ${user?.facultyData?.department?.name || 'Computer Science & Engineering'}`, 15, 54);
    doc.text(`Designation: ${user?.facultyData?.designation || 'Associate Professor'}`, 195, 54, { align: 'right' });
    
    doc.line(15, 60, 195, 60);
    
    // Table Headers
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Day', 15, 68);
    doc.text('Time Slot', 40, 68);
    doc.text('Subject Details', 85, 68);
    doc.text('Classroom', 160, 68);
    doc.text('Batch / Sem', 178, 68);
    
    doc.line(15, 73, 195, 73);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    
    let y = 80;
    initialTimetableData.forEach((slot) => {
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
      doc.text(slot.day, 15, y);
      doc.text(slot.time, 40, y);
      doc.text(`${slot.courseName} (${slot.courseCode}) [${slot.type}]`, 85, y);
      doc.text(slot.room, 160, y);
      doc.text(slot.batch, 178, y);
      y += 8;
    });
    
    doc.line(15, y + 2, 195, y + 2);
    
    y += 10;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.text('GENERATED SECURELY VIA SMARTEDU PORTAL', 105, y, { align: 'center' });
    
    doc.save('Faculty_Timetable.pdf');
    showToast('Teaching timetable exported as PDF successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">My Timetable</h1>
          <p className="text-xs text-text-muted mt-0.5">
            View your weekly schedule, coordinate swaps, and manage practical slots.
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

      {/* Filter and Overview Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search by course code, name, batch or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary/50 text-text-primary transition-colors placeholder:text-text-dim"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/20 bg-primary/8 text-primary-light font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Lectures (6 hrs/wk)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-success/20 bg-success/8 text-success-light font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Practicals (6 hrs/wk)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-warning/20 bg-warning/8 text-warning-light font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" /> Tutorials (2 hrs/wk)
          </span>
        </div>
      </div>

      {/* Main Schedule Display */}
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
              {days.map((day, dIdx) => (
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
                            className={`p-2 rounded-xl border text-left h-full flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${typeColors[slot.type]}`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-black tracking-tight">{slot.courseCode}</span>
                                <Badge variant={badgeVariants[slot.type]} size="xs">{slot.type.charAt(0)}</Badge>
                              </div>
                              <p className="text-[9px] font-medium text-text-primary leading-tight mt-1 truncate">{slot.courseName}</p>
                            </div>
                            <div className="flex items-center justify-between text-[8px] text-text-muted mt-1.5">
                              <span className="flex items-center gap-0.5 truncate max-w-[55%]">
                                <HiOutlineBuildingOffice2 className="w-2.5 h-2.5 shrink-0" />
                                {slot.room}
                              </span>
                              <span className="flex items-center gap-0.5 truncate max-w-[45%]">
                                <HiOutlineUserGroup className="w-2.5 h-2.5 shrink-0" />
                                {slot.batch.split(' ').pop()}
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
          {filteredSlots.length > 0 ? (
            filteredSlots.map((slot) => (
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
                      <Badge variant={badgeVariants[slot.type]} size="xs">{slot.type}</Badge>
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
                    <HiOutlineUserGroup className="w-4 h-4 text-text-dim" />
                    <span>{slot.batch}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-text-muted text-xs">
              No matching class slots found.
            </div>
          )}
        </div>
      )}

      {/* Class Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Class Session Details"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
            <Button variant="secondary" size="sm" icon={<HiOutlineArrowsUpDown className="w-4 h-4" />} onClick={() => setIsSwapModalOpen(true)}>
              Request Swap
            </Button>
          </div>
        }
      >
        {selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-border/20 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-text-primary">{selectedSlot.courseCode}</span>
                  <Badge variant={badgeVariants[selectedSlot.type]} size="xs">{selectedSlot.type}</Badge>
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
                <span className="text-text-muted font-medium">Enrolled Batch</span>
                <span className="text-text-primary font-bold">{selectedSlot.batch}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Request Swap Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Request Class Swap"
      >
        <form onSubmit={handleSwapSubmit} className="space-y-4 text-xs text-text-secondary">
          <p className="text-[11px] text-text-muted leading-relaxed">
            Request a schedule adjustment for <strong className="text-text-primary">{selectedSlot?.courseName} ({selectedSlot?.courseCode})</strong>. We will notify the target faculty member and the HOD for approval.
          </p>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Select Swap Date</label>
            <input
              type="date"
              required
              value={swapTarget.date}
              onChange={(e) => setSwapTarget({ ...swapTarget, date: e.target.value })}
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Select Target Time Slot</label>
            <select
              value={swapTarget.slot}
              onChange={(e) => setSwapTarget({ ...swapTarget, slot: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            >
              {timeSlots.map((time, idx) => (
                <option key={idx} value={idx + 1}>
                  Slot {idx + 1} ({time})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Select Faculty to Swap With</label>
            <select
              value={swapTarget.faculty}
              required
              onChange={(e) => setSwapTarget({ ...swapTarget, faculty: e.target.value })}
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            >
              <option value="">Choose a Faculty...</option>
              <option value="Amit Sharma">Dr. Amit Sharma (Operating Systems)</option>
              <option value="Sunita Verma">Dr. Sunita Verma (Database Systems)</option>
              <option value="Vikram Malhotra">Prof. Vikram Malhotra (Networks)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/20">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSwapModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
