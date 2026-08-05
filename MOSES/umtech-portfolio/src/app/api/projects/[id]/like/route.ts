import { NextRequest, NextResponse } from 'next/server';
import { toggleLike } from '@/lib/dataStore';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { liked } = await request.json();
    const count = await toggleLike('projects', id, liked);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
