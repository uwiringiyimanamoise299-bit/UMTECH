'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { user, loading: authLoading, register, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setValidationError('Name is required');
      return;
    }
    if (name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setValidationError('Password is required');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);

    if (result?.success) {
      const role = result.role;
      if (role === 'admin' || role === 'superadmin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden p-4">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/25">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-1">UMTECH</h1>
            <p className="text-gray-500 text-sm">Create a new account</p>
          </motion.div>

          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {validationError || error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="Full Name"
              />
              <label
                htmlFor="name"
                className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all"
              >
                Full Name
              </label>
              <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="Email"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all"
              >
                Email Address
              </label>
              <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-sm text-primary/70 hover:text-primary transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>

          <p className="text-center mt-4 text-gray-600 text-xs">
            <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
              &larr; Back to home
            </Link>
          </p>
        </div>

        <p className="text-center mt-3 text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} UMTECH. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
