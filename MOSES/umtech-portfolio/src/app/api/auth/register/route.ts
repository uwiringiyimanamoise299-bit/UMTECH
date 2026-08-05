import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { registerUser, getUserByEmail } from '@/lib/userStore';
import { getAdminByEmail } from '@/lib/adminStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { name, email, password, uid } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email is already used by an admin
    try {
      const existingAdmin = await getAdminByEmail(email);
      if (existingAdmin) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
    } catch (dbErr) {
      console.error('DB error checking admin email:', dbErr);
      // Don't block registration if this check fails
    }

    // Check if email is already used by a regular user
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
    } catch (dbErr) {
      console.error('DB error checking user email:', dbErr);
      // Don't block registration if this check fails
    }

    // Hash password
    const bcrypt = (await import('bcryptjs')).default;
    const passwordHash = await bcrypt.hash(password, 12);

    // Register user in Firestore
    let user;
    try {
      user = await registerUser({ name, email, passwordHash, uid });
    } catch (regErr) {
      console.error('Error registering user:', regErr);
      const regMessage = regErr instanceof Error ? regErr.message : '';
      if (regMessage.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({
        error: 'Failed to create account. Please check your connection and try again.',
      }, { status: 503 });
    }

    // Generate auth token
    const token = await generateToken({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: '',
        createdAt: user.createdAt,
      },
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
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Register error details:', message);
    if (message.includes('already exists')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({
      error: 'Registration failed. Please try again.',
    }, { status: 500 });
  }
}
