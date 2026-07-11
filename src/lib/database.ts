import { dbConnect } from './mongodb';
import CompanyModel from '@/models/Company';

export interface Company {
  id: string;
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
  rating: number; // 1 to 5
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Map Mongoose document to clean TypeScript object
function mapCompany(doc: any): Company {
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    address: doc.address,
    mapLink: doc.mapLink,
    website: doc.website,
    facebook: doc.facebook || '',
    linkedin: doc.linkedin || '',
    email: doc.email || '',
    phone: doc.phone || '',
    status: doc.status,
    rating: doc.rating,
    notes: doc.notes || '',
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
}

export interface PaginatedCompanies {
  companies: Company[];
  total: number;
  pages: number;
  page: number;
}

export async function getCompanies(options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  minRating?: number;
}): Promise<PaginatedCompanies> {
  await dbConnect();
  
  const page = Number(options?.page) || 1;
  const limit = Number(options?.limit) || 12;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (options?.status && options.status !== 'All') {
    query.status = options.status;
  }

  if (options?.category && options.category !== 'All') {
    query.category = options.category;
  }

  if (options?.minRating && options.minRating > 0) {
    query.rating = { $gte: options.minRating };
  }

  if (options?.search) {
    const searchRegex = { $regex: options.search, $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { address: searchRegex },
      { notes: searchRegex }
    ];
  }

  const total = await CompanyModel.countDocuments(query);
  const docs = await CompanyModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    companies: docs.map(mapCompany),
    total,
    pages: Math.ceil(total / limit) || 1,
    page,
  };
}

export async function getUniqueCategories(): Promise<string[]> {
  await dbConnect();
  try {
    return await CompanyModel.distinct('category');
  } catch (error) {
    return [];
  }
}

export interface GlobalStats {
  total: number;
  priority: number;
  contacted: number;
  applied: number;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  await dbConnect();
  try {
    const total = await CompanyModel.countDocuments({});
    
    const priority = await CompanyModel.countDocuments({
      status: { $in: ['Target / Save', 'To Explore'] },
      rating: { $gte: 4 }
    });

    const contacted = await CompanyModel.countDocuments({
      status: { $in: ['Contacted', 'In Dialogue'] }
    });

    const applied = await CompanyModel.countDocuments({
      status: 'Applied'
    });

    return { total, priority, contacted, applied };
  } catch (error) {
    return { total: 0, priority: 0, contacted: 0, applied: 0 };
  }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  await dbConnect();
  try {
    const doc = await CompanyModel.findById(id);
    if (!doc) return null;
    return mapCompany(doc);
  } catch (error) {
    return null;
  }
}

export async function createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  await dbConnect();
  const doc = await CompanyModel.create(companyData);
  return mapCompany(doc);
}

export async function updateCompany(id: string, updatedData: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company | null> {
  await dbConnect();
  try {
    const doc = await CompanyModel.findByIdAndUpdate(id, updatedData, { new: true });
    if (!doc) return null;
    return mapCompany(doc);
  } catch (error) {
    return null;
  }
}

export async function deleteCompany(id: string): Promise<boolean> {
  await dbConnect();
  try {
    const result = await CompanyModel.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    return false;
  }
}
