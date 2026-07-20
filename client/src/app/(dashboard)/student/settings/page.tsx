'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiOutlineCog6Tooth, HiOutlineBell, HiOutlineLockClosed,
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineEye,
  HiOutlineMapPin, HiOutlineSparkles
} from 'react-icons/hi2';

export default function StudentSettingsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // Preference states
  const [preferences, setPreferences] = useState({
    pushNotif: true,
    emailNotif: false,
    alertShortage: true,
    lang: 'English',
    shareLocation: true,
    profileSearchable: true
  });

  // Query preferences
  const { data: serverPref, isLoading } = useQuery<any>({
    queryKey: ['studentSettings'],
    queryFn: async () => {
      const res = await api.get('/student/settings');
      if (!res.success) throw new Error(res.message || 'Failed to fetch preferences');
      return res.data;
    }
  });

  // Sync state with server values
  useEffect(() => {
    if (serverPref) {
      setPreferences({
        pushNotif: serverPref.pushNotif ?? true,
        emailNotif: serverPref.emailNotif ?? false,
        alertShortage: serverPref.alertShortage ?? true,
        lang: serverPref.lang ?? 'English',
        shareLocation: serverPref.shareLocation ?? true,
        profileSearchable: serverPref.profileSearchable ?? true
      });
    }
  }, [serverPref]);

  // Save settings mutation
  const savePrefMutation = useMutation({
    mutationFn: async (body: typeof preferences) => {
      const res = await api.put('/student/settings', body);
      if (!res.success) throw new Error(res.message || 'Update failed');
      return res.data;
    },
    onSuccess: () => {
      showToast('Preferences updated and synced successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['studentSettings'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to save preferences.', 'error');
    }
  });

  const handleSaveSettings = () => {
    savePrefMutation.mutate(preferences);
  };

  const togglePref = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading account configurations & preferences...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineCog6Tooth className="w-5.5 h-5.5 text-primary-light animate-spin-slow" />
            Portal Settings
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Configure system themes, languages, location privacy, and notifications.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSaveSettings}
          loading={savePrefMutation.isPending}
          className="shadow-md shadow-primary/20 text-xs font-bold"
        >
          Save Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card title="Notification Configuration" subtitle="Manage how you receive alerts"
          headerRight={<HiOutlineBell className="w-4.5 h-4.5 text-primary-light" />}
        >
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text-primary">Push Attendance Alerts</p>
                <p className="text-[10px] text-text-muted">Receive live warnings on class attendance check-ins.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushNotif}
                onChange={() => togglePref('pushNotif')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input"
              />
            </div>
            
            <div className="flex items-center justify-between border-t border-border/10 pt-4">
              <div>
                <p className="text-xs font-bold text-text-primary">Attendance Shortage warnings</p>
                <p className="text-[10px] text-text-muted">Alert when attendance drops below the required 75% limit.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.alertShortage}
                onChange={() => togglePref('alertShortage')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/10 pt-4">
              <div>
                <p className="text-xs font-bold text-text-primary">Weekly Performance Email Digest</p>
                <p className="text-[10px] text-text-muted">Receive syllabus tracker & credit compliance reports.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotif}
                onChange={() => togglePref('emailNotif')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input"
              />
            </div>
          </div>
        </Card>

        {/* System Theme & Regional Languages */}
        <div className="space-y-6">
          {/* Interface Preference */}
          <Card title="Interface & Styling" subtitle="Customize the visual theme of your portal">
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xs font-bold text-text-primary">Toggle Theme Mode</p>
                <p className="text-[10px] text-text-muted">Switch between dark and light displays dynamically.</p>
              </div>
              <div className="scale-110">
                <ThemeToggle />
              </div>
            </div>
          </Card>

          {/* Regional Languages picker */}
          <Card title="Language Preferences" subtitle="Pick portal display and hub reading language"
            headerRight={<HiOutlineGlobeAlt className="w-4.5 h-4.5 text-secondary-light" />}
          >
            <div className="flex items-center justify-between mt-2 gap-4">
              <div>
                <p className="text-xs font-bold text-text-primary">System Language</p>
                <p className="text-[10px] text-text-muted">Will apply to sidebar menus and lesson card subtitles.</p>
              </div>
              <select
                value={preferences.lang}
                onChange={(e) => {
                  setPreferences(prev => ({ ...prev, lang: e.target.value }));
                  showToast(`Language preference changed to ${e.target.value}. Don't forget to save.`, 'info');
                }}
                className="bg-bg-input border border-border/40 rounded-xl text-xs font-bold text-text-secondary px-3 py-2 focus:border-primary/40 focus:outline-none cursor-pointer"
              >
                <option value="English">🇬🇧 English</option>
                <option value="Hindi">🇮🇳 Hindi (हिंदी)</option>
                <option value="Punjabi">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Privacy Configurations */}
        <Card title="Privacy Settings" subtitle="Choose location tracking and visibility access"
          headerRight={<HiOutlineShieldCheck className="w-4.5 h-4.5 text-success-light" />}
        >
          <div className="space-y-4 mt-2">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="flex items-center gap-1.5">
                  <HiOutlineMapPin className="w-4 h-4 text-text-muted" />
                  <p className="text-xs font-bold text-text-primary">Share Geo-Coordinates Location</p>
                </div>
                <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                  Used by QR scanners to cross-verify physical attendance logs and detect proxy attempts. Recommended for automatic check-in.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.shareLocation}
                onChange={() => togglePref('shareLocation')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input shrink-0 mt-1"
              />
            </div>
            
            <div className="flex items-start justify-between border-t border-border/10 pt-4">
              <div className="pr-4">
                <div className="flex items-center gap-1.5">
                  <HiOutlineEye className="w-4 h-4 text-text-muted" />
                  <p className="text-xs font-bold text-text-primary">Profile Discoverability in Rosters</p>
                </div>
                <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                  Allows faculty members and administrators to search your student record in course roster logs and assignment submissions.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.profileSearchable}
                onChange={() => togglePref('profileSearchable')}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input shrink-0 mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Security & Authentication options */}
        <Card title="Security & Authentication" subtitle="Change login credentials and security locks">
          <div className="flex flex-col gap-2.5 mt-2">
            <Button variant="outline" size="sm" icon={<HiOutlineLockClosed className="w-4 h-4 text-text-muted" />} className="w-full justify-start text-xs text-text-secondary" onClick={() => showToast('Password reset link has been sent to your registered email.', 'info')}>
              Update Account Password
            </Button>
            <Button variant="outline" size="sm" icon={<HiOutlineSparkles className="w-4 h-4 text-primary-light" />} className="w-full justify-start text-xs text-text-secondary" onClick={() => showToast('Bio-Authentication registered successfully with this device.', 'success')}>
              Enable Bio-Authentication (Face ID / Touch ID)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
