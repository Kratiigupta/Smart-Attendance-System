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
  HiOutlineCheckCircle, HiOutlineCheck
} from 'react-icons/hi2';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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
  
  // Real timetable from DB
  const { data: dbTimetable = [], refetch } = useQuery({
    queryKey: ['adminTimetable'],
    queryFn: async () => {
      const res = await api.get('/timetable/admin');
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    }
  });

  // Draft / Preview State
  const [isPreview, setIsPreview] = useState(false);
  const [draftData, setDraftData] = useState<any[]>([]);
  
  // Grid parsing
  const buildGrid = (flatData: any[]) => {
    const grid: Record<string, (TimetableCell)[]> = {
      Monday: Array(8).fill(null),
      Tuesday: Array(8).fill(null),
      Wednesday: Array(8).fill(null),
      Thursday: Array(8).fill(null),
      Friday: Array(8).fill(null),
      Saturday: Array(8).fill(null),
    };

    days.forEach(day => {
      grid[day][4] = { subject: 'Lunch Break', code: '', faculty: '', room: '', type: 'break', color: '' };
    });

    flatData.forEach(slot => {
      const day = slot.day;
      if (grid[day]) {
        let idx = slot.slotNumber - 1;
        if (idx >= 4) idx += 1; 
        if (idx > 7) return;
        
        grid[day][idx] = {
          subject: slot.courseName || slot.course_title,
          code: slot.courseCode || 'TBD',
          faculty: slot.faculty || slot.teacher_name,
          room: slot.room || slot.room_name,
          type: (slot.type?.toLowerCase() || 'lecture') as 'lecture' | 'tutorial' | 'practical',
          color: '#6366f1'
        };
      }
    });
    return grid;
  };

  const activeGrid = isPreview ? buildGrid(draftData) : buildGrid(dbTimetable);
  const isGridEmpty = !isPreview && dbTimetable.length === 0;

  // AI Optimization state
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const faculties = Array.from(new Set(dbTimetable.map((s: any) => s.faculty))).sort() as string[];
  const rooms = Array.from(new Set(dbTimetable.map((s: any) => s.room))).sort() as string[];

  const typeColors: Record<string, string> = {
    lecture: 'L', tutorial: 'T', practical: 'P', break: '—',
  };

  const optimizationSteps = [
    { text: 'Analyzing department course credits & requirements...', done: false },
    { text: 'Scanning faculty slots for scheduling overlap conflicts...', done: false },
    { text: 'Mapping classrooms by seat capacities & lab resources...', done: false },
    { text: 'Validating lunch-break hour allocations & student gaps...', done: false },
    { text: 'Verification complete. Generating Preview...', done: true },
  ];

  useEffect(() => {
    if (!isOptimizing) return;

    let progress = 0;
    const interval = setInterval(async () => {
      progress += 2;
      setOptimizationProgress(progress);
      
      if (progress < 25) setCurrentStepIndex(0);
      else if (progress < 50) setCurrentStepIndex(1);
      else if (progress < 75) setCurrentStepIndex(2);
      else if (progress < 95) setCurrentStepIndex(3);
      else setCurrentStepIndex(4);

      if (progress >= 100) {
        clearInterval(interval);
        
        try {
          const res = await api.post('/timetable/optimize', {});
          if (res.success && res.data?.timetable) {
             setDraftData(res.data.timetable);
             setIsPreview(true);
             showToast('Draft timetable generated. Please review and publish.', 'success');
          } else {
             showToast(res.message || 'Failed to generate timetable', 'error');
          }
        } catch(e: any) {
           showToast(e.message || 'Optimizer failed.', 'error');
        } finally {
           setIsOptimizing(false);
           setIsOptimizationModalOpen(false);
        }
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isOptimizing]);

  const handleAIClick = () => {
    setIsOptimizationModalOpen(true);
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setCurrentStepIndex(0);
  };

  const publishTimetable = async () => {
    try {
      const res = await api.post('/timetable/publish', {
        timetableData: draftData,
        semester: 5,
        academicYear: '2025-2026'
      });
      if (res.success) {
        showToast('Timetable published to live database successfully!', 'success');
        setIsPreview(false);
        setDraftData([]);
        refetch();
      } else {
        showToast(res.message || 'Failed to publish', 'error');
      }
    } catch(e: any) {
       showToast(e.message || 'Publishing failed.', 'error');
    }
  };

  const discardDraft = () => {
     setIsPreview(false);
     setDraftData([]);
     showToast('Draft discarded.', 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineCalendarDays className="w-6 h-6 text-primary-light" />
            Timetable Manager
          </h1>
          <p className="text-xs text-text-muted mt-0.5">AI-powered NEP 2020 compliant scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          {isPreview ? (
            <>
              <Button variant="outline" size="sm" onClick={discardDraft}>
                Discard Preview
              </Button>
              <Button variant="primary" size="sm" onClick={publishTimetable} icon={<HiOutlineCheckCircle className="w-4 h-4" />}>
                Publish to Live
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={handleAIClick} icon={<HiOutlineSparkles className="w-3.5 h-3.5" />}>
              Generate Optimized Timetable
            </Button>
          )}
        </div>
      </div>

      {isPreview && (
        <div className="bg-warning/10 border border-warning/20 p-3 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Badge variant="warning">DRAFT PREVIEW</Badge>
             <span className="text-xs text-warning-light font-medium">Review the optimized slots. This is not yet visible to students or faculty.</span>
           </div>
        </div>
      )}

      {/* Timetable Grid */}
      {isGridEmpty ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HiOutlineCalendarDays className="w-8 h-8 text-primary-light" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">No Timetable Generated</h3>
            <p className="text-xs text-text-muted max-w-xs">
              Run the AI Optimizer to generate the semester timetable for your college.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleAIClick}>
              Generate Now
            </Button>
          </div>
        </Card>
      ) : (
        <Card noPadding className="overflow-hidden">
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
                    {(activeGrid[day] || []).map((cell, i) => {
                      const isLunch = cell && cell.type === 'break';
                      
                      return (
                        <td
                          key={i}
                          className="px-1 py-1 border-r border-b border-border/10 min-w-[100px] align-middle"
                        >
                          {cell ? (
                            isLunch ? (
                              <div className="text-center py-2">
                                <span className="text-[9px] text-text-dim font-bold tracking-widest">🍽️ LUNCH</span>
                              </div>
                            ) : (
                              <div
                                className="slot-card rounded-lg p-2 transition-all duration-300 group opacity-100"
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
      )}

      {/* AI Timetable Optimizer Modal */}
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
                    isActive ? 'text-primary-light font-bold' : 'text-text-dim'
                  }`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase tracking-wider">
              <span>{isOptimizing ? 'Analyzing constraints…' : 'Preview Ready ✓'}</span>
              <span>{Math.round(optimizationProgress)}%</span>
            </div>
            <div className="h-2 w-full bg-bg-input rounded-full overflow-hidden border border-border/20">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-100"
                style={{ width: `${optimizationProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
