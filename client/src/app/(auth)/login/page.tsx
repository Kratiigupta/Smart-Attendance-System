'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineBuildingLibrary,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const res = await login(formData.email, formData.password, formData.collegeCode);
    setIsLoading(false);

    if (res.success) {
      showToast('Logged in successfully. Welcome!', 'success');
    } else {
      showToast(res.message || 'Invalid credentials.', 'error');
    }
  };

  // Quick Demo account auto-filler
  const handleQuickLogin = async (role: 'student' | 'faculty' | 'admin') => {
    let email = '';
    let password = 'password';
    let collegeCode = 'DU';

    if (role === 'student') {
      email = 'student@uscdle.edu';
    } else if (role === 'faculty') {
      email = 'faculty@uscdle.edu';
    } else {
      email = 'admin@uscdle.edu';
    }

    setFormData({ email, password, collegeCode });
    setErrors({});
    setIsLoading(true);

    // Give it a tiny delay for visual responsiveness
    setTimeout(async () => {
      const res = await login(email, password, collegeCode);
      setIsLoading(false);
      if (res.success) {
        showToast(`Logged in successfully as demo ${role}!`, 'success');
      } else {
        showToast(res.message || 'Demo login failed.', 'error');
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Brand Logo & Slogan */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex w-12 h-12 rounded-2xl gradient-primary items-center justify-center shadow-lg shadow-primary/20 animate-bounce-subtle">
          <span className="text-2xl">🎓</span>
        </div>
        <h1 className="text-2xl font-heading font-black tracking-widest text-text-primary">
          USCDLE <span className="text-primary-light">PORTAL</span>
        </h1>
        <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
          Unified Smart Campus & Digital Learning Ecosystem
        </p>
      </div>

      <Card className="shadow-2xl border border-border/60 bg-bg-card/75 backdrop-blur-xl relative overflow-hidden card-glow">
        <div className="absolute top-0 left-0 w-full h-[3px] gradient-primary" />
        
        <div className="text-center flex flex-col gap-1.5 pb-4">
          <h2 className="font-heading font-black text-xl tracking-tight text-text-primary">
            Welcome Back
          </h2>
          <p className="text-[11px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            Access your courses, live attendance tracker, and academic planner.
          </p>
        </div>

        {/* Demo Roles Quick Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider block text-center">
            ⚡ Quick-Demo Access Accounts
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-primary/8 border border-primary/25 hover:bg-primary/18 hover:border-primary/45 transition-all text-center cursor-pointer group"
            >
              <HiOutlineAcademicCap className="w-5 h-5 text-primary-light mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary">Student</span>
              <span className="text-[7.5px] text-text-muted mt-0.5 uppercase tracking-wide">Amit Sem-3</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('faculty')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-secondary/8 border border-secondary/25 hover:bg-secondary/18 hover:border-secondary/45 transition-all text-center cursor-pointer group"
            >
              <HiOutlineUser className="w-5 h-5 text-secondary-light mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary">Faculty</span>
              <span className="text-[7.5px] text-text-muted mt-0.5 uppercase tracking-wide">Dr. Rajesh</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-violet/8 border border-violet/25 hover:bg-violet/18 hover:border-violet/45 transition-all text-center cursor-pointer group"
            >
              <HiOutlineShieldCheck className="w-5 h-5 text-violet-light mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary">Admin</span>
              <span className="text-[7.5px] text-text-muted mt-0.5 uppercase tracking-wide">Campus Ops</span>
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
          <div className="relative flex justify-center text-[9px] uppercase"><span className="bg-bg-card px-2 text-text-dim font-bold tracking-wider">Or Use Credentials</span></div>
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

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<HiOutlineLockClosed className="w-4 h-4 text-text-muted" />}
            required
          />

          <Button type="submit" loading={isLoading} fullWidth className="mt-2 py-3">
            Sign In Portal
          </Button>
        </form>

        <div className="text-center text-[10px] text-text-muted mt-5 border-t border-border/30 pt-4">
          Need to register your institution?{' '}
          <Link href="/register" className="text-primary-light hover:underline font-bold transition-all">
            Register Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
