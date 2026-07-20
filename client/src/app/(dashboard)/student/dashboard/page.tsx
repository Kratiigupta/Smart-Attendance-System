'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';
import { AreaChartCard } from '@/components/charts/Charts';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import {
  HiOutlineClipboardDocumentCheck, HiOutlineCalendarDays,
  HiOutlineCreditCard, HiOutlineBookOpen, HiOutlineQrCode,
  HiOutlineAcademicCap, HiOutlineClock, HiOutlineSparkles,
  HiOutlinePlay, HiOutlineIdentification, HiOutlineArrowDownTray
} from 'react-icons/hi2';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceProgressRing } from '@/components/analytics/AttendanceProgressRing';
import { AttendanceStreak } from '@/components/attendance/AttendanceStreak';
import { OfflineSyncBanner } from '@/components/attendance/OfflineSyncBanner';
import { StatsSkeleton, CardSkeleton } from '@/components/ui/AttendanceSkeleton';


import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

import jsPDF from 'jspdf';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showIdCard, setShowIdCard] = useState(false);

  // Fetch real analytics from backend
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['studentAnalytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/student');
      if (!res.success) throw new Error(res.message || 'Failed to fetch student analytics');
      return res.data;
    }
  });

  // Fetch real timetable
  const { data: timetable = [], isLoading: timetableLoading } = useQuery<any[]>({
    queryKey: ['studentTimetable'],
    queryFn: async () => {
      const res = await api.get('/timetable/student');
      if (!res.success) throw new Error(res.message || 'Failed to fetch timetable');
      return res.data || [];
    }
  });

  const studentName = user?.name || 'Amit Kumar';
  const semester = user?.studentData?.semester ? `Sem-${user.studentData.semester}` : 'Sem-3';
  const deptCode = user?.studentData?.department?.code || 'CSE';
  const rollNo = user?.studentData?.rollNumber || 'CSE-2023-045';

  const handleJoinClass = () => {
    const activeClass = todaySchedule.find(s => s.status === 'active');
    if (activeClass?.meetingUrl) {
      window.open(activeClass.meetingUrl, '_blank');
    } else {
      showToast('No active class meeting link available at this moment.', 'warning');
    }
  };

  const handleDownloadIdCard = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85.6, 53.98] // Standard CR80 ID Card size
    });

    doc.setFillColor(30, 41, 59); // bg-secondary
    doc.rect(0, 0, 54, 86, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.collegeName?.toUpperCase() || 'SMARTEDU CAMPUS', 27, 10, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(studentName, 27, 45, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`${deptCode} • ${semester}`, 27, 50, { align: 'center' });
    
    doc.text(`ID: ${rollNo}`, 5, 65);
    doc.text('Valid: 2023 - 2027', 5, 70);
    
    doc.setDrawColor(16, 185, 129); // success green
    doc.setTextColor(16, 185, 129);
    doc.text('ACTIVE STUDENT', 5, 80);

    doc.save(`${rollNo}_ID_Card.pdf`);
    
    showToast('Student ID card PDF downloaded successfully!', 'success');
    setShowIdCard(false);
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = new Date().getDay();
  const queryDay = currentDayIndex === 0 ? 'Monday' : daysOfWeek[currentDayIndex];

  const todaySlots = timetable.filter((slot: any) => slot.day === queryDay);

  const todaySchedule = todaySlots.length > 0 ? todaySlots.map((slot: any, idx: number) => {
    let status = 'upcoming';
    if (idx === 0) status = 'completed';
    else if (idx === 1) status = 'active';

    return {
      time: slot.time,
      course: slot.courseName,
      code: slot.courseCode,
      faculty: slot.faculty,
      room: slot.room,
      type: slot.type,
      status,
      meetingUrl: slot.meetingUrl
    };
  }) : [];

  // Generate dynamic free period suggestions based on todaySchedule gaps
  let freePeriodSuggestions: any[] = [];
  if (todaySchedule.length === 0) {
    freePeriodSuggestions.push({ icon: '🏖️', title: 'Free Day', subject: 'No scheduled classes today', duration: 'All Day', type: 'Break' });
  } else if (todaySchedule.length < 3) {
    freePeriodSuggestions.push({ icon: '📚', title: 'Self Study', subject: 'Library available', duration: 'Afternoon', type: 'Study' });
  }

  if (analyticsLoading || timetableLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-bg-secondary animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-bg-secondary animate-pulse rounded-lg" />
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
          </div>
          <div className="space-y-6">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const overallPct = analytics?.overallPct ?? 100;
  const totalAttended = analytics?.totalAttended ?? 0;
  const totalAbsent = analytics?.totalAbsent ?? 0;
  const streak = analytics?.streak ?? 12;
  const coursesList = analytics?.courses ?? [];
  const weeklyTrend = analytics?.weeklyTrend ?? [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Welcome back, {studentName} • {deptCode} {semester} • Roll: {rollNo}
          </p>
        </div>
      </div>

      {/* Offline Sync Banner */}
      <OfflineSyncBanner pendingCount={3} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Overall Attendance" value={`${overallPct}%`} icon={HiOutlineClipboardDocumentCheck} color="success" subtitle={`${totalAttended} Present / ${totalAbsent} Absent`} />
        <StatCard title="Enrolled Courses" value={coursesList.length} icon={HiOutlineAcademicCap} color="primary" subtitle="Sem 3 FYUP" />
        <StatCard title="Classes Today" value={todaySlots.length} icon={HiOutlineClock} color="accent" subtitle={todaySlots.length > 0 ? "Check your schedule" : "No classes today"} />
        <StatCard title="Pending Fees" value="₹24,500" icon={HiOutlineCreditCard} color="danger" subtitle="Due by June 15, 2026" />
      </div>

      {/* Quick Actions Panel */}
      <Card title="Quick Actions" subtitle="One-click triggers for daily student tasks">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
          <Link href="/student/mark-attendance" className="block">
            <button 
              className="w-full p-3 rounded-xl border border-border/30 bg-bg-secondary hover:bg-bg-hover hover:border-primary/50 text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between h-24 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light">
                <HiOutlineQrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary group-hover:text-primary-light">Smart Check-In</p>
                <p className="text-[9px] text-text-muted">Register check-in</p>
              </div>
            </button>
          </Link>

          <button
            onClick={() => setShowIdCard(true)}
            className="w-full p-3 rounded-xl border border-border/30 bg-bg-secondary hover:bg-bg-hover hover:border-secondary/50 text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between h-24 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary-light">
              <HiOutlineIdentification className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary group-hover:text-secondary-light">Download ID Card</p>
              <p className="text-[9px] text-text-muted">Digital Student ID</p>
            </div>
          </button>

          <Link href="/student/learn" className="block">
            <button 
              className="w-full p-3 rounded-xl border border-border/30 bg-bg-secondary hover:bg-bg-hover hover:border-violet/50 text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between h-24 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <div className="w-8 h-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center text-violet-light">
                <HiOutlineBookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary group-hover:text-violet-light">View Notes</p>
                <p className="text-[9px] text-text-muted">Browse Learning Hub</p>
              </div>
            </button>
          </Link>

          <button
            onClick={handleJoinClass}
            className="w-full p-3 rounded-xl border border-border/30 bg-bg-secondary hover:bg-bg-hover hover:border-accent/50 text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between h-24 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-light">
              <HiOutlinePlay className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary group-hover:text-accent-light">Join Class</p>
              <p className="text-[9px] text-text-muted">Virtually attend live</p>
            </div>
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <Card title="Today's Timetable" subtitle="Daily schedule & classroom locations" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {todaySchedule.map((cls, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                  cls.status === 'active'
                    ? 'border-primary bg-primary/8 shadow-md shadow-primary/5'
                    : 'border-border/30 bg-bg-secondary/40 hover:border-border-light'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-text-dim uppercase font-extrabold tracking-wide">{cls.code} • Room {cls.room}</span>
                    <Badge
                      variant={cls.status === 'completed' ? 'success' : cls.status === 'active' ? 'primary' : 'default'}
                      size="xs" dot={cls.status === 'active'} pulse={cls.status === 'active'}
                    >
                      {cls.status === 'completed' ? '✓ Done' : cls.status === 'active' ? 'Now' : 'Later'}
                    </Badge>
                  </div>
                  <h3 className="text-xs font-black text-text-primary mt-2 line-clamp-1">{cls.course}</h3>
                  <p className="text-[10px] text-text-secondary mt-1">Instructor: <span className="font-bold">{cls.faculty}</span></p>
                </div>
                <div className="flex items-center justify-between border-t border-border/10 pt-2.5 mt-2">
                  <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-bold">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    {cls.time}
                  </div>
                  {cls.status === 'active' && (
                    <Link href="/student/mark-attendance">
                      <Button variant="primary" size="xs" icon={<HiOutlineQrCode className="w-3.5 h-3.5" />}>Scan QR</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Column 2: Attendance Overview & Suggestions */}
        <div className="space-y-6">
          {/* Attendance Overview Card */}
          <Card title="Attendance Status" subtitle="Overall status & monthly statistics">
            <div className="flex flex-col items-center justify-center py-2 bg-bg-secondary/40 border border-border/10 rounded-2xl mb-4">
              <AttendanceProgressRing 
                value={overallPct} 
                size={120} 
                strokeWidth={8} 
                sublabel={`${totalAttended} Present / ${totalAbsent} Absent`}
              />
            </div>
            
            {analytics?.lowAttendancePrediction && (
              <div className={`p-2.5 rounded-xl text-[10px] font-bold text-center mb-4 leading-normal ${overallPct < 75 ? 'bg-danger/15 text-danger-light border border-danger/10' : 'bg-success/15 text-success-light border border-success/10'}`}>
                💡 {analytics.lowAttendancePrediction}
              </div>
            )}

            <p className="text-[10px] font-bold text-text-secondary mb-1">Weekly Average Trend</p>
            <AreaChartCard data={weeklyTrend} dataKey="rate" color="#10b981" gradientId="stuAtt" height={90} className="mt-1" />
          </Card>

          {/* Attendance Streak */}
          <AttendanceStreak streakDays={streak} longestStreak={streak + 3} />

          {/* Free Period Suggestions */}
          <Card
            title="Free Period Suggestions"
            subtitle="AI customized suggestions"
            headerRight={<HiOutlineSparkles className="w-4 h-4 text-accent-light" />}
          >
            <div className="space-y-2.5 mt-2">
              {freePeriodSuggestions.length === 0 ? (
                <div className="py-4 text-center text-xs text-text-muted">
                  No free periods available today.
                </div>
              ) : (
                freePeriodSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-secondary/40 border border-border/15 hover:bg-bg-hover/50 cursor-pointer transition-all hover:border-primary/20"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-text-primary truncate">{s.title}</p>
                      <p className="text-[9px] text-text-muted">{s.subject} • {s.duration}</p>
                    </div>
                    <Badge variant="violet" size="xs">{s.type}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Course-wise Attendance */}
      <Card title="Course-wise Attendance" subtitle="Subject-wise check-in standings">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {coursesList.map((course: any) => {
            const pct = Math.round((course.attended / course.total) * 100);
            return (
              <div key={course.code} className="rounded-xl border border-border/20 p-4 hover:border-border-light bg-bg-card/30 transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: course.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-text-primary line-clamp-1">{course.name}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{course.code} • {course.faculty}</p>
                  </div>
                  <CircularProgress value={pct} size={42} strokeWidth={4.5} color={pct >= 75 ? '#10b981' : '#ef4444'} />
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px]">
                  <Badge variant={course.type === 'DSC' ? 'primary' : course.type === 'Minor' ? 'secondary' : 'violet'} size="xs">
                    {course.type}
                  </Badge>
                  <span className="text-text-dim font-semibold">{course.attended}/{course.total} classes</span>
                </div>
                <ProgressBar value={course.attended} max={course.total} color={pct >= 75 ? 'success' : 'danger'} size="xs" className="mt-2.5" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Printable Digital Student ID Card Modal */}
      <Modal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        title="Student Digital ID Card"
        size="md"
      >
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-80 p-5 rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-card border border-border-light relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[5px] gradient-primary" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            
            <p className="text-[8px] font-black tracking-[0.2em] text-text-muted uppercase mb-4">{user?.collegeName || 'SMARTEDU CAMPUS'}</p>
            
            <div className="relative group mb-3">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm" />
              <img 
                src="/student_avatar.png" 
                alt="Student Portrait" 
                className="w-20 h-20 rounded-2xl object-cover border border-border bg-bg-elevated relative z-10 shadow-md"
              />
            </div>

            <h4 className="text-sm font-black text-text-primary">{studentName}</h4>
            <p className="text-[9px] text-text-muted font-bold tracking-wide uppercase mt-0.5">{deptCode} • {semester}</p>

            <div className="w-full border-t border-border/20 my-4" />

            <div className="w-full space-y-2 text-[10px] text-left text-text-secondary px-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Student ID:</span>
                <span className="font-bold text-text-primary">{rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Validity:</span>
                <span className="font-bold text-text-primary">2023 - 2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-success-light font-bold">✓ Active Student</span>
              </div>
            </div>

            <div className="w-full bg-white/5 border border-border/20 rounded-lg p-2.5 flex flex-col items-center gap-1.5 mt-5">
              <div className="w-full h-8 flex justify-center items-center gap-0.5 overflow-hidden opacity-80">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-text-primary"
                    style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                  />
                ))}
              </div>
              <span className="text-[7px] font-mono text-text-muted tracking-widest">{rollNo}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowIdCard(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              icon={<HiOutlineArrowDownTray className="w-4 h-4" />}
              onClick={handleDownloadIdCard}
            >
              Print Card
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
