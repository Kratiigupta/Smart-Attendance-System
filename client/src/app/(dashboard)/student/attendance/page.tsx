'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressBar';
import { AreaChartCard } from '@/components/charts/Charts';
import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

const courses = [
  { code: 'CSC-201', name: 'Data Structures', attended: 18, total: 20, color: '#6366f1' },
  { code: 'CSC-305', name: 'DBMS', attended: 16, total: 20, color: '#f43f5e' },
  { code: 'ECE-301', name: 'Digital Electronics', attended: 17, total: 20, color: '#f59e0b' },
  { code: 'MAT-301', name: 'Eng. Math III', attended: 19, total: 20, color: '#14b8a6' },
  { code: 'SEC-201', name: 'Web Development', attended: 14, total: 18, color: '#8b5cf6' },
  { code: 'VAC-101', name: 'Environmental Science', attended: 9, total: 10, color: '#06b6d4' },
];

const monthlyData = [
  { name: 'Jul', rate: 95 }, { name: 'Aug', rate: 92 }, { name: 'Sep', rate: 88 },
  { name: 'Oct', rate: 90 }, { name: 'Nov', rate: 85 }, { name: 'Dec', rate: 82 },
  { name: 'Jan', rate: 89 }, { name: 'Feb', rate: 92 }, { name: 'Mar', rate: 91 },
  { name: 'Apr', rate: 93 }, { name: 'May', rate: 90 },
];

const totalA = courses.reduce((a, c) => a + c.attended, 0);
const totalC = courses.reduce((a, c) => a + c.total, 0);

export default function StudentAttendancePage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
          <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-primary-light" />
          My Attendance
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Detailed attendance records & analytics</p>
      </div>

      {/* Overall + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="text-center flex flex-col items-center justify-center">
          <CircularProgress value={Math.round((totalA / totalC) * 100)} size={120} strokeWidth={10} color="#10b981" />
          <h3 className="text-sm font-bold text-text-primary mt-3">Overall Attendance</h3>
          <p className="text-[10px] text-text-muted">{totalA} / {totalC} classes attended</p>
          <Badge variant="success" size="sm" className="mt-2">Above Threshold (75%)</Badge>
        </Card>
        <Card title="Monthly Trend" subtitle="Your attendance rate" className="lg:col-span-2">
          <AreaChartCard data={monthlyData} dataKey="rate" color="#6366f1" gradientId="stuMonth" height={200} className="mt-3" />
        </Card>
      </div>

      {/* Course-wise */}
      <Card title="Course-wise Breakdown" subtitle="Attendance per enrolled course">
        <div className="space-y-3 mt-3">
          {courses.map(course => {
            const pct = Math.round((course.attended / course.total) * 100);
            return (
              <div key={course.code} className="flex items-center gap-4 p-3 rounded-xl bg-bg-elevated/30 border border-border/15">
                <CircularProgress value={pct} size={48} strokeWidth={4} color={pct >= 75 ? '#10b981' : '#ef4444'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-text-primary">{course.name}</span>
                    <Badge variant="default" size="xs">{course.code}</Badge>
                  </div>
                  <ProgressBar value={course.attended} max={course.total} color={pct >= 75 ? 'success' : 'danger'} size="xs" />
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-heading font-black" style={{ color: pct >= 75 ? '#10b981' : '#ef4444' }}>{pct}%</span>
                  <p className="text-[9px] text-text-dim">{course.attended}/{course.total}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
