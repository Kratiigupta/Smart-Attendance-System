'use client';

import React from 'react';
import { HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi2';

interface SubjectDetectionCardProps {
  courseCode: string;
  courseTitle?: string;
  facultyName?: string;
  roomName?: string;
  className?: string;
}

export function SubjectDetectionCard({
  courseCode,
  courseTitle = 'Auto-Detected Class',
  facultyName,
  roomName,
  className = '',
}: SubjectDetectionCardProps) {
  return (
    <div className={`p-3 rounded-2xl bg-success/8 border border-success/15 flex items-center gap-3 animate-scaleIn shadow-lg shadow-success/5 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success-light shrink-0">
        <HiOutlineAcademicCap className="w-4.5 h-4.5" />
      </div>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-success/15 text-success-light border border-success/25 uppercase tracking-wide">
            QR Auto-Detected
          </span>
          <span className="text-[10px] text-text-muted font-bold tracking-wide uppercase">
            {courseCode}
          </span>
        </div>
        
        <h5 className="text-xs font-black text-text-primary mt-1 truncate">
          {courseTitle}
        </h5>
        
        {(facultyName || roomName) && (
          <p className="text-[9px] text-text-muted mt-0.5 font-semibold">
            {facultyName && `Faculty: ${facultyName}`}
            {facultyName && roomName && ' • '}
            {roomName && `Room: ${roomName}`}
          </p>
        )}
      </div>

      <div className="flex items-center text-success-light pr-1 shrink-0">
        <HiOutlineCheckCircle className="w-5 h-5 animate-pulse" />
      </div>
    </div>
  );
}
