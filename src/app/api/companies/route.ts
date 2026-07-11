import { NextResponse } from 'next/server';
import { getCompanies, createCompany, getUniqueCategories, getGlobalStats } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';
    const category = searchParams.get('category') || 'All';
    const minRating = Number(searchParams.get('minRating')) || 0;

    const data = await getCompanies({ page, limit, search, status, category, minRating });
    const categories = await getUniqueCategories();
    const stats = await getGlobalStats();

    return NextResponse.json({
      ...data,
      categories,
      stats,
    });
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!body.category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!body.address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!body.mapLink) {
      return NextResponse.json({ error: 'Map link is required' }, { status: 400 });
    }
    if (!body.website) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const newCompany = await createCompany({
      name: body.name,
      category: body.category,
      address: body.address,
      mapLink: body.mapLink,
      website: body.website,
      facebook: body.facebook || '',
      linkedin: body.linkedin || '',
      email: body.email || '',
      phone: body.phone || '',
      status: body.status || 'To Explore',
      rating: Number(body.rating) || 3,
      notes: body.notes || '',
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
