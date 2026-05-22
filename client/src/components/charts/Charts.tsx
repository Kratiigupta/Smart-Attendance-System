'use client';

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ===== SHARED TOOLTIP ===== */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border/60 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] font-semibold text-text-muted mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-bold text-text-primary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== AREA CHART ===== */
interface AreaChartProps {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  gradientId?: string;
  height?: number;
  secondaryDataKey?: string;
  secondaryColor?: string;
  className?: string;
}

export function AreaChartCard({
  data, dataKey, xKey = 'name', color = '#6366f1',
  gradientId = 'areaGrad', height = 200,
  secondaryDataKey, secondaryColor = '#14b8a6',
  className = ''
}: AreaChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {secondaryDataKey && (
              <linearGradient id={`${gradientId}2`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1d3d" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
          {secondaryDataKey && (
            <Area
              type="monotone" dataKey={secondaryDataKey} stroke={secondaryColor} strokeWidth={2}
              fill={`url(#${gradientId}2)`} dot={false} activeDot={{ r: 4, fill: secondaryColor, strokeWidth: 0 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ===== BAR CHART ===== */
interface BarChartProps {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  height?: number;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export function BarChartCard({
  data, dataKey, xKey = 'name', color = '#6366f1',
  secondaryDataKey, secondaryColor = '#14b8a6',
  height = 200, layout = 'horizontal', className = ''
}: BarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout={layout === 'vertical' ? 'vertical' : undefined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1d3d" vertical={false} />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey={xKey} type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
          {secondaryDataKey && (
            <Bar dataKey={secondaryDataKey} fill={secondaryColor} radius={[4, 4, 0, 0]} maxBarSize={32} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ===== DONUT CHART ===== */
interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function DonutChart({
  data, height = 200, innerRadius = 55, outerRadius = 75,
  centerLabel, centerValue, className = ''
}: DonutChartProps) {
  return (
    <div className={`relative ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={innerRadius} outerRadius={outerRadius}
            paddingAngle={3} dataKey="value" stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="text-lg font-heading font-black text-text-primary">{centerValue}</span>}
          {centerLabel && <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

/* ===== LEGEND ===== */
interface ChartLegendProps {
  items: { label: string; color: string; value?: string }[];
  className?: string;
}

export function ChartLegend({ items, className = '' }: ChartLegendProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
          <span className="text-[10px] font-semibold text-text-muted">{item.label}</span>
          {item.value && <span className="text-[10px] font-bold text-text-secondary">{item.value}</span>}
        </div>
      ))}
    </div>
  );
}
