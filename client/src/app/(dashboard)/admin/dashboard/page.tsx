'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AreaChartCard, BarChartCard, DonutChart, ChartLegend } from '@/components/charts/Charts';
import { Tabs } from '@/components/ui/Tabs';
import {
  HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentCheck, HiOutlineCalendarDays, HiOutlineCreditCard,
  HiOutlineArrowTrendingUp, HiOutlineUserGroup,
} from 'react-icons/hi2';

// Mock data
const weeklyAttendance = [
  { name: 'Mon', present: 842, absent: 78 },
  { name: 'Tue', present: 856, absent: 64 },
  { name: 'Wed', present: 830, absent: 90 },
  { name: 'Thu', present: 862, absent: 58 },
  { name: 'Fri', present: 810, absent: 110 },
  { name: 'Sat', present: 785, absent: 135 },
];

const monthlyTrend = [
  { name: 'Jan', attendance: 88, fee: 72 },
  { name: 'Feb', attendance: 91, fee: 78 },
  { name: 'Mar', attendance: 85, fee: 85 },
  { name: 'Apr', attendance: 89, fee: 90 },
  { name: 'May', attendance: 92, fee: 95 },
];

const departmentData = [
  { name: 'CSE', students: 320, faculty: 18 },
  { name: 'ECE', students: 280, faculty: 15 },
  { name: 'ME', students: 240, faculty: 14 },
  { name: 'CE', students: 200, faculty: 12 },
  { name: 'EE', students: 180, faculty: 10 },
];

const courseTypeData = [
  { name: 'DSC (Major)', value: 42, color: '#6366f1' },
  { name: 'Minor', value: 18, color: '#14b8a6' },
  { name: 'MDC', value: 12, color: '#f59e0b' },
  { name: 'SEC/AEC', value: 15, color: '#8b5cf6' },
  { name: 'VAC', value: 8, color: '#f43f5e' },
  { name: 'Elective', value: 5, color: '#06b6d4' },
];

const recentActivity = [
  { type: 'attendance', user: 'Dr. Rajesh Kumar', action: 'marked attendance for CSC-301 (45/48 present)', time: '5 min ago', color: 'success' },
  { type: 'user', user: 'Admin', action: 'added 25 new students to CSE department', time: '15 min ago', color: 'primary' },
  { type: 'timetable', user: 'System', action: 'generated timetable for Sem-5 FYUP batch', time: '1 hr ago', color: 'violet' },
  { type: 'fee', user: 'Priya Sharma', action: 'paid semester fee ₹18,500 via UPI', time: '2 hr ago', color: 'secondary' },
  { type: 'leave', user: 'Dr. Meena Singh', action: 'applied for leave on 25th May (proxy: Dr. Rao)', time: '3 hr ago', color: 'warning' },
  { type: 'hostel', user: 'System', action: 'allocated Room B-204 to Amit Kumar (CSE, Sem-3)', time: '4 hr ago', color: 'cyan' },
];

const liveClasses = [
  { course: 'Data Structures', code: 'CSC-201', faculty: 'Dr. Rajesh Kumar', room: 'LH-301', present: 45, total: 48, status: 'active' },
  { course: 'Digital Electronics', code: 'ECE-301', faculty: 'Prof. Sunita Rai', room: 'Lab-201', present: 38, total: 42, status: 'active' },
  { course: 'Engineering Math III', code: 'MAT-301', faculty: 'Dr. A.K. Verma', room: 'LH-102', present: 55, total: 60, status: 'active' },
  { course: 'Database Systems', code: 'CSC-305', faculty: 'Dr. Neha Gupta', room: 'LH-401', present: 32, total: 48, status: 'ending' },
];

const activityColors: Record<string, string> = {
  success: 'bg-success/15 text-success-light border-success/20',
  primary: 'bg-primary/15 text-primary-light border-primary/20',
  violet: 'bg-violet/15 text-violet-light border-violet/20',
  secondary: 'bg-secondary/15 text-secondary-light border-secondary/20',
  warning: 'bg-warning/15 text-warning-light border-warning/20',
  cyan: 'bg-cyan/15 text-cyan-light border-cyan/20',
};

