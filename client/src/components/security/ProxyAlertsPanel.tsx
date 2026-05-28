'use client';

import React from 'react';
import { HiOutlineShieldExclamation, HiOutlineCheckCircle, HiOutlineUserMinus } from 'react-icons/hi2';

export interface ProxyAlert {
  id: string;
  studentName1: string;
  studentName2: string;
  roll1: string;
  roll2: string;
  reason: string; // e.g. "Duplicate hardware fingerprint (dev_9a4)"
  details?: string;
}

interface ProxyAlertsPanelProps {
  presentCount: number;
  absentCount: number;
  flaggedCount: number;
  alerts: ProxyAlert[];
  onAction?: (alertId: string, action: 'flag' | 'approve') => void;
  className?: string;
}

export function ProxyAlertsPanel({
  presentCount,
  absentCount,
  flaggedCount,
  alerts,
  onAction,
  className = '',
}: ProxyAlertsPanelProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Real-time Counts row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border/30 text-center select-none">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Present</span>
          <span className="text-xl font-heading font-black text-success-light mt-1 block">
            {presentCount}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border/30 text-center select-none">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Absent</span>
          <span className="text-xl font-heading font-black text-text-muted mt-1 block">
            {absentCount}
          </span>
        </div>
        <div className={`p-3.5 rounded-2xl border text-center select-none transition-all duration-300
          ${flaggedCount > 0 
            ? 'bg-danger/8 border-danger/25 text-danger-light shadow-sm shadow-danger/5 animate-pulse' 
            : 'bg-bg-secondary border-border/30'
          }`}
        >
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Flagged</span>
          <span className="text-xl font-heading font-black mt-1 block">
            {flaggedCount}
          </span>
        </div>
      </div>

      {/* Duplicate Scan alerts list */}
      <div className="p-4 rounded-2xl bg-bg-secondary border border-border/30 space-y-3">
        <div>
          <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <HiOutlineShieldExclamation className="w-4 h-4 text-danger-light shrink-0" />
            Anti-Proxy Watchdog
          </h4>
          <p className="text-[9px] text-text-muted mt-0.5">Automated hardware matching & audit alerts</p>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-[10px] text-text-muted select-none flex flex-col items-center gap-1">
              <span>🛡️ Watchdog Scanning Active</span>
              <span>No suspicious proxy check-ins detected in this session.</span>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-3 rounded-xl border border-danger/15 bg-danger/5 space-y-2 text-[11px] animate-scaleIn"
              >
                <div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-danger/15 text-danger-light border border-danger/20 uppercase tracking-wide">
                    Hardware Clash
                  </span>
                  <p className="text-text-primary font-bold mt-1.5 leading-normal">
                    {alert.reason}
                  </p>
                  <p className="text-text-secondary mt-1">
                    👥 Flagged profiles:
                    <span className="block font-semibold mt-0.5 text-text-primary">
                      • {alert.studentName1} ({alert.roll1})
                    </span>
                    <span className="block font-semibold text-text-primary">
                      • {alert.studentName2} ({alert.roll2})
                    </span>
                  </p>
                </div>

                {onAction && (
                  <div className="flex gap-2 pt-1.5 border-t border-danger/10">
                    <button
                      onClick={() => onAction(alert.id, 'flag')}
                      className="flex-1 py-1 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger-light font-bold text-[9px] uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 transition-all"
                    >
                      <HiOutlineUserMinus className="w-3 h-3" />
                      Flag Proxy
                    </button>
                    <button
                      onClick={() => onAction(alert.id, 'approve')}
                      className="flex-1 py-1 rounded-lg bg-success/10 hover:bg-success/20 text-success-light font-bold text-[9px] uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 transition-all"
                    >
                      <HiOutlineCheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
