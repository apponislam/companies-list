'use client';

import React, { useState, useEffect } from 'react';
import { DetailedStats } from '@/lib/database';
import { Icons } from '@/components/Icons';

export default function StatsPage() {
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error('Failed to fetch detailed statistics');
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-4 text-text-secondary">
        <div className="w-10 h-10 border-3 border-brand-primary/10 rounded-full border-t-brand-primary animate-spin"></div>
        <p className="text-sm font-semibold">Generating directory insights...</p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <main className="container mx-auto px-6 py-12 flex-1 flex items-center justify-center">
        <div className="bg-bg-secondary border border-dashed border-border-color rounded-2xl p-16 text-center max-w-[500px] flex flex-col items-center gap-5 text-text-secondary">
          <Icons.Website size={48} className="text-text-secondary" />
          <h2 className="text-xl font-bold text-text-primary">No Analytics Data Available</h2>
          <p className="text-sm leading-relaxed">
            Please add company profiles into your prospect directory first to compile performance graphs and pipeline distributions.
          </p>
        </div>
      </main>
    );
  }

  // Calculate percentage values
  const contactedRate = stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0;
  const appliedRate = stats.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0;

  // Helpers to assign status-specific color gradients
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Explore': return 'bg-explore';
      case 'Target / Save': return 'bg-target';
      case 'Contacted': return 'bg-contacted';
      case 'In Dialogue': return 'bg-dialogue';
      case 'Applied': return 'bg-applied';
      case 'Not Hiring': return 'bg-nothiring';
      default: return 'bg-brand-primary';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'To Explore': return 'border-explore/20 hover:border-explore/50';
      case 'Target / Save': return 'border-target/20 hover:border-target/50';
      case 'Contacted': return 'border-contacted/20 hover:border-contacted/50';
      case 'In Dialogue': return 'border-dialogue/20 hover:border-dialogue/50';
      case 'Applied': return 'border-applied/20 hover:border-applied/50';
      case 'Not Hiring': return 'border-nothiring/20 hover:border-nothiring/50';
      default: return 'border-brand-primary/20 hover:border-brand-primary/50';
    }
  };

  return (
    <main className="container mx-auto px-6 py-10 flex-1 flex flex-col gap-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary tracking-tight">
          Analytics & Insights
        </h1>
        <span className="text-sm text-text-secondary">
          A quantitative breakdown of your local target companies outreach pipeline.
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 hover:shadow-xl hover:border-brand-primary/30 transition-all duration-200">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Target Companies</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.total}</span>
            <span className="text-xs text-text-secondary/70">saved in database</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 hover:shadow-xl hover:border-contacted/30 transition-all duration-200">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Outreach Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-contacted">{contactedRate}%</span>
            <span className="text-xs text-text-secondary/70">({stats.contacted} contacted)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 hover:shadow-xl hover:border-target/30 transition-all duration-200">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Priority Targets</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-target">{stats.priority}</span>
            <span className="text-xs text-text-secondary/70">4+ stars in To Explore/Target</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 hover:shadow-xl hover:border-applied/30 transition-all duration-200">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Average Target Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary">{stats.averageRating}</span>
            <span className="text-xs text-text-secondary/70">/ 5.0 stars avg</span>
          </div>
        </div>
      </div>

      {/* Middle Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Status Funnel Card */}
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-secondary">
              <Icons.Star size={16} />
            </span>
            <h3 className="text-base font-bold text-text-primary">Outreach Pipeline Stages</h3>
          </div>

          <div className="flex flex-col gap-4">
            {stats.statusCounts.map(({ status, count }) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={status} className={`p-4 border rounded-xl bg-bg-primary/40 ${getStatusBorder(status)} transition-all flex flex-col gap-2`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-text-primary flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`}></span>
                      {status}
                    </span>
                    <span className="font-semibold text-text-secondary">
                      {count} {count === 1 ? 'company' : 'companies'} <span className="text-xs text-text-secondary/70">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-bg-tertiary h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${getStatusColor(status)}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown progress list */}
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-secondary">
              <Icons.Website size={16} />
            </span>
            <h3 className="text-base font-bold text-text-primary">Industry Category Distribution</h3>
          </div>

          <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
            {stats.categoryCounts.map(({ category, count }) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={category} className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between items-center text-text-primary/95">
                    <span className="font-medium truncate max-w-[70%]" title={category}>{category}</span>
                    <span className="text-xs font-bold text-brand-secondary">
                      {count} {count === 1 ? 'target' : 'targets'} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-bg-tertiary h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Ratings Density mapping */}
      <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-secondary">
            <Icons.Star size={16} />
          </span>
          <h3 className="text-base font-bold text-text-primary">Priority Stars Density</h3>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((starRating) => {
            const countObj = stats.ratingCounts.find((item) => item.rating === starRating);
            const count = countObj ? countObj.count : 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

            return (
              <div key={starRating} className="bg-bg-primary/30 border border-border-color/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-bg-primary/60 transition-colors">
                <div className="flex gap-0.5 text-target">
                  <Icons.Star size={14} className="fill-target text-target" />
                  <span className="text-sm font-bold text-text-primary">{starRating}★</span>
                </div>
                <div className="text-2xl font-black text-text-primary">{count}</div>
                <div className="text-[10px] text-text-secondary font-semibold uppercase">{pct}% of targets</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
