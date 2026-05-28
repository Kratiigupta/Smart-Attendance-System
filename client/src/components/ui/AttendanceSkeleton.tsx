'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Shimmer({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-bg-elevated/70 rounded-xl relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
      
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-bg-secondary border border-border/30 space-y-4">
      <div className="space-y-2">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      <div className="space-y-2.5 pt-2">
        <Shimmer className="h-10 w-full" />
        <Shimmer className="h-10 w-full" />
        <Shimmer className="h-10 w-full" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-bg-secondary border border-border/30 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Shimmer className="h-3 w-2/3" />
            <Shimmer className="h-6 w-1/2" />
          </div>
          <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function GraphsSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-bg-secondary border border-border/30 space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5 flex-1">
          <Shimmer className="h-4 w-1/4" />
          <Shimmer className="h-3 w-1/3" />
        </div>
        <Shimmer className="h-6 w-16 rounded-xl" />
      </div>
      <Shimmer className="h-48 w-full rounded-2xl" />
    </div>
  );
}
