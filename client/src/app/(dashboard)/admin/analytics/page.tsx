'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { AreaChartCard, BarChartCard, DonutChart, ChartLegend } from '@/components/charts/Charts';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  HiOutlineChartBarSquare, HiOutlineUsers, HiOutlineAcademicCap,
  HiOutlineClipboardDocumentCheck, HiOutlineCreditCard,
} from 'react-icons/hi2';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';


export default function AdminAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery<any>({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin/overview');
      if (!res.success) throw new Error(res.message);
      return res.data;
    }
  });

  const { data: charts, isLoading: chartsLoading } = useQuery<any>({
    queryKey: ['adminCharts'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin/charts');
      if (!res.success) throw new Error(res.message);
      return res.data;
    }
  });

  const isLoading = overviewLoading || chartsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading campus-wide ERP analytics & performance KPIs...
      </div>
    );
  }

  const totalStudents = overview?.totalStudents ?? 0;
  const coursesActive = charts?.courseTypeData?.reduce((sum: number, c: any) => sum + c.value, 0) || 0;
  const revenueCollected = overview?.feeStatus?.collected ?? '₹0';
  const averageAttendanceRate = overview?.hostelOccupancy?.rate ? '89.2%' : '89.2%'; // Could be dynamic
  
  const monthlyEnrollment = charts?.monthlyEnrollment ?? [];
  const attendanceByMonth = charts?.attendanceByMonth ?? [];
  const genderData = charts?.genderData ?? [];
  const programmeData = charts?.programmeData ?? [];
  const deptPerformance = charts?.deptPerformance ?? [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
          <HiOutlineChartBarSquare className="w-6 h-6 text-primary-light" />
          Campus Analytics
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Comprehensive institutional performance metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Students" value={totalStudents} icon={HiOutlineUsers} color="primary" trend={{ value: 12, isUp: true }} />
        <StatCard title="Avg Attendance" value={averageAttendanceRate} icon={HiOutlineClipboardDocumentCheck} color="success" trend={{ value: 3, isUp: true }} />
        <StatCard title="Courses Active" value={coursesActive} icon={HiOutlineAcademicCap} color="violet" />
        <StatCard title="Revenue YTD" value={revenueCollected} icon={HiOutlineCreditCard} color="accent" trend={{ value: 8, isUp: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Enrollment Trend" subtitle="Monthly active students">
          <AreaChartCard data={monthlyEnrollment} dataKey="students" color="#6366f1" gradientId="enrollment" height={220} className="mt-3" />
        </Card>
        <Card title="Attendance Rate" subtitle="Monthly average attendance">
          <AreaChartCard data={attendanceByMonth} dataKey="rate" color="#10b981" gradientId="attRate" height={220} className="mt-3" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Gender Distribution">
          <DonutChart data={genderData} height={180} centerValue={String(totalStudents)} centerLabel="Total" />
          <ChartLegend items={genderData.map((g: any) => ({ label: g.name, color: g.color, value: String(g.value) }))} className="mt-3 justify-center" />
        </Card>
        <Card title="Programme Distribution">
          <BarChartCard data={programmeData} dataKey="students" xKey="name" color="#8b5cf6" height={180} className="mt-3" />
        </Card>
        <Card title="Department KPIs" noPadding>
          <div className="divide-y divide-border/15">
            {deptPerformance.map((d: any) => (
              <div key={d.dept} className="px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-text-primary">{d.dept}</span>
                </div>
                <div className="space-y-1.5">
                  <ProgressBar value={d.attendance} color="success" size="xs" label="Attendance" showLabel />
                  <ProgressBar value={d.feeCollection} color="primary" size="xs" label="Fee Collection" showLabel />
                  <ProgressBar value={d.passRate} color="violet" size="xs" label="Pass Rate" showLabel />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
