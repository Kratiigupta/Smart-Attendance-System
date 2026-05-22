'use client';

import React, { useEffect } from 'react';
import { Button } from './Button.js';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  // Lock scroll on background body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[size];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Content wrapper */}
      <div
        className={`glass rounded-2xl w-full flex flex-col overflow-hidden shadow-2xl border border-border animate-fadeIn relative z-10 ${sizeClasses}`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-heading font-extrabold text-lg text-text-primary tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition duration-150 cursor-pointer font-bold w-7 h-7 rounded-lg hover:bg-bg-hover flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] text-text-secondary text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer actions */}
        {footer && (
          <div className="p-5 border-t border-border flex justify-end gap-3 bg-bg-secondary/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
