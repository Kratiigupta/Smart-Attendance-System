'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Card className="shadow-2xl">
      <div className="text-center flex flex-col gap-1">
        <h2 className="font-heading font-black text-2xl tracking-tight text-text-primary">
          Welcome Back
        </h2>
        <p className="text-xs text-text-secondary">
          Enter your details below to access your campus dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <Input
          label="College Code"
          id="collegeCode"
          placeholder="e.g. DU, IITD, GC"
          value={formData.collegeCode}
          onChange={handleChange}
          error={errors.collegeCode}
          icon="🏫"
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
          icon="✉️"
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
          icon="🔑"
          required
        />

        <Button type="submit" loading={isLoading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-text-muted mt-4 border-t border-border pt-4">
        Need to register your institution?{' '}
        <Link href="/register" className="text-primary-light hover:underline font-bold">
          Register Here
        </Link>
      </div>
    </Card>
  );
}
