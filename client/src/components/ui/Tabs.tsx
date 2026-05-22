'use client';

import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'pills', className = '' }: TabsProps) {
  const [active, setActive] = useState(activeTab || tabs[0]?.id);
  const currentTab = activeTab || active;

  const handleClick = (tabId: string) => {
    setActive(tabId);
    onChange?.(tabId);
  };

  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-0 border-b border-border/40 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer
              ${currentTab === tab.id
                ? 'text-primary-light'
                : 'text-text-muted hover:text-text-secondary'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary-light border border-primary/20">
                {tab.badge}
              </span>
            )}
            {currentTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl bg-bg-elevated/50 border border-border/20 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer
            ${currentTab === tab.id
              ? 'bg-primary/15 text-primary-light border border-primary/20 shadow-sm'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover border border-transparent'
            }
          `}
        >
          {tab.icon}
          {tab.label}
          {tab.badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              currentTab === tab.id
                ? 'bg-primary/20 text-primary-light'
                : 'bg-bg-hover text-text-muted'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
