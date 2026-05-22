'use client';

import React from 'react';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-h-screen flex items-center justify-center relative bg-bg-primary py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {children}
      </div>
    </div>
  );
}
