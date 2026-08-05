import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/edgeAuth';

const AUTH_PATH = '/login';
const ADMIN_SETUP_PATH = '/admin/setup';
const ADMIN_PATH_PREFIX = '/admin';
const DASHBOARD_PATH = '/dashboard';
const PUBLIC_PATHS = [AUTH_PATH, '/register', ADMIN_SETUP_PATH];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /admin to dashboard
  if (pathname === ADMIN_PATH_PREFIX) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect /admin/* routes
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    return handleAuthGate(request, AUTH_PATH);
  }

  // Protect /dashboard routes (user area)
  if (pathname.startsWith(DASHBOARD_PATH)) {
    return handleAuthGate(request, AUTH_PATH);
  }

  return NextResponse.next();
}

async function handleAuthGate(request: NextRequest, loginPath: string) {
  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken) {
    const loginUrl = new URL(loginPath, request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(authToken);
  if (!payload) {
    const loginUrl = new URL(loginPath, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // For /admin routes, only allow admin/superadmin roles
  if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin' && payload.role !== 'superadmin') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
