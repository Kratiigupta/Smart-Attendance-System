'use client';

import React, { useEffect, useState } from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: IconType;
  trend?: { value: number; isUp: boolean };
  color?: 'primary' | 'secondary' | 'accent' | 'violet' | 'rose' | 'cyan' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

const colorMap: Record<string, { bg: string; icon: string; glow: string; text: string; border: string }> = {
  primary:   { bg: 'bg-primary/8',   icon: 'gradient-primary',   glow: 'shadow-primary/10',   text: 'text-primary-light',   border: 'border-primary/15' },
  secondary: { bg: 'bg-secondary/8', icon: 'gradient-secondary', glow: 'shadow-secondary/10', text: 'text-secondary-light', border: 'border-secondary/15' },
  accent:    { bg: 'bg-accent/8',    icon: 'gradient-accent',    glow: 'shadow-accent/10',    text: 'text-accent-light',    border: 'border-accent/15' },
  violet:    { bg: 'bg-violet/8',    icon: 'gradient-violet',    glow: 'shadow-violet/10',    text: 'text-violet-light',    border: 'border-violet/15' },
  rose:      { bg: 'bg-rose/8',      icon: 'gradient-rose',      glow: 'shadow-rose/10',      text: 'text-rose-light',      border: 'border-rose/15' },
  cyan:      { bg: 'bg-cyan/8',      icon: 'bg-gradient-to-br from-cyan to-cyan-light', glow: 'shadow-cyan/10', text: 'text-cyan-light', border: 'border-cyan/15' },
  success:   { bg: 'bg-success/8',   icon: 'bg-gradient-to-br from-success to-success-light', glow: 'shadow-success/10', text: 'text-success-light', border: 'border-success/15' },
  warning:   { bg: 'bg-warning/8',   icon: 'bg-gradient-to-br from-warning to-warning-light', glow: 'shadow-warning/10', text: 'text-warning-light', border: 'border-warning/15' },
  danger:    { bg: 'bg-danger/8',    icon: 'bg-gradient-to-br from-danger to-danger-light', glow: 'shadow-danger/10', text: 'text-danger-light', border: 'border-danger/15' },
};

function AnimatedNumber({ value }: { value: number | string }) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === 'number' ? value : parseInt(value, 10);
  const isNum = !isNaN(numVal);

  useEffect(() => {
    if (!isNum) return;
    const duration = 800;
    const steps = 30;
    const increment = numVal / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), numVal);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numVal, isNum]);

  if (!isNum) return <span>{value}</span>;
  return <span>{display.toLocaleString()}</span>;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary', loading = false }: StatCardProps) {
  const c = colorMap[color] || colorMap.primary;

  if (loading) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border/40 p-5 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="skeleton w-16 h-4 rounded-md" />
        </div>
        <div className="skeleton w-20 h-8 rounded-lg mb-2" />
        <div className="skeleton w-28 h-3 rounded-md" />
      </div>
    );
  }

  return (
    <div className={`bg-bg-card rounded-2xl border ${c.border} p-5 card-glow group transition-all duration-300 hover:border-border-light`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center shadow-lg ${c.glow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${
            trend.isUp ? 'bg-success/10 text-success-light' : 'bg-danger/10 text-danger-light'
          }`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-heading font-black text-text-primary tracking-tight mb-0.5">
        <AnimatedNumber value={value} />
      </h3>
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{title}</p>
      {subtitle && (
        <p className={`text-[10px] font-medium ${c.text} mt-1`}>{subtitle}</p>
      )}
    </div>
  );
}
