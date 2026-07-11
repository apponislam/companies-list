'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Company } from '@/lib/database';
import styles from './page.module.css';
import DashboardStats from '@/components/DashboardStats';
import CompanyCard from '@/components/CompanyCard';
import CompanyForm from '@/components/CompanyForm';
import { Icons } from '@/components/Icons';

const STATUS_OPTIONS: ('All' | Company['status'])[] = [
  'All',
  'To Explore',
  'Target / Save',
  'Contacted',
  'In Dialogue',
  'Applied',
  'Not Hiring'
];

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search state & input debounce
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12; // Page size
  
  // Drawer form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Sentinel ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input to avoid hitting database on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInputValue);
      setPage(1); // Reset to first page on search change
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);

  // Fetch companies matching active page & filters
  const fetchCompanies = async (targetPage = page, isReset = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(limit),
        search: searchQuery,
        status: selectedStatus,
        category: selectedCategory,
        minRating: String(minRating)
      });
      
      const res = await fetch(`/api/companies?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const newCompanies = data.companies || [];
        
        if (targetPage === 1 || isReset) {
          setCompanies(newCompanies);
        } else {
          setCompanies((prev) => [...prev, ...newCompanies]);
        }
        
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || 0);
        setStats(data.stats || null);
        if (data.categories) {
          setCategoriesList(['All', ...data.categories]);
        }
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch only when page changes (appending mode)
  useEffect(() => {
    if (page > 1) {
      fetchCompanies(page, false);
    }
  }, [page]);

  // Re-fetch and reset when filters or search query change
  useEffect(() => {
    setPage(1);
    fetchCompanies(1, true);
  }, [searchQuery, selectedStatus, selectedCategory, minRating]);

  // Intersection Observer for scroll-based pagination triggers
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && page < totalPages && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      {
        rootMargin: '100px', // Preloads more items when user is 100px away from bottom
      }
    );

    observer.observe(sentinel);

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [page, totalPages, isLoading]);

  // Form submit (Handles both ADD and EDIT operations)
  const handleFormSubmit = async (formData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      let res;
      if (editingCompany) {
        // Edit Mode
        res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Add Mode
        res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (res.ok) {
        if (!editingCompany) {
          // Reset filters to defaults on creation so the new company is visible on page 1
          setSearchInputValue('');
          setSearchQuery('');
          setSelectedStatus('All');
          setSelectedCategory('All');
          setMinRating(0);
          setPage(1);
          await fetchCompanies(1, true);
        } else {
          // Reset to page 1 and reload edited results
          setPage(1);
          await fetchCompanies(1, true);
        }
      } else {
        throw new Error('Failed to save company');
      }
    } catch (err) {
      console.error('Submit error:', err);
      throw err;
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Reset and fetch from page 1
        setPage(1);
        await fetchCompanies(1, true);
      } else {
        alert('Failed to delete the company profile.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Trigger form drawer for Editing
  const handleEditTrigger = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  // Trigger form drawer for Creating
  const handleAddTrigger = () => {
    setEditingCompany(null);
    setIsFormOpen(true);
  };

  // Status/Category/Rating change wrappers to reset page back to 1
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    setPage(1);
  };

  return (
    <main className="container">
      <div className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Company Directory</h1>
            <span className={styles.subtitle}>
              Research, prioritize, and explore target local companies for career opportunities.
            </span>
          </div>
          <button onClick={handleAddTrigger} className={styles.addBtn}>
            <Icons.Add size={18} />
            Add Company
          </button>
        </div>

        {/* Dashboard Analytics Bar */}
        <DashboardStats stats={stats} />

        {/* Filters Controls Panel */}
        <div className={styles.controlsSection}>
          {/* Row 1: Search & Dropdowns */}
          <div className={styles.searchRow}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>
                <Icons.Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search companies by name, location, stack, or notes..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Dropdown Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={styles.filterSelect}
              title="Filter by Industry Category"
            >
              <option value="All">All Categories</option>
              {categoriesList
                .filter((cat) => cat !== 'All')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>

            {/* Star Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => handleRatingChange(Number(e.target.value))}
              className={styles.filterSelect}
              title="Filter by Minimum Rating"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars only</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={2}>2+ Stars</option>
              <option value={1}>1+ Stars</option>
            </select>
          </div>

          {/* Row 2: Status Pills */}
          <div className={styles.pillsContainer}>
            <span className={styles.filterLabel}>Filter by Status:</span>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`${styles.pill} ${
                  selectedStatus === status ? styles.pillActive : ''
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid & Pagination */}
        {isLoading && page === 1 ? (
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p>Loading companies data...</p>
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className={styles.grid}>
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteCompany}
                />
              ))}
            </div>
            
            {/* Infinite Scroll Sentinel element */}
            <div ref={loadMoreRef} className={styles.sentinel}>
              {isLoading && page > 1 && (
                <div className={styles.sentinelSpinner}>
                  <div className={styles.spinnerMini}></div>
                  <span>Loading more companies...</span>
                </div>
              )}
              {!isLoading && page === totalPages && totalCount > 0 && (
                <p className={styles.caughtUpText}>
                  You have viewed all {totalCount} target companies.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Icons.Website size={48} />
            <h2 className={styles.emptyTitle}>No Target Companies Found</h2>
            <p className={styles.emptyText}>
              {stats?.total === 0
                ? "Your directory is currently empty. Click the button below to add your first company details."
                : "No companies match your active filters or search criteria. Try modifying your search query or reset filters."}
            </p>
            {stats?.total === 0 ? (
              <button onClick={handleAddTrigger} className={styles.emptyBtn}>
                <Icons.Add size={18} />
                Create Company Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchInputValue('');
                  setSearchQuery('');
                  setSelectedStatus('All');
                  setSelectedCategory('All');
                  setMinRating(0);
                  setPage(1);
                }}
                className={styles.emptyBtn}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Slide-over Form Drawer */}
        <CompanyForm
          company={editingCompany}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCompany(null);
          }}
          onSubmit={handleFormSubmit}
        />
      </div>
    </main>
  );
}
