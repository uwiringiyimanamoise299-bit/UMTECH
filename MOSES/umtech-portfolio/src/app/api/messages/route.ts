import { NextRequest, NextResponse } from 'next/server';
import { getAllMessages, updateMessage, deleteMessage } from '@/lib/dataStore';
import { checkAdminAuth } from '@/lib/apiAuth';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    const token = request.cookies.get('auth-token')?.value;
    const userPayload = token ? await verifyToken(token) : null;

    if (email) {
      if (!userPayload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (userPayload.email !== email && userPayload.role !== 'admin' && userPayload.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const allMessages = await getAllMessages();
      const userMessages = allMessages.filter((m) => m.email === email);
      return NextResponse.json({ messages: userMessages });
    }

    const auth = await checkAdminAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const messages = await getAllMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('GET messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id, read, replied, reply } = await request.json();
    const updateData: Record<string, unknown> = {};
    if (typeof read === 'boolean') updateData.read = read;
    if (typeof replied === 'boolean') updateData.replied = replied;
    if (typeof reply === 'string') {
      updateData.reply = reply;
      updateData.replied = true;
    }
    const updated = await updateMessage(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error('PATCH message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await request.json();
    const deleted = await deleteMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
