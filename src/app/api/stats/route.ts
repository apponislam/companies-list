import { NextResponse } from 'next/server';
import { getDetailedStats } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getDetailedStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('API stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch detailed statistics' }, { status: 500 });
  }
}
