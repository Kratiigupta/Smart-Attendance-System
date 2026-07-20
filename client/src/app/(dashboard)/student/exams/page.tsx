'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HiOutlineAcademicCap, HiOutlineCalendarDays } from 'react-icons/hi2';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { jsPDF } from 'jspdf';

export default function StudentExamsPage() {
  const { user } = useAuth();
  const { data: exams = [], isLoading } = useQuery<any[]>({
    queryKey: ['studentExams'],
    queryFn: async () => {
      const res = await api.get('/exams');
      if (!res.success) throw new Error(res.message || 'Failed to fetch exams');
      return res.data || [];
    }
  });

  const handleDownloadAdmitCard = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SmartEdu Campus - Admit Card', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Name: ${user?.name || 'Student'}`, 20, 40);
    doc.text(`College ID: ${user?.collegeId || 'N/A'}`, 20, 50);
    doc.text('Examination: Term End Exams', 20, 60);
    
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    
    let y = 80;
    doc.setFontSize(10);
    doc.text('Schedule:', 20, 75);
    if (exams.length > 0) {
      exams.forEach((exam: any) => {
        doc.text(`- ${exam.subject} (${exam.code}) on ${exam.date} at ${exam.time} | Room: ${exam.room} | Seat: ${exam.seat}`, 20, y);
        y += 10;
      });
    } else {
      doc.text('No exams scheduled.', 20, y);
    }

    doc.save('SmartEdu_Admit_Card.pdf');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading datesheet and seating arrangements...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
            Exams & Assessments
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            View schedules, room allocations, and grades.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleDownloadAdmitCard}>
          Download Admit Card
        </Button>
      </div>

      <Card title="Theory Examination Datesheet (Sem-3)" subtitle="June 2026 Term End Exams" noPadding>
        <div className="divide-y divide-border/15">
          {exams.map((exam) => (
            <div key={exam._id || exam.id} className="px-5 py-4 hover:bg-bg-hover/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose/10 border border-rose/20 flex items-center justify-center text-rose-light shrink-0 mt-0.5">
                  <HiOutlineCalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary">{exam.subject} ({exam.code})</h3>
                  <p className="text-[10px] text-text-muted mt-1">
                    📅 {exam.date} • ⏰ {exam.time}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-secondary">
                <div className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border/30">
                  <span className="text-text-muted">Room: </span>
                  <span className="font-bold text-text-primary">{exam.room}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border/30">
                  <span className="text-text-muted">Seating: </span>
                  <span className="font-bold text-text-primary">{exam.seat}</span>
                </div>
                <Badge variant="primary" size="xs">Confirmed</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
