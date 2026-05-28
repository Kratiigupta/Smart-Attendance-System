'use client';

import React from 'react';
import { HiOutlineCheck, HiOutlineEllipsisHorizontal } from 'react-icons/hi2';

export type VerificationState = 'idle' | 'loading' | 'success' | 'failed';

interface VerificationStatusProps {
  cameraState: VerificationState;
  qrState: VerificationState;
  identityState: VerificationState;
  confirmationState: VerificationState;
  className?: string;
}

export function VerificationStatus({
  cameraState,
  qrState,
  identityState,
  confirmationState,
  className = '',
}: VerificationStatusProps) {
  
  const renderItem = (label: string, state: VerificationState, index: number) => {
    return (
      <div 
        key={label}
        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300
          ${state === 'success' 
            ? 'bg-success/5 border-success/15 text-success-light'
            : state === 'loading'
            ? 'bg-primary/5 border-primary/15 text-primary-light'
            : state === 'failed'
            ? 'bg-danger/5 border-danger/15 text-danger'
            : 'bg-bg-secondary/40 border-border/15 text-text-muted opacity-60'
          }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold text-text-dim font-mono">{index}.</span>
          <span className="text-xs font-semibold text-text-secondary">{label}</span>
        </div>

        <div className="shrink-0 flex items-center justify-center">
          {state === 'success' && (
            <div className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center text-success-light">
              <HiOutlineCheck className="w-3 h-3 stroke-[3]" />
            </div>
          )}
          {state === 'loading' && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {state === 'failed' && (
            <span className="text-xs">⚠️</span>
          )}
          {state === 'idle' && (
            <HiOutlineEllipsisHorizontal className="w-4 h-4" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1">
        Real-Time Verification Checklist
      </span>
      {renderItem('Camera Active', cameraState, 1)}
      {renderItem('QR Code Detected', qrState, 2)}
      {renderItem('Identity Verifying', identityState, 3)}
      {renderItem('Attendance Confirmed', confirmationState, 4)}
    </div>
  );
}
