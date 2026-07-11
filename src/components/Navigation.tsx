'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './Icons';
import ModeToggle from './ModeToggle';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border-color bg-bg-primary/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo Brand */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20">
            <Icons.Website size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-text-primary text-md tracking-tight">
            Target<span className="text-brand-secondary font-medium ml-0.5">Directory</span>
          </span>
        </Link>

        {/* Navigation Tabs & Theme Toggle */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-brand-primary/15 text-brand-secondary border border-brand-secondary/20'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              <Icons.Website size={13} />
              Dashboard
            </Link>
            <Link
              href="/stats"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                pathname === '/stats'
                  ? 'bg-brand-primary/15 text-brand-secondary border border-brand-secondary/20'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              <Icons.Phone size={13} />
              Analytics
            </Link>
          </nav>
          
          <ModeToggle />
        </div>

      </div>
    </header>
  );
}
