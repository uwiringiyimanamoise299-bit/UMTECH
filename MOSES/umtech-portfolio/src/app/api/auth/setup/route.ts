import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { getAdminByEmail, registerAdmin } from '@/lib/adminStore';

const SETUP_SECRET = process.env.SETUP_SECRET;
if (!SETUP_SECRET) {
  console.warn('WARNING: SETUP_SECRET environment variable is not set. Setup endpoint is disabled.');
}

export async function POST(request: NextRequest) {
  try {
    const { secret, name, email, password } = await request.json();

    if (!SETUP_SECRET) {
      return NextResponse.json({ error: 'Setup is not configured' }, { status: 503 });
    }
    if (secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await getAdminByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await registerAdmin({
      name,
      email,
      passwordHash,
      role: 'superadmin',
    });

    const token = await generateToken({ uid: admin.uid, email, name, role: 'superadmin' });

    const response = NextResponse.json({
      success: true,
      user: {
        uid: admin.uid,
        name,
        email,
        role: 'superadmin',
        photoURL: '',
        createdAt: admin.createdAt,
      },
      message: `Admin account created for ${email}`,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
