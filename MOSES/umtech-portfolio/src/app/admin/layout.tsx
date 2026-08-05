'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaTachometerAlt, FaProjectDiagram, FaNewspaper,
  FaEnvelope, FaUser, FaCog, FaSignOutAlt, FaBars,
  FaTimes, FaBell, FaChevronDown, FaShieldAlt, FaUsers, FaEye,
  FaClipboardCheck,
} from 'react-icons/fa';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: FaTachometerAlt },
  { href: '/admin/projects', label: 'Projects', icon: FaProjectDiagram },
  { href: '/admin/posts', label: 'Posts', icon: FaNewspaper },
  { href: '/admin/messages', label: 'Messages', icon: FaEnvelope },
  { href: '/admin/service-requests', label: 'Service Requests', icon: FaClipboardCheck },
  { href: '/admin/users', label: 'Users', icon: FaUsers },
  { href: '/admin/visitors', label: 'Visitors', icon: FaEye },
  { href: '/admin/profile', label: 'Profile', icon: FaUser },
  { href: '/admin/settings', label: 'Settings', icon: FaCog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const notifRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login';
  const isSetupPage = pathname === '/admin/setup';

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'admin' && user.role !== 'superadmin') {
        router.replace('/dashboard');
      } else {
        setAuthChecked(true);
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authChecked || isAuthPage || isSetupPage) return;

    // Poll for unread notifications via the secure API routes instead
    // of using Firestore onSnapshot (which requires Firebase Auth rules)
    const fetchNotifications = async () => {
      try {
        const [msgsRes, reqsRes] = await Promise.all([
          fetch('/api/messages').catch(() => null),
          fetch('/api/service-requests').catch(() => null),
        ]);

        const newNotifs: any[] = [];

        if (msgsRes?.ok) {
          const msgsData = await msgsRes.json();
          const unreadMsgs = (msgsData.messages || []).filter((m: any) => !m.read);
          unreadMsgs.forEach((msg: any) => {
            newNotifs.push({
              id: msg.id,
              type: 'message',
              title: 'New Message',
              description: `From ${msg.name || 'Unknown'}`,
              time: msg.createdAt,
              link: '/admin/messages',
            });
          });
        }

        if (reqsRes?.ok) {
          const reqsData = await reqsRes.json();
          const unreadReqs = (reqsData.requests || reqsData.serviceRequests || []).filter((r: any) => !r.read);
          unreadReqs.forEach((req: any) => {
            newNotifs.push({
              id: req.id,
              type: 'request',
              title: 'New Service Request',
              description: `${req.serviceTitle} - ${req.name}`,
              time: req.createdAt,
              link: '/admin/service-requests',
            });
          });
        }

        newNotifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setNotifications(newNotifs);
        setNotifCount(newNotifs.length);
      } catch {
        // Silently ignore polling errors
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [authChecked, isAuthPage, isSetupPage]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isAuthPage || isSetupPage) return <>{children}</>;

  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed top-0 left-0 z-50 h-full w-64 lg:translate-x-0 lg:static lg:z-auto"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full glass border-r border-glass-border">
          <div className="p-6 border-b border-glass-border">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">UMTECH</h1>
                <p className="text-[10px] text-gray-500 -mt-1">Admin Panel</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                      : 'text-gray-400 hover:text-white hover:bg-glass-hover border border-transparent'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                  {item.label === 'Messages' && notifCount > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-glass-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 w-full border border-transparent hover:border-red-500/20"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 glass border-b border-glass-border">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-glass-hover transition-colors"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-4">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-glass-hover transition-colors"
                >
                  <FaBell size={18} />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 glass border border-glass-border rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-glass-border">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                        ) : (
                          notifications.map((n: { id: string; link: string; title: string; description: string; time: string }) => (
                            <Link
                              key={n.id}
                              href={n.link}
                              onClick={() => setNotifOpen(false)}
                              className="flex items-start gap-3 p-4 border-b border-glass-border hover:bg-glass-hover transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <FaBell className="text-accent text-xs" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                                <p className="text-[10px] text-gray-600 mt-1">
                                  {new Date(n.time).toLocaleDateString()}
                                </p>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-glass-border text-center">
                        <Link
                          href="/admin/messages"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs text-primary hover:underline"
                        >
                          View all messages
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass-hover transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@umtech.dev'}</p>
                  </div>
                  <FaChevronDown className={`text-gray-500 text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 glass border border-glass-border rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-glass-border">
                        <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'admin@umtech.dev'}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/admin/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-glass-hover transition-colors"
                        >
                          <FaUser className="text-xs" />
                          Profile
                        </Link>
                        <Link
                          href="/admin/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-glass-hover transition-colors"
                        >
                          <FaCog className="text-xs" />
                          Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-glass-border">
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                        >
                          <FaSignOutAlt className="text-xs" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
