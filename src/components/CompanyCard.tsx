import React, { useState } from 'react';
import { Company } from '@/lib/database';
import styles from './CompanyCard.module.css';
import { Icons } from './Icons';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export default function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | null>(null);

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
        return styles.statusExplore;
      case 'Target / Save':
        return styles.statusTarget;
      case 'Contacted':
        return styles.statusContacted;
      case 'Applied':
        return styles.statusApplied;
      case 'In Dialogue':
        return styles.statusDialogue;
      case 'Not Hiring':
        return styles.statusNothiring;
      default:
        return styles.statusExplore;
    }
  };

  return (
    <div className={styles.card}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.nameContainer}>
          <h3 className={styles.name} title={company.name}>{company.name}</h3>
          <span className={styles.category}>{company.category}</span>
        </div>
        <span className={`${styles.statusBadge} ${getStatusClass(company.status)}`}>
          {company.status}
        </span>
      </div>

      {/* Address & Rating */}
      <div className={styles.body}>
        <div className={styles.addressRow}>
          <Icons.Pin size={16} />
          <span className={styles.addressText} title={company.address}>
            {company.address}
          </span>
        </div>

        {/* Priority Rating */}
        <div className={styles.ratingRow} title={`Priority: ${company.rating}/5 stars`}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Icons.Star
              key={idx}
              size={16}
              className={idx < company.rating ? styles.starFilled : ''}
            />
          ))}
        </div>
      </div>

      {/* Contact Panel (Only if Email or Phone is provided) */}
      {(company.email || company.phone) && (
        <div className={styles.contactBox}>
          {company.email && (
            <div className={styles.contactRow}>
              <div className={styles.contactInfo} title={company.email}>
                <Icons.Email size={14} />
                <span>{company.email}</span>
              </div>
              <button
                className={styles.copyButton}
                onClick={() => handleCopy(company.email!, 'email')}
                title="Copy Email"
              >
                {copiedType === 'email' ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                {copiedType === 'email' && <span className={styles.copiedTooltip}>Copied!</span>}
              </button>
            </div>
          )}

          {company.phone && (
            <div className={styles.contactRow}>
              <div className={styles.contactInfo} title={company.phone}>
                <Icons.Phone size={14} />
                <span>{company.phone}</span>
              </div>
              <button
                className={styles.copyButton}
                onClick={() => handleCopy(company.phone!, 'phone')}
                title="Copy Phone Number"
              >
                {copiedType === 'phone' ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                {copiedType === 'phone' && <span className={styles.copiedTooltip}>Copied!</span>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Links */}
      <div className={styles.linksRow}>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.linkIcon} ${styles.linkWebsite}`}
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
            className={`${styles.linkIcon} ${styles.linkMap}`}
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
            className={`${styles.linkIcon} ${styles.linkLinkedin}`}
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
            className={`${styles.linkIcon} ${styles.linkFacebook}`}
            title="Facebook Page"
          >
            <Icons.Facebook size={18} />
          </a>
        )}
      </div>

      {/* Notes Preview (If exists) */}
      {company.notes && (
        <div className={styles.notesArea}>
          <span className={styles.notesTitle}>Notes</span>
          <div className={styles.notesContent}>{company.notes}</div>
        </div>
      )}

      {/* Card Actions Footer */}
      <div className={styles.footer}>
        <button
          onClick={() => onEdit(company)}
          className={`${styles.actionButton} ${styles.editBtn}`}
        >
          <Icons.Edit size={14} />
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete ${company.name}?`)) {
              onDelete(company.id);
            }
          }}
          className={`${styles.actionButton} ${styles.deleteBtn}`}
        >
          <Icons.Delete size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
