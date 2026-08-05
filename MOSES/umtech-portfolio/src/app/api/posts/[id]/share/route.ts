import { NextRequest, NextResponse } from 'next/server';
import { incrementShare } from '@/lib/dataStore';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await incrementShare('posts', id);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
