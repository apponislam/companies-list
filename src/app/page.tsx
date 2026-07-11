'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Company } from '@/lib/database';
import CompanyCard from '@/components/CompanyCard';
import CompanyForm from '@/components/CompanyForm';
import CompanyRow from '@/components/CompanyRow';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <>
      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="w-full min-h-screen flex flex-col py-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
              Company Directory
            </h1>
            <span className="text-sm text-gray-400 font-medium">
              Research, prioritize, and explore target local companies for career opportunities.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Layout switcher buttons */}
            <div className="flex items-center bg-bg-secondary border border-border-color rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-brand-primary/10 text-brand-secondary'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid Card View"
                aria-label="Grid Card View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-brand-primary/10 text-brand-secondary'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Compact List View"
                aria-label="Compact List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              </button>
            </div>

            <button onClick={handleAddTrigger} className="flex items-center gap-2 bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
              <Icons.Add size={18} />
              Add Company
            </button>
          </div>
        </div>

        {/* Filters Controls Panel */}
        <div className="bg-bg-secondary border border-border-color rounded-xl p-5 mb-8 flex flex-col gap-5">
          {/* Row 1: Search & Dropdowns */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Icons.Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search companies by name, location, stack, or notes..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                className="w-full bg-bg-primary border border-border-color rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>

            {/* Category Dropdown Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white min-w-[180px] transition-all focus:outline-none focus:border-brand-primary cursor-pointer"
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
              className="bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white min-w-[180px] transition-all focus:outline-none focus:border-brand-primary cursor-pointer"
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
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filter by Status:</span>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border border-border-color bg-transparent text-gray-400 transition-all duration-150 hover:bg-white/5 hover:text-white cursor-pointer ${
                  selectedStatus === status ? 'bg-brand-primary text-white border-brand-primary hover:bg-brand-primary/90' : ''
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid & Pagination */}
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-gray-400">
            <div className="w-10 h-10 border-3 border-brand-primary/10 rounded-full border-t-brand-primary animate-spin"></div>
            <p>Loading companies data...</p>
          </div>
        ) : companies.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onEdit={handleEditTrigger}
                    onDelete={handleDeleteCompany}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-8">
                {companies.map((company) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onEdit={handleEditTrigger}
                    onDelete={handleDeleteCompany}
                  />
                ))}
              </div>
            )}
            
            {/* Infinite Scroll Sentinel element */}
            <div ref={loadMoreRef} className="flex justify-center items-center min-h-[80px] mt-6 pb-8 text-gray-400">
              {isLoading && page > 1 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 border-2 border-brand-primary/10 rounded-full border-t-brand-primary animate-spin"></div>
                  <span>Loading more companies...</span>
                </div>
              )}
              {!isLoading && page === totalPages && totalCount > 0 && (
                <p className="text-xs font-medium text-gray-500 tracking-wider">
                  You have viewed all {totalCount} target companies.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-bg-secondary border border-dashed border-border-color rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-5 text-gray-400 animate-fade-in">
            <Icons.Website size={48} />
            <h2 className="text-xl font-bold text-white">No Target Companies Found</h2>
            <p className="max-w-[400px] text-sm leading-relaxed mb-2">
              {stats?.total === 0
                ? "Your directory is currently empty. Click the button below to add your first company details."
                : "No companies match your active filters or search criteria. Try modifying your search query or reset filters."}
            </p>
            {stats?.total === 0 ? (
              <button onClick={handleAddTrigger} className="flex items-center gap-2 bg-bg-tertiary text-white border border-border-color font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:bg-brand-primary hover:border-brand-primary hover:-translate-y-0.5 cursor-pointer">
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
                className="flex items-center gap-2 bg-bg-tertiary text-white border border-border-color font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:bg-brand-primary hover:border-brand-primary hover:-translate-y-0.5 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        </div>
      </main>

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
    </>
  );
}
