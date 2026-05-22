'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AreaChartCard, DonutChart, ChartLegend } from '@/components/charts/Charts';
import {
  HiOutlineAcademicCap, HiOutlineClipboardDocumentCheck,
  HiOutlineCalendarDays, HiOutlineUserGroup, HiOutlineQrCode,
  HiOutlineClock,
} from 'react-icons/hi2';
import Link from 'next/link';

const todayClasses = [
  { time: '10:00 - 10:50', course: 'Data Structures', code: 'CSC-201', room: 'LH-301', batch: 'CSE Sem-3', students: 48, type: 'Lecture', status: 'completed', attended: 45 },
  { time: '11:00 - 11:50', course: 'Data Structures Lab', code: 'CSC-201P', room: 'Lab-101', batch: 'CSE Sem-3 A', students: 24, type: 'Practical', status: 'active', attended: 22 },
  { time: '1:30 - 2:20', course: 'Algorithm Design', code: 'CSC-401', room: 'LH-302', batch: 'CSE Sem-5', students: 45, type: 'Lecture', status: 'upcoming', attended: 0 },
  { time: '3:30 - 4:20', course: 'Data Structures', code: 'CSC-201', room: 'LH-301', batch: 'CSE Sem-3', type: 'Tutorial', students: 48, status: 'upcoming', attended: 0 },
];

const weeklyAttendanceData = [
  { name: 'Mon', rate: 94 }, { name: 'Tue', rate: 91 }, { name: 'Wed', rate: 88 },
  { name: 'Thu', rate: 93 }, { name: 'Fri', rate: 86 }, { name: 'Sat', rate: 82 },
];

const courseStats = [
  { name: 'CSC-201', value: 48, color: '#6366f1' },
  { name: 'CSC-201P', value: 24, color: '#14b8a6' },
  { name: 'CSC-401', value: 45, color: '#f59e0b' },
];

const statusColors: Record<string, { text: string; badge: 'success' | 'primary' | 'default' | 'warning' }> = {
  completed: { text: 'Completed', badge: 'success' },
  active: { text: 'In Progress', badge: 'primary' },
  upcoming: { text: 'Upcoming', badge: 'default' },
};

export default function FacultyDashboard() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Faculty Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Welcome back, Dr. Rajesh Kumar • {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/faculty/start-class">
          <Button variant="primary" size="md" icon={<HiOutlineQrCode className="w-4 h-4" />}>
            Start Class
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="My Courses" value={3} icon={HiOutlineAcademicCap} color="primary" subtitle="This semester" />
        <StatCard title="Total Students" value={117} icon={HiOutlineUserGroup} color="secondary" subtitle="Across all courses" />
        <StatCard title="Avg Attendance" value="90.2%" icon={HiOutlineClipboardDocumentCheck} color="success" trend={{ value: 2.1, isUp: true }} />
        <StatCard title="Classes Today" value={4} icon={HiOutlineClock} color="accent" subtitle="1 completed, 1 active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <Card title="Today's Schedule" subtitle="Your classes for today" className="lg:col-span-2" noPadding>
          <div className="divide-y divide-border/15">
            {todayClasses.map((cls, i) => (
              <div key={i} className="px-5 py-3.5 hover:bg-bg-hover/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-text-muted block">{cls.time.split('-')[0].trim()}</span>
                      <span className="text-[8px] text-text-dim">to {cls.time.split('-')[1].trim()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{cls.course}</span>
                        <Badge variant={statusColors[cls.status].badge} size="xs" dot pulse={cls.status === 'active'}>
                          {statusColors[cls.status].text}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">{cls.code} • {cls.room} • {cls.batch}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" size="xs">{cls.type}</Badge>
                        <span className="text-[10px] text-text-dim">{cls.students} students</span>
                      </div>
                    </div>
                  </div>
                  {cls.status === 'completed' && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-success-light">{cls.attended}/{cls.students}</span>
                      <p className="text-[9px] text-text-dim">present</p>
                    </div>
                  )}
                  {cls.status === 'active' && (
                    <Link href="/faculty/start-class">
                      <Button variant="primary" size="xs" icon={<HiOutlineQrCode className="w-3 h-3" />}>Live QR</Button>
                    </Link>
                  )}
                  {cls.status === 'upcoming' && (
                    <Link href="/faculty/start-class">
                      <Button variant="outline" size="xs">Start</Button>
                    </Link>
                  )}
                </div>
                {cls.status !== 'upcoming' && cls.attended > 0 && (
                  <ProgressBar value={cls.attended} max={cls.students} color={cls.attended / cls.students > 0.85 ? 'success' : 'warning'} size="xs" className="mt-2" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Course Distribution */}
        <div className="space-y-4">
          <Card title="My Students" subtitle="Distribution by course">
            <DonutChart data={courseStats} height={160} centerValue="117" centerLabel="Total" />
            <ChartLegend items={courseStats.map(c => ({ label: c.name, color: c.color, value: String(c.value) }))} className="mt-3 justify-center" />
          </Card>

          <Card title="Weekly Attendance" subtitle="Average across my courses">
            <AreaChartCard data={weeklyAttendanceData} dataKey="rate" color="#10b981" gradientId="facWeekly" height={130} className="mt-2" />
          </Card>
        </div>
      </div>
    </div>
  );
}
