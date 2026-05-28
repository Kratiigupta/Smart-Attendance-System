'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  QrCode, 
  Calendar, 
  Database, 
  Cloud, 
  BarChart3, 
  ChevronRight 
} from 'lucide-react';

export default function LandingPage() {
  const [activeTagline, setActiveTagline] = useState(0);

  // Auto scroll taglines
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTagline((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const taglines = [
    "One Platform for Smarter Education",
    "Transforming Campuses Digitally",
    "Unified Smart Learning Ecosystem",
    "Learn Smart. Manage Smart.",
    "Future of Digital Campuses",
    "AI Powered Education Management",
    "Built for the Future of NEP Education"
  ];

  return (
    <div className="flex-1 flex flex-col py-8 md:py-16">
      {/* Hero Section */}
      <section className="relative z-20 max-w-7xl w-full mx-auto px-6 pb-12 flex flex-col items-center text-center justify-center gap-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary-light animate-fadeIn">
          <span>✨</span> Smart Education Ecosystem
        </div>
        
        <h1 className="font-heading font-black text-4xl md:text-6xl tracking-tight leading-[1.1] max-w-4xl text-text-primary animate-fadeIn stagger-children">
          Unified Smart Campus & <br />
          <span className="gradient-text">Digital Learning Ecosystem</span>
        </h1>

        <p className="text-text-secondary max-w-2xl text-sm md:text-base leading-relaxed animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          An all-in-one institutional administration and learning platform. Automate attendance tracking, 
          schedule timetables conflict-free via AI constraint solvers, and manage ERP details on a secure framework.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-2 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
          <Link href="/register">
            <Button size="lg" className="shadow-lg shadow-primary/25 font-bold" iconRight={<ChevronRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 max-w-6xl w-full mx-auto px-6 py-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-heading font-black text-text-primary tracking-tight">
            Academic Infrastructure Solved
          </h2>
          <p className="text-xs md:text-sm text-text-secondary max-w-xl mx-auto">
            Lightweight, responsive modules running on high-availability web services to bridge students, lecturers, and college operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glow className="bg-bg-card/45 border-border/40 hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary-light">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Smart Attendance</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Check-in securely using rotating dynamic QR codes, hardware device fingerprinting, and local camera facial validation.
              </p>
            </div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-4">Multi-Modal Sync</div>
          </Card>

          <Card glow className="bg-bg-card/45 border-border/40 hover:border-secondary/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary-light">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">AI Timetable Generator</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Generate optimized, conflict-free weekly schedules utilizing Google OR-Tools constraint solver algorithm models.
              </p>
            </div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-4">NEP 2020 Compliant</div>
          </Card>

          <Card glow className="bg-bg-card/45 border-border/40 hover:border-violet/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/25 flex items-center justify-center text-violet-light">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Unified ERP & Finance</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Securely manage admissions, departmental registers, fee schedules, hostel allocations, and library inventory in one ledger.
              </p>
            </div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-4">Administrative Hub</div>
          </Card>

          <Card glow className="bg-bg-card/45 border-border/40 hover:border-rose/40 transition-colors flex flex-col justify-between md:col-span-1">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose/10 border border-rose/25 flex items-center justify-center text-rose-light">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Rural Offline Mode</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                PWA-supported synchronization allows students in low-bandwidth regions to view timetables and logs offline.
              </p>
            </div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-4">Low-Bandwidth Optimization</div>
          </Card>

          <Card glow className="bg-bg-card/45 border-border/40 hover:border-cyan/40 transition-colors flex flex-col justify-between md:col-span-2">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/25 flex items-center justify-center text-cyan-light">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">Campus Analytics</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Track student turnout indexes, department loads, and fee collection rates via real-time interactive Recharts dashboards.
              </p>
            </div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-4">Data-Driven Administration</div>
          </Card>
        </div>
      </section>

      {/* Core Vision Section */}
      <section className="relative z-20 max-w-4xl w-full mx-auto px-6 py-14 bg-bg-secondary/20 rounded-3xl border border-border/30 mb-10">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">Core Vision</span>
        </div>
        <div className="relative max-w-3xl mx-auto px-10 py-6 min-h-[120px] flex items-center justify-center text-center">
          <span className="absolute left-0 top-0 text-5xl text-primary/30 font-serif select-none leading-none">“</span>
          <p 
            key={activeTagline} 
            className="text-lg md:text-2xl font-heading font-black tracking-tight gradient-text leading-relaxed animate-fadeIn px-4"
          >
            {taglines[activeTagline]}
          </p>
          <span className="absolute right-0 bottom-0 text-5xl text-primary/30 font-serif select-none leading-none">”</span>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {taglines.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTagline(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === activeTagline ? 'bg-primary w-5' : 'bg-border'}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
