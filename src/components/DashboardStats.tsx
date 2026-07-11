import React from 'react';
import styles from './DashboardStats.module.css';
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
  
  // High interest targets (Target / Save status with 4 or 5 star rating)
  const priorityTargets = stats?.priority || 0;

  // Active pipelines (Contacted, In Dialogue)
  const activeContacts = stats?.contacted || 0;

  // Applied count
  const appliedCount = stats?.applied || 0;

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
