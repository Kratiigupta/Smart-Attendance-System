'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { AreaChartCard, BarChartCard } from '@/components/charts/Charts';

interface AttendanceTrendsProps {
  weeklyData?: Array<{ name: string; rate: number }>;
  monthlyData?: Array<{ name: string; rate: number }>;
  className?: string;
}

const defaultWeekly = [
  { name: 'Mon', rate: 95 },
  { name: 'Tue', rate: 90 },
  { name: 'Wed', rate: 85 },
  { name: 'Thu', rate: 100 },
  { name: 'Fri', rate: 90 },
];

const defaultMonthly = [
  { name: 'Jul', rate: 92 },
  { name: 'Aug', rate: 89 },
  { name: 'Sep', rate: 91 },
  { name: 'Oct', rate: 88 },
  { name: 'Nov', rate: 93 },
  { name: 'Dec', rate: 85 },
];

export function AttendanceTrends({ weeklyData = defaultWeekly, monthlyData = defaultMonthly, className = '' }: AttendanceTrendsProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('monthly');

  return (
    <Card 
      title="Attendance Trends" 
      subtitle="Analyze attendance over time frames" 
      className={className}
      headerRight={
        <div className="flex gap-1 p-0.5 bg-bg-elevated border border-border/40 rounded-xl">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
              ${activeTab === 'weekly' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-muted hover:text-text-primary'
              }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
              ${activeTab === 'monthly' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-muted hover:text-text-primary'
              }`}
          >
            Monthly
          </button>
        </div>
      }
    >
      <div className="mt-4 animate-fadeIn">
        {activeTab === 'weekly' ? (
          <BarChartCard 
            data={weeklyData} 
            dataKey="rate" 
            color="#10b981" 
            height={200} 
          />
        ) : (
          <AreaChartCard 
            data={monthlyData} 
            dataKey="rate" 
            color="#6366f1" 
            gradientId="trendArea"
            height={200} 
          />
        )}
      </div>
    </Card>
  );
}
