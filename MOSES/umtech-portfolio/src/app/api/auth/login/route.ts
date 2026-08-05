import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { getUserByEmail } from '@/lib/userStore';
import { getAdminByEmail, upsertAdmin } from '@/lib/adminStore';
import { checkRateLimit, rateLimitResponse } from '@/lib/apiAuth';

interface TokenResponseRecord {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

async function createTokenResponse(record: TokenResponseRecord) {
  const token = await generateToken({
    uid: record.uid,
    email: record.email,
    name: record.name,
    role: record.role as 'admin' | 'superadmin' | 'user',
  });

  const response = NextResponse.json({
    user: {
      uid: record.uid,
      email: record.email,
      name: record.name,
      role: record.role,
      photoURL: '',
      createdAt: record.createdAt || '',
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
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfter!);
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const bcrypt = (await import('bcryptjs')).default;

    // Check admin accounts in Firestore
    let adminRecord = null;
    try {
      adminRecord = await getAdminByEmail(email);
    } catch (dbErr) {
      console.error('DB error fetching admin:', dbErr);
      // Don't fail here — fall through to env-based admin check
    }

    if (adminRecord) {
      const isValid = await bcrypt.compare(password, adminRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      return await createTokenResponse(adminRecord);
    }

    // Check user accounts in Firestore
    let userRecord = null;
    try {
      userRecord = await getUserByEmail(email);
    } catch (dbErr) {
      console.error('DB error fetching user:', dbErr);
      // Continue — fall through to other checks
    }

    if (userRecord) {
      const isValid = await bcrypt.compare(password, userRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      return await createTokenResponse(userRecord);
    }

    // Fallback: env-based admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHashB64 = process.env.ADMIN_PASSWORD_HASH_B64;
    if (adminEmail && adminPasswordHashB64 && email === adminEmail) {
      try {
        const adminPasswordHash = Buffer.from(adminPasswordHashB64, 'base64').toString('utf-8');
        const isValid = await bcrypt.compare(password, adminPasswordHash);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
        // Persist the admin record in Firestore so admin login data lives in Firebase,
        // not just in localhost/environment variables.
        try {
          await upsertAdmin({
            uid: 'admin-1',
            name: 'Uwiringiyimana Moise',
            email: adminEmail,
            passwordHash: adminPasswordHash,
            role: 'superadmin',
            createdAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.error('Failed to persist admin to Firestore:', dbErr);
        }
        return await createTokenResponse({
          uid: 'admin-1',
          email: adminEmail,
          name: 'Uwiringiyimana Moise',
          role: 'superadmin',
          createdAt: '',
        });
      } catch (envErr) {
        console.error('Error with env-based admin auth:', envErr);
        return NextResponse.json({ error: 'Authentication configuration error' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Login error details:', message);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
