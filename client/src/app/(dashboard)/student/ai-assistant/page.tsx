'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { AIChatbot } from '@/components/ui/AIChatbot';
import { HiOutlineSparkles } from 'react-icons/hi2';

export default function StudentAIAssistantPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
          AI Study Assistant Workspace
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Ask syllabus doubts, review attendance targets, summarize notes, or plan your study calendar.
        </p>
      </div>

      <Card className="min-h-[400px] flex flex-col justify-center items-center text-center p-8 bg-bg-card/40 border-border/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />
        
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 z-10 animate-pulse">
          <HiOutlineSparkles className="w-8 h-8" />
        </div>
        
        <h2 className="text-sm font-bold text-text-primary mb-2 z-10">SmartEdu Campus Copilot is Active</h2>
        <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-6 z-10">
          Your personal chatbot is ready! Click the floating **AI bubble** in the bottom-right corner of the screen to chat, use voice prompts, or upload a PDF syllabus.
        </p>
      </Card>
    </div>
  );
}
