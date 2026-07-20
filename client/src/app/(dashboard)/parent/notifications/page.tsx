'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HiOutlineBellAlert } from 'react-icons/hi2';

export default function ParentNotificationsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Notifications Inbox</h1>
        <p className="text-sm text-text-secondary mt-1">Updates and alerts regarding your child.</p>
      </div>

      <Card glow className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <HiOutlineBellAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">All Caught Up!</h3>
        <p className="text-text-secondary mt-2 max-w-sm">
          You currently have no unread notifications. Recent critical alerts will appear on your Dashboard.
        </p>
      </Card>
    </div>
  );
}
