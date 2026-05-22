'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HiOutlineCog6Tooth, HiOutlineShieldCheck, HiOutlineBellAlert, HiOutlinePaintBrush } from 'react-icons/hi2';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
          <HiOutlineCog6Tooth className="w-6 h-6 text-primary-light" />
          College Settings
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Manage institution configuration & preferences</p>
      </div>

      {/* General */}
      <Card title="General Settings" subtitle="Basic college information"
        headerRight={<Button variant="outline" size="xs">Edit</Button>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {[
            { label: 'College Name', value: 'Govt. College of Education, Nabha' },
            { label: 'College Code', value: 'GCEN' },
            { label: 'Domain', value: 'gcenabha.edu.in' },
            { label: 'City', value: 'Nabha, Punjab' },
            { label: 'Timezone', value: 'Asia/Kolkata (IST)' },
            { label: 'Subscription', value: 'Premium' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">{item.label}</span>
              <span className="text-xs font-semibold text-text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance */}
      <Card title="Attendance Settings" subtitle="Configure attendance rules"
        headerRight={<Button variant="outline" size="xs">Save</Button>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">Minimum Attendance Threshold</label>
            <div className="flex items-center gap-2">
              <input type="number" defaultValue={75} className="bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-primary px-3 py-2 w-24 focus:border-primary/40 focus:outline-none" />
              <span className="text-xs text-text-muted">%</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">QR Code Rotation Interval</label>
            <select className="bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2 w-full focus:border-primary/40 focus:outline-none">
              <option>Every 30 seconds</option>
              <option>Every 15 seconds</option>
              <option>Every 60 seconds</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">Verification Methods</label>
            <div className="flex flex-wrap gap-2">
              {['QR Code', 'Face Recognition', 'Wi-Fi Proximity', 'BLE Beacon'].map(m => (
                <Badge key={m} variant="primary" size="sm">✓ {m}</Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">Working Days</label>
            <div className="flex flex-wrap gap-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <button key={d} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all
                  ${i < 6 ? 'bg-primary/12 text-primary-light border-primary/25' : 'bg-transparent text-text-muted border-border/30'}`}
                >{d}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card title="Security" subtitle="Account & access control" headerRight={<HiOutlineShieldCheck className="w-5 h-5 text-success-light" />}>
        <div className="space-y-3 mt-2">
          {[
            { label: 'Two-Factor Authentication (2FA)', desc: 'Require 2FA for admin accounts', enabled: true },
            { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', enabled: true },
            { label: 'IP Whitelisting', desc: 'Restrict admin access to specific IPs', enabled: false },
            { label: 'Audit Logging', desc: 'Log all administrative actions', enabled: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
              <div>
                <p className="text-xs font-semibold text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-all ${item.enabled ? 'bg-success justify-end' : 'bg-bg-hover justify-start'}`}>
                <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notifications" subtitle="Configure alert preferences" headerRight={<HiOutlineBellAlert className="w-5 h-5 text-accent-light" />}>
        <div className="space-y-3 mt-2">
          {[
            { label: 'Attendance Shortage Alerts', desc: 'Notify when student falls below threshold', enabled: true },
            { label: 'Fee Due Reminders', desc: 'Auto-send reminders before due date', enabled: true },
            { label: 'Faculty Leave Notifications', desc: 'Alert admin when faculty applies for leave', enabled: true },
            { label: 'Timetable Conflicts', desc: 'Notify on scheduling conflicts', enabled: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
              <div>
                <p className="text-xs font-semibold text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-all ${item.enabled ? 'bg-primary justify-end' : 'bg-bg-hover justify-start'}`}>
                <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
