'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineBell
} from 'react-icons/hi2';

export default function ParentDashboard() {
  const { user } = useAuth();
  const parentName = user?.name || 'Parent';

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Child Attendance" value="86%" icon={HiOutlineClipboardDocumentCheck} color="success" subtitle="Above threshold" />
        <StatCard title="Enrolled Courses" value={6} icon={HiOutlineAcademicCap} color="primary" subtitle="Semester 3 FYUP" />
        <StatCard title="Fee Status" value="Paid" icon={HiOutlineCreditCard} color="accent" subtitle="Next due: July 2026" />
        <StatCard title="Notifications" value={3} icon={HiOutlineBell} color="danger" subtitle="2 unread messages" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Child's Attendance Summary" subtitle="Weekly attendance overview">
          <div className="space-y-3 mt-3">
            {[
              { subject: 'Data Structures', attended: 18, total: 20 },
              { subject: 'DBMS', attended: 16, total: 20 },
              { subject: 'Digital Electronics', attended: 17, total: 20 },
              { subject: 'Eng. Math III', attended: 19, total: 20 },
            ].map((c, i) => {
              const pct = Math.round((c.attended / c.total) * 100);
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary/40 border border-border/15">
                  <div>
                    <p className="text-xs font-bold text-text-primary">{c.subject}</p>
                    <p className="text-[9px] text-text-muted">{c.attended}/{c.total} classes</p>
                  </div>
                  <Badge variant={pct >= 75 ? 'success' : 'danger'} size="sm">{pct}%</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Recent Notifications" subtitle="Updates from the institution">
          <div className="space-y-3 mt-3">
            {[
              { title: 'Fee Payment Reminder', desc: 'Semester 3 fee is due by June 15, 2026', time: '2 hours ago', type: 'warning' },
              { title: 'Attendance Alert', desc: 'Your child has below 75% in DBMS', time: '1 day ago', type: 'danger' },
              { title: 'Exam Schedule Released', desc: 'Mid-semester exams start from July 1', time: '3 days ago', type: 'info' },
            ].map((n, i) => (
              <div key={i} className="p-3 rounded-xl bg-bg-secondary/40 border border-border/15 hover:bg-bg-hover/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-text-primary">{n.title}</p>
                    <p className="text-[9px] text-text-secondary mt-0.5">{n.desc}</p>
                  </div>
                  <span className="text-[8px] text-text-dim whitespace-nowrap">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
