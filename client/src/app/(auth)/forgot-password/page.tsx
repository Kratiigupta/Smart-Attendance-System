'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import {
  HiOutlineEnvelope,
  HiOutlineBuildingLibrary,
  HiOutlineChevronLeft,
  HiOutlineSparkles
} from 'react-icons/hi2';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    collegeCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.collegeCode) newErrors.collegeCode = 'College code is required.';
    if (!formData.email) newErrors.email = 'Email address is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: formData.email,
        collegeCode: formData.collegeCode
      });
      if (res.success) {
        showToast(res.message || 'A 6-digit OTP code has been sent to your email.', 'success');
        router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}&college=${encodeURIComponent(formData.collegeCode)}`);
      } else {
        showToast(res.message || 'Failed to send OTP code. Please check your credentials.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error connection failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand logo & title */}
      <div className="text-center space-y-2 mb-4 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="SmartEdu Campus Logo" className="h-14 w-auto object-contain mb-2" />
        <h1 className="text-2xl font-heading font-black tracking-widest text-text-primary">
          SmartEdu <span className="text-primary-light">SECURITY</span>
        </h1>
        <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
          Password Recovery Console
        </p>
      </div>

      <Card className="shadow-2xl border border-border/60 bg-bg-card/75 backdrop-blur-xl relative overflow-hidden card-glow">
        <div className="absolute top-0 left-0 w-full h-[3px] gradient-primary" />

        <div className="text-center flex flex-col gap-1.5 pb-4">
          <h2 className="font-heading font-black text-xl tracking-tight text-text-primary">
            Reset Password
          </h2>
          <p className="text-[11px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            Enter your institutional credentials. We will send an OTP code to verify your identity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="College Code"
            id="collegeCode"
            placeholder="e.g. DU, IITD, GC"
            value={formData.collegeCode}
            onChange={handleChange}
            error={errors.collegeCode}
            icon={<HiOutlineBuildingLibrary className="w-4 h-4 text-text-muted" />}
            required
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<HiOutlineEnvelope className="w-4 h-4 text-text-muted" />}
            required
          />

          <Button type="submit" loading={isLoading} fullWidth className="mt-2 py-3">
            Send OTP Code
          </Button>
        </form>

        <div className="text-center text-[10px] text-text-muted mt-5 border-t border-border/30 pt-4 flex justify-between items-center">
          <Link href="/login" className="text-text-secondary hover:text-text-primary flex items-center gap-1 font-bold transition-all">
            <HiOutlineChevronLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
          <span className="text-text-dim">• Security Protocol</span>
        </div>
      </Card>
    </div>
  );
}
