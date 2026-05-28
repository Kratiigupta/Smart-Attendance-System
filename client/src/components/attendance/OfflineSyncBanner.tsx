'use client';

import React, { useState } from 'react';
import { HiOutlineCloudArrowUp, HiOutlineArrowPath } from 'react-icons/hi2';
import { useToast } from '@/components/ui/Toast';

interface OfflineSyncBannerProps {
  pendingCount: number;
  onSyncComplete?: () => void;
  className?: string;
}

export function OfflineSyncBanner({ pendingCount, onSyncComplete, className = '' }: OfflineSyncBannerProps) {
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [currentCount, setCurrentCount] = useState(pendingCount);

  if (currentCount === 0) return null;

  const handleSync = () => {
    setSyncing(true);
    showToast('Uploading offline check-ins to ERP server ledger...', 'info');

    // Simulate batch upload call latency
    setTimeout(() => {
      setSyncing(false);
      setCurrentCount(0);
      showToast('All offline check-ins successfully synchronized!', 'success');
      if (onSyncComplete) onSyncComplete();
    }, 2000);
  };

  return (
    <div className={`p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <HiOutlineCloudArrowUp className="w-4 h-4 animate-bounce" />
        </div>
        <div>
          <h5 className="font-bold text-text-primary">Rural Offline Mode Active</h5>
          <p className="text-[10px] text-text-secondary mt-0.5">
            ⚠️ **{currentCount} check-in record{currentCount > 1 ? 's' : ''}** pending cloud synchronization.
          </p>
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-600/50 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md shadow-amber-500/10 hover:shadow-amber-500/20"
      >
        <HiOutlineArrowPath className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
