import React, { useState } from 'react';
import { Company } from '@/lib/database';
import { Icons } from './Icons';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export default function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleCopy = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusClass = (status: Company['status']) => {
    switch (status) {
      case 'To Explore':
        return 'bg-explore/10 text-explore border-explore/30';
      case 'Target / Save':
        return 'bg-target/10 text-target border-target/30';
      case 'Contacted':
        return 'bg-contacted/10 text-contacted border-contacted/30';
      case 'Applied':
        return 'bg-applied/10 text-applied border-applied/30';
      case 'In Dialogue':
        return 'bg-dialogue/10 text-dialogue border-dialogue/30';
      case 'Not Hiring':
        return 'bg-nothiring/10 text-nothiring border-nothiring/30';
      default:
        return 'bg-explore/10 text-explore border-explore/30';
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary hover:shadow-xl relative animate-fade-in">
      
      {/* Top Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1 max-w-[70%]">
          <h3 className="text-lg font-bold text-text-primary truncate" title={company.name}>
            {company.name}
          </h3>
          <span className="text-[10px] font-semibold text-brand-secondary uppercase tracking-wider">
            {company.category}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap border ${getStatusClass(company.status)}`}>
          {company.status}
        </span>
      </div>

      {/* Address & Rating */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 text-text-primary/95 text-sm">
          <span className="mt-0.5 text-text-secondary shrink-0">
            <Icons.Pin size={16} />
          </span>
          <span className="line-clamp-2" title={company.address}>
            {company.address}
          </span>
        </div>

        {/* Priority Rating */}
        <div className="flex gap-0.5 text-text-secondary/30" title={`Priority: ${company.rating}/5 stars`}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Icons.Star
              key={idx}
              size={16}
              className={idx < company.rating ? 'text-target fill-target' : 'fill-current'}
            />
          ))}
        </div>
      </div>

      {/* Contact Panel (Only if Email or Phone is provided) */}
      {(company.email || company.phone) && (
        <div className="bg-bg-tertiary rounded-lg p-3 flex flex-col gap-2 text-xs border border-border-color/10">
          {company.email && (
            <div className="flex items-center justify-between gap-2 text-text-primary/90">
              <div className="flex items-center gap-2 truncate max-w-[85%]" title={company.email}>
                <span className="text-text-secondary shrink-0">
                  <Icons.Email size={14} />
                </span>
                <span className="truncate">{company.email}</span>
              </div>
              <button
                className="bg-transparent text-text-secondary p-1 rounded transition-colors hover:text-text-primary hover:bg-bg-secondary/40 flex items-center justify-center relative cursor-pointer"
                onClick={() => handleCopy(company.email!, 'email')}
                title="Copy Email"
              >
                {copiedType === 'email' ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                {copiedType === 'email' && (
                  <span className="absolute bottom-[130%] right-0 bg-brand-secondary text-bg-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none animate-fade-in">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          )}

          {company.phone && (
            <div className="flex items-center justify-between gap-2 text-text-primary/90">
              <div className="flex items-center gap-2 truncate max-w-[85%]" title={company.phone}>
                <span className="text-text-secondary shrink-0">
                  <Icons.Phone size={14} />
                </span>
                <span className="truncate">{company.phone}</span>
              </div>
              <button
                className="bg-transparent text-text-secondary p-1 rounded transition-colors hover:text-text-primary hover:bg-bg-secondary/40 flex items-center justify-center relative cursor-pointer"
                onClick={() => handleCopy(company.phone!, 'phone')}
                title="Copy Phone Number"
              >
                {copiedType === 'phone' ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                {copiedType === 'phone' && (
                  <span className="absolute bottom-[130%] right-0 bg-brand-secondary text-bg-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none animate-fade-in">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Links */}
      <div className="flex gap-3 my-1">
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-tertiary text-text-secondary border border-border-color transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:bg-brand-primary hover:border-brand-primary"
            title="Visit Website"
          >
            <Icons.Website size={18} />
          </a>
        )}

        {company.mapLink && (
          <a
            href={company.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-tertiary text-text-secondary border border-border-color transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:bg-[#ea4335] hover:border-[#ea4335]"
            title="Google Maps Location"
          >
            <Icons.Map size={18} />
          </a>
        )}

        {company.linkedin && (
          <a
            href={company.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-tertiary text-text-secondary border border-border-color transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:bg-[#0a66c2] hover:border-[#0a66c2]"
            title="LinkedIn Profile"
          >
            <Icons.LinkedIn size={18} />
          </a>
        )}

        {company.facebook && (
          <a
            href={company.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-tertiary text-text-secondary border border-border-color transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:bg-[#1877f2] hover:border-[#1877f2]"
            title="Facebook Page"
          >
            <Icons.Facebook size={18} />
          </a>
        )}
      </div>

      {/* Notes Preview (If exists) */}
      {company.notes && (
        <div className="border-t border-dashed border-border-color pt-3 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Notes</span>
          <div className="text-xs text-text-primary/80 leading-relaxed pre-wrap max-h-20 overflow-y-auto pr-1 scrollbar-thin">
            {company.notes}
          </div>
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="flex justify-end gap-3 border-t border-border-color pt-3">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-2 animate-fade-in w-full justify-between">
            <span className="text-xs font-semibold text-nothiring">Are you sure?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border-color text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(company.id);
                  setIsConfirmingDelete(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-nothiring text-white border-nothiring hover:bg-nothiring/90 transition-all cursor-pointer"
              >
                <Icons.Delete size={14} />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(company)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer"
            >
              <Icons.Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-nothiring/10 text-nothiring border-nothiring/20 hover:bg-nothiring hover:text-white transition-all duration-200 cursor-pointer"
            >
              <Icons.Delete size={14} />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
