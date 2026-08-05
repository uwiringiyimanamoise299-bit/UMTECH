import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAdminByEmail } from '@/lib/adminStore';
import { getUserByEmail } from '@/lib/userStore';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) return NextResponse.json({ user: null });

    const payload = await verifyToken(authToken);
    if (!payload) return NextResponse.json({ user: null });

    let createdAt = '';
    const userRecord = await getUserByEmail(payload.email);
    if (userRecord) {
      createdAt = userRecord.createdAt || '';
    } else {
      const adminRecord = await getAdminByEmail(payload.email);
      if (adminRecord) createdAt = adminRecord.createdAt || '';
    }

    return NextResponse.json({
      user: {
        uid: payload.uid,
        email: payload.email,
        name: payload.name || 'Admin',
        role: payload.role,
        photoURL: '',
        createdAt,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
