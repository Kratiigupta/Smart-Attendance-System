'use client';

import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';

interface AttendanceStreakProps {
  streakDays: number;
  longestStreak?: number;
  className?: string;
}

export function AttendanceStreak({ streakDays, longestStreak = 15, className = '' }: AttendanceStreakProps) {
  return (
    <div className={`p-4 rounded-2xl bg-bg-secondary border border-border/30 flex items-center justify-between gap-4 transition-all duration-200 hover:border-border-light relative overflow-hidden group ${className}`}>
      {/* Background flare */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-accent/5 blur-xl group-hover:bg-accent/8 transition-all duration-300" />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-all">
          🔥
        </div>
        <div>
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Engagement Level</span>
          <h4 className="text-sm font-heading font-black text-text-primary mt-0.5">
            {streakDays} Day Check-In Streak!
          </h4>
          <p className="text-[9px] text-text-muted mt-0.5">
            Personal Record: {longestStreak} days • Keep checking in to maintain.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-accent/15 text-accent-light border border-accent/20 flex items-center gap-1">
          <HiOutlineSparkles className="w-3 h-3 animate-pulse" />
          Active Streak
        </span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-orange-500 shadow-sm shadow-orange-500/35' : 'bg-border/40'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
