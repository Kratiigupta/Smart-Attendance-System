'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { register, isAuthenticated, user, isLoading: authLoading } = useAuth();
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
    role: 'college_admin',
    collegeCode: '',
    collegeName: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNumber: '',
    semester: '1',
    employeeId: '',
    studentRollNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.collegeCode) newErrors.collegeCode = 'College code is required.';
    if (!formData.name) newErrors.name = 'Full name is required.';
    if (!formData.email) newErrors.email = 'Email address is required.';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.role === 'college_admin') {
      if (!formData.collegeName) newErrors.collegeName = 'College name is required.';
    } else if (formData.role === 'student') {
      if (!formData.rollNumber) newErrors.rollNumber = 'Roll number is required.';
    } else if (formData.role === 'faculty') {
      if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required.';
    } else if (formData.role === 'parent') {
      if (!formData.studentRollNumber) newErrors.studentRollNumber = 'Student roll number is required.';
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
      showToast('Account created successfully. Welcome to SmartEdu!', 'success');
    } else {
      showToast(res.message || 'Registration failed.', 'error');
    }
  };

  return (
    <Card className="shadow-2xl border border-border/60 bg-bg-card/75 backdrop-blur-xl relative overflow-hidden card-glow">
      <div className="absolute top-0 left-0 w-full h-[3px] gradient-primary" />
      
      <div className="text-center flex flex-col gap-1">
        <h2 className="font-heading font-black text-2xl tracking-tight text-text-primary">
          SmartEdu Register
        </h2>
        <p className="text-xs text-text-secondary">
          Join our unified smart learning ecosystem
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-4">
        {/* Role select */}
        <Input
          label="I am registering as..."
          id="role"
          type="select"
          value={formData.role}
          onChange={(e: any) => {
            setFormData(p => ({ ...p, role: e.target.value }));
            setErrors({});
          }}
          options={[
            { value: 'college_admin', label: 'Institution Administrator' },
            { value: 'student', label: 'Student' },
            { value: 'faculty', label: 'Faculty Member' },
            { value: 'parent', label: 'Parent / Guardian' }
          ]}
          required
        />

        <div className="border-b border-border/30 pb-2 mt-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-light">
            🔒 Account Details
          </span>
        </div>

        {/* Dynamic section title for college code */}
        <Input
          label={formData.role === 'college_admin' ? "Assign College Code (e.g. OXF, IITD)" : "College Code"}
          id="collegeCode"
          placeholder="e.g. DU, IITD, GC"
          value={formData.collegeCode}
          onChange={handleChange}
          error={errors.collegeCode}
          required
        />

        {formData.role === 'college_admin' && (
          <Input
            label="College Name"
            id="collegeName"
            placeholder="e.g. Oxford University"
            value={formData.collegeName}
            onChange={handleChange}
            error={errors.collegeName}
            required
          />
        )}

        <Input
          label="Full Name"
          id="name"
          placeholder="e.g. Dr. John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
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
          required
        />

        <Input
          label="Phone Number"
          id="phone"
          placeholder="e.g. 9876543210"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        {/* Dynamic Role Fields */}
        {formData.role === 'student' && (
          <>
            <div className="border-b border-border/30 pb-2 mt-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-light">
                🎓 Academic Details
              </span>
            </div>
            <Input
              label="Roll Number"
              id="rollNumber"
              placeholder="e.g. CSE-2023-045"
              value={formData.rollNumber}
              onChange={handleChange}
              error={errors.rollNumber}
              required
            />
            <Input
              label="Current Semester"
              id="semester"
              type="select"
              value={formData.semester}
              onChange={handleChange}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
                { value: '3', label: 'Semester 3' },
                { value: '4', label: 'Semester 4' },
                { value: '5', label: 'Semester 5' },
                { value: '6', label: 'Semester 6' },
                { value: '7', label: 'Semester 7' },
                { value: '8', label: 'Semester 8' }
              ]}
              required
            />
          </>
        )}

        {formData.role === 'faculty' && (
          <>
            <div className="border-b border-border/30 pb-2 mt-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-light">
                📚 Professional Details
              </span>
            </div>
            <Input
              label="Employee ID"
              id="employeeId"
              placeholder="e.g. FAC-9921"
              value={formData.employeeId}
              onChange={handleChange}
              error={errors.employeeId}
              required
            />
          </>
        )}

        {formData.role === 'parent' && (
          <>
            <div className="border-b border-border/30 pb-2 mt-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-light">
                👨‍👩‍👦 Child Connection
              </span>
            </div>
            <Input
              label="Student Roll Number (Your Child)"
              id="studentRollNumber"
              placeholder="e.g. CSE-2023-045"
              value={formData.studentRollNumber}
              onChange={handleChange}
              error={errors.studentRollNumber}
              required
            />
          </>
        )}

        <Button type="submit" loading={isLoading} className="w-full mt-2 py-3">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-text-muted mt-4 border-t border-border/30 pt-4">
        Already registered?{' '}
        <Link href="/login" className="text-primary-light hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </Card>
  );
}
