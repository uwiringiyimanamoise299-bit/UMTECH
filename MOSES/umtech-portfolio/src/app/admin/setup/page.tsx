'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey, FaCheckCircle } from 'react-icons/fa';

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ secret: '', name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: form.secret,
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Admin account created successfully!');
        setTimeout(() => router.push('/admin/login'), 3000);
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold gradient-text mb-1">Admin Setup</h1>
            <p className="text-gray-500 text-sm">Create your admin account</p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <FaCheckCircle className="text-green-400 text-3xl" />
              </div>
              <p className="text-green-400 text-center font-medium">{success}</p>
              <p className="text-gray-500 text-sm text-center">Redirecting to login...</p>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Setup Secret */}
                <div className="relative">
                  <input
                    type="password"
                    id="secret"
                    value={form.secret}
                    onChange={(e) => setForm({ ...form, secret: e.target.value })}
                    required
                    className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Setup Secret"
                  />
                  <label htmlFor="secret" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all">
                    Setup Secret Key
                  </label>
                  <FaKey className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>

                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Full Name"
                  />
                  <label htmlFor="name" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all">
                    Full Name
                  </label>
                  <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    id="setup-email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Email"
                  />
                  <label htmlFor="setup-email" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all">
                    Email Address
                  </label>
                  <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="setup-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Password"
                  />
                  <label htmlFor="setup-password" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all">
                    Password (min 8 chars)
                  </label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="setup-confirm"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                    className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-glass border border-glass-border text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Confirm"
                  />
                  <label htmlFor="setup-confirm" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary transition-all">
                    Confirm Password
                  </label>
                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
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
                      Creating Account...
                    </span>
                  ) : (
                    'Create Admin Account'
                  )}
                </button>
              </motion.form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-4 text-gray-600 text-xs"
              >
                Use your setup secret key provided by the administrator
              </motion.p>
            </>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-3 text-gray-600 text-sm"
        >
          &copy; {new Date().getFullYear()} UMTECH. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
