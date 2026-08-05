'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaSave, FaCheckCircle, FaSun, FaMoon,
  FaGlobe, FaEnvelope, FaTools, FaSearch,
  FaChartLine, FaShieldAlt, FaSpinner
} from 'react-icons/fa';

type Theme = 'dark' | 'light';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    siteName: 'UMTECH',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
  });

  const [theme, setTheme] = useState<Theme>('dark');

  const [seo, setSeo] = useState({
    title: 'UMTECH - Full-Stack Developer & UI/UX Designer',
    description: '',
    metaTags: '',
  });

  const [analytics, setAnalytics] = useState({
    googleAnalyticsId: '',
  });

  const [emailSettings, setEmailSettings] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    pass: '',
  });

  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        if (s) {
          setGeneral({ siteName: s.siteName || 'UMTECH', logoUrl: s.logoUrl || '/logo.png', faviconUrl: s.faviconUrl || '/favicon.ico' });
          setTheme(s.theme || 'dark');
          setSeo({ title: s.seoTitle || '', description: s.seoDescription || '', metaTags: s.metaTags || '' });
          setAnalytics({ googleAnalyticsId: s.googleAnalyticsId || '' });
          setEmailSettings({ host: s.emailHost || 'smtp.gmail.com', port: s.emailPort || '587', user: s.emailUser || '', pass: s.emailPass || '' });
          setMaintenance(s.maintenanceMode || false);
        }
      }
    } catch {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: general.siteName,
          logoUrl: general.logoUrl,
          faviconUrl: general.faviconUrl,
          theme,
          seoTitle: seo.title,
          seoDescription: seo.description,
          metaTags: seo.metaTags,
          googleAnalyticsId: analytics.googleAnalyticsId,
          emailHost: emailSettings.host,
          emailPort: emailSettings.port,
          emailUser: emailSettings.user,
          emailPass: emailSettings.pass,
          maintenanceMode: maintenance,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  const sections = [
    {
      title: 'General Settings',
      icon: FaGlobe,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Site Name', value: general.siteName, key: 'siteName' },
            { label: 'Logo URL', value: general.logoUrl, key: 'logoUrl' },
            { label: 'Favicon URL', value: general.faviconUrl, key: 'faviconUrl' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1.5">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={(e) => setGeneral({ ...general, [f.key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Theme',
      icon: theme === 'dark' ? FaMoon : FaSun,
      content: (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
              theme === 'dark'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-glass border-glass-border text-gray-400 hover:text-white'
            }`}
          >
            <FaMoon /> Dark Mode
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
              theme === 'light'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-glass border-glass-border text-gray-400 hover:text-white'
            }`}
          >
            <FaSun /> Light Mode
          </button>
        </div>
      ),
    },
    {
      title: 'SEO Settings',
      icon: FaSearch,
      content: (
        <div className="space-y-4">
          {[
            { label: 'SEO Title', value: seo.title, key: 'title' },
            { label: 'Meta Description', value: seo.description, key: 'description', type: 'textarea' },
            { label: 'Meta Tags', value: seo.metaTags, key: 'metaTags' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1.5">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  value={f.value}
                  onChange={(e) => setSeo({ ...seo, [f.key]: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => setSeo({ ...seo, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Google Analytics',
      icon: FaChartLine,
      content: (
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Measurement ID</label>
          <input
            type="text"
            value={analytics.googleAnalyticsId}
            onChange={(e) => setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })}
            className="w-full max-w-md px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
            placeholder="G-XXXXXXXXXX"
          />
        </div>
      ),
    },
    {
      title: 'Email Settings (SMTP)',
      icon: FaEnvelope,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'SMTP Host', value: emailSettings.host, key: 'host' },
            { label: 'Port', value: emailSettings.port, key: 'port' },
            { label: 'Username', value: emailSettings.user, key: 'user' },
            { label: 'Password', value: emailSettings.pass, key: 'pass', type: 'password' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1.5">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={f.value}
                onChange={(e) => setEmailSettings({ ...emailSettings, [f.key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-glass border border-glass-border text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Maintenance Mode',
      icon: FaTools,
      content: (
        <label className="flex items-center gap-4 px-4 py-3 rounded-xl bg-glass border border-glass-border cursor-pointer max-w-md">
          <div className={`relative w-12 h-6 rounded-full transition-colors ${maintenance ? 'bg-accent' : 'bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${maintenance ? 'translate-x-6' : 'translate-x-0.5'}`} />
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="hidden"
            />
          </div>
          <div>
            <span className="text-sm text-white font-medium">Maintenance Mode</span>
            <p className="text-[10px] text-gray-500">When enabled, visitors will see a maintenance page</p>
          </div>
        </label>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Website Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Configure your website preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {saved ? 'Saved!' : 'Save Settings'}</>}
        </button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
        >
          <FaCheckCircle /> Settings saved successfully!
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="text-primary text-2xl animate-spin" />
        </div>
      ) : (
      <div className="space-y-6">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              custom={i}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/10 flex items-center justify-center">
                  <Icon className="text-primary text-lg" />
                </div>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              {section.content}
            </motion.div>
          );
        })}
      </div>
      )}

      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {saved ? 'Saved!' : 'Save Settings'}</>}
        </button>
      </div>
    </motion.div>
  );
}
