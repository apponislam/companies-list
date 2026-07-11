import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  category: string;
  address: string;
  mapLink: string;
  website: string;
  facebook?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  status: 'To Explore' | 'Target / Save' | 'Contacted' | 'Applied' | 'Not Hiring' | 'In Dialogue';
  rating: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    mapLink: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    facebook: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['To Explore', 'Target / Save', 'Contacted', 'In Dialogue', 'Applied', 'Not Hiring'],
      default: 'To Explore',
    },
    rating: { type: Number, required: true, min: 1, max: 5, default: 3 },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Define compound text index for search fields
CompanySchema.index(
  {
    name: 'text',
    category: 'text',
    address: 'text',
    notes: 'text',
  },
  {
    weights: {
      name: 10,
      category: 5,
      address: 3,
      notes: 1,
    },
    name: 'CompanyTextIndex',
  }
);

// Regular single-field indexes for quick individual filters & distinct queries
CompanySchema.index({ status: 1 });
CompanySchema.index({ category: 1 });
CompanySchema.index({ rating: -1 });
CompanySchema.index({ createdAt: -1 });

// Compound indexes to cover multi-field filtering paired with sorting
CompanySchema.index({ status: 1, category: 1, rating: -1, createdAt: -1 });
CompanySchema.index({ status: 1, category: 1, createdAt: -1 });
CompanySchema.index({ status: 1, rating: -1, createdAt: -1 });
CompanySchema.index({ category: 1, rating: -1, createdAt: -1 });
CompanySchema.index({ status: 1, createdAt: -1 });
CompanySchema.index({ category: 1, createdAt: -1 });
CompanySchema.index({ rating: -1, createdAt: -1 });

const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
