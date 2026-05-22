'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HiOutlineQrCode, HiOutlineStopCircle, HiOutlineArrowPath, HiOutlineSignal } from 'react-icons/hi2';

const mockStudents = [
  { name: 'Amit Kumar', roll: 'CSE-045', time: '10:02 AM', method: 'QR + Face', avatar: 'A' },
  { name: 'Priya Sharma', roll: 'CSE-018', time: '10:02 AM', method: 'QR + Wi-Fi', avatar: 'P' },
  { name: 'Rahul Singh', roll: 'CSE-032', time: '10:03 AM', method: 'QR + Face', avatar: 'R' },
  { name: 'Anjali Verma', roll: 'CSE-067', time: '10:04 AM', method: 'QR + Face', avatar: 'A' },
  { name: 'Vikash Yadav', roll: 'CSE-012', time: '10:04 AM', method: 'QR + Wi-Fi', avatar: 'V' },
  { name: 'Mohit Gupta', roll: 'CSE-089', time: '10:05 AM', method: 'QR + Face', avatar: 'M' },
  { name: 'Neha Kumari', roll: 'CSE-023', time: '10:06 AM', method: 'QR + Face', avatar: 'N' },
];

export default function FacultyStartClassPage() {
  const [isActive, setIsActive] = useState(true);
  const [timer, setTimer] = useState(30);
  const [qrCycle, setQrCycle] = useState(1);
  const [markedCount, setMarkedCount] = useState(7);
  const totalStudents = 48;

  // QR rotation timer
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setQrCycle(c => c + 1);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineQrCode className="w-6 h-6 text-primary-light" />
            Live Attendance Session
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Data Structures (CSC-201) • LH-301 • CSE Sem-3</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot pulse size="md">Session Active</Badge>
          <Button variant="danger" size="sm" icon={<HiOutlineStopCircle className="w-4 h-4" />} onClick={() => setIsActive(false)}>
            End Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Display */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <Card className="w-full text-center">
            {/* QR Placeholder */}
            <div className="relative mx-auto w-56 h-56 rounded-2xl bg-white flex items-center justify-center mb-4 overflow-hidden">
              {/* Simulated QR Pattern */}
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-[2px]">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-gray-900' : 'bg-white'}`} />
                  ))}
                </div>
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-10 h-10 border-[4px] border-gray-900 rounded-md"><div className="w-4 h-4 bg-gray-900 rounded-sm m-1" /></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-[4px] border-gray-900 rounded-md"><div className="w-4 h-4 bg-gray-900 rounded-sm m-1 ml-auto" /></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-[4px] border-gray-900 rounded-md"><div className="w-4 h-4 bg-gray-900 rounded-sm m-1 mt-auto" /></div>
              </div>
              {/* Animated scan line */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]"
                  style={{ animation: 'scan 2s ease-in-out infinite', top: '50%' }}
                />
              </div>
            </div>

            {/* Timer Ring */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1d3d" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#6366f1" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - timer / 30)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-heading font-black text-text-primary">{timer}s</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Next Rotation</p>
                <p className="text-[10px] text-text-dim">Cycle #{qrCycle}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" icon={<HiOutlineArrowPath className="w-3.5 h-3.5" />} fullWidth>
              Force Rotate QR
            </Button>
          </Card>

          {/* Verification Methods */}
          <Card className="w-full mt-4">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Active Verification</p>
            <div className="space-y-2">
              {[
                { method: 'Dynamic QR Code', status: 'Active', icon: '📱', color: 'success' as const },
                { method: 'Face Recognition', status: 'Active', icon: '👤', color: 'success' as const },
                { method: 'Wi-Fi Proximity', status: 'Active', icon: '📶', color: 'success' as const },
                { method: 'BLE Beacon', status: 'Not Available', icon: '📡', color: 'default' as const },
              ].map(v => (
                <div key={v.method} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{v.icon}</span>
                    <span className="text-[11px] font-semibold text-text-secondary">{v.method}</span>
                  </div>
                  <Badge variant={v.color} size="xs" dot={v.color === 'success'} pulse={v.color === 'success'}>{v.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Live Attendance List */}
        <div className="lg:col-span-2">
          <Card noPadding>
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Live Attendance Board</h3>
                  <p className="text-[10px] text-text-muted">Students checking in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineSignal className="w-4 h-4 text-success-light animate-pulse" />
                  <span className="text-lg font-heading font-black text-text-primary">{markedCount}</span>
                  <span className="text-xs text-text-muted">/ {totalStudents}</span>
                </div>
              </div>
              <ProgressBar value={markedCount} max={totalStudents} color="primary" size="md" showLabel />
            </div>

            {/* Student List */}
            <div className="divide-y divide-border/15 max-h-[500px] overflow-y-auto">
              {mockStudents.map((student, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-bg-hover/30 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-primary/15">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{student.name}</span>
                      <Badge variant="success" size="xs" dot>✓ Verified</Badge>
                    </div>
                    <p className="text-[10px] text-text-muted">{student.roll} • {student.method}</p>
                  </div>
                  <span className="text-[10px] text-text-dim font-semibold">{student.time}</span>
                </div>
              ))}

              {/* Waiting indicator */}
              <div className="px-5 py-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-[10px] text-text-dim mt-2">Waiting for more students to check in...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
}
