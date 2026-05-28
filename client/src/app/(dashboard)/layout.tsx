'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineBell, 
  HiOutlineChatBubbleLeftRight,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle
} from 'react-icons/hi2';
import { getSocket } from '@/lib/socket';

import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  read: boolean;
  timestamp: string;
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Fetch real notifications via TanStack Query
  const { data: notifications = [], refetch: refetchNotifications } = useQuery<NotificationItem[]>({
    queryKey: ['notificationsList'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      if (!res.success) throw new Error(res.message || 'Failed to fetch notifications');
      return res.data || [];
    },
    enabled: !!user
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#notifications-button') && !target.closest('#notifications-dropdown')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    
    const handleNewNotification = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      showToast(data.message || 'New notification received.', 'info');
    };

    const handleSecurityAlert = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      showToast(`WATCHDOG ALERT: ${data.message}`, 'warning');
    };

    socket.on('new-notification', handleNewNotification);
    socket.on('notification:new', handleNewNotification);
    socket.on('security:alert', handleSecurityAlert);



    return () => {
      socket.off('new-notification', handleNewNotification);
      socket.off('notification:new', handleNewNotification);
      socket.off('security:alert', handleSecurityAlert);
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user) {
        const role = user.role;
        
        const redirectToCorrectDashboard = (r: string) => {
          if (r === 'student') {
            router.push('/student/dashboard');
          } else if (r === 'faculty' || r === 'hod') {
            router.push('/faculty/dashboard');
          } else if (r === 'parent') {
            router.push('/parent/dashboard');
          } else {
            router.push('/admin/dashboard');
          }
        };

        if (pathname.startsWith('/student') && role !== 'student') {
          redirectToCorrectDashboard(role);
        } else if (pathname.startsWith('/faculty') && role !== 'faculty' && role !== 'hod') {
          redirectToCorrectDashboard(role);
        } else if (pathname.startsWith('/parent') && role !== 'parent') {
          redirectToCorrectDashboard(role);
        } else if (pathname.startsWith('/admin') && role !== 'college_admin' && role !== 'super_admin') {
          redirectToCorrectDashboard(role);
        }
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/mark-all', {});
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
        showToast('All notifications marked as read.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await api.put(`/notifications/${id}/read`, {});
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-text-secondary tracking-wider">
            Securing connection...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Route pushes to login
  }

  return (
    <div className="flex-1 min-h-screen flex bg-bg-primary text-text-primary">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content pane */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-6 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary cursor-pointer border border-border"
            >
              ☰
            </button>
            <h2 className="font-heading font-extrabold text-base text-text-primary tracking-tight hidden lg:block mr-4">
              {user.collegeName || 'SmartEdu Campus Portal'}
            </h2>

            {/* Topbar Search Bar */}
            <div className="relative max-w-xs w-full hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                <HiOutlineMagnifyingGlass className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search courses, attendance, roster..."
                className="w-full bg-bg-input border border-border/50 rounded-xl pl-9 pr-4 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/40 font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notifications-button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm relative ${
                  isNotificationsOpen
                    ? 'border-primary/50 bg-bg-hover text-text-primary'
                    : 'border-border/50 hover:border-primary/45 bg-bg-secondary hover:bg-bg-hover text-text-secondary hover:text-text-primary'
                }`}
                title="Notifications"
              >
                <HiOutlineBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div
                  id="notifications-dropdown"
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-bg-secondary border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-text-primary">Notifications</h3>
                      <p className="text-[10px] text-text-muted mt-0.5 font-semibold">
                        {unreadCount} unread alerts
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-primary-light hover:text-primary transition-colors cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[320px] overflow-y-auto divide-y divide-border/30">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkRead(notif.id)}
                          className={`p-3.5 hover:bg-bg-hover transition-colors flex items-start gap-3 cursor-pointer ${
                            notif.read ? 'opacity-65' : ''
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${
                            notif.category === 'Attendance'
                              ? 'bg-danger/10 text-danger border-danger/20'
                              : notif.category === 'Fees'
                                ? 'bg-success/10 text-success-light border-success/20'
                                : 'bg-primary/10 text-primary-light border-primary/20'
                          }`}>
                            {notif.category === 'Attendance' ? (
                              <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
                            ) : notif.category === 'Fees' ? (
                              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <HiOutlineInformationCircle className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-text-primary truncate">{notif.title}</span>
                              <span className="text-[9px] text-text-dim shrink-0 font-medium">{notif.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary leading-normal font-medium line-clamp-2">
                              {notif.message}
                            </p>
                          </div>

                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-[11px] text-text-muted font-bold">No new notifications</p>
                        <p className="text-[9px] text-text-dim mt-0.5">You are all caught up!</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-border/40 bg-bg-elevated/20 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        const notifPath = user.role === 'student' ? '/student/notifications' : user.role === 'faculty' || user.role === 'hod' ? '/faculty/dashboard' : '/admin/dashboard';
                        router.push(notifPath);
                      }}
                      className="text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors inline-block w-full py-1 cursor-pointer"
                    >
                      View All in Inbox →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chatbot Toggle Icon */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-chatbot'))}
              className="p-2 rounded-xl border border-border/50 hover:border-primary/45 bg-bg-secondary hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm"
              title="AI Assistant Chatbot"
            >
              <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-primary-light" />
            </button>

            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-text-primary">{user.name}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Inner page content scrollable */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
