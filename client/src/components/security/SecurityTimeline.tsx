'use client';

import React from 'react';
import { HiOutlineClock, HiOutlineShieldExclamation, HiOutlineCheckCircle } from 'react-icons/hi2';

export interface TimelineLog {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface SecurityTimelineProps {
  logs: TimelineLog[];
  className?: string;
}

const defaultLogs: TimelineLog[] = [
  { id: '1', time: '10:01 AM', message: 'Aman Sharma check-in verified via dynamic QR', type: 'success' },
  { id: '2', time: '10:02 AM', message: 'Priya Verma identity confirmed via face mapping matching 94%', type: 'success' },
  { id: '3', time: '10:03 AM', message: 'Security Alert: Duplicate device fingerprint detected for roll CSE-2023-012', type: 'warning' },
  { id: '4', time: '10:05 AM', message: 'Rahul Singh completed smart override code verification', type: 'info' },
];

export function SecurityTimeline({ logs = defaultLogs, className = '' }: SecurityTimelineProps) {
  return (
    <div className={`p-5 rounded-2xl bg-bg-secondary border border-border/30 ${className}`}>
      <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4">
        <div>
          <h4 className="text-xs font-bold text-text-primary">Live Security Feed</h4>
          <p className="text-[9px] text-text-muted">Real-time check-in validation log timeline</p>
        </div>
        <HiOutlineClock className="w-4 h-4 text-text-dim" />
      </div>

      <div className="relative border-l border-border/20 pl-4 ml-1 space-y-4">
        {logs.map((log) => {
          const isWarning = log.type === 'warning';
          const isSuccess = log.type === 'success';

          return (
            <div key={log.id} className="relative group text-xs animate-fadeIn">
              {/* Timeline Bullet node */}
              <div 
                className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 
                  ${isWarning 
                    ? 'bg-danger border-danger shadow-sm shadow-danger/40 animate-pulse' 
                    : isSuccess 
                    ? 'bg-success border-success' 
                    : 'bg-primary border-primary'
                  }`} 
              />
              
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[10px] font-bold text-text-dim tracking-wide font-mono shrink-0 select-none">
                  {log.time}
                </span>
                
                <div className="flex-1 min-w-0">
                  <p className={`leading-normal ${isWarning ? 'text-danger-light font-bold' : 'text-text-secondary'}`}>
                    {log.message}
                  </p>
                </div>
                
                <span className="shrink-0">
                  {isWarning ? (
                    <HiOutlineShieldExclamation className="w-3.5 h-3.5 text-danger-light" />
                  ) : isSuccess ? (
                    <HiOutlineCheckCircle className="w-3.5 h-3.5 text-success-light" />
                  ) : null}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
