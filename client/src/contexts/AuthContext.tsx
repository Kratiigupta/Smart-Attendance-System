'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'college_admin' | 'hod' | 'faculty' | 'student' | 'parent';
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

    // Register PWA Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('🟢 PWA Service Worker registered successfully:', reg.scope))
          .catch((err) => console.error('🔴 PWA Service Worker registration failed:', err));
      });
    }
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
        } else if (role === 'parent') {
          router.push('/parent/dashboard');
        } else {
          router.push('/admin/dashboard');
        }

        return { success: true };
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

        // Dynamic role-based redirect after registration
        const role = res.data.user?.role || data.role;
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role === 'faculty' || role === 'hod') {
          router.push('/faculty/dashboard');
        } else if (role === 'parent') {
          router.push('/parent/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'An error occurred.' };
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
