import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, deleteUser, updateUser } from '@/lib/userStore';
import { checkAdminAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const users = await getAllUsers();
    const safeUsers = users.map((u) => ({
      uid: u.uid,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { uid, name, email } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const updated = await updateUser(uid, { name, email });
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        uid: updated.uid,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const deleted = await deleteUser(uid);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
