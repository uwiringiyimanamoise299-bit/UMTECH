import { NextRequest, NextResponse } from 'next/server';
import { getPostComments, addPostComment } from '@/lib/dataStore';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await getPostComments(id);
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

    const comment = await addPostComment({ postId: id, name, email, content });
    const allComments = await getPostComments(id);
    return NextResponse.json({ comment, count: allComments.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
