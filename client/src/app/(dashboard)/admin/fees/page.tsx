'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AreaChartCard, DonutChart, ChartLegend } from '@/components/charts/Charts';
import {
  HiOutlineCreditCard, HiOutlineArrowDownTray, HiOutlineBanknotes,
  HiOutlineExclamationTriangle, HiOutlineReceiptPercent,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const feeCollectionTrend = [
  { name: 'Jan', collected: 320000, due: 180000 },
  { name: 'Feb', collected: 480000, due: 120000 },
  { name: 'Mar', collected: 650000, due: 95000 },
  { name: 'Apr', collected: 820000, due: 78000 },
  { name: 'May', collected: 1050000, due: 65000 },
];

const feeDistribution = [
  { name: 'Tuition', value: 55, color: '#6366f1' },
  { name: 'Lab Fee', value: 15, color: '#14b8a6' },
  { name: 'Library', value: 8, color: '#f59e0b' },
  { name: 'Hostel', value: 18, color: '#8b5cf6' },
  { name: 'Other', value: 4, color: '#f43f5e' },
];

const recentPayments = [
  { student: 'Amit Kumar', roll: 'CSE-2023-045', amount: '₹18,500', method: 'UPI', date: '22 May 2025', status: 'paid' },
  { student: 'Priya Sharma', roll: 'ECE-2023-018', amount: '₹18,500', method: 'NEFT', date: '22 May 2025', status: 'paid' },
  { student: 'Rahul Singh', roll: 'ME-2023-032', amount: '₹9,250', method: 'Cash', date: '21 May 2025', status: 'partial' },
  { student: 'Anjali Kaur', roll: 'CSE-2023-067', amount: '₹0', method: '—', date: '—', status: 'overdue' },
  { student: 'Vikash Yadav', roll: 'CE-2023-012', amount: '₹18,500', method: 'UPI', date: '20 May 2025', status: 'paid' },
];

const defaulters = [
  { name: 'Anjali Kaur', roll: 'CSE-2023-067', dept: 'CSE', due: '₹18,500', dueDate: '15 Apr 2025', days: 37 },
  { name: 'Deepak Verma', roll: 'ME-2023-041', dept: 'ME', due: '₹18,500', dueDate: '15 Apr 2025', days: 37 },
  { name: 'Ritu Sharma', roll: 'ECE-2023-055', dept: 'ECE', due: '₹9,250', dueDate: '15 Apr 2025', days: 37 },
  { name: 'Sandeep Singh', roll: 'CE-2023-008', dept: 'CE', due: '₹18,500', dueDate: '15 Mar 2025', days: 68 },
];

export default function AdminFeesPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineCreditCard className="w-6 h-6 text-primary-light" />
            Fee Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Collection tracking, receipts & defaulter management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<HiOutlineArrowDownTray className="w-3.5 h-3.5" />}>Export Report</Button>
          <Button variant="primary" size="sm" icon={<HiOutlineReceiptPercent className="w-3.5 h-3.5" />}>Record Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Collected" value="₹18.5L" icon={HiOutlineBanknotes} color="success" trend={{ value: 12, isUp: true }} subtitle="This semester" />
        <StatCard title="Total Due" value="₹4.2L" icon={HiOutlineExclamationTriangle} color="danger" subtitle="Outstanding amount" />
        <StatCard title="Collection Rate" value="81.5%" icon={HiOutlineCheckCircle} color="primary" trend={{ value: 5, isUp: true }} />
        <StatCard title="Fee Defaulters" value={18} icon={HiOutlineExclamationTriangle} color="warning" subtitle="Overdue > 30 days" />
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'payments', label: 'Recent Payments' },
          { id: 'defaulters', label: 'Defaulters', badge: '18' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Collection Trend" subtitle="Monthly collection vs outstanding" className="lg:col-span-2">
            <AreaChartCard
              data={feeCollectionTrend}
              dataKey="collected"
              secondaryDataKey="due"
              color="#10b981"
              secondaryColor="#ef4444"
              gradientId="feeTrend"
              height={240}
              className="mt-3"
            />
            <ChartLegend items={[{ label: 'Collected', color: '#10b981' }, { label: 'Due', color: '#ef4444' }]} className="mt-3 justify-center" />
          </Card>

          <Card title="Fee Structure" subtitle="Breakup by category">
            <DonutChart data={feeDistribution} height={200} centerValue="₹18.5K" centerLabel="Per Student" />
            <ChartLegend items={feeDistribution.map(f => ({ label: f.name, color: f.color }))} className="mt-3 justify-center" />
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {['Student', 'Roll No.', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/15">
                {recentPayments.map((p, i) => (
                  <tr key={i} className="hover:bg-bg-hover/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold text-text-primary">{p.student}</td>
                    <td className="px-5 py-3 text-[11px] font-mono text-text-secondary">{p.roll}</td>
                    <td className="px-5 py-3 text-xs font-bold text-text-primary">{p.amount}</td>
                    <td className="px-5 py-3"><Badge variant="default" size="xs">{p.method}</Badge></td>
                    <td className="px-5 py-3 text-[10px] text-text-muted">{p.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'danger'} size="xs" dot>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'defaulters' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {['Student', 'Roll No.', 'Dept', 'Due Amount', 'Due Date', 'Overdue', 'Action'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/15">
                {defaulters.map((d, i) => (
                  <tr key={i} className="hover:bg-bg-hover/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold text-text-primary">{d.name}</td>
                    <td className="px-5 py-3 text-[11px] font-mono text-text-secondary">{d.roll}</td>
                    <td className="px-5 py-3"><Badge variant="default" size="xs">{d.dept}</Badge></td>
                    <td className="px-5 py-3 text-xs font-bold text-danger-light">{d.due}</td>
                    <td className="px-5 py-3 text-[10px] text-text-muted">{d.dueDate}</td>
                    <td className="px-5 py-3"><Badge variant="danger" size="xs">{d.days} days</Badge></td>
                    <td className="px-5 py-3"><Button variant="danger" size="xs">Send Reminder</Button></td>
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
