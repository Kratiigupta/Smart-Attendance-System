'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'default';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const badgeVariants: Record<string, string> = {
  primary:   'bg-primary/12 text-primary-light border-primary/20',
  secondary: 'bg-secondary/12 text-secondary-light border-secondary/20',
  success:   'bg-success/12 text-success-light border-success/20',
  warning:   'bg-warning/12 text-warning-light border-warning/20',
  danger:    'bg-danger/12 text-danger-light border-danger/20',
  info:      'bg-info/12 text-info-light border-info/20',
  violet:    'bg-violet/12 text-violet-light border-violet/20',
  default:   'bg-bg-hover text-text-secondary border-border/40',
};

const badgeSizes: Record<string, string> = {
  xs: 'text-[9px] px-1.5 py-0.5 rounded-md',
  sm: 'text-[10px] px-2 py-0.5 rounded-lg',
  md: 'text-[11px] px-2.5 py-1 rounded-lg',
};

const dotColors: Record<string, string> = {
  primary: 'bg-primary-light', secondary: 'bg-secondary-light', success: 'bg-success-light',
  warning: 'bg-warning-light', danger: 'bg-danger-light', info: 'bg-info-light',
  violet: 'bg-violet-light', default: 'bg-text-muted',
};

export function Badge({ children, variant = 'default', size = 'sm', dot, pulse, className = '', icon }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border
      ${badgeVariants[variant]} ${badgeSizes[size]} ${className}
    `}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className={`absolute inline-flex h-full w-full rounded-full ${dotColors[variant]} opacity-60 animate-ping`} />}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
