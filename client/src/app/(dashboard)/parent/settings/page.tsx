'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';

export default function ParentSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your parent profile and notification preferences.</p>
      </div>

      <Card glow className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <HiOutlineCog6Tooth className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Settings Configurator Offline</h3>
        <p className="text-text-secondary mt-2 max-w-sm">
          Profile settings and notification preferences for parents are currently locked by the institution admin. Please contact support if you need to update your phone number.
        </p>
      </Card>
    </div>
  );
}
