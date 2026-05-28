'use client';

import React from 'react';

interface AttendanceProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function AttendanceProgressRing({
  value,
  size = 140,
  strokeWidth = 10,
  label = 'Attendance',
  sublabel,
  className = '',
}: AttendanceProgressRingProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  
  // Decide color based on percentage (Notion/Linear SaaS feel: safe green, warning amber, danger red)
  const color = pct >= 75 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444';
  const shadowColor = pct >= 75 ? 'rgba(16, 185, 129, 0.15)' : pct >= 65 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  return (
    <div className={`flex flex-col items-center justify-center p-4 relative ${className}`}>
      {/* SVG Ring container with soft drop shadow */}
      <div 
        className="relative flex items-center justify-center rounded-full transition-all duration-300"
        style={{ width: size, height: size, boxShadow: `0 0 25px ${shadowColor}` }}
      >
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border-dim, #1e1d3d)"
            strokeWidth={strokeWidth}
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-2xl font-heading font-black tracking-tighter text-text-primary">
            {pct}%
          </span>
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {sublabel && (
        <span className="text-[10px] text-text-secondary mt-3 font-semibold text-center leading-relaxed max-w-[180px]">
          {sublabel}
        </span>
      )}
    </div>
  );
}
