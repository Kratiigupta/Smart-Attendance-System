'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  HiOutlineCalendarDays, HiOutlineSparkles, HiOutlineArrowDownTray,
  HiOutlineAdjustmentsHorizontal, HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2, HiOutlineUserGroup, HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import {
  HiOutlineCheck,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';

// Let's import standard icons from react-icons/hi2
import * as Hi2 from 'react-icons/hi2';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '9:00-9:50', '10:00-10:50', '11:00-11:50', '12:00-12:50',
  '1:00-1:30', // Lunch
  '1:30-2:20', '2:30-3:20', '3:30-4:20'
];

type TimetableCell = {
  subject: string;
  code: string;
  faculty: string;
  room: string;
  type: 'lecture' | 'tutorial' | 'practical' | 'break';
  color: string;
} | null;

const initialTimetableData: Record<string, (TimetableCell)[]> = {
  Monday: [
    { subject: 'Data Structures', code: 'CSC-201', faculty: 'Dr. Rajesh', room: 'LH-301', type: 'lecture', color: '#6366f1' },
    { subject: 'Eng. Math III', code: 'MAT-301', faculty: 'Dr. Verma', room: 'LH-102', type: 'lecture', color: '#14b8a6' },
    { subject: 'Digital Electronics', code: 'ECE-301', faculty: 'Prof. Rai', room: 'LH-201', type: 'lecture', color: '#f59e0b' },
    null,
    { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' },
    { subject: 'DS Lab', code: 'CSC-201P', faculty: 'Dr. Rajesh', room: 'Lab-101', type: 'practical', color: '#8b5cf6' },
    { subject: 'DS Lab', code: 'CSC-201P', faculty: 'Dr. Rajesh', room: 'Lab-101', type: 'practical', color: '#8b5cf6' },
    null,
  ],
  Tuesday: [
    { subject: 'DBMS', code: 'CSC-305', faculty: 'Dr. Neha', room: 'LH-401', type: 'lecture', color: '#f43f5e' },
    { subject: 'Computer Networks', code: 'CSC-303', faculty: 'Prof. Amit', room: 'LH-302', type: 'lecture', color: '#06b6d4' },
    null,
    { subject: 'Eng. Math III', code: 'MAT-301', faculty: 'Dr. Verma', room: 'LH-102', type: 'tutorial', color: '#14b8a6' },
    { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' },
    { subject: 'Environmental Science', code: 'VAC-101', faculty: 'Dr. Meena', room: 'LH-103', type: 'lecture', color: '#10b981' },
    { subject: 'Skill: Web Dev', code: 'SEC-201', faculty: 'Prof. Rahul', room: 'Lab-201', type: 'practical', color: '#a855f7' },
    { subject: 'Skill: Web Dev', code: 'SEC-201', faculty: 'Prof. Rahul', room: 'Lab-201', type: 'practical', color: '#a855f7' },
  ],
  Wednesday: [
    { subject: 'Data Structures', code: 'CSC-201', faculty: 'Dr. Rajesh', room: 'LH-301', type: 'lecture', color: '#6366f1' },
    { subject: 'Digital Electronics', code: 'ECE-301', faculty: 'Prof. Rai', room: 'LH-201', type: 'lecture', color: '#f59e0b' },
    { subject: 'DBMS', code: 'CSC-305', faculty: 'Dr. Neha', room: 'LH-401', type: 'lecture', color: '#f43f5e' },
    { subject: 'Computer Networks', code: 'CSC-303', faculty: 'Prof. Amit', room: 'LH-302', type: 'tutorial', color: '#06b6d4' },
    { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' },
    { subject: 'DE Lab', code: 'ECE-301P', faculty: 'Prof. Rai', room: 'Lab-301', type: 'practical', color: '#f59e0b' },
    { subject: 'DE Lab', code: 'ECE-301P', faculty: 'Prof. Rai', room: 'Lab-301', type: 'practical', color: '#f59e0b' },
    null,
  ],
  Thursday: [
    null,
    { subject: 'Eng. Math III', code: 'MAT-301', faculty: 'Dr. Verma', room: 'LH-102', type: 'lecture', color: '#14b8a6' },
    { subject: 'Data Structures', code: 'CSC-201', faculty: 'Dr. Rajesh', room: 'LH-301', type: 'tutorial', color: '#6366f1' },
    { subject: 'DBMS', code: 'CSC-305', faculty: 'Dr. Neha', room: 'LH-401', type: 'lecture', color: '#f43f5e' },
    { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' },
    { subject: 'Computer Networks', code: 'CSC-303', faculty: 'Prof. Amit', room: 'LH-302', type: 'lecture', color: '#06b6d4' },
    { subject: 'Sports / NSS', code: 'AEC-101', faculty: 'Coach', room: 'Ground', type: 'lecture', color: '#10b981' },
    null,
  ],
  Friday: [
    { subject: 'Digital Electronics', code: 'ECE-301', faculty: 'Prof. Rai', room: 'LH-201', type: 'lecture', color: '#f59e0b' },
    { subject: 'DBMS', code: 'CSC-305', faculty: 'Dr. Neha', room: 'LH-401', type: 'tutorial', color: '#f43f5e' },
    { subject: 'Computer Networks', code: 'CSC-303', faculty: 'Prof. Amit', room: 'LH-302', type: 'lecture', color: '#06b6d4' },
    null,
    { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' },
    { subject: 'DBMS Lab', code: 'CSC-305P', faculty: 'Dr. Neha', room: 'Lab-102', type: 'practical', color: '#f43f5e' },
    { subject: 'DBMS Lab', code: 'CSC-305P', faculty: 'Dr. Neha', room: 'Lab-102', type: 'practical', color: '#f43f5e' },
    null,
  ],
  Saturday: [
    { subject: 'Mentoring', code: 'MNT-001', faculty: 'Mentor', room: 'LH-Various', type: 'tutorial', color: '#8b5cf6' },
    { subject: 'Library / Self Study', code: '', faculty: '', room: 'Library', type: 'tutorial', color: '#64748b' },
    null, null,
    { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' },
    null, null, null,
  ],
};

const viewTabs = [
  { id: 'batch', label: 'Batch View' },
  { id: 'faculty', label: 'Faculty View' },
  { id: 'room', label: 'Room View' },
];

export default function AdminTimetablePage() {
  const { showToast } = useToast();
  const [view, setView] = useState('batch');
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  // Interactive timetable state
  const [timetable, setTimetable] = useState(initialTimetableData);
  
  // Drag and drop state
  const [dragOverCell, setDragOverCell] = useState<{ day: string; index: number } | null>(null);
  
  // Export Dropdown state
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // AI Optimization state
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const typeColors: Record<string, string> = {
    lecture: 'L', tutorial: 'T', practical: 'P', break: '—',
  };

  // Compile unique lists of faculty and rooms dynamically
  const faculties = Array.from(
    new Set(
      Object.values(timetable)
        .flat()
        .filter((cell): cell is Exclude<TimetableCell, null> => cell !== null && cell.type !== 'break' && !!cell.faculty)
        .map(cell => cell.faculty)
    )
  ).sort();

  const rooms = Array.from(
    new Set(
      Object.values(timetable)
        .flat()
        .filter((cell): cell is Exclude<TimetableCell, null> => cell !== null && cell.type !== 'break' && !!cell.room)
        .map(cell => cell.room)
    )
  ).sort();

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, day: string, index: number) => {
    const cell = timetable[day][index];
    if (cell && cell.type === 'break') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', `${day},${index}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetIndex: number) => {
    e.preventDefault();
    const targetCell = timetable[targetDay][targetIndex];
    if (targetCell && targetCell.type === 'break') return;

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [sourceDay, sourceIndexStr] = data.split(',');
    const sourceIndex = parseInt(sourceIndexStr, 10);

    if (sourceDay === targetDay && sourceIndex === targetIndex) return;

    setTimetable(prev => {
      const updated = { ...prev };
      const sourceRow = [...updated[sourceDay]];
      const targetRow = [...updated[targetDay]];

      const temp = sourceRow[sourceIndex];
      sourceRow[sourceIndex] = targetRow[targetIndex];
      targetRow[targetIndex] = temp;

      updated[sourceDay] = sourceRow;
      updated[targetDay] = targetRow;
      return updated;
    });

    showToast(`Moved slot between ${sourceDay} and ${targetDay} successfully.`, 'success');
  };

  // AI Timetable constraints simulation steps
  const optimizationSteps = [
    { text: 'Analyzing department course credits & requirements...', done: false },
    { text: 'Scanning faculty slots for scheduling overlap conflicts...', done: false },
    { text: 'Mapping classrooms by seat capacities & lab resources...', done: false },
    { text: 'Validating lunch-break hour allocations & student gaps...', done: false },
    { text: 'Verification complete. Timetable generated successfully!', done: true },
  ];

  // Simulated optimization progress runner
  useEffect(() => {
    if (!isOptimizing) return;

    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          return 100;
        }
        const nextProgress = prev + 2;
        
        // Match progress ranges to step index
        if (nextProgress < 25) {
          setCurrentStepIndex(0);
        } else if (nextProgress < 50) {
          setCurrentStepIndex(1);
        } else if (nextProgress < 75) {
          setCurrentStepIndex(2);
        } else if (nextProgress < 95) {
          setCurrentStepIndex(3);
        } else {
          setCurrentStepIndex(4);
        }

        return nextProgress;
      });
    }, 60); // Solver runs in ~3 seconds

    return () => clearInterval(interval);
  }, [isOptimizing]);

  const handleAIClick = () => {
    setIsOptimizationModalOpen(true);
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setCurrentStepIndex(0);
  };

  const applyAIoptimizedSchedule = () => {
    // Generate a shuffled copy of the current state, keeping lunch break at index 4
    const optimized = { ...timetable };
    Object.keys(optimized).forEach(day => {
      const daySlots = [...optimized[day]];
      const nonBreakIndices = [0, 1, 2, 3, 5, 6, 7];
      const shuffledSlots = nonBreakIndices
        .map(idx => daySlots[idx])
        .sort(() => Math.random() - 0.5);

      nonBreakIndices.forEach((origIdx, idx) => {
        daySlots[origIdx] = shuffledSlots[idx];
      });
      optimized[day] = daySlots;
    });

    setTimetable(optimized);
    setIsOptimizationModalOpen(false);
    showToast('AI successfully resolved all constraints and updated the grid.', 'success');
  };

  // Export to Excel (CSV)
  const exportToExcel = () => {
    let csvContent = 'Day,9:00-9:50,10:00-10:50,11:00-11:50,12:00-12:50,1:00-1:30,1:30-2:20,2:30-3:20,3:30-4:20\n';
    days.forEach(day => {
      const rowCells = timetable[day] || [];
      const rowStrings = rowCells.map(cell => {
        if (!cell) return '—';
        if (cell.type === 'break') return 'LUNCH';
        return `"${cell.subject} (${cell.code}) - ${cell.faculty} @ ${cell.room}"`;
      });
      csvContent += `${day},${rowStrings.join(',')}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `timetable_${selectedDept.toLowerCase()}_sem5.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported active timetable layout to CSV sheet successfully.', 'success');
  };

  // Export to PDF (triggers print in PDF layout format)
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn print-container">
      {/* Embedded print overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: white !important;
            color: black !important;
          }
          header, aside, select, button, .no-print, [role="tablist"], .export-btn {
            display: none !important;
          }
          main, .print-container, div, section {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            color: black !important;
          }
          th, td {
            border: 1px solid #111 !important;
            padding: 10px !important;
            font-size: 10px !important;
            background: transparent !important;
            color: black !important;
          }
          .slot-card {
            background: #f9fafb !important;
            border: 1px solid #333 !important;
            box-shadow: none !important;
            transform: none !important;
            color: black !important;
          }
          .slot-card span {
            color: black !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineCalendarDays className="w-6 h-6 text-primary-light" />
            Timetable Manager
          </h1>
          <p className="text-xs text-text-muted mt-0.5">AI-powered NEP 2020 compliant scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<HiOutlineAdjustmentsHorizontal className="w-3.5 h-3.5" />}>
            Constraints
          </Button>
          <Button variant="primary" size="sm" onClick={handleAIClick} icon={<HiOutlineSparkles className="w-3.5 h-3.5" />}>
            Generate Optimized Timetable
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children no-print">
        <StatCard title="Total Slots" value={240} icon={HiOutlineClock} color="primary" subtitle="Across all batches" />
        <StatCard title="Rooms Used" value={18} icon={HiOutlineBuildingOffice2} color="secondary" subtitle="Out of 24 available" />
        <StatCard title="Faculty Loaded" value={69} icon={HiOutlineUserGroup} color="violet" subtitle="Average 16 hrs/week" />
        <StatCard title="Conflicts" value={0} icon={HiOutlineExclamationTriangle} color="success" subtitle="All clear ✓" />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <Tabs tabs={viewTabs} activeTab={view} onChange={(v) => {
          setView(v);
          if (v === 'batch') {
            setSelectedFaculty("");
            setSelectedRoom("");
          } else if (v === 'faculty') {
            setSelectedRoom("");
            if (!selectedFaculty && faculties.length > 0) setSelectedFaculty(faculties[0]);
          } else if (v === 'room') {
            setSelectedFaculty("");
            if (!selectedRoom && rooms.length > 0) setSelectedRoom(rooms[0]);
          }
        }} />

        <div className="flex items-center flex-wrap gap-2">
          {view === 'batch' && (
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2 focus:border-primary/40 focus:outline-none cursor-pointer"
            >
              <option value="CSE">CSE - Sem 5</option>
              <option value="ECE">ECE - Sem 5</option>
              <option value="ME">ME - Sem 3</option>
              <option value="CE">CE - Sem 3</option>
            </select>
          )}

          {view === 'faculty' && (
            <select
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              className="bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2 focus:border-primary/40 focus:outline-none cursor-pointer"
            >
              <option value="">All Faculty</option>
              {faculties.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}

          {view === 'room' && (
            <select
              value={selectedRoom}
              onChange={e => setSelectedRoom(e.target.value)}
              className="bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2 focus:border-primary/40 focus:outline-none cursor-pointer"
            >
              <option value="">All Classrooms</option>
              {rooms.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          {(selectedFaculty || selectedRoom) && (
            <Button variant="outline" size="xs" onClick={() => {
              setSelectedFaculty("");
              setSelectedRoom("");
            }} className="text-[10px]">
              Clear Filters
            </Button>
          )}

          {/* Export Options dropdown */}
          <div className="relative export-btn">
            <Button
              variant="outline"
              size="sm"
              icon={<HiOutlineArrowDownTray className="w-3.5 h-3.5" />}
              onClick={() => setIsExportOpen(!isExportOpen)}
            >
              Export
            </Button>
            {isExportOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-32 bg-bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      exportToPDF();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-bg-hover text-text-secondary hover:text-text-primary text-[10px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    📄 PDF Report
                  </button>
                  <button
                    onClick={() => {
                      exportToExcel();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-bg-hover text-text-secondary hover:text-text-primary text-[10px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    📊 Excel (CSV)
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-bg-hover text-text-secondary hover:text-text-primary text-[10px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    🖨️ Print Layout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <Card noPadding className="overflow-hidden print-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50">
                <th className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-3 py-3 border-b border-r border-border/20 w-24">
                  Day / Time
                </th>
                {timeSlots.map((slot, i) => (
                  <th key={i} className="text-center text-[9px] font-bold text-text-dim uppercase tracking-wider px-2 py-3 border-b border-r border-border/20">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="hover:bg-bg-hover/10 transition-colors">
                  <td className="text-[11px] font-bold text-text-secondary px-3 py-1 border-r border-b border-border/15 bg-bg-elevated/30">
                    {day.substring(0, 3)}
                  </td>
                  {(timetable[day] || []).map((cell, i) => {
                    const isLunch = cell && cell.type === 'break';
                    const isDragOver = dragOverCell && dragOverCell.day === day && dragOverCell.index === i;
                    const matchesFacultyFilter = !selectedFaculty || (cell && cell.faculty === selectedFaculty);
                    const matchesRoomFilter = !selectedRoom || (cell && cell.room === selectedRoom);
                    const isDimmed = cell && (!matchesFacultyFilter || !matchesRoomFilter);

                    return (
                      <td
                        key={i}
                        className={`px-1 py-1 border-r border-b border-border/10 min-w-[100px] align-middle transition-all duration-200 ${
                          isDragOver ? 'bg-primary-glow border-2 border-dashed border-primary/50' : ''
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => {
                          if (isLunch) return;
                          setDragOverCell({ day, index: i });
                        }}
                        onDragLeave={() => setDragOverCell(null)}
                        onDrop={(e) => {
                          setDragOverCell(null);
                          handleDrop(e, day, i);
                        }}
                      >
                        {cell ? (
                          isLunch ? (
                            <div className="text-center py-2 no-print">
                              <span className="text-[9px] text-text-dim font-bold tracking-widest">🍽️ LUNCH</span>
                            </div>
                          ) : (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, day, i)}
                              className={`slot-card rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${
                                isDimmed ? 'opacity-20 scale-95 blur-[0.5px]' : 'opacity-100'
                              }`}
                              style={{
                                background: `${cell.color}15`,
                                borderLeft: `3.5px solid ${cell.color}`,
                              }}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[10px] font-bold text-text-primary leading-tight truncate">
                                  {cell.subject}
                                </span>
                              </div>
                              <div className="text-[8px] text-text-muted leading-tight">
                                <span>{cell.code}</span>
                                {cell.room && <span className="text-text-dim font-semibold"> • {cell.room}</span>}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[8px] text-text-dim truncate">{cell.faculty}</span>
                                <span
                                  className="text-[7px] font-extrabold px-1 py-0.5 rounded uppercase font-mono tracking-tighter"
                                  style={{ color: cell.color, background: `${cell.color}20` }}
                                >
                                  {typeColors[cell.type]}
                                </span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="h-full min-h-[50px] flex items-center justify-center">
                            <span className="text-[9px] text-text-dim/30 select-none">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1 no-print">
        <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Legend:</span>
        {[
          { label: 'Lecture', code: 'L', color: '#6366f1' },
          { label: 'Tutorial', code: 'T', color: '#14b8a6' },
          { label: 'Practical', code: 'P', color: '#8b5cf6' },
          { label: 'Free Slot', code: '—', color: '#64748b' },
        ].map(l => (
          <div key={l.code} className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: l.color, background: `${l.color}15` }}>
              {l.code}
            </span>
            <span className="text-[10px] text-text-muted">{l.label}</span>
          </div>
        ))}
      </div>

      {/* AI Timetable Optimizer progress Modal */}
      <Modal
        isOpen={isOptimizationModalOpen}
        onClose={() => {
          if (!isOptimizing) setIsOptimizationModalOpen(false);
        }}
        title="AI Timetable Optimizer"
      >
        <div className="space-y-5 text-xs text-text-secondary py-1">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineSparkles className="w-5 h-5 text-primary-light animate-pulse" />
            <span className="font-bold text-text-primary">NEP 2020 Multi-Constraint Optimizer</span>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Running parallel heuristics using constraint propagation to verify availability, room quotas, credits, and schedule overlaps.
          </p>

          {/* Stepper Progress bar */}
          <div className="space-y-3 border border-border/30 bg-bg-secondary/40 p-4 rounded-xl">
            {optimizationSteps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isActive = idx === currentStepIndex && isOptimizing;
              const isPending = idx > currentStepIndex;

              return (
                <div key={idx} className="flex items-center gap-3 transition-opacity duration-300">
                  {isDone && <HiOutlineCheck className="w-4 h-4 text-success shrink-0" />}
                  {isActive && <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />}
                  {isPending && <div className="w-3.5 h-3.5 border-2 border-border/40 rounded-full shrink-0" />}
                  
                  <span className={`text-[10.5px] font-semibold ${
                    isDone ? 'text-text-muted line-through opacity-80' : 
                    isActive ? 'text-primary-light font-bold' : 
                    'text-text-dim'
                  }`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase tracking-wider">
              <span>{isOptimizing ? 'Analyzing constraints…' : 'Optimized ✓'}</span>
              <span>{Math.round(optimizationProgress)}%</span>
            </div>
            <div className="h-2 w-full bg-bg-input rounded-full overflow-hidden border border-border/20">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-100"
                style={{ width: `${optimizationProgress}%` }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              disabled={isOptimizing}
              onClick={() => setIsOptimizationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isOptimizing}
              onClick={applyAIoptimizedSchedule}
              icon={<HiOutlineSparkles className="w-3.5 h-3.5" />}
            >
              Apply AI Timetable
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
