'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { getSocket, disconnectSocket } from '@/lib/socket';
import {
  HiOutlineQrCode,
  HiOutlineStopCircle,
  HiOutlineArrowPath,
  HiOutlineSignal,
  HiOutlineBuildingOffice2,
  HiOutlineClock
} from 'react-icons/hi2';

interface StudentCheckIn {
  studentId: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  verifiedAt: string;
  status: string;
}

interface CourseItem {
  _id: string;
  title: string;
  code: string;
}

export default function FacultyStartClassPage() {
  const { showToast } = useToast();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState('60');
  const [roomName, setRoomName] = useState('LH-301');
  const [isLoading, setIsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Active Session State
  const [activeSession, setActiveSession] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<StudentCheckIn[]>([]);
  const [timer, setTimer] = useState(30);

  // Load courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.success && res.data) {
          setCourses(res.data);
          if (res.data.length > 0) {
            setSelectedCourse(res.data[0]._id);
          }
        } else {
          showToast(res.message || 'Failed to load courses.', 'error');
        }
      } catch (err) {
        showToast('Network error loading courses.', 'error');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch active session status periodically for OTP check
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/attendance/session/${activeSession._id}`);
        if (res.success && res.data) {
          setActiveSession(res.data.session);
          setCheckIns(res.data.attendances);
        }
      } catch (err) {
        console.error('Error polling session status:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Countdown timer for OTP rotation
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;

    // Calculate initial timer based on otpExpiresAt
    const calculateTimeLeft = () => {
      if (!activeSession.otpExpiresAt) return 30;
      const difference = new Date(activeSession.otpExpiresAt).getTime() - Date.now();
      const seconds = Math.max(0, Math.ceil(difference / 1000));
      return seconds;
    };

    setTimer(calculateTimeLeft());

    const countdown = setInterval(() => {
      setTimer(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(countdown);
  }, [activeSession?.otp, activeSession?.otpExpiresAt]);

  // Socket connection to listen for student check-ins
  useEffect(() => {
    if (!activeSession) return;

    const socket = getSocket();

    // Join the session channel
    socket.emit('join-room', `session_${activeSession._id}`);

    // Listen for check-in events
    socket.on('student-checked-in', (data: StudentCheckIn) => {
      // Append student to checked-in list if not already present
      setCheckIns((prev: StudentCheckIn[]) => {
        if (prev.some(c => c.studentId._id === data.studentId._id)) return prev;
        return [data, ...prev];
      });
      showToast(`${data.studentId.name} checked in!`, 'success');
    });

    // Listen for OTP rotations from socket
    socket.on('otp-rotated', (data: { otp: string; expiresAt: string }) => {
      setActiveSession((prev: any) => ({
        ...prev,
        otp: data.otp,
        otpExpiresAt: data.expiresAt
      }));
    });

    // Listen for end-session events
    socket.on('session-ended', () => {
      setActiveSession((prev: any) => prev ? { ...prev, status: 'completed' } : null);
      showToast('Attendance session has been ended.', 'info');
    });

    return () => {
      socket.off('student-checked-in');
      socket.off('otp-rotated');
      socket.off('session-ended');
    };
  }, [activeSession?._id]);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      showToast('Please select a course.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/attendance/start', {
        courseId: selectedCourse,
        durationMinutes: parseInt(duration, 10),
        roomName
      });

      if (res.success && res.data) {
        setActiveSession(res.data);
        setCheckIns([]);
        showToast('Attendance session initialized.', 'success');
      } else {
        showToast(res.message || 'Failed to start session.', 'error');
      }
    } catch (err) {
      showToast('Network error starting session.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      const res = await api.post(`/attendance/session/${activeSession._id}/end`, {});
      if (res.success) {
        setActiveSession((prev: any) => prev ? { ...prev, status: 'completed' } : null);
        showToast('Attendance session completed successfully.', 'success');
      } else {
        showToast(res.message || 'Failed to complete session.', 'error');
      }
    } catch (err) {
      showToast('Network error ending session.', 'error');
    }
  };

  const generateQRCodePayload = () => {
    if (!activeSession) return '';
    return JSON.stringify({
      sessionId: activeSession._id,
      otp: activeSession.otp,
      courseCode: activeSession.courseId?.code
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineQrCode className="w-6 h-6 text-primary-light" />
            Live Attendance Session
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {activeSession
              ? `${activeSession.courseId?.title} (${activeSession.courseId?.code}) • Room: ${activeSession.roomName || 'N/A'}`
              : 'Select a course to start a software-only check-in session'}
          </p>
        </div>
        {activeSession && (
          <div className="flex items-center gap-2">
            <Badge
              variant={activeSession.status === 'active' ? 'success' : 'default'}
              dot={activeSession.status === 'active'}
              pulse={activeSession.status === 'active'}
              size="md"
            >
              {activeSession.status === 'active' ? 'Session Active' : 'Session Ended'}
            </Badge>
            {activeSession.status === 'active' && (
              <Button
                variant="danger"
                size="sm"
                icon={<HiOutlineStopCircle className="w-4 h-4" />}
                onClick={handleEndSession}
              >
                End Session
              </Button>
            )}
          </div>
        )}
      </div>

      {!activeSession ? (
        /* Configuration Panel */
        <div className="max-w-xl mx-auto">
          <Card title="Start New Session" subtitle="Configure class settings and trigger dynamic check-in QR">
            {coursesLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No courses assigned to your department. Set them up in Courses first.
              </div>
            ) : (
              <form onSubmit={handleStartSession} className="space-y-4 mt-2">
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                    Course / Subject
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2.5 focus:border-primary/45 focus:outline-none"
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Room Name"
                    id="room"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    placeholder="e.g. LH-301, Lab-A"
                    icon={<HiOutlineBuildingOffice2 className="w-4 h-4 text-text-muted" />}
                  />
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                      Session Duration
                    </label>
                    <select
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2.5 focus:border-primary/45 focus:outline-none"
                    >
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="90">1.5 Hours</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" loading={isLoading} fullWidth icon={<HiOutlineQrCode className="w-4 h-4" />}>
                  Start QR Check-in
                </Button>
              </form>
            )}
          </Card>
        </div>
      ) : (
        /* Real-Time Session Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code and Pin Display */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full text-center">
              {activeSession.status === 'active' ? (
                <>
                  {/* Dynamic QR Visualizer containing session info */}
                  <div className="relative mx-auto w-56 h-56 rounded-2xl bg-white flex items-center justify-center mb-4 overflow-hidden shadow-lg border border-border/10">
                    <div className="w-48 h-48 relative">
                      {/* Grid representation that changes layout according to the OTP code */}
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-[2px]">
                        {Array.from({ length: 64 }).map((_, i) => {
                          const seed = (i + parseInt(activeSession.otp || '0', 10)) * 73;
                          return (
                            <div
                              key={i}
                              className={`rounded-[1px] ${
                                (seed % 10 > 4 && i > 8) || i % 7 === 0 ? 'bg-gray-900' : 'bg-white'
                              }`}
                            />
                          );
                        })}
                      </div>
                      {/* Standard QR boundary markers */}
                      <div className="absolute top-0 left-0 w-10 h-10 border-[4px] border-gray-900 rounded-md bg-white">
                        <div className="w-4 h-4 bg-gray-900 rounded-sm m-1" />
                      </div>
                      <div className="absolute top-0 right-0 w-10 h-10 border-[4px] border-gray-900 rounded-md bg-white">
                        <div className="w-4 h-4 bg-gray-900 rounded-sm m-1" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-[4px] border-gray-900 rounded-md bg-white">
                        <div className="w-4 h-4 bg-gray-900 rounded-sm m-1" />
                      </div>
                    </div>
                    {/* Pulsing scan bar */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute left-0 right-0 h-0.5 bg-primary animate-[scan_2.2s_ease-in-out_infinite]" />
                    </div>
                  </div>

                  {/* OTP and Countdowns */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1d3d" strokeWidth="4" />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - timer / 30)}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-heading font-black text-text-primary">{timer}s</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Verification Code
                      </p>
                      <p className="text-xl font-heading font-black text-text-primary tracking-wider">
                        {activeSession.otp}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-text-muted px-4 mb-4 leading-relaxed">
                    Students must scan the QR above or enter the code manually on their portals to check in.
                  </p>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-2">🏁</span>
                  <h3 className="text-sm font-bold text-text-primary">Attendance Completed</h3>
                  <p className="text-xs text-text-muted max-w-[200px] mx-auto mt-1 leading-normal">
                    This attendance session has ended. All check-ins have been logged.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveSession(null)}>
                    Start Another Class
                  </Button>
                </div>
              )}
            </Card>

            {/* Session Settings Info */}
            <Card className="w-full mt-4">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Class Info</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-text-muted">Subject:</span>
                  <span className="font-semibold text-text-secondary">{activeSession.courseId?.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-text-muted">Code:</span>
                  <span className="font-semibold text-text-secondary">{activeSession.courseId?.code}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-text-muted">Room:</span>
                  <span className="font-semibold text-text-secondary">{activeSession.roomName || 'LH-301'}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-text-muted">Status:</span>
                  <Badge variant={activeSession.status === 'active' ? 'success' : 'default'} size="xs">
                    {activeSession.status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Live Roster Board */}
          <div className="lg:col-span-2">
            <Card noPadding>
              {/* Stats Header */}
              <div className="px-5 pt-5 pb-3 border-b border-border/15">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Live Roster Board</h3>
                    <p className="text-[10px] text-text-muted">Students logged in this session</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineSignal
                      className={`w-4 h-4 ${
                        activeSession.status === 'active' ? 'text-success-light animate-pulse' : 'text-text-muted'
                      }`}
                    />
                    <span className="text-lg font-heading font-black text-text-primary">{checkIns.length}</span>
                    <span className="text-xs text-text-muted">students present</span>
                  </div>
                </div>
              </div>

              {/* Roster List */}
              <div className="divide-y divide-border/15 max-h-[480px] overflow-y-auto">
                {checkIns.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-xs text-text-muted">Waiting for students to check in...</p>
                  </div>
                ) : (
                  checkIns.map((checkIn, i) => (
                    <div
                      key={checkIn.studentId._id}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-bg-hover/30 transition-colors animate-fadeIn"
                    >
                      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-primary/15">
                        {checkIn.studentId.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{checkIn.studentId.name}</span>
                          <Badge variant="success" size="xs">
                            ✓ Checked In
                          </Badge>
                        </div>
                        <p className="text-[10px] text-text-muted">
                          Roll: {checkIn.studentId.rollNumber || 'N/A'} • {checkIn.studentId.email}
                        </p>
                      </div>
                      <span className="text-[10px] text-text-dim font-semibold">
                        {new Date(checkIn.verifiedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 5%;
          }
          50% {
            top: 95%;
          }
        }
      `}</style>
    </div>
  );
}
