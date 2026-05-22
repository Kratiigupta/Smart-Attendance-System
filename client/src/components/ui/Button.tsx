'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<string, string> = {
  primary: 'gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110',
  secondary: 'gradient-secondary text-white shadow-lg shadow-secondary/20 hover:shadow-secondary/30 hover:brightness-110',
  outline: 'bg-transparent border border-border-light text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:border-primary/40',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
  danger: 'bg-danger/10 border border-danger/20 text-danger-light hover:bg-danger/20 hover:border-danger/40',
  success: 'bg-success/10 border border-success/20 text-success-light hover:bg-success/20 hover:border-success/40',
};

const sizes: Record<string, string> = {
  xs: 'text-[10px] px-2.5 py-1.5 rounded-lg gap-1.5',
  sm: 'text-[11px] px-3 py-2 rounded-xl gap-2',
  md: 'text-xs px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-sm px-6 py-3 rounded-xl gap-2.5',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        active:scale-[0.97]
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
