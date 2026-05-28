'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineBell
} from 'react-icons/hi2';

export default function ParentDashboard() {
  const { user } = useAuth();
  const parentName = user?.name || 'Parent';

  // Fetch parent dashboard data
  const { data: dashboard, isLoading } = useQuery<any>({
    queryKey: ['parentDashboard'],
    queryFn: async () => {
      const res = await api.get('/parent/dashboard');
      if (!res.success) throw new Error(res.message || 'Failed to fetch parent dashboard');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading student profile & performance metrics...
      </div>
    );
  }

  // Handle case where parent has no student registered
  if (dashboard && !dashboard.hasStudent) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
            Parent Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Welcome, {parentName} — Monitor your child&apos;s academic progress
          </p>
        </div>

        <Card title="No Student Linked" className="text-center py-12 max-w-lg mx-auto">
          <span className="text-4xl">👤</span>
          <h3 className="text-sm font-bold text-text-primary mt-3">Link your student to begin</h3>
          <p className="text-xs text-text-muted mt-1 leading-normal max-w-xs mx-auto">
            {dashboard.rollNumber 
              ? `We searched for roll number "${dashboard.rollNumber}" but couldn't find a matching student record. Please check with the administrator.`
              : 'You do not have a child roll number linked to your profile. Please contact college administration to link your student account.'}
          </p>
        </Card>
      </div>
    );
  }

  const childName = dashboard?.studentName || 'Child';
  const attendanceRate = dashboard?.attendanceRate || '86%';
  const coursesCount = dashboard?.coursesCount || 0;
  const feeStatus = dashboard?.feeStatus || 'Paid';
  const notificationsCount = dashboard?.notificationsCount || 0;
  const attendanceSummary = dashboard?.attendanceSummary || [];
  const notifications = dashboard?.notifications || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
          Parent Dashboard
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Welcome, {parentName} — Monitoring progress for **{childName}** ({dashboard?.rollNumber})
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Child Attendance" value={attendanceRate} icon={HiOutlineClipboardDocumentCheck} color="success" subtitle="Minimum 75% required" />
        <StatCard title="Enrolled Courses" value={coursesCount} icon={HiOutlineAcademicCap} color="primary" subtitle={`Semester ${dashboard?.semester || 3}`} />
        <StatCard title="Fee Status" value={feeStatus} icon={HiOutlineCreditCard} color={feeStatus === 'Paid' ? 'accent' : 'warning'} subtitle={feeStatus === 'Paid' ? 'No pending dues' : 'Outstanding dues'} />
        <StatCard title="Alerts/Updates" value={notificationsCount} icon={HiOutlineBell} color="danger" subtitle={`${notifications.length} messages`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`${childName}'s Attendance Summary`} subtitle="Course-wise attendance rates">
          <div className="space-y-3 mt-3">
            {attendanceSummary.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No enrolled courses logs found.</p>
            ) : (
              attendanceSummary.map((c: any, i: number) => {
                const pct = Math.round((c.attended / c.total) * 100);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary/40 border border-border/15">
                    <div>
                      <p className="text-xs font-bold text-text-primary">{c.subject}</p>
                      <p className="text-[9px] text-text-muted">{c.attended}/{c.total} classes attended</p>
                    </div>
                    <Badge variant={pct >= 75 ? 'success' : 'danger'} size="sm">{pct}%</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card title="Recent Institution Alerts" subtitle="Important updates and notices">
          <div className="space-y-3 mt-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No recent alerts found.</p>
            ) : (
              notifications.map((n: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-bg-secondary/40 border border-border/15 hover:bg-bg-hover/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-text-primary">{n.title}</p>
                      <p className="text-[9px] text-text-secondary mt-0.5">{n.desc}</p>
                    </div>
                    <span className="text-[8px] text-text-dim whitespace-nowrap">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
