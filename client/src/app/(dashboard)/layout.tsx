'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { AIChatbot } from '@/components/ui/AIChatbot';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-text-secondary tracking-wider">
            Securing connection...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Route pushes to login
  }

  return (
    <div className="flex-1 min-h-screen flex bg-bg-primary text-text-primary">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content pane */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-6 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary cursor-pointer border border-border"
            >
              ☰
            </button>
            <h2 className="font-heading font-extrabold text-base text-text-primary tracking-tight">
              {user.collegeName || 'USCDLE Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-text-primary">{user.name}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Inner page content scrollable */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>

        {/* Global Floating AI Chatbot Assistant */}
        <AIChatbot />
      </div>
    </div>
  );
}
