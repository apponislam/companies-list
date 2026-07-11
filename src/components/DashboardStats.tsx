import React from 'react';
import { Icons } from './Icons';

export interface GlobalStats {
  total: number;
  priority: number;
  contacted: number;
  applied: number;
}

interface DashboardStatsProps {
  stats: GlobalStats | null;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const total = stats?.total || 0;
  const priorityTargets = stats?.priority || 0;
  const activeContacts = stats?.contacted || 0;
  const appliedCount = stats?.applied || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      
      {/* Total Companies */}
      <div className="group bg-bg-secondary border border-border-color rounded-xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-explore hover:shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[4px] before:h-full before:bg-explore">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-bg-tertiary text-text-secondary transition-all duration-200 group-hover:bg-explore group-hover:text-white">
          <Icons.Website size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-text-primary leading-none">{total}</span>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Companies</span>
        </div>
      </div>

      {/* Priority Targets */}
      <div className="group bg-bg-secondary border border-border-color rounded-xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-target hover:shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[4px] before:h-full before:bg-target">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-bg-tertiary text-text-secondary transition-all duration-200 group-hover:bg-target group-hover:text-white">
          <Icons.Star size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-text-primary leading-none">{priorityTargets}</span>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Priority Targets</span>
        </div>
      </div>

      {/* Active Contacts */}
      <div className="group bg-bg-secondary border border-border-color rounded-xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-contacted hover:shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[4px] before:h-full before:bg-contacted">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-bg-tertiary text-text-secondary transition-all duration-200 group-hover:bg-contacted group-hover:text-white">
          <Icons.Phone size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-text-primary leading-none">{activeContacts}</span>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">In Contact</span>
        </div>
      </div>

      {/* Applied Companies */}
      <div className="group bg-bg-secondary border border-border-color rounded-xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-applied hover:shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[4px] before:h-full before:bg-applied">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-bg-tertiary text-text-secondary transition-all duration-200 group-hover:bg-applied group-hover:text-white">
          <Icons.Check size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-text-primary leading-none">{appliedCount}</span>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Applied</span>
        </div>
      </div>

    </div>
  );
}
