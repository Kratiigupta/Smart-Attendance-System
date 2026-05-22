'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'violet';
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const barColors: Record<string, string> = {
  primary: 'from-primary to-primary-light',
  secondary: 'from-secondary to-secondary-light',
  success: 'from-success to-success-light',
  warning: 'from-warning to-warning-light',
  danger: 'from-danger to-danger-light',
  violet: 'from-violet to-violet-light',
};

const barSizes: Record<string, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function ProgressBar({ value, max = 100, color = 'primary', size = 'sm', showLabel, label, animated = true, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-[10px] font-semibold text-text-secondary">{label}</span>}
          {showLabel && <span className="text-[10px] font-bold text-text-muted">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-bg-hover overflow-hidden ${barSizes[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColors[color]} ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = '#6366f1',
  label,
  sublabel,
  className = '',
}: CircularProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1e1d3d" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-heading font-black text-text-primary">{Math.round(pct)}%</span>
        </div>
      </div>
      {label && <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</span>}
      {sublabel && <span className="text-[9px] text-text-muted">{sublabel}</span>}
    </div>
  );
}
