'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  FaUsers, FaProjectDiagram, FaNewspaper, FaEnvelope, FaEye,
  FaArrowUp, FaArrowDown, FaSpinner, FaRegPaperPlane, FaUserPlus,
  FaClipboardCheck, FaDollarSign,
} from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface StatsData {
  totalVisitors: number;
  uniqueVisitors: number;
  totalProjects: number;
  featuredProjects: number;
  totalPosts: number;
  totalMessages: number;
  unreadMessages: number;
  totalUsers: number;
  totalServiceRequests: number;
  pendingServiceRequests: number;
  completedServiceRequests: number;
  totalRevenue: number;
  dailyVisits: Record<string, number>;
  monthlyVisits: Record<string, number>;
  recentMessages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    replied: boolean;
    createdAt: string;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
  }>;
  recentServiceRequests: Array<{
    id: string;
    serviceTitle: string;
    name: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="text-primary text-3xl animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Visitors', value: stats?.totalVisitors || 0, icon: FaEye, change: `${stats?.uniqueVisitors || 0} unique`, up: true, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FaProjectDiagram, change: 'portfolio', up: true, color: 'from-purple-500 to-pink-500' },
    { label: 'Featured Projects', value: stats?.featuredProjects || 0, icon: FaProjectDiagram, change: 'highlighted', up: true, color: 'from-indigo-500 to-purple-500' },
    { label: 'Total Messages', value: stats?.totalMessages || 0, icon: FaEnvelope, change: `${stats?.unreadMessages || 0} unread`, up: (stats?.unreadMessages || 0) > 0, color: 'from-green-500 to-teal-500' },
    { label: 'Total Services', value: 12, icon: FaClipboardCheck, change: 'offered', up: true, color: 'from-blue-400 to-indigo-500' },
    { label: 'Service Requests', value: stats?.totalServiceRequests || 0, icon: FaClipboardCheck, change: 'total', up: true, color: 'from-amber-500 to-yellow-500' },
    { label: 'Pending Requests', value: stats?.pendingServiceRequests || 0, icon: FaClipboardCheck, change: 'awaiting action', up: (stats?.pendingServiceRequests || 0) > 0, color: 'from-orange-500 to-red-500' },
    { label: 'Completed Requests', value: stats?.completedServiceRequests || 0, icon: FaClipboardCheck, change: 'finished', up: true, color: 'from-emerald-500 to-teal-500' },
  ];

  const sortedDays = stats?.dailyVisits ? Object.entries(stats.dailyVisits).sort(([a], [b]) => a.localeCompare(b)) : [];
  const maxDay = sortedDays.length > 0 ? Math.max(...sortedDays.map(([, v]) => v)) : 1;
  const chartDays = sortedDays.slice(-14);
  const maxChart = chartDays.length > 0 ? Math.max(...chartDays.map(([, v]) => v)) : 1;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/admin/projects"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 hover:bg-glass-hover transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <FaProjectDiagram className="text-white text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Post New Project</p>
            <p className="text-[11px] text-gray-500">Add cover, links, description</p>
          </div>
        </a>
        <a
          href="/admin/posts"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 hover:bg-glass-hover transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FaNewspaper className="text-white text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Write a Post</p>
            <p className="text-[11px] text-gray-500">Share an update</p>
          </div>
        </a>
        <a
          href="/admin/messages"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 hover:bg-glass-hover transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <FaEnvelope className="text-white text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Messages</p>
            <p className="text-[11px] text-gray-500">{stats?.unreadMessages || 0} unread</p>
          </div>
        </a>
        <a
          href="/admin/service-requests"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 hover:bg-glass-hover transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <FaClipboardCheck className="text-white text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Service Requests</p>
            <p className="text-[11px] text-gray-500">{stats?.pendingServiceRequests || 0} pending</p>
          </div>
        </a>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white text-lg" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {stat.up ? <FaArrowUp className="text-[9px]" /> : <FaArrowDown className="text-[9px]" />}
                  {stat.change}
                </span>
              </div>
              <span className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</span>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Traffic Overview</h2>
            <span className="text-[10px] text-gray-600">Last 14 days</span>
          </div>
          {chartDays.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No traffic data yet</div>
          ) : (
            <div className="h-64">
              <div className="flex items-end gap-2 h-56 pb-1">
                {chartDays.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-glass border border-glass-border rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 shadow-xl">
                      {count} visits
                      <div className="text-[8px] text-gray-500">{day}</div>
                    </div>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-primary via-primary/60 to-primary/20 transition-all duration-300 hover:from-primary-light cursor-pointer"
                      style={{ height: `${Math.max((count / maxChart) * 100, 4)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {chartDays.filter((_, i) => i % Math.max(1, Math.floor(chartDays.length / 7)) === 0).map(([day]) => (
                  <span key={day} className="text-[9px] text-gray-600">{day.slice(5)}</span>
                ))}
                <span className="text-[9px] text-gray-600">{chartDays[chartDays.length - 1][0].slice(5)}</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 h-64">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-glass-border p-4 flex flex-col items-center justify-center">
              <FaEnvelope className="text-2xl text-accent mb-2" />
              <span className="text-3xl font-bold text-white">{stats?.unreadMessages || 0}</span>
              <span className="text-xs text-gray-500 mt-1">Unread Messages</span>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-secondary/5 to-accent/5 border border-glass-border p-4 flex flex-col items-center justify-center">
              <FaUsers className="text-2xl text-primary mb-2" />
              <span className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</span>
              <span className="text-xs text-gray-500 mt-1">Total Users</span>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 border border-glass-border p-4 flex flex-col items-center justify-center">
              <FaClipboardCheck className="text-2xl text-yellow-400 mb-2" />
              <span className="text-3xl font-bold text-white">{stats?.pendingServiceRequests || 0}</span>
              <span className="text-xs text-gray-500 mt-1">Pending Requests</span>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-green-500/5 to-teal-500/5 border border-glass-border p-4 flex flex-col items-center justify-center">
              <FaDollarSign className="text-2xl text-green-400 mb-2" />
              <span className="text-3xl font-bold text-white">${(stats?.totalRevenue || 0).toLocaleString()}</span>
              <span className="text-xs text-gray-500 mt-1">Accepted Revenue</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Messages</h2>
            <a href="/admin/messages" className="text-xs text-primary hover:underline">View All</a>
          </div>
          {(!stats?.recentMessages || stats.recentMessages.length === 0) ? (
            <div className="py-8 text-center text-gray-500 text-sm">No messages yet</div>
          ) : (
          <div className="space-y-3">
            {stats.recentMessages.slice(0, 5).map((msg) => (
              <a
                key={msg.id}
                href="/admin/messages"
                className={`block p-4 rounded-xl border transition-all ${
                  !msg.read
                    ? 'bg-primary/5 border-primary/10'
                    : 'bg-glass border-glass-border hover:bg-glass-hover'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {!msg.read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                    <h3 className="text-sm font-medium text-white">{msg.name}</h3>
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-primary mb-1">{msg.subject}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{msg.message}</p>
              </a>
            ))}
          </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Service Requests</h2>
            <a href="/admin/service-requests" className="text-xs text-primary hover:underline">View All</a>
          </div>
          {(!stats?.recentServiceRequests || stats.recentServiceRequests.length === 0) ? (
            <div className="py-8 text-center text-gray-500 text-sm">No service requests yet</div>
          ) : (
          <div className="space-y-3">
            {stats.recentServiceRequests.slice(0, 5).map((req) => {
              const reqStatusColors: Record<string, string> = {
                pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
                rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
              };
              return (
                <a
                  key={req.id}
                  href="/admin/service-requests"
                  className="block p-4 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-medium text-white">{req.serviceTitle}</h3>
                      <p className="text-xs text-gray-500">{req.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">${req.amount.toLocaleString()}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${reqStatusColors[req.status] || ''}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </a>
              );
            })}
          </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
