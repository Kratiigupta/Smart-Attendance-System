'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render overlay container */}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Sub-component ToastCard
const ToastCard: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styles = {
    success: 'bg-success/15 border-success text-success-light',
    error: 'bg-danger/15 border-danger text-danger',
    warning: 'bg-warning/15 border-warning text-warning',
    info: 'bg-info/15 border-info text-info'
  }[toast.type];

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[toast.type];

  return (
    <div
      className={`glass flex items-start gap-3 p-4 rounded-xl border shadow-lg transition duration-300 animate-fadeIn ${styles}`}
    >
      <span className="text-lg leading-none">{icons}</span>
      <div className="flex-1 text-sm text-text-primary leading-tight font-medium">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary text-xs ml-2 cursor-pointer font-bold"
      >
        ✕
      </button>
    </div>
  );
};
