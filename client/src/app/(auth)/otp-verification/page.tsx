'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineChevronLeft,
  HiOutlineEnvelopeOpen
} from 'react-icons/hi2';

function OTPVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const email = searchParams.get('email') || 'your email';
  const college = searchParams.get('college') || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!otp || otp.length !== 6) newErrors.otp = 'Please enter a valid 6-digit OTP.';
    if (!newPassword || newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters.';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate verifying OTP and updating password
    setTimeout(() => {
      setIsLoading(false);
      showToast('Password reset successfully. You can now login.', 'success');
      router.push('/login');
    }, 2000);
  };

  const handleResendOTP = () => {
    setTimer(60);
    showToast('A new 6-digit OTP code has been sent.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Brand logo & title */}
      <div className="text-center space-y-2 mb-4 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="SmartEdu Campus Logo" className="h-14 w-auto object-contain mb-2" />
        <h1 className="text-2xl font-heading font-black tracking-widest text-text-primary">
          SmartEdu <span className="text-primary-light">VERIFICATION</span>
        </h1>
        <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
          One-Time Passcode Verification
        </p>
      </div>

      <Card className="shadow-2xl border border-border/60 bg-bg-card/75 backdrop-blur-xl relative overflow-hidden card-glow">
        <div className="absolute top-0 left-0 w-full h-[3px] gradient-primary" />

        <div className="text-center flex flex-col gap-1.5 pb-4">
          <h2 className="font-heading font-black text-xl tracking-tight text-text-primary flex items-center justify-center gap-2">
            <HiOutlineEnvelopeOpen className="w-5 h-5 text-primary-light" />
            Enter OTP Code
          </h2>
          <p className="text-[11px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            Sent to <span className="font-bold text-text-primary">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="6-Digit OTP Code"
            id="otp"
            placeholder="e.g. 123456"
            maxLength={6}
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              if (errors.otp) setErrors(p => ({ ...p, otp: '' }));
            }}
            error={errors.otp}
            icon={<HiOutlineKey className="w-4 h-4 text-text-muted" />}
            required
          />

          <Input
            label="New Password"
            id="newPassword"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors(p => ({ ...p, newPassword: '' }));
            }}
            error={errors.newPassword}
            icon={<HiOutlineLockClosed className="w-4 h-4 text-text-muted" />}
            required
          />

          <Input
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
            icon={<HiOutlineLockClosed className="w-4 h-4 text-text-muted" />}
            required
          />

          <div className="flex items-center justify-between py-1 text-[11px]">
            <span className="text-text-muted">Didn't receive code?</span>
            {timer > 0 ? (
              <span className="text-text-muted font-mono">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-primary-light hover:underline font-bold cursor-pointer"
              >
                Resend OTP
              </button>
            )}
          </div>

          <Button type="submit" loading={isLoading} fullWidth className="mt-2 py-3">
            Verify & Reset Password
          </Button>
        </form>

        <div className="text-center text-[10px] text-text-muted mt-5 border-t border-border/30 pt-4 flex justify-between items-center">
          <Link href="/forgot-password" className="text-text-secondary hover:text-text-primary flex items-center gap-1 font-bold transition-all">
            <HiOutlineChevronLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-text-dim">• Secure Reset Session</span>
        </div>
      </Card>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8 text-xs text-text-secondary">
        Loading Verification Wizard...
      </div>
    }>
      <OTPVerificationForm />
    </Suspense>
  );
}
