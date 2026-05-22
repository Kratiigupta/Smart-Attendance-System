'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';
import { AreaChartCard } from '@/components/charts/Charts';
import Link from 'next/link';
import {
  HiOutlineClipboardDocumentCheck, HiOutlineCalendarDays,
  HiOutlineCreditCard, HiOutlineBookOpen, HiOutlineQrCode,
  HiOutlineAcademicCap, HiOutlineClock, HiOutlineSparkles,
} from 'react-icons/hi2';

const attendanceData = [
  { name: 'W1', rate: 100 }, { name: 'W2', rate: 95 }, { name: 'W3', rate: 85 },
  { name: 'W4', rate: 90 }, { name: 'W5', rate: 88 }, { name: 'W6', rate: 92 },
  { name: 'W7', rate: 95 }, { name: 'W8', rate: 90 },
];

const courses = [
  { code: 'CSC-201', name: 'Data Structures', faculty: 'Dr. Rajesh', attended: 18, total: 20, type: 'DSC', color: '#6366f1' },
  { code: 'CSC-305', name: 'DBMS', faculty: 'Dr. Neha', attended: 16, total: 20, type: 'DSC', color: '#f43f5e' },
  { code: 'ECE-301', name: 'Digital Electronics', faculty: 'Prof. Rai', attended: 17, total: 20, type: 'Minor', color: '#f59e0b' },
  { code: 'MAT-301', name: 'Eng. Math III', faculty: 'Dr. Verma', attended: 19, total: 20, type: 'MDC', color: '#14b8a6' },
  { code: 'SEC-201', name: 'Web Development', faculty: 'Prof. Rahul', attended: 14, total: 18, type: 'SEC', color: '#8b5cf6' },
  { code: 'VAC-101', name: 'Environmental Science', faculty: 'Dr. Meena', attended: 9, total: 10, type: 'VAC', color: '#06b6d4' },
];

const todaySchedule = [
  { time: '10:00', course: 'Data Structures', code: 'CSC-201', room: 'LH-301', type: 'Lecture', status: 'completed' },
  { time: '11:00', course: 'DS Lab', code: 'CSC-201P', room: 'Lab-101', type: 'Practical', status: 'active' },
  { time: '1:30', course: 'DBMS', code: 'CSC-305', room: 'LH-401', type: 'Lecture', status: 'upcoming' },
  { time: '3:30', course: 'Web Dev Lab', code: 'SEC-201', room: 'Lab-201', type: 'Practical', status: 'upcoming' },
];

const freePeriodSuggestions = [
  { icon: '🧠', title: 'Practice: Linked List Problems', subject: 'Data Structures', duration: '15 min', type: 'Quiz' },
  { icon: '📖', title: 'Read: Normalization in DBMS', subject: 'DBMS', duration: '10 min', type: 'Reading' },
  { icon: '💡', title: 'Mini Project: CSS Animations', subject: 'Web Development', duration: '20 min', type: 'Project' },
];

const totalAttended = courses.reduce((a, c) => a + c.attended, 0);
const totalClasses = courses.reduce((a, c) => a + c.total, 0);
const overallPct = Math.round((totalAttended / totalClasses) * 100);

export default function StudentDashboard() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Welcome, Amit Kumar • CSE Sem-3 • Roll: CSE-2023-045
          </p>
        </div>
        <Link href="/student/mark-attendance">
          <Button variant="primary" size="md" icon={<HiOutlineQrCode className="w-4 h-4" />}>
            Mark Attendance
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Overall Attendance" value={`${overallPct}%`} icon={HiOutlineClipboardDocumentCheck} color="success" trend={{ value: 2, isUp: true }} />
        <StatCard title="Enrolled Courses" value={6} icon={HiOutlineAcademicCap} color="primary" subtitle="Sem 3 FYUP" />
        <StatCard title="Classes Today" value={4} icon={HiOutlineClock} color="accent" subtitle="1 completed, 1 active" />
        <StatCard title="Fee Status" value="Paid" icon={HiOutlineCreditCard} color="secondary" subtitle="₹18,500 — Sem 3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <Card title="Today's Classes" subtitle="Your schedule for today" className="lg:col-span-2" noPadding>
          <div className="divide-y divide-border/15">
            {todaySchedule.map((cls, i) => (
              <div key={i} className="px-5 py-3.5 hover:bg-bg-hover/30 transition-colors flex items-center gap-4">
                <div className="text-center shrink-0 w-14">
                  <span className="text-sm font-heading font-black text-text-primary">{cls.time}</span>
                  <p className="text-[8px] text-text-dim uppercase">{cls.type}</p>
                </div>
                <div className="h-8 w-[2px] rounded-full bg-border/40 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">{cls.course}</span>
                    <Badge
                      variant={cls.status === 'completed' ? 'success' : cls.status === 'active' ? 'primary' : 'default'}
                      size="xs" dot={cls.status === 'active'} pulse={cls.status === 'active'}
                    >
                      {cls.status === 'completed' ? '✓ Done' : cls.status === 'active' ? 'Now' : 'Later'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-text-muted">{cls.code} • Room {cls.room}</p>
                </div>
                {cls.status === 'active' && (
                  <Link href="/student/mark-attendance">
                    <Button variant="primary" size="xs" icon={<HiOutlineQrCode className="w-3 h-3" />}>Scan QR</Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Attendance Overview */}
        <div className="space-y-4">
          <Card title="Attendance Trend" subtitle="Weekly average">
            <AreaChartCard data={attendanceData} dataKey="rate" color="#10b981" gradientId="stuAtt" height={120} className="mt-2" />
          </Card>

          {/* Free Period Suggestions */}
          <Card title="Free Period Suggestions" subtitle="Personalized micro-learning"
            headerRight={<HiOutlineSparkles className="w-4 h-4 text-accent-light" />}
          >
            <div className="space-y-2 mt-1">
              {freePeriodSuggestions.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-bg-elevated/40 border border-border/15 hover:bg-bg-hover/50 cursor-pointer transition-all">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-text-primary truncate">{s.title}</p>
                    <p className="text-[9px] text-text-muted">{s.subject} • {s.duration}</p>
                  </div>
                  <Badge variant="violet" size="xs">{s.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Course-wise Attendance */}
      <Card title="Course-wise Attendance" subtitle="Your attendance breakdown per subject">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {courses.map(course => {
            const pct = Math.round((course.attended / course.total) * 100);
            return (
              <div key={course.code} className="rounded-xl border border-border/20 p-4 hover:border-border-light transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: course.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-text-primary">{course.name}</p>
                    <p className="text-[10px] text-text-muted">{course.code} • {course.faculty}</p>
                  </div>
                  <CircularProgress value={pct} size={44} strokeWidth={4} color={pct >= 75 ? '#10b981' : '#ef4444'} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={course.type === 'DSC' ? 'primary' : course.type === 'Minor' ? 'secondary' : 'violet'} size="xs">
                    {course.type}
                  </Badge>
                  <span className="text-[10px] text-text-dim">{course.attended}/{course.total} classes</span>
                </div>
                <ProgressBar value={course.attended} max={course.total} color={pct >= 75 ? 'success' : 'danger'} size="xs" className="mt-2" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
