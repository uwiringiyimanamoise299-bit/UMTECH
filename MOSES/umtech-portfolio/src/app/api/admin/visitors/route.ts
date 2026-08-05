import { NextRequest, NextResponse } from 'next/server';
import { getVisitorData } from '@/lib/dataStore';
import { verifyToken } from '@/lib/auth';

async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null && (payload.role === 'admin' || payload.role === 'superadmin');
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await getVisitorData();
    return NextResponse.json({ visitors: data });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
