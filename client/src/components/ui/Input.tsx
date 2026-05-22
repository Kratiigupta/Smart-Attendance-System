'use client';

import React, { useState } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, 'type'> {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  error?: string;
  icon?: string; // Emoji or short symbol
  options?: Array<{ value: string; label: string }>; // For select type
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  error,
  icon,
  options = [],
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  const baseClasses = 'w-full bg-bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200';
  const iconPadding = icon ? 'pl-10' : '';
  const errorBorder = error ? 'border-danger focus:ring-danger/35 focus:border-danger' : '';

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-text-secondary">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-text-secondary select-none text-sm pointer-events-none">
            {icon}
          </span>
        )}

        {type === 'select' ? (
          <select
            id={inputId}
            className={`${baseClasses} ${iconPadding} ${errorBorder}`}
            {...(props as any)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-card">
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={inputId}
            className={`${baseClasses} ${iconPadding} ${errorBorder} min-h-[80px]`}
            {...(props as any)}
          />
        ) : type === 'checkbox' ? (
          <div className="flex items-center gap-2.5 py-1">
            <input
              id={inputId}
              type="checkbox"
              className="w-4.5 h-4.5 rounded bg-bg-input border border-border text-primary focus:ring-primary/50"
              {...(props as any)}
            />
            {label && (
              <label htmlFor={inputId} className="text-xs font-medium text-text-secondary cursor-pointer select-none">
                {label}
              </label>
            )}
          </div>
        ) : (
          <input
            id={inputId}
            type={inputType}
            className={`${baseClasses} ${iconPadding} ${errorBorder}`}
            {...(props as any)}
          />
        )}

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-text-muted hover:text-text-primary text-xs font-semibold cursor-pointer"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-medium text-danger tracking-wide mt-0.5">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
