import React, { useState, useEffect } from 'react';
import { Company } from '@/lib/database';
import styles from './CompanyForm.module.css';
import { Icons } from './Icons';

interface CompanyFormProps {
  company?: Company | null; // If provided, we are in Edit Mode
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

  // Sync state with edit target when open
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
      // Reset form
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

    // Basic validation
    if (!name.trim()) return setValidationError('Company name is required.');
    if (!address.trim()) return setValidationError('Address is required.');
    if (!mapLink.trim()) return setValidationError('Google Maps / Location link is required.');
    if (!website.trim()) return setValidationError('Website link is required.');

    // URL validation
    const validateUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    };

    if (!validateUrl(website)) {
      return setValidationError('Please enter a valid website URL (including http:// or https://).');
    }
    if (!validateUrl(mapLink)) {
      return setValidationError('Please enter a valid Maps link (including http:// or https://).');
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
        setValidationError('Please specify the category.');
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{company ? 'Edit Company Profile' : 'Add Target Company'}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close form">
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className={styles.formContent}>
          {validationError && (
            <div className={styles.errorMessage}>
              <strong>Error:</strong> {validationError}
            </div>
          )}

          {/* Company Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Company Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google Maps, TechSoft Ltd."
              required
            />
          </div>

          {/* Category Selector */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Category <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
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

            {/* Interest/Prospect Status */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Interest Status</label>
              <select
                className={styles.select}
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

          {/* Custom Category Field (Visible if 'Other' selected) */}
          {category === 'Other' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Custom Category <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. AI Laboratory, FinTech startup"
                required
              />
            </div>
          )}

          {/* Physical Address */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Location/Address <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sector 11, Uttara, Dhaka or Remote"
              required
            />
          </div>

          {/* Google Maps Link */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Google Maps URL <span className={styles.required}>*</span>
            </label>
            <input
              type="url"
              className={styles.input}
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              required
            />
          </div>

          {/* Website Link */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Website URL <span className={styles.required}>*</span>
            </label>
            <input
              type="url"
              className={styles.input}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          {/* Social Profiles */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Facebook URL</label>
              <input
                type="url"
                className={styles.input}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>LinkedIn URL</label>
              <input
                type="url"
                className={styles.input}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>

          {/* Contact details */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+88017XXXXXXXX"
              />
            </div>
          </div>

          {/* Priority Star Rating */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Priority / Rating (1-5 Stars)</label>
            <div className={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={styles.starBtn}
                  onClick={() => setRating(star)}
                  title={`Rate ${star} Stars`}
                >
                  <Icons.Star
                    size={24}
                    className={star <= rating ? styles.starFilled : ''}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Research Notes */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Research Notes & Observations</label>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. React/Next.js stack, hiring senior developers, CEO contact person..."
            />
          </div>
        </form>

        {/* Drawer Actions Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} styles.btnCancel`}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSubmit}`}
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
