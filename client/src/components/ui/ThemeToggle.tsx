'use client';

import React, { useState, useEffect } from 'react';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or document class
    const savedTheme = localStorage.getItem('theme');
    const isLightMode = savedTheme === 'light' || document.documentElement.classList.contains('light');
    setIsLight(isLightMode);
    
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLight;
    setIsLight(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-border/50 hover:border-primary/45 bg-bg-secondary hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm"
      aria-label="Toggle Theme"
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {isLight ? (
        <HiOutlineMoon className="w-4 h-4 text-violet-light animate-scaleIn" />
      ) : (
        <HiOutlineSun className="w-4 h-4 text-accent-light animate-scaleIn" />
      )}
    </button>
  );
}
