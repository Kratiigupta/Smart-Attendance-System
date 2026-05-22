'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineChartBarSquare,
  HiOutlineQrCode,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUserGroup,
  HiOutlineBellAlert,
  HiOutlineHomeModern,
} from 'react-icons/hi2';
import { IconType } from 'react-icons';

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  badge?: string;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: HiOutlineHome },
  { label: 'Attendance', href: '/admin/attendance', icon: HiOutlineClipboardDocumentCheck, badge: 'Live' },
  { label: 'Timetable', href: '/admin/timetable', icon: HiOutlineCalendarDays },
  { label: 'Users', href: '/admin/users', icon: HiOutlineUsers },
  { label: 'Departments', href: '/admin/departments', icon: HiOutlineBuildingOffice2 },
  { label: 'Courses', href: '/admin/courses', icon: HiOutlineAcademicCap },
  { label: 'Rooms', href: '/admin/rooms', icon: HiOutlineHomeModern },
  { label: 'Admissions', href: '/admin/admissions', icon: HiOutlineDocumentText },
  { label: 'Fees', href: '/admin/fees', icon: HiOutlineCreditCard },
  { label: 'Hostel', href: '/admin/hostel', icon: HiOutlineBuildingOffice2 },
  { label: 'Analytics', href: '/admin/analytics', icon: HiOutlineChartBarSquare },
  { label: 'Settings', href: '/admin/settings', icon: HiOutlineCog6Tooth },
];

const facultyNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/faculty/dashboard', icon: HiOutlineHome },
  { label: 'Start Class', href: '/faculty/start-class', icon: HiOutlineQrCode, badge: 'QR' },
  { label: 'Attendance', href: '/faculty/attendance', icon: HiOutlineClipboardDocumentCheck },
  { label: 'My Timetable', href: '/faculty/timetable', icon: HiOutlineCalendarDays },
  { label: 'My Students', href: '/faculty/students', icon: HiOutlineUserGroup },
  { label: 'Leave', href: '/faculty/leave', icon: HiOutlineClipboardDocumentList },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: HiOutlineHome },
  { label: 'Mark Attendance', href: '/student/mark-attendance', icon: HiOutlineQrCode, badge: 'Scan' },
  { label: 'My Attendance', href: '/student/attendance', icon: HiOutlineClipboardDocumentCheck },
  { label: 'My Timetable', href: '/student/timetable', icon: HiOutlineCalendarDays },
  { label: 'My Fees', href: '/student/fees', icon: HiOutlineCreditCard },
  { label: 'Learn', href: '/student/learn', icon: HiOutlineBookOpen },
  { label: 'Notifications', href: '/student/notifications', icon: HiOutlineBellAlert },
];

function getNavItems(role?: string): NavItem[] {
  switch (role) {
    case 'college_admin':
    case 'super_admin':
      return adminNavItems;
    case 'faculty':
    case 'hod':
      return facultyNavItems;
    case 'student':
      return studentNavItems;
    default:
      return [];
  }
}

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = getNavItems(user?.role);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border/50 shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-lg">🎓</span>
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-sm tracking-widest gradient-text">
            USCDLE
          </span>
          <span className="text-[9px] text-text-muted font-medium tracking-wider uppercase">
            Smart Campus
          </span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-bg-elevated/50 border border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md shadow-primary/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-text-primary truncate">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
              {user?.role?.replace('_', ' ') || 'Role'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.15em] px-3 pt-2 pb-1.5">
          Navigation
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold
                transition-all duration-200 relative
                ${active
                  ? 'bg-primary/12 text-primary-light border border-primary/20 shadow-sm shadow-primary/5'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent'
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-sm shadow-primary/40" />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? 'text-primary-light' : 'text-text-muted group-hover:text-text-secondary'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`
                  text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider
                  ${item.badge === 'Live'
                    ? 'bg-success/15 text-success-light border border-success/20'
                    : item.badge === 'QR' || item.badge === 'Scan'
                      ? 'bg-accent/15 text-accent-light border border-accent/20'
                      : 'bg-primary/15 text-primary-light border border-primary/20'
                  }
                `}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom - Logout */}
      <div className="px-3 pb-4 pt-2 border-t border-border/30 shrink-0">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold
            text-text-muted hover:text-danger hover:bg-danger/8 border border-transparent
            hover:border-danger/15 transition-all duration-200 cursor-pointer group"
        >
          <HiOutlineArrowRightOnRectangle className="w-[18px] h-[18px] group-hover:text-danger transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-bg-secondary border-r border-border/40 z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 bottom-0 w-72 bg-bg-secondary border-r border-border/40
          z-50 flex flex-col transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
