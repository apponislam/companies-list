'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Icons } from './Icons';

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-border-color bg-bg-secondary/40" />
    );
  }

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-tertiary transition-all duration-200 cursor-pointer shadow-sm active:scale-95 hover:border-brand-primary/50"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Icons.Sun size={17} className="text-amber-400 animate-fade-in" />
      ) : (
        <Icons.Moon size={17} className="text-brand-primary animate-fade-in" />
      )}
    </button>
  );
}
