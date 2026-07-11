'use client';

import React, { useState } from 'react';
import { Company } from '@/lib/database';
import { Icons } from './Icons';

interface CompanyRowProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export default function CompanyRow({ company, onEdit, onDelete }: CompanyRowProps) {
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleCopy = async (e: React.MouseEvent, text: string, type: 'email' | 'phone') => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Copy failed: ', err);
    }
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'To Explore': return 'bg-explore/10 text-explore border-explore/30';
      case 'Target / Save': return 'bg-target/10 text-target border-target/30';
      case 'Contacted': return 'bg-contacted/10 text-contacted border-contacted/30';
      case 'Applied': return 'bg-applied/10 text-applied border-applied/30';
      case 'In Dialogue': return 'bg-dialogue/10 text-dialogue border-dialogue/30';
      case 'Not Hiring': return 'bg-nothiring/10 text-nothiring border-nothiring/30';
      default: return 'bg-explore/10 text-explore border-explore/30';
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-color/85 rounded-xl px-5 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 transition-all duration-150 hover:bg-bg-tertiary hover:border-brand-primary/40 relative">
      
      {/* 1. Name & Category */}
      <div className="flex items-center gap-3 min-w-[220px] max-w-xs truncate">
        {company.website ? (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-text-primary hover:text-brand-secondary transition-colors truncate"
            title={`Visit Website: ${company.website}`}
          >
            {company.name}
          </a>
        ) : (
          <span className="font-bold text-text-primary truncate">{company.name}</span>
        )}
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-secondary border border-brand-primary/15 whitespace-nowrap uppercase tracking-wider">
          {company.category}
        </span>
      </div>

      {/* 2. Rating & Location */}
      <div className="flex items-center gap-4 flex-1 min-w-[200px] text-xs">
        <div className="flex gap-0.5 shrink-0" title={`${company.rating}/5 Stars`}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Icons.Star
              key={idx}
              size={12}
              className={idx < company.rating ? 'text-target fill-target' : 'text-text-secondary/30'}
            />
          ))}
        </div>
        <span className="text-text-secondary truncate hidden sm:inline" title={company.address}>
          {company.address}
        </span>
      </div>

      {/* 3. Interest Status */}
      <div className="shrink-0">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(company.status)} uppercase tracking-wider`}>
          {company.status}
        </span>
      </div>

      {/* 4. Contact copies */}
      <div className="flex items-center gap-1.5 shrink-0 text-xs">
        {company.email ? (
          <button
            onClick={(e) => handleCopy(e, company.email!, 'email')}
            className="flex items-center justify-center w-7 h-7 rounded bg-bg-primary/50 text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40 relative cursor-pointer"
            title={`Copy Email: ${company.email}`}
          >
            <Icons.Email size={13} />
            {copiedType === 'email' && (
              <span className="absolute bottom-[130%] left-1/2 -translate-x-1/2 bg-brand-secondary text-bg-primary text-[9px] font-bold px-1.5 py-0.5 rounded shadow shadow-brand-secondary/35 whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        ) : (
          <div className="w-7 h-7"></div>
        )}

        {company.phone ? (
          <button
            onClick={(e) => handleCopy(e, company.phone!, 'phone')}
            className="flex items-center justify-center w-7 h-7 rounded bg-bg-primary/50 text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40 relative cursor-pointer"
            title={`Copy Phone: ${company.phone}`}
          >
            <Icons.Phone size={13} />
            {copiedType === 'phone' && (
              <span className="absolute bottom-[130%] left-1/2 -translate-x-1/2 bg-brand-secondary text-bg-primary text-[9px] font-bold px-1.5 py-0.5 rounded shadow shadow-brand-secondary/35 whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        ) : (
          <div className="w-7 h-7"></div>
        )}
      </div>

      {/* 5. Actions row */}
      <div className="flex items-center gap-2 shrink-0 justify-end min-w-[130px]">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1.5 animate-fade-in">
            <span className="text-[10px] font-bold text-nothiring">Delete?</span>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="text-[10px] px-2 py-1 rounded bg-bg-primary border border-border-color text-text-secondary hover:text-text-primary cursor-pointer"
            >
              No
            </button>
            <button
              onClick={() => {
                onDelete(company.id);
                setIsConfirmingDelete(false);
              }}
              className="text-[10px] px-2 py-1 rounded bg-nothiring text-white hover:bg-nothiring/90 cursor-pointer"
            >
              Yes
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(company)}
              className="p-1.5 rounded border border-brand-primary/20 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white cursor-pointer transition-colors"
              title="Edit Profile"
            >
              <Icons.Edit size={12} />
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="p-1.5 rounded border border-nothiring/20 bg-nothiring/10 text-nothiring hover:bg-nothiring hover:text-white cursor-pointer transition-colors"
              title="Delete Profile"
            >
              <Icons.Delete size={12} />
            </button>
          </>
        )}
      </div>

    </div>
  );
}
