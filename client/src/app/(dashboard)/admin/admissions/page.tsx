'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import {
  HiOutlineDocumentText, HiOutlinePlus, HiOutlineEye,
  HiOutlineCheck, HiOutlineXMark, HiOutlineClock,
  HiOutlineUserPlus,
} from 'react-icons/hi2';

const applications = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', programme: 'B.Tech CSE (FYUP)', date: '2025-05-18', status: 'applied' as const, photo: null, marks: '89.4%' },
  { id: 2, name: 'Priya Singh', email: 'priya@email.com', programme: 'B.Tech ECE (FYUP)', date: '2025-05-17', status: 'reviewing' as const, photo: null, marks: '92.1%' },
  { id: 3, name: 'Amandeep Kaur', email: 'aman@email.com', programme: 'B.Ed. (ITEP)', date: '2025-05-16', status: 'accepted' as const, photo: null, marks: '78.5%' },
  { id: 4, name: 'Vikash Kumar', email: 'vikash@email.com', programme: 'B.Tech ME (FYUP)', date: '2025-05-15', status: 'enrolled' as const, photo: null, marks: '85.2%' },
  { id: 5, name: 'Anjali Verma', email: 'anjali@email.com', programme: 'B.Tech CSE (FYUP)', date: '2025-05-19', status: 'applied' as const, photo: null, marks: '91.8%' },
  { id: 6, name: 'Mohit Yadav', email: 'mohit@email.com', programme: 'B.Tech CE (FYUP)', date: '2025-05-14', status: 'rejected' as const, photo: null, marks: '58.3%' },
];

const statusConfig: Record<string, { badge: 'info' | 'warning' | 'success' | 'primary' | 'danger'; icon: string }> = {
  applied: { badge: 'info', icon: '📝' },
  reviewing: { badge: 'warning', icon: '🔍' },
  accepted: { badge: 'success', icon: '✅' },
  enrolled: { badge: 'primary', icon: '🎓' },
  rejected: { badge: 'danger', icon: '❌' },
};

const stages = ['applied', 'reviewing', 'accepted', 'enrolled'];

export default function AdminAdmissionsPage() {
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineDocumentText className="w-6 h-6 text-primary-light" />
            Admissions
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Application pipeline & enrollment management</p>
        </div>
        <Button variant="primary" size="sm" icon={<HiOutlinePlus className="w-3.5 h-3.5" />}>New Application</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Applied" value={156} icon={HiOutlineDocumentText} color="cyan" trend={{ value: 24, isUp: true }} />
        <StatCard title="Under Review" value={38} icon={HiOutlineClock} color="warning" />
        <StatCard title="Accepted" value={92} icon={HiOutlineCheck} color="success" />
        <StatCard title="Enrolled" value={78} icon={HiOutlineUserPlus} color="primary" subtitle="2025-26 Batch" />
      </div>

      <Tabs
        tabs={[
          { id: 'pipeline', label: 'Pipeline View' },
          { id: 'list', label: 'All Applications', badge: '156' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map(stage => {
            const stageApps = applications.filter(a => a.status === stage);
            const config = statusConfig[stage];
            return (
              <div key={stage} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="text-xs font-bold text-text-primary capitalize">{stage}</span>
                  </div>
                  <Badge variant={config.badge} size="xs">{stageApps.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageApps.length > 0 ? stageApps.map(app => (
                    <Card key={app.id} className="!p-3 cursor-pointer hover:border-primary/30">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {app.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-text-primary truncate">{app.name}</p>
                          <p className="text-[9px] text-text-muted">{app.email}</p>
                        </div>
                      </div>
                      <Badge variant="default" size="xs" className="mb-1.5">{app.programme}</Badge>
                      <div className="flex items-center justify-between text-[9px] text-text-dim">
                        <span>📊 {app.marks}</span>
                        <span>{app.date}</span>
                      </div>
                    </Card>
                  )) : (
                    <div className="text-center py-8 text-[10px] text-text-dim border border-dashed border-border/30 rounded-xl">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'list' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {['Applicant', 'Programme', 'Marks', 'Applied', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/15">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-bg-hover/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold">{app.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{app.name}</p>
                          <p className="text-[9px] text-text-muted">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-text-secondary">{app.programme}</td>
                    <td className="px-5 py-3 text-[11px] font-bold text-text-primary">{app.marks}</td>
                    <td className="px-5 py-3 text-[10px] text-text-muted">{app.date}</td>
                    <td className="px-5 py-3"><Badge variant={statusConfig[app.status].badge} size="xs">{app.status}</Badge></td>
                    <td className="px-5 py-3"><Button variant="ghost" size="xs" icon={<HiOutlineEye className="w-3.5 h-3.5" />}>View</Button></td>
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
