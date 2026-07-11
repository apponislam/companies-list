import React, { useState, useEffect } from 'react';
import { Company } from '@/lib/database';
import { Icons } from './Icons';

interface CompanyFormProps {
  company?: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const CATEGORIES = [
  'Software House',
  'Digital Agency',
  'Product Startup',
  'Enterprise Corp',
  'E-commerce Brand',
  'Design Studio',
  'Game Dev Studio',
  'Other'
];

export default function CompanyForm({ company, isOpen, onClose, onSubmit }: CompanyFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Software House');
  const [customCategory, setCustomCategory] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Company['status']>('To Explore');
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setName(company.name);
      if (CATEGORIES.includes(company.category)) {
        setCategory(company.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(company.category);
      }
      setAddress(company.address);
      setMapLink(company.mapLink);
      setWebsite(company.website);
      setFacebook(company.facebook || '');
      setLinkedin(company.linkedin || '');
      setEmail(company.email || '');
      setPhone(company.phone || '');
      setStatus(company.status);
      setRating(company.rating);
      setNotes(company.notes || '');
    } else {
      setName('');
      setCategory('Software House');
      setCustomCategory('');
      setAddress('');
      setMapLink('');
      setWebsite('');
      setFacebook('');
      setLinkedin('');
      setEmail('');
      setPhone('');
      setStatus('To Explore');
      setRating(3);
      setNotes('');
    }
    setValidationError(null);
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) return setValidationError('Company name is required.');
    if (!address.trim()) return setValidationError('Address is required.');
    if (!mapLink.trim()) return setValidationError('Google Maps link is required.');
    if (!website.trim()) return setValidationError('Website URL is required.');

    const validateUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    };

    if (!validateUrl(website)) {
      return setValidationError('Please enter a valid website URL (starting with http:// or https://).');
    }
    if (!validateUrl(mapLink)) {
      return setValidationError('Please enter a valid Google Maps URL.');
    }
    if (facebook && !validateUrl(facebook)) {
      return setValidationError('Please enter a valid Facebook URL.');
    }
    if (linkedin && !validateUrl(linkedin)) {
      return setValidationError('Please enter a valid LinkedIn URL.');
    }

    setIsSubmitting(true);
    try {
      const finalCategory = category === 'Other' ? customCategory.trim() : category;
      if (!finalCategory) {
        setValidationError('Please specify the custom category.');
        setIsSubmitting(false);
        return;
      }

      await onSubmit({
        name: name.trim(),
        category: finalCategory,
        address: address.trim(),
        mapLink: mapLink.trim(),
        website: website.trim(),
        facebook: facebook.trim(),
        linkedin: linkedin.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status,
        rating,
        notes: notes.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      setValidationError('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full height-full bg-black/60 backdrop-blur-sm z-[1000] flex justify-end animate-fade-in" onClick={onClose} style={{ height: '100vh' }}>
      <div className="w-full max-w-[480px] h-full bg-bg-secondary border-l border-border-color shadow-2xl flex flex-col animate-slide-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{company ? 'Edit Company Profile' : 'Add Target Company'}</h2>
          <button className="text-gray-400 bg-transparent w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-bg-tertiary hover:text-white cursor-pointer" onClick={onClose} aria-label="Close form">
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {validationError && (
            <div className="text-xs text-nothiring p-3 bg-nothiring/10 border border-nothiring/20 rounded-lg">
              <strong>Error:</strong> {validationError}
            </div>
          )}

          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              Company Name <span className="text-nothiring">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google Maps, TechSoft Ltd."
              required
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                Category <span className="text-nothiring">*</span>
              </label>
              <select
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">Interest Status</label>
              <select
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={status}
                onChange={(e) => setStatus(e.target.value as Company['status'])}
              >
                <option value="To Explore">To Explore</option>
                <option value="Target / Save">Target / Save</option>
                <option value="Contacted">Contacted</option>
                <option value="In Dialogue">In Dialogue</option>
                <option value="Applied">Applied</option>
                <option value="Not Hiring">Not Hiring</option>
              </select>
            </div>
          </div>

          {/* Custom Category */}
          {category === 'Other' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                Custom Category <span className="text-nothiring">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. AI Laboratory, FinTech startup"
                required
              />
            </div>
          )}

          {/* Physical Address */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              Location/Address <span className="text-nothiring">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sector 11, Uttara, Dhaka or Remote"
              required
            />
          </div>

          {/* Google Maps Link */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              Google Maps URL <span className="text-nothiring">*</span>
            </label>
            <input
              type="url"
              className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              required
            />
          </div>

          {/* Website Link */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              Website URL <span className="text-nothiring">*</span>
            </label>
            <input
              type="url"
              className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          {/* Social Profiles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">Facebook URL</label>
              <input
                type="url"
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">LinkedIn URL</label>
              <input
                type="url"
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">Phone Number</label>
              <input
                type="tel"
                className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+88017XXXXXXXX"
              />
            </div>
          </div>

          {/* Priority Star Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">Priority / Rating (1-5 Stars)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="bg-transparent text-gray-600 transition-all duration-150 hover:scale-110 cursor-pointer"
                  onClick={() => setRating(star)}
                  title={`Rate ${star} Stars`}
                >
                  <Icons.Star
                    size={24}
                    className={star <= rating ? 'text-target fill-target' : ''}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Research Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">Research Notes & Observations</label>
            <textarea
              className="w-full bg-bg-primary border border-border-color rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 min-h-[100px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. React/Next.js stack, hiring senior developers, CEO contact person..."
            />
          </div>
        </form>

        {/* Drawer Actions Footer */}
        <div className="p-6 border-t border-border-color flex justify-end gap-4 bg-bg-tertiary">
          <button
            type="button"
            className="text-sm font-semibold px-6 py-2.5 rounded-lg border bg-transparent text-gray-400 border-border-color hover:bg-white/5 hover:text-white cursor-pointer transition-all duration-200"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="text-sm font-semibold px-6 py-2.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : company ? 'Save Changes' : 'Add Company'}
          </button>
        </div>

      </div>
    </div>
  );
}
