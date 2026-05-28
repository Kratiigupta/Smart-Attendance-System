'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import { AreaChartCard, DonutChart, ChartLegend } from '@/components/charts/Charts';
import {
  HiOutlineAcademicCap, HiOutlineClipboardDocumentCheck,
  HiOutlineUserGroup, HiOutlineQrCode,
  HiOutlineClock, HiOutlineMagnifyingGlass, HiOutlineEnvelope,
  HiOutlineArrowsUpDown
} from 'react-icons/hi2';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';


const statusColors: Record<string, { text: string; badge: 'success' | 'primary' | 'default' | 'warning' }> = {
  completed: { text: 'Completed', badge: 'success' },
  active: { text: 'In Progress', badge: 'primary' },
  upcoming: { text: 'Upcoming', badge: 'default' },
};

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const facultyName = user?.name || 'Dr. Rajesh Kumar';
  const deptName = user?.facultyData?.department?.name || 'Computer Science';

  // Fetch real analytics from backend
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['facultyAnalytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/faculty');
      if (!res.success) throw new Error(res.message || 'Failed to fetch faculty analytics');
      return res.data;
    }
  });

  // Query sessions for today's schedule
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['facultySessions'],
    queryFn: async () => {
      const res = await api.get('/attendance/faculty');
      if (!res.success) throw new Error(res.message || 'Failed to fetch sessions');
      return res.data || [];
    }
  });

  // Query class logs
  const { data: classLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['classLogs'],
    queryFn: async () => {
      const res = await api.get('/attendance/logs');
      if (!res.success) throw new Error(res.message || 'Failed to fetch logs');
      return res.data || [];
    }
  });

  // State controls for student search / filters / sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWeak, setShowOnlyWeak] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  // Handle student alerts
  const handleAlertStudent = (name: string) => {
    showToast(`Attendance shortage warning sent to ${name}.`, 'success');
  };

  // Process today's schedule dynamically from sessions
  const todayClasses = sessions.slice(0, 4).map((session: any) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const timeStr = `${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    
    const attended = classLogs.filter((log: any) => 
      log.classSessionId && (log.classSessionId._id === session._id || log.classSessionId === session._id)
    ).length;

    return {
      _id: session._id,
      time: timeStr,
      course: session.courseId?.title || 'Unknown Subject',
      code: session.courseId?.code || 'N/A',
      room: session.roomName || 'LH-301',
      batch: 'CSE Students',
      students: 48,
      type: 'Lecture',
      status: session.status,
      attended: attended || 0
    };
  });

  const weakStudents = analytics?.weakStudents ?? [];
  const courseStats = analytics?.courseStats ?? [];
  const totalCourses = analytics?.totalCourses ?? 0;
  const totalStudents = analytics?.totalStudents ?? 0;
  const avgAttendance = analytics?.avgAttendance ?? '90.2%';
  const engagementScore = analytics?.engagementScore ?? 88;
  const weeklyAttendanceData = analytics?.weeklyAttendanceData ?? [];

  // Process weak students list based on search, filter, and sort order
  const processedStudents = weakStudents
    .filter((s: any) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWeak = !showOnlyWeak || s.attendance < 75;
      return matchesSearch && matchesWeak;
    })
    .sort((a: any, b: any) => {
      if (sortOrder === 'asc') return a.attendance - b.attendance;
      if (sortOrder === 'desc') return b.attendance - a.attendance;
      return 0;
    });

  const loading = analyticsLoading || sessionsLoading || logsLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-bg-secondary animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-bg-secondary animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-bg-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-bg-secondary animate-pulse rounded-2xl" />
          <div className="h-96 bg-bg-secondary animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Faculty Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Welcome back, {facultyName} • {deptName} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/faculty/start-class">
          <Button variant="primary" size="md" icon={<HiOutlineQrCode className="w-4 h-4" />}>
            Start Class
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="My Courses" value={totalCourses} icon={HiOutlineAcademicCap} color="primary" subtitle="This semester" />
        <StatCard title="Total Students" value={totalStudents} icon={HiOutlineUserGroup} color="secondary" subtitle="Across all courses" />
        <StatCard title="Avg Attendance" value={avgAttendance} icon={HiOutlineClipboardDocumentCheck} color="success" trend={{ value: 2.1, isUp: true }} />
        <StatCard title="Classes Today" value={todayClasses.length} icon={HiOutlineClock} color="accent" subtitle="Active roster tracking" />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Columns (Today's Schedule & Student Analytics) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Schedule Card */}
          <Card title="Today's Schedule" subtitle="Your classes for today" noPadding>
            <div className="divide-y divide-border/15">
              {todayClasses.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No sessions created yet today. Click "Start Class" to initialize one.
                </div>
              ) : (
                todayClasses.map((cls: any, i: number) => (
                  <div key={i} className="px-5 py-3.5 hover:bg-bg-hover/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-center shrink-0 mt-0.5">
                          <span className="text-[10px] text-text-muted block">{cls.time.split('-')[0].trim()}</span>
                          <span className="text-[8px] text-text-dim">to {cls.time.split('-')[1].trim()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-primary">{cls.course}</span>
                            <Badge variant={statusColors[cls.status].badge} size="xs" dot pulse={cls.status === 'active'}>
                              {statusColors[cls.status].text}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-text-muted mt-0.5">{cls.code} • {cls.room} • {cls.batch}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" size="xs">{cls.type}</Badge>
                            <span className="text-[10px] text-text-dim">{cls.students} students</span>
                          </div>
                        </div>
                      </div>
                      {cls.status === 'completed' && (
                        <div className="text-right">
                          <span className="text-sm font-bold text-success-light">{cls.attended}/{cls.students}</span>
                          <p className="text-[9px] text-text-dim">present</p>
                        </div>
                      )}
                      {cls.status === 'active' && (
                        <Link href="/faculty/start-class">
                          <Button variant="primary" size="xs" icon={<HiOutlineQrCode className="w-3 h-3" />}>Live QR</Button>
                        </Link>
                      )}
                      {cls.status === 'upcoming' && (
                        <Link href="/faculty/start-class">
                          <Button variant="outline" size="xs">Start</Button>
                        </Link>
                      )}
                    </div>
                    {cls.status !== 'upcoming' && cls.attended > 0 && (
                      <ProgressBar value={cls.attended} max={cls.students} color={cls.attended / cls.students > 0.85 ? 'success' : 'warning'} size="xs" className="mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Student Analytics & Alerts Widget */}
          <Card title="Student Attendance Monitor" subtitle="Track and alert students with attendance issues">
            {/* Search/Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-3 border-b border-border/15">
              <div className="relative flex-1 max-w-xs">
                <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-bg-secondary border border-border/40 rounded-xl text-[11px] focus:outline-none focus:border-primary text-text-primary placeholder:text-text-dim"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyWeak}
                    onChange={(e) => setShowOnlyWeak(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer bg-bg-input"
                  />
                  <span>Show Weak (&lt;75%)</span>
                </label>

                <div className="flex items-center gap-1">
                  <HiOutlineArrowsUpDown className="w-3.5 h-3.5 text-text-muted" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-bg-secondary border border-border/40 rounded-xl text-[10px] font-semibold text-text-secondary px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="none">Sort: Default</option>
                    <option value="asc">Attendance: Low-to-High</option>
                    <option value="desc">Attendance: High-to-Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Body */}
            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {processedStudents.length > 0 ? (
                processedStudents.map((student: any, idx: number) => {
                  const isWeak = student.attendance < 75;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-bg-secondary/35 border border-border/10 rounded-xl hover:border-border/20 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-primary">{student.name}</div>
                        <div className="text-[9px] text-text-dim">{student.rollNo} • {student.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold ${isWeak ? 'text-danger-light' : 'text-success-light'}`}>
                            {student.attendance}%
                          </span>
                          <p className="text-[8px] text-text-dim">attendance</p>
                        </div>
                        {isWeak && (
                          <Button
                            variant="danger"
                            size="xs"
                            icon={<HiOutlineEnvelope className="w-3 h-3" />}
                            onClick={() => handleAlertStudent(student.name)}
                            title="Send Warning Notification"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : showOnlyWeak ? (
                <div className="py-12 text-center text-text-muted text-xs flex flex-col items-center justify-center space-y-2">
                  <span className="text-2xl">🎉</span>
                  <div className="font-bold text-text-primary">No weak students found!</div>
                  <p className="text-[10px] text-text-dim">All students in your roster meet the 75% attendance criteria.</p>
                </div>
              ) : (
                <div className="py-12 text-center text-text-muted text-xs">
                  No matching student records found.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Columns (Charts & Metrics) */}
        <div className="space-y-4">
          <Card title="My Students" subtitle="Distribution by course">
            <DonutChart data={courseStats} height={160} centerValue={String(totalStudents)} centerLabel="Total" />
            <ChartLegend items={courseStats.map((c: any) => ({ label: c.name, color: c.color, value: String(c.value) }))} className="mt-3 justify-center" />
          </Card>

          {/* Class Engagement card */}
          <Card title="Class Engagement" subtitle="Average participation ratings">
            <div className="space-y-3 mt-3">
              {[
                { course: 'Data Structures', rate: engagementScore, status: 'High' },
                { course: 'Data Structures Lab', rate: Math.max(50, engagementScore - 6), status: 'Good' },
                { course: 'Algorithm Design', rate: Math.max(50, engagementScore - 12), status: 'Average' },
              ].map((c: any, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-text-secondary">{c.course}</span>
                    <span className="text-primary-light font-mono">{c.rate}% ({c.status})</span>
                  </div>
                  <ProgressBar value={c.rate} max={100} size="xs" color={c.rate > 90 ? 'success' : 'primary'} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Weekly Attendance" subtitle="Average across my courses">
            <AreaChartCard data={weeklyAttendanceData} dataKey="rate" color="#10b981" gradientId="facWeekly" height={120} className="mt-2" />
          </Card>
        </div>
      </div>
    </div>
  );
}
