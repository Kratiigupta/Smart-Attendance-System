'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  HiOutlineBellAlert,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCreditCard,
  HiOutlineCalendarDays,
  HiOutlineAcademicCap,
  HiOutlineEnvelopeOpen,
  HiOutlineTrash,
  HiOutlineCheck,
} from 'react-icons/hi2';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Attendance' | 'Fees' | 'Timetable' | 'Academic';
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionLink?: string;
  actionText?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Attendance Shortage Alert',
    message: 'Your attendance in Data Structures Lab (CSC-201P) has dropped to 71%, which is below the minimum required 75% limit.',
    category: 'Attendance',
    timestamp: '2 hours ago',
    read: false,
    priority: 'high',
    actionLink: '/student/attendance',
    actionText: 'View My Attendance',
  },
  {
    id: 'n2',
    title: 'Outstanding Semester Fees',
    message: 'Hostel charges and Exam fees for Semester 3 are due. Please complete payment before the 15th June deadline to avoid late fees.',
    category: 'Fees',
    timestamp: '1 day ago',
    read: false,
    priority: 'medium',
    actionLink: '/student/fees',
    actionText: 'Pay Outstanding Fees',
  },
  {
    id: 'n3',
    title: 'Timetable Adjustment',
    message: 'Data Structures Lecture (CSC-201) on Wednesday has been moved from Slot 4 to Slot 2 (10:00 AM - 10:50 AM).',
    category: 'Timetable',
    timestamp: '2 days ago',
    read: true,
    priority: 'medium',
    actionLink: '/student/timetable',
    actionText: 'View Schedule',
  },
  {
    id: 'n4',
    title: 'Assignment Graded',
    message: 'Your practical assignment "BST Implementation" in Data Structures has been graded. Score: 9.5/10.',
    category: 'Academic',
    timestamp: '3 days ago',
    read: true,
    priority: 'low',
  },
];

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<string>('All');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    );
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter(
    (n) => filter === 'All' || n.category === filter
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Attendance':
        return <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-danger-light" />;
      case 'Fees':
        return <HiOutlineCreditCard className="w-5 h-5 text-warning-light" />;
      case 'Timetable':
        return <HiOutlineCalendarDays className="w-5 h-5 text-primary-light" />;
      case 'Academic':
        return <HiOutlineAcademicCap className="w-5 h-5 text-success-light" />;
      default:
        return <HiOutlineBellAlert className="w-5 h-5 text-text-primary" />;
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" size="xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning" size="xs">Important</Badge>;
      case 'low':
        return <Badge variant="default" size="xs">Update</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Notifications</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Keep track of attendance warnings, upcoming class schedule adjustments, and fee alerts.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<HiOutlineEnvelopeOpen className="w-4 h-4" />}
            onClick={markAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary p-4 rounded-2xl border border-border/40">
        <div className="flex bg-bg-elevated border border-border/40 p-0.5 rounded-xl">
          {(['All', 'Attendance', 'Fees', 'Timetable', 'Academic'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                filter === cat
                  ? 'bg-primary/20 text-primary-light'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {cat === 'All' ? 'All Alerts' : cat}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
          {unreadCount} UNREAD ALERTS
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                notif.read
                  ? 'bg-bg-secondary/40 border-border/10 opacity-70'
                  : 'bg-bg-secondary border-border/30 shadow-md relative overflow-hidden'
              }`}
            >
              {/* Left Accent indicator if unread */}
              {!notif.read && (
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    notif.priority === 'high'
                      ? 'bg-danger'
                      : notif.priority === 'medium'
                      ? 'bg-warning'
                      : 'bg-primary'
                  }`}
                />
              )}

              {/* Notification icon */}
              <div className="p-2.5 rounded-xl bg-bg-elevated border border-border/20 shrink-0">
                {getCategoryIcon(notif.category)}
              </div>

              {/* Message body */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-bold text-text-primary">{notif.title}</h3>
                  {getPriorityBadge(notif.priority)}
                  <span className="text-[9px] text-text-dim font-mono ml-auto">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-medium pr-8">{notif.message}</p>
                
                {/* Action button if available */}
                {notif.actionLink && notif.actionText && (
                  <div className="pt-2">
                    <Link href={notif.actionLink}>
                      <Button variant="ghost" size="xs" className="text-primary-light hover:text-primary p-0 h-auto">
                        {notif.actionText} →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Actions side */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1 text-text-muted hover:text-success-light hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
                    title="Mark as Read"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1 text-text-muted hover:text-danger-light hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete Alert"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-text-muted text-xs bg-bg-secondary/40 border border-border/10 rounded-2xl">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
