'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);

// These Firebase error codes mean "this user doesn't exist in Firebase Auth".
// We fall through to the backend in these cases rather than blocking login.
const FIREBASE_FALLBACK_CODES = new Set([
  'auth/invalid-credential',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/operation-not-allowed',
  'auth/configuration-not-found',
  'auth/network-request-failed',
]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    setError(null);
    try {
      // Step 1: Try Firebase Auth (non-blocking).
      // Admin accounts may only exist in Firestore/backend, not in Firebase Auth.
      // If Firebase Auth fails for a known reason, we fall through to the backend.
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseErr: any) {
        const code: string = firebaseErr?.code ?? '';
        if (!FIREBASE_FALLBACK_CODES.has(code)) {
          // Unknown error — still try the backend, don't block the user
          console.warn('Firebase Auth error (falling back to backend):', code);
        }
        // All Firebase auth errors: fall through to backend
      }

      // Step 2: Backend auth — always the source of truth for the session cookie.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        await signOut(auth).catch(() => {});
        setError(data.error || 'Invalid email or password');
        return { success: false };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      return { success: false };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      // Step 1: Try Firebase Auth so the user appears in the Firebase Console.
      // This step is optional — if it fails, registration still works via the backend.
      let firebaseUid: string | undefined;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUid = cred.user.uid;
      } catch (firebaseErr: any) {
        const code: string = firebaseErr?.code ?? '';
        if (code === 'auth/email-already-in-use') {
          // Already in Firebase Auth — try to sign in to get their UID
          try {
            const existing = await signInWithEmailAndPassword(auth, email, password);
            firebaseUid = existing.user.uid;
          } catch {
            // Wrong password or other issue — continue without UID
          }
        } else {
          // Email/Password provider not enabled or other config issue — continue
          console.warn('Firebase Auth registration skipped:', code || firebaseErr?.message);
        }
      }

      // Step 2: Register with the backend (required for session + Firestore user record).
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, uid: firebaseUid }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        // Backend failed — roll back the Firebase Auth user if we just created them
        if (firebaseUid) {
          const currentUser = auth.currentUser;
          if (currentUser?.uid === firebaseUid) {
            await currentUser.delete().catch(() => {});
          }
        }
        setError(data.error || 'Registration failed');
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const clearError = () => setError(null);

  const logout = async () => {
    await signOut(auth).catch(() => {});
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
