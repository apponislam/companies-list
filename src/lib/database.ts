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

export async function getCompanies(): Promise<Company[]> {
  await dbConnect();
  const docs = await CompanyModel.find({}).sort({ createdAt: -1 });
  return docs.map(mapCompany);
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
