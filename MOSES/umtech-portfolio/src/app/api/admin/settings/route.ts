import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/dataStore';
import { checkAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
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
    await saveSettings(data);
    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
