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

import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

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

export default function StudentNotifications() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<string>('All');

  // Query notifications from database
  const { data: notifications = [], isLoading, refetch } = useQuery<NotificationItem[]>({
    queryKey: ['notificationsList'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      if (!res.success) throw new Error(res.message || 'Failed to load notifications');
      return res.data || [];
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/mark-all', {});
      if (res.success) {
        showToast('All notifications marked as read.', 'success');
        refetch();
      } else {
        showToast(res.message || 'Failed to update notifications.', 'error');
      }
    } catch (err) {
      showToast('Network error updating notifications.', 'error');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await api.put(`/notifications/${id}/read`, {});
      if (res.success) {
        refetch();
      } else {
        showToast(res.message || 'Failed to update notification.', 'error');
      }
    } catch (err) {
      showToast('Network error updating notification.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.success) {
        showToast('Notification deleted successfully.', 'success');
        refetch();
      } else {
        showToast(res.message || 'Failed to delete notification.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting notification.', 'error');
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-8 w-48 bg-bg-secondary animate-pulse rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-bg-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

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
