import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'companies.json');

async function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    await fs.mkdir(dirname, { recursive: true });
  } catch (err) {
    // Ignore if directory already exists
  }
}

export async function readDatabase(): Promise<Company[]> {
  try {
    await ensureDirectoryExists(DB_PATH);
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    // If file doesn't exist, return empty array and create the file
    if (error.code === 'ENOENT') {
      await writeDatabase([]);
      return [];
    }
    console.error('Error reading database:', error);
    return [];
  }
}

export async function writeDatabase(data: Company[]): Promise<boolean> {
  try {
    await ensureDirectoryExists(DB_PATH);
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

export async function getCompanies(): Promise<Company[]> {
  return await readDatabase();
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const companies = await readDatabase();
  return companies.find((c) => c.id === id) || null;
}

export async function createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  const companies = await readDatabase();
  const now = new Date().toISOString();
  const newCompany: Company = {
    ...companyData,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  companies.push(newCompany);
  await writeDatabase(companies);
  return newCompany;
}

export async function updateCompany(id: string, updatedData: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company | null> {
  const companies = await readDatabase();
  const index = companies.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedCompany: Company = {
    ...companies[index],
    ...updatedData,
    updatedAt: now,
  };

  companies[index] = updatedCompany;
  await writeDatabase(companies);
  return updatedCompany;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const companies = await readDatabase();
  const initialLength = companies.length;
  const filtered = companies.filter((c) => c.id !== id);
  
  if (filtered.length === initialLength) return false;
  
  await writeDatabase(filtered);
  return true;
}
