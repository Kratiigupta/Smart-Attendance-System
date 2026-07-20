'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('week');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin/overview');
      if (!res.success) throw new Error(res.message);
      return res.data;
    }
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['adminCharts'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin/charts');
      if (!res.success) throw new Error(res.message);
      return res.data;
    }
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['adminActivity'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin/activity');
      if (!res.success) throw new Error(res.message);
      return res.data;
    }
  });

  const handleSolveTimetableConstraints = () => {
    router.push('/admin/timetable');
  };

  const analyticsLoading = overviewLoading || chartsLoading || activityLoading;

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

  const totalStudents = overview?.totalStudents ?? 0;
  const totalFaculty = overview?.totalFaculty ?? 0;
  const activeSessionsCount = overview?.activeSessionsCount ?? 0;
  const feeCollected = overview?.feeStatus?.collected ?? '₹0L';
  const feePending = overview?.feeStatus?.pending ?? '₹0L';
  const hostelRate = overview?.hostelOccupancy?.rate ?? '0%';
  const hostelOccupied = overview?.hostelOccupancy?.occupied ?? 0;
  const hostelTotal = overview?.hostelOccupancy?.total ?? 0;
  const liveClasses = overview?.liveClasses ?? [];
  const departmentBreakdown = overview?.departmentBreakdown ?? [];
  
  const courseTypeData = charts?.courseTypeData ?? [];
  const weeklyAttendance = charts?.weeklyAttendance ?? [];
  const monthlyTrend = charts?.monthlyTrend ?? [];
  const recentActivity = activity ?? [];

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
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No recent activity recorded.
              </div>
            ) : (
              recentActivity.map((activity: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-bg-hover/30 transition-colors flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm border ${activityColors[activity.color] || activityColors['primary']}`}>
                    {activityIcons[activity.type] || activityIcons['user']}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text-secondary">
                      <span className="font-bold text-text-primary">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    <span className="text-[10px] text-text-dim">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Timetable Optimization card */}
      <div className="grid grid-cols-1 gap-4">
        <Card title="Timetable Manager" subtitle="Manage university schedules">
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
              Use the centralized timetable manager to oversee faculty load balancing, room allocations, and schedule generations.
            </p>

            <Button
              variant="outline"
              size="sm"
              icon={<HiOutlineSparkles className="w-4 h-4 text-primary-light" />}
              onClick={handleSolveTimetableConstraints}
              className="w-full justify-center"
            >
              Open Manager
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
