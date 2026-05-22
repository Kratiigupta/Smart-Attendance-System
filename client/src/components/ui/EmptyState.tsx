'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border/30 flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-heading font-bold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-[11px] text-text-muted max-w-sm text-center mb-4">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
