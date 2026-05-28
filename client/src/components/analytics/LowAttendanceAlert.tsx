'use client';

import React from 'react';
import { HiOutlineExclamationTriangle, HiOutlineArrowRight } from 'react-icons/hi2';

interface LowAttendanceAlertProps {
  courses: Array<{
    name: string;
    code: string;
    rate: number;
    neededClasses?: number;
  }>;
  onActionClick?: () => void;
  className?: string;
}

export function LowAttendanceAlert({ courses, onActionClick, className = '' }: LowAttendanceAlertProps) {
  const lowCourses = courses.filter((c) => c.rate < 75);

  if (lowCourses.length === 0) return null;

  return (
    <div className={`p-4 rounded-2xl bg-danger/8 border border-danger/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn ${className}`}>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger-light shrink-0">
          <HiOutlineExclamationTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            Security & Compliance Alert: Low Attendance
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
          </h4>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            You are currently below the critical **75%** compliance threshold in **{lowCourses.length}** course{lowCourses.length > 1 ? 's' : ''}:
            {lowCourses.map((c, i) => (
              <span key={c.code} className="block mt-1 font-semibold text-danger-light">
                ➔ {c.name} ({c.code}): {c.rate}% attendance. You need to attend the next {c.neededClasses || 3} classes consecutively to cross 75%.
              </span>
            ))}
          </p>
        </div>
      </div>
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="px-3.5 py-1.5 rounded-xl border border-danger/20 hover:border-danger/40 bg-danger/5 hover:bg-danger/10 text-[10px] font-bold uppercase tracking-wider text-danger-light transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          View Timetable
          <HiOutlineArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
