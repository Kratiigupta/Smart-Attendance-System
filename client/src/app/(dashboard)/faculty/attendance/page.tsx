'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AreaChartCard, BarChartCard } from '@/components/charts/Charts';
import { HiOutlineClipboardDocumentCheck, HiOutlineArrowDownTray } from 'react-icons/hi2';

const courseAttendance = [
  { name: 'Week 1', 'CSC-201': 94, 'CSC-201P': 88, 'CSC-401': 91 },
  { name: 'Week 2', 'CSC-201': 92, 'CSC-201P': 90, 'CSC-401': 89 },
  { name: 'Week 3', 'CSC-201': 88, 'CSC-201P': 85, 'CSC-401': 92 },
  { name: 'Week 4', 'CSC-201': 91, 'CSC-201P': 92, 'CSC-401': 87 },
  { name: 'Week 5', 'CSC-201': 93, 'CSC-201P': 89, 'CSC-401': 90 },
];

const studentList = [
  { name: 'Amit Kumar', roll: 'CSE-045', total: 20, present: 18, pct: 90 },
  { name: 'Priya Sharma', roll: 'CSE-018', total: 20, present: 19, pct: 95 },
  { name: 'Rahul Singh', roll: 'CSE-032', total: 20, present: 14, pct: 70 },
  { name: 'Anjali Verma', roll: 'CSE-067', total: 20, present: 12, pct: 60 },
  { name: 'Vikash Yadav', roll: 'CSE-012', total: 20, present: 17, pct: 85 },
  { name: 'Mohit Gupta', roll: 'CSE-089', total: 20, present: 20, pct: 100 },
  { name: 'Neha Kumari', roll: 'CSE-023', total: 20, present: 16, pct: 80 },
];

export default function FacultyAttendancePage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-primary-light" />
            My Attendance Records
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Course-wise attendance analytics</p>
        </div>
        <Button variant="outline" size="sm" icon={<HiOutlineArrowDownTray className="w-3.5 h-3.5" />}>Export</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Weekly Trend — CSC-201" subtitle="Data Structures attendance rate">
          <AreaChartCard data={courseAttendance} dataKey="CSC-201" color="#6366f1" gradientId="fc201" height={200} className="mt-3" />
        </Card>
        <Card title="Course Comparison" subtitle="Average attendance across courses">
          <BarChartCard
            data={[
              { name: 'CSC-201', rate: 91 },
              { name: 'CSC-201P', rate: 89 },
              { name: 'CSC-401', rate: 90 },
            ]}
            dataKey="rate" color="#14b8a6" height={200} className="mt-3"
          />
        </Card>
      </div>

      <Card title="Student Attendance — CSC-201 (Data Structures)" subtitle="Individual student records" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {['Student', 'Roll No.', 'Classes', 'Present', 'Rate', 'Status'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/15">
              {studentList.map((s, i) => (
                <tr key={i} className="hover:bg-bg-hover/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold">{s.name.charAt(0)}</div>
                      <span className="text-xs font-semibold text-text-primary">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[11px] font-mono text-text-secondary">{s.roll}</td>
                  <td className="px-5 py-3 text-xs text-text-secondary">{s.total}</td>
                  <td className="px-5 py-3 text-xs font-bold text-text-primary">{s.present}</td>
                  <td className="px-5 py-3 text-xs font-bold" style={{ color: s.pct >= 75 ? '#10b981' : '#ef4444' }}>{s.pct}%</td>
                  <td className="px-5 py-3">
                    <Badge variant={s.pct >= 75 ? 'success' : 'danger'} size="xs" dot>{s.pct >= 75 ? 'OK' : 'Shortage'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
