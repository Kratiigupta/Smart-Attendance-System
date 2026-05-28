'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { CircularProgress } from '@/components/ui/ProgressBar';
import {
  HiOutlineUserGroup,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
  HiOutlineDevicePhoneMobile,
} from 'react-icons/hi2';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  course: string;
  attendance: number;
  classesAttended: number;
  totalClasses: number;
  phone: string;
}

import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function FacultyStudents() {
  const { data: mockStudents = [], isLoading } = useQuery<StudentRecord[]>({
    queryKey: ['facultyStudents'],
    queryFn: async () => {
      const res = await api.get('/faculty/students');
      if (!res.success) throw new Error(res.message || 'Failed to fetch faculty students');
      return res.data || [];
    }
  });

  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Your attendance is currently below the required 75% threshold. Please meet Dr. Rajesh Kumar as soon as possible to discuss.');

  const courses = ['All', 'Data Structures', 'Data Structures Lab', 'Algorithm Design'];

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading enrolled students & class attendance metrics...
      </div>
    );
  }

  const filteredStudents = mockStudents.filter((student) => {
    const matchesCourse = selectedCourse === 'All' || student.course === selectedCourse;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesAttendance = true;
    if (attendanceFilter === 'Critical') {
      matchesAttendance = student.attendance < 75;
    } else if (attendanceFilter === 'Warning') {
      matchesAttendance = student.attendance >= 75 && student.attendance < 85;
    } else if (attendanceFilter === 'Good') {
      matchesAttendance = student.attendance >= 85;
    }

    return matchesCourse && matchesSearch && matchesAttendance;
  });

  const getAttendanceLabel = (rate: number) => {
    if (rate < 75) return { text: 'Critical', variant: 'danger' as const };
    if (rate < 85) return { text: 'Warning', variant: 'warning' as const };
    return { text: 'Good', variant: 'success' as const };
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Alert sent successfully to ${selectedStudent?.name} via Push Notification and Email.`);
    setIsAlertModalOpen(false);
  };

  const columns = [
    {
      header: 'Student',
      accessor: (row: StudentRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-white text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary">{row.name}</div>
            <div className="text-[10px] text-text-muted">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Roll Number',
      accessor: 'rollNo' as keyof StudentRecord,
    },
    {
      header: 'Course',
      accessor: 'course' as keyof StudentRecord,
    },
    {
      header: 'Attendance',
      accessor: (row: StudentRecord) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-text-primary">{row.attendance}%</span>
          <span className="text-[10px] text-text-dim">({row.classesAttended}/{row.totalClasses})</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: StudentRecord) => {
        const status = getAttendanceLabel(row.attendance);
        return (
          <Badge variant={status.variant} size="xs">
            {status.text}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: StudentRecord) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setSelectedStudent(row);
              setIsHistoryModalOpen(true);
            }}
          >
            History
          </Button>
          {row.attendance < 75 && (
            <Button
              variant="danger"
              size="xs"
              icon={<HiOutlineEnvelope className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedStudent(row);
                setIsAlertModalOpen(true);
              }}
              title="Alert Student"
            />
          )}
        </div>
      ),
    },
  ];

  // Stats calculations
  const totalEnrolled = mockStudents.length;
  const criticalCount = mockStudents.filter((s) => s.attendance < 75).length;
  const averageAttendance = totalEnrolled > 0 ? Math.round(
    mockStudents.reduce((acc, s) => acc + s.attendance, 0) / totalEnrolled
  ) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">My Students</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Monitor student attendance progress and send notifications for poor class counts.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Students Enrolled"
          value={totalEnrolled}
          icon={HiOutlineUserGroup}
          color="primary"
          subtitle="Across all courses"
        />
        <StatCard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          icon={HiOutlineCheckCircle}
          color="success"
          subtitle="Meets 75% standard"
        />
        <StatCard
          title="Critical Status (Below 75%)"
          value={criticalCount}
          icon={HiOutlineExclamationTriangle}
          color="danger"
          subtitle="Needs immediate attention"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-secondary p-4 rounded-2xl border border-border/40">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by name, roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-bg-elevated border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary placeholder:text-text-dim"
            />
          </div>

          {/* Course filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">Course</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 text-xs bg-bg-elevated border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="text-text-muted w-4 h-4" />
          <div className="flex bg-bg-elevated border border-border/40 p-0.5 rounded-xl">
            {(['All', 'Good', 'Warning', 'Critical'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setAttendanceFilter(filter)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  attendanceFilter === filter
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {filter === 'All' ? 'All Statuses' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        emptyMessage="No students match the current filters."
      />

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Student Attendance History"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Info Card */}
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">{selectedStudent.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{selectedStudent.rollNo} • {selectedStudent.course}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <HiOutlineEnvelope className="w-3.5 h-3.5" />
                    {selectedStudent.email}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <HiOutlineDevicePhoneMobile className="w-3.5 h-3.5" />
                    {selectedStudent.phone}
                  </span>
                </div>
              </div>
              <CircularProgress
                value={selectedStudent.attendance}
                size={70}
                strokeWidth={5}
                color={selectedStudent.attendance < 75 ? '#ef4444' : selectedStudent.attendance < 85 ? '#f59e0b' : '#10b981'}
              />
            </div>

            {/* Attendance Breakdowns */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Session Details</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {[
                  { date: '21 May 2026', time: '11:00 AM', status: 'Present', method: 'Face Recognition' },
                  { date: '19 May 2026', time: '11:00 AM', status: 'Present', method: 'QR + Wi-Fi' },
                  { date: '14 May 2026', time: '11:00 AM', status: 'Absent', method: '-' },
                  { date: '12 May 2026', time: '11:00 AM', status: 'Present', method: 'QR Code' },
                  { date: '07 May 2026', time: '11:00 AM', status: 'Absent', method: '-' },
                  { date: '05 May 2026', time: '11:00 AM', status: 'Present', method: 'Manual Override' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/40 border border-border/10">
                    <div>
                      <div className="text-xs font-bold text-text-primary">{log.date}</div>
                      <div className="text-[10px] text-text-dim">{log.time} • Verified via {log.method}</div>
                    </div>
                    <Badge variant={log.status === 'Present' ? 'success' : 'danger'} size="xs">
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/20 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(false)}>
                Close
              </Button>
              {selectedStudent.attendance < 75 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setIsHistoryModalOpen(false);
                    setIsAlertModalOpen(true);
                  }}
                >
                  Send Alert
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Send Attendance Alert"
      >
        <form onSubmit={handleSendAlert} className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Send an official attendance shortage warning to <strong className="text-text-primary">{selectedStudent?.name}</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary text-xs block">Alert Channel</label>
            <div className="flex gap-4 text-xs text-text-primary">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                <span>In-app Notification</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                <span>Email Address</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                <span>SMS Alert</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary text-xs block">Warning Message</label>
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              rows={4}
              required
              className="w-full p-3 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/20">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAlertModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Send Warning
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
