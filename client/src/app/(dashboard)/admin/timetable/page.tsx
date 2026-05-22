'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import {
  HiOutlineCalendarDays, HiOutlineSparkles, HiOutlineArrowDownTray,
  HiOutlineAdjustmentsHorizontal, HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2, HiOutlineUserGroup, HiOutlineClock,
} from 'react-icons/hi2';

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

const timetableData: Record<string, (TimetableCell)[]> = {
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
  const [view, setView] = useState('batch');
  const [selectedDept, setSelectedDept] = useState('CSE');

  const typeColors: Record<string, string> = {
    lecture: 'L', tutorial: 'T', practical: 'P', break: '—',
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
          <Button variant="outline" size="sm" icon={<HiOutlineAdjustmentsHorizontal className="w-3.5 h-3.5" />}>
            Constraints
          </Button>
          <Button variant="primary" size="sm" icon={<HiOutlineSparkles className="w-3.5 h-3.5" />}>
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Slots" value={240} icon={HiOutlineClock} color="primary" subtitle="Across all batches" />
        <StatCard title="Rooms Used" value={18} icon={HiOutlineBuildingOffice2} color="secondary" subtitle="Out of 24 available" />
        <StatCard title="Faculty Loaded" value={69} icon={HiOutlineUserGroup} color="violet" subtitle="Average 16 hrs/week" />
        <StatCard title="Conflicts" value={0} icon={HiOutlineExclamationTriangle} color="success" subtitle="All clear ✓" />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={viewTabs} activeTab={view} onChange={setView} />
        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2 focus:border-primary/40 focus:outline-none"
          >
            <option value="CSE">CSE - Sem 5</option>
            <option value="ECE">ECE - Sem 5</option>
            <option value="ME">ME - Sem 3</option>
            <option value="CE">CE - Sem 3</option>
          </select>
          <Button variant="outline" size="sm" icon={<HiOutlineArrowDownTray className="w-3.5 h-3.5" />}>
            PDF
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
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
                <tr key={day} className="hover:bg-bg-hover/20 transition-colors">
                  <td className="text-[11px] font-bold text-text-secondary px-3 py-1 border-r border-b border-border/15 bg-bg-elevated/30">
                    {day.substring(0, 3)}
                  </td>
                  {(timetableData[day] || []).map((cell, i) => (
                    <td key={i} className="px-1 py-1 border-r border-b border-border/10 min-w-[100px]">
                      {cell ? (
                        cell.type === 'break' ? (
                          <div className="text-center py-2">
                            <span className="text-[9px] text-text-dim font-semibold">🍽️ LUNCH</span>
                          </div>
                        ) : (
                          <div
                            className="rounded-lg p-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg group"
                            style={{
                              background: `${cell.color}15`,
                              borderLeft: `3px solid ${cell.color}`,
                            }}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-text-primary leading-tight truncate">
                                {cell.subject}
                              </span>
                            </div>
                            <div className="text-[8px] text-text-muted leading-tight">
                              <span>{cell.code}</span>
                              {cell.room && <span> • {cell.room}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[8px] text-text-dim truncate">{cell.faculty}</span>
                              <span
                                className="text-[8px] font-bold px-1 rounded"
                                style={{ color: cell.color, background: `${cell.color}20` }}
                              >
                                {typeColors[cell.type]}
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="h-full min-h-[50px] flex items-center justify-center">
                          <span className="text-[9px] text-text-dim/40">—</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1">
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
    </div>
  );
}
