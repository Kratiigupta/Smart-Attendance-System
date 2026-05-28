'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'student') {
        router.push('/student/dashboard');
      } else if (user.role === 'faculty' || user.role === 'hod') {
        router.push('/faculty/dashboard');
      } else if (user.role === 'parent') {
        router.push('/parent/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    collegeCode: '',
    role: 'student',
    rememberMe: false
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

  const handleGoogleLogin = () => {
    showToast('Connecting to Google OAuth account...', 'success');
    setTimeout(() => {
      showToast('Google authentication successful!', 'success');
    }, 1200);
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

  return (
    <div className="space-y-6">
      {/* Brand Logo & Slogan */}
      <div className="text-center space-y-2 mb-4 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="SmartEdu Campus Logo" className="h-14 w-auto object-contain mb-2" />
        <h1 className="text-2xl font-heading font-black tracking-widest text-text-primary">
          SmartEdu <span className="text-primary-light">PORTAL</span>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Portal Login Type"
            id="role"
            type="select"
            value={formData.role}
            onChange={(e: any) => setFormData(p => ({ ...p, role: e.target.value }))}
            options={[
              { value: 'student', label: 'Student Portal' },
              { value: 'faculty', label: 'Faculty / Lecturer Portal' },
              { value: 'admin', label: 'Institution Admin Portal' },
              { value: 'parent', label: 'Parents' }
            ]}
            icon={<HiOutlineUser className="w-4 h-4 text-text-muted" />}
          />

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

          <div className="flex items-center justify-between py-1 text-[11px]">
            <Input
              label="Remember me"
              id="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e: any) => setFormData(p => ({ ...p, rememberMe: e.target.checked }))}
              className="w-auto"
            />
            <Link 
              href="/forgot-password" 
              className="text-primary-light hover:underline font-bold transition-all"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" loading={isLoading} fullWidth className="mt-2 py-3">
            Sign In Portal
          </Button>

          <div className="relative my-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
            <span className="relative bg-bg-card px-2 text-[9px] text-text-muted font-bold uppercase tracking-wider">or sign in with</span>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            fullWidth 
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.42 7.5l3.79 2.94C6.1 7.42 8.84 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.79 2.94c2.2-2.03 3.46-5.01 3.46-8.66z" />
                <path fill="#FBBC05" d="M5.21 10.44c-.25-.75-.39-1.55-.39-2.39s.14-1.64.39-2.39L1.42 2.72C.51 4.54 0 6.59 0 8.75s.51 4.21 1.42 6.03l3.79-2.94z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.79-2.94c-1.1.74-2.5 1.18-4.17 1.18-3.16 0-5.9-2.38-6.79-5.4L1.42 14.78C3.37 18.63 7.35 21.25 12 23z" />
              </svg>
            }
            className="py-2.5 font-bold"
            onClick={handleGoogleLogin}
          >
            Sign in with Google
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
