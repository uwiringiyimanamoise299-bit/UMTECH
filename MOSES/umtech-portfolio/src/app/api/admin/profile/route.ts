import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '@/lib/dataStore';
import { checkAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const profile = await getProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const data = await request.json();
    await saveProfile(data);
    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
