'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import {
  HiOutlineCog6Tooth, HiOutlineBell, HiOutlineLockClosed,
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineEye,
  HiOutlineMapPin, HiOutlineSparkles
} from 'react-icons/hi2';

export default function StudentSettingsPage() {
  const { showToast } = useToast();
  
  // Notification states
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [alertShortage, setAlertShortage] = useState(true);

  // Language state
  const [lang, setLang] = useState('English');

  // Privacy states
  const [shareLocation, setShareLocation] = useState(true);
  const [profileSearchable, setProfileSearchable] = useState(true);

  const handleSaveSettings = () => {
    showToast('Preferences updated and synced successfully.', 'success');
  };

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
                checked={pushNotif}
                onChange={() => setPushNotif(!pushNotif)}
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
                checked={alertShortage}
                onChange={() => setAlertShortage(!alertShortage)}
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
                checked={emailNotif}
                onChange={() => setEmailNotif(!emailNotif)}
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
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  showToast(`Language switched to ${e.target.value}.`, 'success');
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
                checked={shareLocation}
                onChange={() => setShareLocation(!shareLocation)}
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
                checked={profileSearchable}
                onChange={() => setProfileSearchable(!profileSearchable)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input shrink-0 mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Security & Authentication options */}
        <Card title="Security & Authentication" subtitle="Change login credentials and security locks">
          <div className="flex flex-col gap-2.5 mt-2">
            <Button variant="outline" size="sm" icon={<HiOutlineLockClosed className="w-4 h-4 text-text-muted" />} className="w-full justify-start text-xs text-text-secondary">
              Update Account Password
            </Button>
            <Button variant="outline" size="sm" icon={<HiOutlineSparkles className="w-4 h-4 text-primary-light" />} className="w-full justify-start text-xs text-text-secondary">
              Enable Bio-Authentication (Face ID / Touch ID)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
