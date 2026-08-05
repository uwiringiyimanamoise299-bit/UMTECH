import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/dataStore';
import { checkAdminAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
