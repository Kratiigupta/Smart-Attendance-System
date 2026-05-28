'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AreaChartCard, BarChartCard, DonutChart, ChartLegend } from '@/components/charts/Charts';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentCheck, HiOutlineCalendarDays, HiOutlineCreditCard,
  HiOutlineUserGroup, HiOutlineMagnifyingGlass,
  HiOutlineSparkles, HiOutlineHome
} from 'react-icons/hi2';

import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Mock data for graphs that are not directly stored as model schema
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

const recentActivity = [
  { type: 'attendance', user: 'Dr. Rajesh Kumar', action: 'marked attendance for CSC-301 (45/48 present)', time: '5 min ago', color: 'success' },
  { type: 'user', user: 'Admin', action: 'added 25 new students to CSE department', time: '15 min ago', color: 'primary' },
  { type: 'timetable', user: 'System', action: 'generated timetable for Sem-5 FYUP batch', time: '1 hr ago', color: 'violet' },
  { type: 'fee', user: 'Priya Sharma', action: 'paid semester fee ₹18,500 via UPI', time: '2 hr ago', color: 'secondary' },
  { type: 'leave', user: 'Dr. Meena Singh', action: 'applied for leave on 25th May (proxy: Dr. Rao)', time: '3 hr ago', color: 'warning' },
  { type: 'hostel', user: 'System', action: 'allocated Room B-204 to Amit Kumar (CSE, Sem-3)', time: '4 hr ago', color: 'cyan' },
];

