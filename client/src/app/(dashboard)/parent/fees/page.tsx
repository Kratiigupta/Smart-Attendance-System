'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HiOutlineCreditCard } from 'react-icons/hi2';

export default function ParentFeesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Fee Payments</h1>
        <p className="text-sm text-text-secondary mt-1">Track fee ledgers and download payment receipts.</p>
      </div>

      <Card glow className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <HiOutlineCreditCard className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Fee Module In Maintenance</h3>
        <p className="text-text-secondary mt-2 max-w-sm">
          The comprehensive fee tracking system is currently undergoing upgrades. Pending statuses are visible on your dashboard.
        </p>
      </Card>
    </div>
  );
}
