import { NextRequest, NextResponse } from 'next/server';
import { getProjectComments, addProjectComment } from '@/lib/dataStore';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await getProjectComments(id);
    return NextResponse.json({ comments, count: comments.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, email, content } = await request.json();

    if (!name || !email || !content) {
      return NextResponse.json({ error: 'Name, email, and content are required' }, { status: 400 });
    }

    const comment = await addProjectComment({ projectId: id, name, email, content });
    const allComments = await getProjectComments(id);
    return NextResponse.json({ comment, count: allComments.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