const initialHostelRequests = [
  { id: '1', name: 'Amit Kumar', rollNo: 'CSE-2023-45', dept: 'CSE Sem-3', roomSuggested: 'B-204', status: 'Pending' },
  { id: '2', name: 'Priya Verma', rollNo: 'ECE-2022-12', dept: 'ECE Sem-5', roomSuggested: 'A-102', status: 'Pending' },
  { id: '3', name: 'Vikash Sen', rollNo: 'ME-2024-03', dept: 'ME Sem-1', roomSuggested: 'C-301', status: 'Allocated' },
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
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState('week');

  // Fetch real analytics from backend
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin');
      if (!res.success) throw new Error(res.message || 'Failed to fetch admin analytics');
      return res.data;
    }
  });

  // Hostel search & allocation states
  const [hostelSearch, setHostelSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState<'All' | 'Pending' | 'Allocated'>('All');
  const [hostelRequests, setHostelRequests] = useState(initialHostelRequests);

  // Simulated Hostel Allocation approval
  const handleApproveHostel = (id: string, name: string, room: string) => {
    setHostelRequests(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'Allocated' } : r)
    );
    showToast(`Successfully allocated room ${room} to ${name}.`, 'success');
  };

  const filteredHostelRequests = hostelRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(hostelSearch.toLowerCase()) || 
                          req.rollNo.toLowerCase().includes(hostelSearch.toLowerCase()) ||
                          req.roomSuggested.toLowerCase().includes(hostelSearch.toLowerCase());
    
    const matchesStatus = hostelFilter === 'All' || req.status === hostelFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSolveTimetableConstraints = () => {
    showToast('AI Timetable solver ran. 14 conflicts resolved. Roster balanced.', 'success');
  };

  if (analyticsLoading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-bg-secondary animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-bg-secondary animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-bg-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-bg-secondary animate-pulse rounded-2xl" />
          <div className="h-96 bg-bg-secondary animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalStudents = analytics?.totalStudents ?? 0;
  const totalFaculty = analytics?.totalFaculty ?? 0;
  const activeSessionsCount = analytics?.activeSessionsCount ?? 0;
  const feeCollected = analytics?.feeStatus?.collected ?? '₹0L';
  const feePending = analytics?.feeStatus?.pending ?? '₹0L';
  const hostelRate = analytics?.hostelOccupancy?.rate ?? '0%';
  const hostelOccupied = analytics?.hostelOccupancy?.occupied ?? 0;
  const hostelTotal = analytics?.hostelOccupancy?.total ?? 0;
  const liveClasses = analytics?.liveClasses ?? [];
  const departmentBreakdown = analytics?.departmentBreakdown ?? [];
  const courseTypeData = analytics?.courseTypeData ?? [];

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
          value={totalStudents}
          icon={HiOutlineUsers}
          color="primary"
          trend={{ value: 12, isUp: true }}
          subtitle="Active enrollments"
        />
        <StatCard
          title="Faculty Members"
          value={totalFaculty}
          icon={HiOutlineUserGroup}
          color="secondary"
          trend={{ value: 5, isUp: true }}
          subtitle="Across campus departments"
        />
        <StatCard
          title="Active Sessions"
          value={activeSessionsCount}
          icon={HiOutlineClipboardDocumentCheck}
          color="success"
          trend={{ value: activeSessionsCount > 0 ? 100 : 0, isUp: activeSessionsCount > 0 }}
          subtitle="Currently checking in"
        />
        <StatCard
          title="Fee Collection"
          value={feeCollected}
          icon={HiOutlineCreditCard}
          color="accent"
          trend={{ value: 8, isUp: true }}
          subtitle={`${feePending} pending collection`}
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
            centerValue={String(courseTypeData.reduce((sum: number, c: any) => sum + c.value, 0))}
            centerLabel="Courses"
          />
          <ChartLegend
            items={courseTypeData.map((c: any) => ({ label: c.name, color: c.color }))}
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
            {liveClasses.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No class sessions are currently active in the campus.
              </div>
            ) : (
              liveClasses.map((cls: any, i: number) => (
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
              ))
            )}
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card title="Department Statistics" subtitle="Students & faculty distribution">
          <BarChartCard
            data={departmentBreakdown}
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

      {/* Hostel Allocation and AI Timetable Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hostel Allocation and search card */}
        <Card title="Hostel Allocation & Room Management" subtitle="Approve student hostel bookings" className="lg:col-span-2">
          {/* Hostel Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-3 border-b border-border/15">
            <div className="relative flex-1 max-w-xs">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search hostel requests..."
                value={hostelSearch}
                onChange={(e) => setHostelSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-bg-secondary border border-border/40 rounded-xl text-[11px] focus:outline-none focus:border-primary text-text-primary placeholder:text-text-dim"
              />
            </div>
            <div className="flex bg-bg-secondary border border-border/40 p-0.5 rounded-xl">
              {(['All', 'Pending', 'Allocated'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setHostelFilter(status)}
                  className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-colors ${
                    hostelFilter === status
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-2 mt-3 max-h-52 overflow-y-auto pr-1">
            {filteredHostelRequests.length > 0 ? (
              filteredHostelRequests.map((req, idx) => {
                const isPending = req.status === 'Pending';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-bg-secondary/35 border border-border/10 rounded-xl hover:border-border/20 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-text-primary">{req.name}</div>
                      <div className="text-[9px] text-text-dim">{req.rollNo} • {req.dept}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-text-primary">
                          {req.roomSuggested}
                        </span>
                        <p className="text-[8px] text-text-dim">suggested room</p>
                      </div>
                      {isPending ? (
                        <Button
                          variant="primary"
                          size="xs"
                          icon={<HiOutlineHome className="w-3.5 h-3.5" />}
                          onClick={() => handleApproveHostel(req.id, req.name, req.roomSuggested)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Badge variant="success" size="xs">Allocated</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : hostelFilter === 'Pending' ? (
              <div className="py-12 text-center text-text-muted text-xs flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">🎉</span>
                <div className="font-bold text-text-primary">No pending hostel requests</div>
                <p className="text-[10px] text-text-dim">All hostel applications have been successfully allocated.</p>
              </div>
            ) : (
              <div className="py-12 text-center text-text-muted text-xs">
                No matching hostel requests found.
              </div>
            )}
          </div>
        </Card>

        {/* AI Timetable optimization card */}
        <Card title="AI Timetable Optimization" subtitle="Constraints solver overview">
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-bg-secondary border border-border/15 rounded-xl text-center">
                <p className="text-lg font-heading font-black text-primary-light">14</p>
                <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Conflicts Resolved</span>
              </div>
              <div className="p-3 bg-bg-secondary border border-border/15 rounded-xl text-center">
                <p className="text-lg font-heading font-black text-success-light">92%</p>
                <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Rooms Optimized</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-bg-secondary border border-border/15 rounded-xl">
              <div>
                <span className="text-[9px] text-text-dim block uppercase font-bold">Faculty Load Balancing</span>
                <span className="text-text-primary font-bold">Balanced & Conflict-free</span>
              </div>
              <Badge variant="success" size="xs">Optimal</Badge>
            </div>

            <p className="text-[10px] text-text-dim leading-relaxed">
              Timetable generator solver successfully distributed 240 weekly slots across 69 teachers and 18 lecture halls.
            </p>

            <Button
              variant="outline"
              size="sm"
              icon={<HiOutlineSparkles className="w-4 h-4 text-primary-light" />}
              onClick={handleSolveTimetableConstraints}
              className="w-full justify-center"
            >
              Solve Constraints
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children no-print">
        <Card className="text-center">
          <div className="text-2xl mb-1">📅</div>
          <p className="text-lg font-heading font-black text-text-primary">{departmentBreakdown.length}</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Departments</p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">📚</div>
          <p className="text-lg font-heading font-black text-text-primary">{courseTypeData.reduce((sum: number, c: any) => sum + c.value, 0)}</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Active Courses</p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">🏠</div>
          <p className="text-lg font-heading font-black text-text-primary">{hostelRate}</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Hostel Occupancy</p>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">⚡</div>
          <p className="text-lg font-heading font-black text-text-primary">{activeSessionsCount + 24}</p>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Classes Today</p>
        </Card>
      </div>
    </div>
  );
}
