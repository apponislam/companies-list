'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  
  // Drawer form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Fetch all companies from the API route
  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/companies', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Compute dynamic category list based on existing companies
  const categoriesList = useMemo(() => {
    const categories = new Set<string>();
    companies.forEach((c) => {
      if (c.category) categories.add(c.category);
    });
    return ['All', ...Array.from(categories)];
  }, [companies]);

  // Form submit (Handles both ADD and EDIT operations)
  const handleFormSubmit = async (formData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCompany) {
      // Edit Mode
      try {
        const res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updated = await res.json();
          setCompanies((prev) =>
            prev.map((c) => (c.id === editingCompany.id ? updated : c))
          );
        } else {
          throw new Error('Failed to update company');
        }
      } catch (err) {
        console.error('Update error:', err);
        throw err;
      }
    } else {
      // Add Mode
      try {
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const created = await res.json();
          // Prepend new company so it shows at the top immediately (matching database order)
          setCompanies((prev) => [created, ...prev]);
          
          // Clear active filters so the new company is visible
          setSearchQuery('');
          setSelectedStatus('All');
          setSelectedCategory('All');
          setMinRating(0);
        } else {
          throw new Error('Failed to create company');
        }
      } catch (err) {
        console.error('Create error:', err);
        throw err;
      }
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
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

  // Filter list matching search fields
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower) ||
        c.address.toLowerCase().includes(searchLower) ||
        c.notes.toLowerCase().includes(searchLower);

      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesRating = c.rating >= minRating;

      return matchesSearch && matchesStatus && matchesCategory && matchesRating;
    });
  }, [companies, searchQuery, selectedStatus, selectedCategory, minRating]);

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
        <DashboardStats companies={companies} />

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Dropdown Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              onChange={(e) => setMinRating(Number(e.target.value))}
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
                onClick={() => setSelectedStatus(status)}
                className={`${styles.pill} ${
                  selectedStatus === status ? styles.pillActive : ''
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid View */}
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p>Loading companies data...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className={styles.grid}>
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onEdit={handleEditTrigger}
                onDelete={handleDeleteCompany}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Icons.Website size={48} />
            <h2 className={styles.emptyTitle}>No Target Companies Found</h2>
            <p className={styles.emptyText}>
              {companies.length === 0
                ? "Your directory is currently empty. Click the button below to add your first company details."
                : "No companies match your active filters or search criteria. Try modifying your search query or reset filters."}
            </p>
            {companies.length === 0 ? (
              <button onClick={handleAddTrigger} className={styles.emptyBtn}>
                <Icons.Add size={18} />
                Create Company Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('All');
                  setSelectedCategory('All');
                  setMinRating(0);
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
