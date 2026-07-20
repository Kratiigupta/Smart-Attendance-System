'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

export default function ParentAttendancePage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Child Attendance</h1>
        <p className="text-sm text-text-secondary mt-1">Detailed view of your child's attendance records.</p>
      </div>

      <Card glow className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <HiOutlineClipboardDocumentCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Detailed Records Coming Soon</h3>
        <p className="text-text-secondary mt-2 max-w-sm">
          A full day-by-day attendance log is being developed. For now, please check the Dashboard for the overall attendance summary and course-wise breakdown.
        </p>
      </Card>
    </div>
  );
}
