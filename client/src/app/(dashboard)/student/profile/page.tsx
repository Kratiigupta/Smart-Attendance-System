'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import {
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineEnvelope,
  HiOutlinePhone, HiOutlineMapPin, HiOutlineArrowPath,
  HiOutlineQrCode, HiOutlineIdentification, HiOutlineCheckBadge
} from 'react-icons/hi2';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  const studentName = user?.name || 'Abhishek Singh';
  const semester = user?.studentData?.semester ? `Semester ${user.studentData.semester}` : 'Semester 3';
  const deptName = user?.studentData?.department?.name || 'Computer Science & Engineering';
  const deptCode = user?.studentData?.department?.code || 'CSE';
  const rollNo = user?.studentData?.rollNumber || 'CSE-2023-045';
  const college = user?.collegeName || 'SmartEdu Campus';
  const email = user?.email || 'abhishek.singh@smartedu.edu';
  const phone = '+91 98765 43210';
  const address = 'A-24, Shalimar Gardens, Lucknow, Uttar Pradesh, 226010';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineIdentification className="w-5.5 h-5.5 text-primary-light" />
            Student Profile
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your institutional credentials and view your secure digital ID card.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<HiOutlineArrowPath className={`w-3.5 h-3.5 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />}
          onClick={() => setIsFlipped(!isFlipped)}
          className="border-primary/20 hover:border-primary/40 text-xs font-bold"
        >
          Flip ID Card
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D ID Card Wrapper (4 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="perspective-1000 w-full max-w-[340px] h-[480px] relative select-none">
            <div
              style={{
                transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                transition: 'transform 0.6s ease-in-out',
              }}
              className="w-full h-full transform-style-3d relative"
            >
              {/* FRONT OF ID CARD */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-bg-secondary/70 via-bg-card/90 to-bg-secondary/60 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                {/* Diagonal Gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-secondary/8 blur-2xl -z-10" />
                
                {/* ID Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/12 flex items-center justify-center border border-primary/20 text-primary-light font-bold text-xs">
                      SE
                    </div>
                    <span className="text-[10px] font-black tracking-wide text-text-primary uppercase">{college}</span>
                  </div>
                  <Badge variant="success" size="xs">STUDENT</Badge>
                </div>

                {/* ID Picture and Name */}
                <div className="flex flex-col items-center text-center my-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm group-hover:opacity-50 transition-opacity" />
                    <img 
                      src="/student_avatar.png" 
                      alt="Student Portrait" 
                      className="w-24 h-24 rounded-2xl object-cover border border-border bg-bg-elevated relative z-10 shadow-md"
                    />
                  </div>
                  <h3 className="text-sm font-black text-text-primary mt-3 tracking-tight flex items-center gap-1">
                    {studentName}
                    <HiOutlineCheckBadge className="w-4 h-4 text-primary-light shrink-0" />
                  </h3>
                  <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-0.5">
                    {deptCode} • Semester 3
                  </p>
                </div>

                {/* Grid Details */}
                <div className="space-y-2 border-t border-border/20 pt-4 text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-text-muted font-semibold">Roll Number</span>
                    <span className="font-mono font-bold text-text-primary">{rollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted font-semibold">Programme</span>
                    <span className="font-bold text-text-primary">B.Tech (FYUP)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted font-semibold">Valid Till</span>
                    <span className="font-mono font-bold text-text-primary">June 2027</span>
                  </div>
                </div>

                {/* Stylized Barcode */}
                <div className="mt-4 pt-3 border-t border-border/15 flex flex-col items-center gap-1">
                  <div className="flex gap-[1.5px] items-center h-6 w-full max-w-[200px] justify-center opacity-60">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-text-primary h-full rounded-sm"
                        style={{ width: i % 3 === 0 ? '1px' : i % 5 === 0 ? '2.5px' : i % 7 === 0 ? '3px' : '1.5px' }}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono tracking-widest text-text-dim uppercase">*{rollNo}*</span>
                </div>
              </div>

              {/* BACK OF ID CARD (QR CODE) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-bg-secondary/70 via-bg-card/90 to-bg-secondary/60 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-secondary/8 blur-2xl -z-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl -z-10" />

                {/* Header Back */}
                <div className="text-center">
                  <span className="text-[9px] font-black tracking-widest text-text-muted uppercase">Digital Access Code</span>
                  <div className="w-full border-t border-border/20 mt-2" />
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center my-4 space-y-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner relative group cursor-pointer">
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-primary to-accent opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
                    
                    {/* SVG High Tech QR Code Representation */}
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-primary-light relative z-10">
                      {/* Corner 1 */}
                      <rect x="5" y="5" width="22" height="22" fill="currentColor" rx="3" />
                      <rect x="9" y="9" width="14" height="14" fill="#0b0f19" rx="1" />
                      <rect x="12" y="12" width="8" height="8" fill="currentColor" rx="1" />
                      {/* Corner 2 */}
                      <rect x="73" y="5" width="22" height="22" fill="currentColor" rx="3" />
                      <rect x="77" y="9" width="14" height="14" fill="#0b0f19" rx="1" />
                      <rect x="80" y="12" width="8" height="8" fill="currentColor" rx="1" />
                      {/* Corner 3 */}
                      <rect x="5" y="73" width="22" height="22" fill="currentColor" rx="3" />
                      <rect x="9" y="77" width="14" height="14" fill="#0b0f19" rx="1" />
                      <rect x="12" y="80" width="8" height="8" fill="currentColor" rx="1" />
                      {/* QR Dots simulation */}
                      <rect x="32" y="5" width="6" height="6" fill="currentColor" rx="1" />
                      <rect x="42" y="10" width="6" height="12" fill="currentColor" rx="1" />
                      <rect x="52" y="5" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="32" y="22" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="52" y="15" width="6" height="18" fill="currentColor" rx="1" />
                      <rect x="62" y="27" width="6" height="6" fill="currentColor" rx="1" />
                      <rect x="5" y="32" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="22" y="32" width="6" height="12" fill="currentColor" rx="1" />
                      <rect x="32" y="42" width="18" height="6" fill="currentColor" rx="1" />
                      <rect x="5" y="48" width="6" height="18" fill="currentColor" rx="1" />
                      <rect x="15" y="52" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="32" y="52" width="6" height="12" fill="currentColor" rx="1" />
                      <rect x="42" y="58" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="58" y="42" width="18" height="18" fill="currentColor" rx="2" />
                      <rect x="62" y="46" width="10" height="10" fill="#0b0f19" rx="1" />
                      <rect x="65" y="49" width="4" height="4" fill="currentColor" rx="0.5" />
                      <rect x="80" y="32" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="73" y="48" width="6" height="12" fill="currentColor" rx="1" />
                      <rect x="83" y="62" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="32" y="73" width="6" height="12" fill="currentColor" rx="1" />
                      <rect x="42" y="80" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="58" y="73" width="12" height="6" fill="currentColor" rx="1" />
                      <rect x="73" y="73" width="6" height="22" fill="currentColor" rx="1" />
                      <rect x="83" y="83" width="12" height="12" fill="currentColor" rx="2" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-text-secondary font-semibold">Tap to scan at terminal</span>
                </div>

                {/* Bottom verification notes */}
                <div className="space-y-1.5 text-center border-t border-border/15 pt-3">
                  <p className="text-[9px] text-text-dim leading-relaxed">
                    This QR code is dynamically encrypted and verified over institution server terminals for physical campus attendance logs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio Records (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card title="Institutional Enrollment details" subtitle="Official registrar enrollment details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border/25 flex items-center gap-3 shadow-sm hover:border-primary/20 transition-all duration-200">
                <div className="w-8.5 h-8.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light shrink-0">
                  <HiOutlineAcademicCap className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-text-dim uppercase font-bold tracking-wide">Department</p>
                  <p className="text-xs font-bold text-text-primary truncate">{deptName}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border/25 flex items-center gap-3 shadow-sm hover:border-primary/20 transition-all duration-200">
                <div className="w-8.5 h-8.5 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary-light shrink-0">
                  <HiOutlineUser className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] text-text-dim uppercase font-bold tracking-wide">Enrollment Year</p>
                  <p className="text-xs font-bold text-text-primary">2023 - 2027 (FYUP)</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border/25 flex items-center gap-3 shadow-sm hover:border-primary/20 transition-all duration-200">
                <div className="w-8.5 h-8.5 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet-light shrink-0">
                  <HiOutlineEnvelope className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-text-dim uppercase font-bold tracking-wide">Institutional Email</p>
                  <p className="text-xs font-bold text-text-primary truncate">{email}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border/25 flex items-center gap-3 shadow-sm hover:border-primary/20 transition-all duration-200">
                <div className="w-8.5 h-8.5 rounded-xl bg-rose/10 border border-rose/20 flex items-center justify-center text-rose-light shrink-0">
                  <HiOutlinePhone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] text-text-dim uppercase font-bold tracking-wide">Contact Number</p>
                  <p className="text-xs font-bold text-text-primary">{phone}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border/25 flex items-center gap-3 shadow-sm hover:border-primary/20 transition-all duration-200 mt-4">
              <div className="w-8.5 h-8.5 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan-light shrink-0">
                <HiOutlineMapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[9px] text-text-dim uppercase font-bold tracking-wide">Permanent Address</p>
                <p className="text-xs font-bold text-text-primary leading-normal">{address}</p>
              </div>
            </div>
          </Card>

          <Card title="Digital ID Authentication Rules" subtitle="Read security terms carefully">
            <div className="space-y-3.5 text-[11px] text-text-secondary leading-relaxed font-medium">
              <div className="flex items-start gap-2">
                <span className="text-primary-light shrink-0 mt-0.5">●</span>
                <p>Digital ID QR code regenerates and encrypts dynamic variables to prevent scan forgery and identity proxy logs.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-light shrink-0 mt-0.5">●</span>
                <p>Scanning this ID Card at classroom gates auto-verifies physical coordinate bounds and checks inside class timetables.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-light shrink-0 mt-0.5">●</span>
                <p>Losing access or reporting security compromises should be alerted instantly to the college administrator desk.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