const activityIcons: Record<string, string> = {
  attendance: '📋', user: '👤', timetable: '📅', fee: '💳', leave: '🏖️', hostel: '🏠',
};

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Campus overview • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Tabs
          tabs={[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'Month' },
          ]}
          activeTab={timeRange}
          onChange={setTimeRange}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Students"
          value={1220}
          icon={HiOutlineUsers}
          color="primary"
          trend={{ value: 12, isUp: true }}
          subtitle="Active enrollments"
        />
        <StatCard
          title="Faculty Members"
          value={69}
          icon={HiOutlineUserGroup}
          color="secondary"
          trend={{ value: 5, isUp: true }}
          subtitle="Across 5 departments"
        />
        <StatCard
          title="Today's Attendance"
          value="91.2%"
          icon={HiOutlineClipboardDocumentCheck}
          color="success"
          trend={{ value: 2.3, isUp: true }}
          subtitle="920 / 1009 present"
        />
        <StatCard
          title="Fee Collection"
          value="₹18.5L"
          icon={HiOutlineCreditCard}
          color="accent"
          trend={{ value: 8, isUp: true }}
          subtitle="This month"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend */}
        <Card title="Attendance Trend" subtitle="Weekly overview" className="lg:col-span-2"
          headerRight={
            <Badge variant="success" dot pulse size="xs">Live</Badge>
          }
        >
          <AreaChartCard
            data={weeklyAttendance}
            dataKey="present"
            secondaryDataKey="absent"
            color="#6366f1"
            secondaryColor="#ef4444"
            height={220}
            className="mt-2"
          />
          <ChartLegend
            items={[
              { label: 'Present', color: '#6366f1' },
              { label: 'Absent', color: '#ef4444' },
            ]}
            className="mt-3 justify-center"
          />
        </Card>

        {/* Course Distribution */}
        <Card title="Course Distribution" subtitle="NEP 2020 categories">
          <DonutChart
            data={courseTypeData}
            height={180}
            centerValue="100"
            centerLabel="Courses"
          />
          <ChartLegend
            items={courseTypeData.map(c => ({ label: c.name, color: c.color }))}
            className="mt-2 justify-center"
          />
        </Card>
      </div>

      {/* Live Classes + Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Classes */}
        <Card title="Live Classes" subtitle="Currently in progress"
          headerRight={
            <Badge variant="success" dot pulse size="xs">{liveClasses.length} Active</Badge>
          }
          noPadding
        >
          <div className="divide-y divide-border/20">
            {liveClasses.map((cls, i) => (
              <div key={i} className="px-5 py-3.5 hover:bg-bg-hover/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{cls.course}</span>
                      <Badge variant={cls.status === 'active' ? 'success' : 'warning'} size="xs" dot pulse>
                        {cls.status === 'active' ? 'Live' : 'Ending'}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-text-muted">{cls.code} • {cls.faculty} • {cls.room}</span>
                  </div>
                  <span className="text-xs font-bold text-text-primary">{cls.present}/{cls.total}</span>
                </div>
                <ProgressBar
                  value={cls.present}
                  max={cls.total}
                  color={cls.present / cls.total > 0.85 ? 'success' : cls.present / cls.total > 0.7 ? 'warning' : 'danger'}
                  size="xs"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card title="Department Statistics" subtitle="Students & faculty distribution">
          <BarChartCard
            data={departmentData}
            dataKey="students"
            secondaryDataKey="faculty"
            color="#6366f1"
            secondaryColor="#14b8a6"
            height={220}
            className="mt-2"
          />
          <ChartLegend
            items={[
              { label: 'Students', color: '#6366f1' },
              { label: 'Faculty', color: '#14b8a6' },
            ]}
            className="mt-3 justify-center"
          />
        </Card>
      </div>

      {/* Monthly Trend + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trend */}
        <Card title="Monthly Trend" subtitle="Attendance vs Fee collection" className="lg:col-span-1">
          <AreaChartCard
            data={monthlyTrend}
            dataKey="attendance"
            secondaryDataKey="fee"
            color="#8b5cf6"
            secondaryColor="#14b8a6"
            gradientId="monthTrend"
            height={180}
            className="mt-2"
          />
          <ChartLegend
            items={[
              { label: 'Attendance %', color: '#8b5cf6' },
              { label: 'Fee %', color: '#14b8a6' },
            ]}
            className="mt-3 justify-center"
          />
        </Card>

        {/* Activity Feed */}
        <Card title="Recent Activity" subtitle="Latest campus events" className="lg:col-span-2" noPadding>
          <div className="divide-y divide-border/15 max-h-[340px] overflow-y-auto">
            {recentActivity.map((activity, i) => (
              <div key={i} className="px-5 py-3 hover:bg-bg-hover/30 transition-colors flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm border ${activityColors[activity.color]}`}>
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-text-secondary">
                    <span className="font-bold text-text-primary">{activity.user}</span>
                    {' '}{activity.action}
                  </p>
                  <span className="text-[10px] text-text-dim">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <Card className="text-center">
          <div className="text-2xl mb-1">📅</div>
          <p className="text-lg font-heading font-black text-text-primary">5</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Departments</p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">📚</div>
          <p className="text-lg font-heading font-black text-text-primary">100</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Active Courses</p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">🏠</div>
          <p className="text-lg font-heading font-black text-text-primary">86%</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Hostel Occupancy</p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">⚡</div>
          <p className="text-lg font-heading font-black text-text-primary">24</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Classes Today</p>
        </Card>
      </div>
    </div>
  );
}
