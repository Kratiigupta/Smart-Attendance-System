'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';
import { AreaChartCard, BarChartCard } from '@/components/charts/Charts';
import { StatCard } from '@/components/ui/StatCard';
import {
  HiOutlineClipboardDocumentCheck, HiOutlineExclamationTriangle,
  HiOutlineFunnel, HiOutlineArrowDownTray, HiOutlineEye,
  HiOutlineUserGroup, HiOutlineClock,
} from 'react-icons/hi2';

const liveClasses = [
  { id: 1, course: 'Data Structures & Algorithms', code: 'CSC-201', faculty: 'Dr. Rajesh Kumar', room: 'LH-301', department: 'CSE', present: 45, total: 48, startTime: '10:00 AM', status: 'active' as const },
  { id: 2, course: 'Digital Signal Processing', code: 'ECE-401', faculty: 'Prof. Sunita Rai', room: 'Lab-201', department: 'ECE', present: 38, total: 42, startTime: '10:00 AM', status: 'active' as const },
  { id: 3, course: 'Engineering Mathematics III', code: 'MAT-301', faculty: 'Dr. A.K. Verma', room: 'LH-102', department: 'General', present: 55, total: 60, startTime: '9:00 AM', status: 'active' as const },
  { id: 4, course: 'Database Management Systems', code: 'CSC-305', faculty: 'Dr. Neha Gupta', room: 'LH-401', department: 'CSE', present: 32, total: 48, startTime: '9:00 AM', status: 'ending' as const },
  { id: 5, course: 'Thermodynamics', code: 'ME-201', faculty: 'Prof. Suresh Yadav', room: 'LH-201', department: 'ME', present: 40, total: 45, startTime: '11:00 AM', status: 'scheduled' as const },
  { id: 6, course: 'Structural Analysis', code: 'CE-301', faculty: 'Dr. Kavita Sharma', room: 'LH-103', department: 'CE', present: 0, total: 38, startTime: '12:00 PM', status: 'scheduled' as const },
];

const weeklyData = [
  { name: 'Mon', rate: 92, total: 1009 },
  { name: 'Tue', rate: 94, total: 1015 },
  { name: 'Wed', rate: 88, total: 998 },
  { name: 'Thu', rate: 91, total: 1010 },
  { name: 'Fri', rate: 86, total: 980 },
  { name: 'Sat', rate: 82, total: 920 },
];

const departmentAttendance = [
  { name: 'CSE', rate: 93 },
  { name: 'ECE', rate: 89 },
  { name: 'ME', rate: 87 },
  { name: 'CE', rate: 91 },
  { name: 'EE', rate: 85 },
];

const shortageStudents = [
  { name: 'Amit Sharma', roll: 'CSE-2023-045', department: 'CSE', attendance: 62, threshold: 75 },
  { name: 'Priya Verma', roll: 'ECE-2023-018', department: 'ECE', attendance: 58, threshold: 75 },
  { name: 'Rahul Singh', roll: 'ME-2023-032', department: 'ME', attendance: 68, threshold: 75 },
  { name: 'Anjali Kumari', roll: 'CSE-2023-067', department: 'CSE', attendance: 71, threshold: 75 },
  { name: 'Vikash Yadav', roll: 'CE-2023-012', department: 'CE', attendance: 65, threshold: 75 },
];

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState('live');
  const [filter, setFilter] = useState('all');

  const filteredClasses = filter === 'all' ? liveClasses : liveClasses.filter(c => c.status === filter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-primary-light" />
            Attendance Monitor
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Real-time campus-wide attendance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<HiOutlineFunnel className="w-3.5 h-3.5" />}>
            Filter
          </Button>
          <Button variant="outline" size="sm" icon={<HiOutlineArrowDownTray className="w-3.5 h-3.5" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Today's Rate" value="91.2%" icon={HiOutlineClipboardDocumentCheck} color="success" trend={{ value: 2.1, isUp: true }} />
        <StatCard title="Active Classes" value={4} icon={HiOutlineClock} color="primary" subtitle="2 ending soon" />
        <StatCard title="Students Present" value={920} icon={HiOutlineUserGroup} color="secondary" subtitle="Out of 1009" />
        <StatCard title="Shortage Alerts" value={12} icon={HiOutlineExclamationTriangle} color="danger" subtitle="Below 75% threshold" />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'live', label: 'Live Classes', badge: '4' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'shortage', label: 'Shortage List', badge: '12' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Live Classes Tab */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {['all', 'active', 'ending', 'scheduled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer
                  ${filter === f
                    ? 'bg-primary/12 text-primary-light border-primary/25'
                    : 'bg-transparent text-text-muted border-border/30 hover:bg-bg-hover hover:text-text-secondary'
                  }`}
              >
                {f === 'all' ? `All (${liveClasses.length})` : f}
              </button>
            ))}
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {filteredClasses.map(cls => {
              const pct = cls.total > 0 ? (cls.present / cls.total) * 100 : 0;
              return (
                <Card key={cls.id} className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-text-primary">{cls.course}</span>
                        <Badge
                          variant={cls.status === 'active' ? 'success' : cls.status === 'ending' ? 'warning' : 'default'}
                          size="xs" dot pulse={cls.status === 'active'}
                        >
                          {cls.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        {cls.code} • {cls.faculty} • Room {cls.room}
                      </p>
                    </div>
                    <CircularProgress
                      value={pct}
                      size={52}
                      strokeWidth={5}
                      color={pct > 85 ? '#10b981' : pct > 70 ? '#f59e0b' : '#ef4444'}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-2">
                    <span>🕐 Started {cls.startTime}</span>
                    <span className="font-bold text-text-secondary">{cls.present}/{cls.total} students</span>
                  </div>
                  <ProgressBar
                    value={cls.present}
                    max={cls.total}
                    color={pct > 85 ? 'success' : pct > 70 ? 'warning' : 'danger'}
                    size="sm"
                  />
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                    <Badge variant="default" size="xs">{cls.department}</Badge>
                    <div className="flex-1" />
                    <Button variant="ghost" size="xs" icon={<HiOutlineEye className="w-3.5 h-3.5" />}>
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Weekly Attendance Rate" subtitle="Percentage trend this week">
            <AreaChartCard data={weeklyData} dataKey="rate" color="#10b981" gradientId="weekRate" height={240} className="mt-3" />
          </Card>
          <Card title="Department Wise" subtitle="Average attendance by department">
            <BarChartCard data={departmentAttendance} dataKey="rate" color="#6366f1" height={240} layout="vertical" className="mt-3" />
          </Card>
        </div>
      )}

      {/* Shortage Tab */}
      {activeTab === 'shortage' && (
        <Card title="Attendance Shortage List" subtitle="Students below 75% threshold" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">Student</th>
                  <th className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">Roll No.</th>
                  <th className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">Dept</th>
                  <th className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">Attendance</th>
                  <th className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/15">
                {shortageStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-bg-hover/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-rose flex items-center justify-center text-white text-[10px] font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-text-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-text-secondary font-mono">{s.roll}</td>
                    <td className="px-5 py-3"><Badge variant="default" size="xs">{s.department}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.attendance} color="danger" size="xs" className="w-20" />
                        <span className="text-[11px] font-bold text-danger-light">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="danger" size="xs" dot>Shortage</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
