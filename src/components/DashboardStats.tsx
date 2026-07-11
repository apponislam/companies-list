import React from 'react';
import { Company } from '@/lib/database';
import styles from './DashboardStats.module.css';
import { Icons } from './Icons';

interface DashboardStatsProps {
  companies: Company[];
}

export default function DashboardStats({ companies }: DashboardStatsProps) {
  const total = companies.length;
  
  // High interest targets (Target / Save status with 4 or 5 star rating)
  const priorityTargets = companies.filter(
    (c) => (c.status === 'Target / Save' || c.status === 'To Explore') && c.rating >= 4
  ).length;

  // Active pipelines (Contacted, In Dialogue)
  const activeContacts = companies.filter(
    (c) => c.status === 'Contacted' || c.status === 'In Dialogue'
  ).length;

  // Applied count
  const appliedCount = companies.filter((c) => c.status === 'Applied').length;

  return (
    <div className={styles.statsContainer}>
      {/* Total Companies */}
      <div className={`${styles.card} ${styles.cardExplore}`}>
        <div className={styles.iconContainer}>
          <Icons.Website size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.value}>{total}</span>
          <span className={styles.label}>Total Companies</span>
        </div>
      </div>

      {/* Priority Targets */}
      <div className={`${styles.card} ${styles.cardTarget}`}>
        <div className={styles.iconContainer}>
          <Icons.Star size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.value}>{priorityTargets}</span>
          <span className={styles.label}>Priority Targets</span>
        </div>
      </div>

      {/* Active Contacts */}
      <div className={`${styles.card} ${styles.cardContacted}`}>
        <div className={styles.iconContainer}>
          <Icons.Phone size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.value}>{activeContacts}</span>
          <span className={styles.label}>In Contact</span>
        </div>
      </div>

      {/* Applied Companies */}
      <div className={`${styles.card} ${styles.cardApplied}`}>
        <div className={styles.iconContainer}>
          <Icons.Check size={24} />
        </div>
        <div className={styles.info}>
          <span className={styles.value}>{appliedCount}</span>
          <span className={styles.label}>Applied</span>
        </div>
      </div>
    </div>
  );
}
