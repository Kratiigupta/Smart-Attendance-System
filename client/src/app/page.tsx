'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../components/ui/Card.js';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-bg-primary">
      {/* Background glow graphics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-secondary/10 blur-[180px]" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-3xl leading-none">🎓</span>
          <span className="font-heading font-extrabold tracking-wider gradient-text text-xl">
            USCDLE
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-text-secondary hover:text-text-primary transition duration-150"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-primary/20 transition duration-150"
          >
            Register College
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center justify-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-light animate-fadeIn">
          <span>✨</span> Aligned with NEP 2020 Framework
        </div>
        
        <h1 className="font-heading font-black text-4xl md:text-6xl tracking-tight leading-tight max-w-4xl text-text-primary animate-fadeIn">
          Unified Smart Campus & <br />
          <span className="gradient-text">Digital Learning Ecosystem</span>
        </h1>

        <p className="text-text-secondary max-w-2xl text-sm md:text-base leading-relaxed animate-fadeIn">
          A high-performance campus automation suite featuring smart attendance (QR, Face, Wi-Fi), 
          AI-driven timetable generator, FYUP/ITEP academic curriculum compliance, and lightweight offline rural learning modules.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-4 animate-fadeIn">
          <Link
            href="/register"
            className="bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition duration-200"
          >
            Onboard Your College
          </Link>
          <Link
            href="/login"
            className="glass hover:bg-bg-hover hover:border-border-light text-text-primary px-7 py-3 rounded-xl font-bold transition duration-200"
          >
            Sign In Portal
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 text-left stagger-children">
          <Card title="⚡ Smart Attendance" subtitle="Multi-Modal verification">
            <p className="text-xs text-text-muted mt-2">
              Integrated Face Recognition verification, localized Wi-Fi check-ins, and dynamic QR rotation for tamper-proof records.
            </p>
          </Card>

          <Card title="🤖 AI Timetable" subtitle="NEP 2020 Compliant">
            <p className="text-xs text-text-muted mt-2">
              Automated scheduler matching lecturer workloads, students course tracks, infrastructure constraints, and batch constraints.
            </p>
          </Card>

          <Card title="🌐 Rural Offline Hub" subtitle="PWA Support & Sync">
            <p className="text-xs text-text-muted mt-2">
              Enables offline academic progress monitoring, content syncing, and low-bandwidth accessibility for rural schools.
            </p>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center text-xs text-text-muted border-t border-border/20">
        © {new Date().getFullYear()} USCDLE Platform. Empowering higher education automation.
      </footer>
    </div>
  );
}
