import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from '@/lib/auth';

export type { TokenPayload };

export interface AuthResult {
  success: boolean;
  payload?: TokenPayload;
  error?: string;
  status?: number;
}

export async function checkAuth(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return { success: false, error: 'Unauthorized', status: 401 };
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return { success: false, error: 'Unauthorized', status: 401 };
  }
  return { success: true, payload };
}

export async function checkAdminAuth(request: NextRequest): Promise<AuthResult> {
  const result = await checkAuth(request);
  if (!result.success) return result;
  if (result.payload!.role !== 'admin' && result.payload!.role !== 'superadmin') {
    return { success: false, error: 'Forbidden', status: 403 };
  }
  return result;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }

  return { allowed: true };
}

export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
