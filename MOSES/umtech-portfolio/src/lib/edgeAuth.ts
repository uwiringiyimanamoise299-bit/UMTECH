import { jwtVerify } from 'jose';

const rawSecret = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(rawSecret || 'development-only-secret-do-not-use-in-production');

export interface EdgeTokenPayload {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin' | 'user';
}

export async function verifyToken(token: string): Promise<EdgeTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as EdgeTokenPayload;
  } catch {
    return null;
  }
}
