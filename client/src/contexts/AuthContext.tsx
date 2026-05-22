'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'college_admin' | 'hod' | 'faculty' | 'student';
  collegeId: string;
  collegeName?: string;
  collegeCode?: string;
  phone?: string;
  avatar?: string;
  studentData?: {
    rollNumber?: string;
    semester?: number;
    department?: { _id: string; name: string; code: string };
    enrolledCourses?: string[];
    hasFaceEncoding: boolean;
  };
  facultyData?: {
    employeeId?: string;
    designation?: string;
    department?: { _id: string; name: string; code: string };
    assignedCourses?: string[];
    maxHoursPerWeek: number;
    specializations: string[];
  };
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, collegeCode: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Process logout on custom event (triggered by API client on session expire)
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
      router.push('/login');
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, [router]);

  const loadProfile = async (token: string) => {
    try {
      localStorage.setItem('accessToken', token);
      setAccessToken(token);
      
      if (token === 'mock-access-token') {
        // Fall back to student as default mock user if local storage was reloaded without active context
        setUser((prev) => prev || {
          id: 'mock-student-id',
          name: 'Amit Kumar',
          email: 'student@uscdle.edu',
          role: 'student',
          collegeId: 'mock-college-id',
          collegeName: 'Delhi University',
          collegeCode: 'DU',
          studentData: {
            rollNumber: 'CSE-2023-045',
            semester: 3,
            department: { _id: 'dept-cse', name: 'Computer Science', code: 'CSE' },
            enrolledCourses: ['CSC-201', 'CSC-305', 'ECE-301', 'MAT-301', 'SEC-201', 'VAC-101'],
            hasFaceEncoding: true
          }
        });
        return;
      }
      
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        throw new Error('Profile load failed');
      }
    } catch (err) {
      console.error('Profile loading error:', err);
      logout();
    }
  };

  const silentAuth = async () => {
    try {
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken === 'mock-access-token') {
        await loadProfile(savedToken);
        setIsLoading(false);
        return;
      }

      const res = await api.post('/auth/refresh', {});
      if (res.success && res.data?.accessToken) {
        await loadProfile(res.data.accessToken);
      }
    } catch (err) {
      console.log('Silent authentication failed (expected if not logged in)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    silentAuth();
  }, []);

  const login = async (email: string, password: string, collegeCode: string) => {
    setIsLoading(true);
    try {
      // First try real API
      let res;
      try {
        res = await api.post('/auth/login', { email, password, collegeCode });
      } catch (apiErr) {
        console.warn('Backend API connection failed, checking for offline demo fallback...', apiErr);
      }

      if (res && res.success && res.data) {
        await loadProfile(res.data.accessToken);
        setIsLoading(false);
        
        // Dynamic route dashboard direction
        const role = res.data.user.role;
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role === 'faculty' || role === 'hod') {
          router.push('/faculty/dashboard');
        } else {
          router.push('/admin/dashboard');
        }

        return { success: true };
      }

      // Check for demo fallback if API fails or is unreachable
      const lowerEmail = email.toLowerCase();
      if (password === 'password' || lowerEmail.endsWith('@uscdle.edu')) {
        let mockProfile: UserProfile | null = null;
        if (lowerEmail === 'student@uscdle.edu') {
          mockProfile = {
            id: 'mock-student-id',
            name: 'Amit Kumar',
            email: 'student@uscdle.edu',
            role: 'student',
            collegeId: 'mock-college-id',
            collegeName: 'Delhi University',
            collegeCode: collegeCode || 'DU',
            studentData: {
              rollNumber: 'CSE-2023-045',
              semester: 3,
              department: { _id: 'dept-cse', name: 'Computer Science', code: 'CSE' },
              enrolledCourses: ['CSC-201', 'CSC-305', 'ECE-301', 'MAT-301', 'SEC-201', 'VAC-101'],
              hasFaceEncoding: true
            }
          };
        } else if (lowerEmail === 'faculty@uscdle.edu') {
          mockProfile = {
            id: 'mock-faculty-id',
            name: 'Dr. Rajesh Kumar',
            email: 'faculty@uscdle.edu',
            role: 'faculty',
            collegeId: 'mock-college-id',
            collegeName: 'Delhi University',
            collegeCode: collegeCode || 'DU',
            facultyData: {
              employeeId: 'EMP-FAC-992',
              designation: 'Associate Professor',
              department: { _id: 'dept-cse', name: 'Computer Science', code: 'CSE' },
              assignedCourses: ['CSC-201', 'CSC-201P', 'CSC-401'],
              maxHoursPerWeek: 16,
              specializations: ['Data Structures', 'Algorithms']
            }
          };
        } else if (lowerEmail === 'admin@uscdle.edu') {
          mockProfile = {
            id: 'mock-admin-id',
            name: 'Admin Officer',
            email: 'admin@uscdle.edu',
            role: 'college_admin',
            collegeId: 'mock-college-id',
            collegeName: 'Delhi University',
            collegeCode: collegeCode || 'DU'
          };
        }

        if (mockProfile) {
          localStorage.setItem('accessToken', 'mock-access-token');
          setAccessToken('mock-access-token');
          setUser(mockProfile);
          setIsLoading(false);

          if (mockProfile.role === 'student') {
            router.push('/student/dashboard');
          } else if (mockProfile.role === 'faculty') {
            router.push('/faculty/dashboard');
          } else {
            router.push('/admin/dashboard');
          }
          return { success: true };
        }
      }

      setIsLoading(false);
      return { success: false, message: res?.message || 'Invalid credentials or connection failed.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'An error occurred.' };
    }
  };

  const registerCollege = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      if (res.success && res.data) {
        await loadProfile(res.data.accessToken);
        setIsLoading(false);
        router.push('/admin/dashboard');
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'An error occurred.' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  const refreshProfile = async () => {
    const token = accessToken || localStorage.getItem('accessToken');
    if (token) {
      await loadProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register: registerCollege,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
