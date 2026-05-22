'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
  glow?: boolean;
}

export function Card({ children, title, subtitle, className = '', headerRight, noPadding, glow = true, ...props }: CardProps) {
  return (
    <div className={`bg-bg-card rounded-2xl border border-border/40 ${glow ? 'card-glow' : ''} transition-all duration-300 ${className}`} {...props}>
      {(title || subtitle || headerRight) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div>
            {title && (
              <h3 className="text-sm font-heading font-bold text-text-primary tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-text-muted font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

interface MiniCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  className?: string;
}

export function MiniCard({ icon, label, value, color = 'primary', className = '' }: MiniCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/50 border border-border/20 ${className}`}>
      <div className="shrink-0">{icon}</div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-text-primary truncate">{value}</span>
      </div>
    </div>
  );
}
