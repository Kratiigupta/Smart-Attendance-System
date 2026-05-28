'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if it's a dashboard route
  const isDashboard = 
    pathname.startsWith('/student') || 
    pathname.startsWith('/faculty') || 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/parent');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-bg-primary text-text-primary">
      {/* Background glow graphics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/8 blur-[180px] animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Persistent Full-Width Public Header */}
      <header className="relative z-30 w-full px-6 sm:px-12 h-20 flex items-center justify-between border-b border-border/40 bg-bg-primary/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src="/logo.png" alt="SmartEdu Campus Logo" className="h-16 w-auto object-contain cursor-pointer" />
          </Link>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-text-secondary hover:text-text-primary transition duration-150"
          >
            Login Portal
          </Link>
          <Link href="/register">
            <Button
              variant="primary"
              size="sm"
              className="shadow-md shadow-primary/20"
            >
              Onboard College
            </Button>
          </Link>
          <div className="border-l border-border/50 pl-4">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-20">
        {children}
      </main>

      {/* Persistent Public Footer */}
      <footer className="relative z-20 w-full bg-bg-secondary/70 border-t border-border/30 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Block */}
          <div className="space-y-4">
            <img src="/logo.png" alt="SmartEdu Campus Logo" className="h-14 w-auto object-contain" />
            <p className="text-[11px] text-text-secondary leading-relaxed max-w-[200px]">
              Modern automation suites bringing administrative excellence and learning integration together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Features</h4>
            <ul className="space-y-2 text-[11px] text-text-secondary">
              <li><Link href="/login" className="hover:text-text-primary transition-colors">Smart Attendance</Link></li>
              <li><Link href="/login" className="hover:text-text-primary transition-colors">AI constraint Solver</Link></li>
              <li><Link href="/login" className="hover:text-text-primary transition-colors">ERP Registers</Link></li>
              <li><Link href="/login" className="hover:text-text-primary transition-colors">Offline Rural Sync</Link></li>
            </ul>
          </div>

          {/* About / Contact */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Contact</h4>
            <ul className="space-y-2 text-[11px] text-text-secondary">
              <li><span className="flex items-center gap-1.5 text-text-secondary"><Mail className="w-3.5 h-3.5" /> smarteduxcampus@gmail.com</span></li>
              <li><span className="flex items-center gap-1.5 text-text-secondary">📞 9125709300</span></li>
              <li><span className="flex items-center gap-1.5 text-text-secondary">📍 Nawabganj, Unnao</span></li>
            </ul>
          </div>

          {/* Privacy / Security */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Compliance</h4>
            <ul className="space-y-2 text-[11px] text-text-secondary">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success-light" /> NEP 2020 Compliant</li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border/20 text-center text-[10px] text-text-muted">
          © {new Date().getFullYear()} SmartEdu Campus Platform. Empowering higher education automation.
        </div>
      </footer>
    </div>
  );
}
