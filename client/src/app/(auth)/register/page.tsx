'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    collegeName: '',
    collegeCode: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: ''
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
    if (!formData.collegeName) newErrors.collegeName = 'College name is required.';
    if (!formData.collegeCode) newErrors.collegeCode = 'College code is required (e.g. OUT, IIT).';
    if (!formData.adminName) newErrors.adminName = 'Admin name is required.';
    if (!formData.adminEmail) newErrors.adminEmail = 'Admin email address is required.';
    if (!formData.adminPassword || formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const res = await register(formData);
    setIsLoading(false);

    if (res.success) {
      showToast('Onboarded successfully. Welcome to your admin suite!', 'success');
    } else {
      showToast(res.message || 'Onboarding failed.', 'error');
    }
  };

  return (
    <Card className="shadow-2xl">
      <div className="text-center flex flex-col gap-1">
        <h2 className="font-heading font-black text-2xl tracking-tight text-text-primary">
          Register Institution
        </h2>
        <p className="text-xs text-text-secondary">
          Setup USCDLE automation suite for your college campus
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-2">
        <div className="border-b border-border pb-2 mt-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-light">
            🏫 College Details
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="College Name"
            id="collegeName"
            placeholder="e.g. Oxford Uni"
            value={formData.collegeName}
            onChange={handleChange}
            error={errors.collegeName}
            required
            className="col-span-2"
          />
          <Input
            label="College Code"
            id="collegeCode"
            placeholder="e.g. OXF"
            value={formData.collegeCode}
            onChange={handleChange}
            error={errors.collegeCode}
            required
            className="col-span-2"
          />
        </div>

        <div className="border-b border-border pb-2 mt-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-light">
            👑 Admin Profile
          </span>
        </div>

        <Input
          label="Full Name"
          id="adminName"
          placeholder="e.g. Dr. John Doe"
          value={formData.adminName}
          onChange={handleChange}
          error={errors.adminName}
          icon="👤"
          required
        />

        <Input
          label="Email Address"
          id="adminEmail"
          type="email"
          placeholder="admin@university.edu"
          value={formData.adminEmail}
          onChange={handleChange}
          error={errors.adminEmail}
          icon="✉️"
          required
        />

        <Input
          label="Phone Number"
          id="adminPhone"
          placeholder="+91 9999999999"
          value={formData.adminPhone}
          onChange={handleChange}
          error={errors.adminPhone}
          icon="📞"
        />

        <Input
          label="Admin Password"
          id="adminPassword"
          type="password"
          placeholder="••••••••"
          value={formData.adminPassword}
          onChange={handleChange}
          error={errors.adminPassword}
          icon="🔑"
          required
        />

        <Button type="submit" loading={isLoading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-text-muted mt-4 border-t border-border pt-4">
        Already registered?{' '}
        <Link href="/login" className="text-primary-light hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </Card>
  );
}
